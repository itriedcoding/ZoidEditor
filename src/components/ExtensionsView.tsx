import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { searchExtensions, getExtensionDetail, installExtension, VSXExtension } from '../services/extensions';
import { IconSearch, IconX, IconStar, IconDownload } from './Icons';

function ExtensionsView() {
  const { installedExtensions, addInstalledExtension, removeInstalledExtension, notify, setActiveView } = useStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<VSXExtension[]>([]);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<VSXExtension | null>(null);
  const [installing, setInstalling] = useState<string | null>(null);

  useEffect(() => {
    if (query.length > 1) {
      const timer = setTimeout(async () => {
        setLoading(true);
        try {
          const res = await searchExtensions(query, 30);
          setResults(res.extensions.map(e => ({
            ...e,
            installed: installedExtensions.includes(`${e.publisher}.${e.name}`),
          })));
        } catch { setResults([]); }
        setLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setResults([]);
    }
  }, [query, installedExtensions]);

  const handleInstall = async (ext: VSXExtension) => {
    const pkgName = `${ext.publisher}.${ext.name}`;
    setInstalling(pkgName);
    try {
      const detailData = await getExtensionDetail(ext.publisher, ext.name);
      await installExtension(detailData.publisher, detailData.name, detailData.version);
      addInstalledExtension(pkgName);
      notify(`Installed: ${detailData.displayName || pkgName}`, 'success');
    } catch (err: any) {
      notify(`Failed to install: ${err.message}`, 'error');
    }
    setInstalling(null);
  };

  const handleUninstall = async (name: string) => {
    try {
      const api = (window as any).electronAPI;
      if (api?.extensions?.uninstall) await api.extensions.uninstall(name);
      removeInstalledExtension(name);
      notify(`Uninstalled: ${name}`, 'info');
    } catch (err: any) {
      notify(`Failed to uninstall: ${err.message}`, 'error');
    }
  };

  const handleShowDetail = async (ext: VSXExtension) => {
    try {
      const d = await getExtensionDetail(ext.publisher, ext.name);
      setDetail({ ...d, installed: installedExtensions.includes(`${d.publisher}.${d.name}`) });
    } catch {
      setDetail({ ...ext, installed: installedExtensions.includes(`${ext.publisher}.${ext.name}`) });
    }
  };

  const pkgName = (ext: VSXExtension) => `${ext.publisher}.${ext.name}`;

  return (
    <div className="extensions-view">
      <div className="extensions-header">
        <span>EXTENSIONS</span>
        <button className="ext-close-btn" onClick={() => setActiveView('editor')}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
        </button>
      </div>

      <div className="extensions-search-wrap">
        <IconSearch size={14} />
        <input className="ext-search-input" placeholder="Search extensions..." value={query} onChange={e => setQuery(e.target.value)} />
      </div>

      <div className="extensions-list">
        {installedExtensions.length > 0 && (
          <div className="ext-section">
            <div className="ext-section-label">INSTALLED ({installedExtensions.length})</div>
            {installedExtensions.map(name => (
              <div key={name} className="ext-item installed">
                <div className="ext-item-info">
                  <span className="ext-item-name">{name}</span>
                </div>
                <button className="ext-uninstall-btn" onClick={() => handleUninstall(name)}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 3h8M4.5 3V2a1 1 0 011-1h1a1 1 0 011 1v1M3 3v7a1 1 0 001 1h4a1 1 0 001-1V3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {detail && (
          <div className="ext-detail">
            <div className="ext-detail-header">
              <button className="ext-detail-back" onClick={() => setDetail(null)}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <span className="ext-detail-title">{detail.displayName || detail.name}</span>
            </div>
            <div className="ext-detail-body">
              <div className="ext-detail-meta">
                <span>{detail.publisher}</span>
                <span>v{detail.version}</span>
              </div>
              <p className="ext-detail-desc">{detail.description}</p>
              <div className="ext-detail-stats">
                <span><IconDownload size={12} /> {detail.downloads.toLocaleString()}</span>
                <span><IconStar size={12} /> {detail.rating.toFixed(1)}</span>
              </div>
              {detail.installed ? (
                <button className="ext-uninstall-btn wide" onClick={() => handleUninstall(pkgName(detail))}>Uninstall</button>
              ) : (
                <button className="ext-install-btn" onClick={() => handleInstall(detail)} disabled={installing === pkgName(detail)}>
                  {installing === pkgName(detail) ? 'Installing...' : 'Install'}
                </button>
              )}
            </div>
          </div>
        )}

        {loading && <div className="ext-loading"><div className="loading-dots"><span /><span /><span /></div></div>}
        {!loading && query.length > 1 && results.length === 0 && (
          <div className="ext-empty">No extensions found for "{query}"</div>
        )}
        {results.filter(ext => !installedExtensions.includes(pkgName(ext))).map(ext => (
          <div key={pkgName(ext)} className="ext-item" onClick={() => handleShowDetail(ext)}>
            <div className="ext-item-icon">
              {ext.icon ? (
                <img src={ext.icon.startsWith('http') ? ext.icon : `https://open-vsx.org${ext.icon}`} alt="" width="20" height="20" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="2" y="2" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M7 7l3 3-3 3M10 13h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <div className="ext-item-info">
              <span className="ext-item-name">{ext.displayName || ext.name}</span>
              <span className="ext-item-publisher">{ext.publisher}</span>
              <span className="ext-item-desc">{ext.description?.slice(0, 80)}{ext.description?.length > 80 ? '...' : ''}</span>
            </div>
            <button className="ext-install-sm" onClick={e => { e.stopPropagation(); handleInstall(ext); }} disabled={installing === pkgName(ext)}>
              {installing === pkgName(ext) ? '...' : '+'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExtensionsView;
