import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { IconBranch, IconRefresh, IconChevronDown, IconChevronRight, IconX } from './Icons';

function SourceControl() {
  const { gitState, setGitState, toggleGitView, notify, openFolder } = useStore();
  const [loading, setLoading] = useState(false);
  const [commitMsg, setCommitMsg] = useState('');
  const [showBranches, setShowBranches] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');

  const refreshStatus = async () => {
    const api = (window as any).electronAPI;
    if (!api?.git) return;
    setLoading(true);
    try {
      const result = await api.git.status();
      if (result.status) {
        setGitState({ status: result.status });
      }
    } catch {}
    setLoading(false);
  };

  const detectRepo = async () => {
    const api = (window as any).electronAPI;
    if (!api?.git || !openFolder) return;
    try {
      const result = await api.git.open(openFolder);
      if (result.isRepo) {
        setGitState({
          isRepo: true,
          status: result.status,
          branches: result.branches || [],
          currentBranch: result.currentBranch || '',
          log: result.log || [],
        });
      } else {
        setGitState({ isRepo: false, status: null, branches: [], currentBranch: '', log: [] });
      }
    } catch {
      setGitState({ isRepo: false });
    }
  };

  useEffect(() => {
    if (openFolder) detectRepo();
    else setGitState({ isRepo: false, status: null });
  }, [openFolder]);

  const handleStage = async (file: string) => {
    const api = (window as any).electronAPI;
    if (!api?.git) return;
    try {
      await api.git.add(file);
      await refreshStatus();
    } catch (err: any) {
      notify(`Stage failed: ${err.message}`, 'error');
    }
  };

  const handleUnstage = async (file: string) => {
    const api = (window as any).electronAPI;
    if (!api?.git) return;
    try {
      await api.git.unstage(file);
      await refreshStatus();
    } catch (err: any) {
      notify(`Unstage failed: ${err.message}`, 'error');
    }
  };

  const handleCommit = async () => {
    if (!commitMsg.trim()) return;
    const api = (window as any).electronAPI;
    if (!api?.git) return;
    try {
      const result = await api.git.commit(commitMsg.trim());
      if (result.success) {
        setCommitMsg('');
        await refreshStatus();
        notify('Committed successfully', 'success');
      }
    } catch (err: any) {
      notify(`Commit failed: ${err.message}`, 'error');
    }
  };

  const handleCheckout = async (branch: string) => {
    const api = (window as any).electronAPI;
    if (!api?.git) return;
    try {
      const result = await api.git.checkout(branch);
      if (result.success) {
        setGitState({ currentBranch: result.current, branches: result.branches, status: result.status });
        notify(`Switched to ${branch}`, 'info');
      }
    } catch (err: any) {
      notify(`Checkout failed: ${err.message}`, 'error');
    }
  };

  const handleCreateBranch = async () => {
    if (!newBranchName.trim()) return;
    const api = (window as any).electronAPI;
    if (!api?.git) return;
    try {
      const result = await api.git.branch(newBranchName.trim());
      if (result.success) {
        setNewBranchName('');
        setGitState({ currentBranch: result.current, branches: result.branches });
        notify(`Created and switched to ${newBranchName}`, 'success');
      }
    } catch (err: any) {
      notify(`Branch creation failed: ${err.message}`, 'error');
    }
  };

  const handleInit = async () => {
    const api = (window as any).electronAPI;
    if (!api?.git || !openFolder) return;
    try {
      const result = await api.git.init(openFolder);
      if (result.success) {
        setGitState({ isRepo: true, status: result.status, branches: result.branches, currentBranch: result.branches?.[0] || 'main' });
        notify('Git repository initialized', 'success');
      }
    } catch (err: any) {
      notify(`Git init failed: ${err.message}`, 'error');
    }
  };

  const handleStageAll = async () => {
    const api = (window as any).electronAPI;
    if (!api?.git) return;
    try {
      await api.git.add('.');
      await refreshStatus();
    } catch (err: any) {
      notify(`Stage all failed: ${err.message}`, 'error');
    }
  };

  const status = gitState.status;
  const stagedFiles = status?.staged || [];
  const unstagedFiles = status?.modified?.filter((f: string) => !stagedFiles.includes(f)) || [];
  const unmergedFiles = status?.conflicted || [];
  const untrackedFiles = status?.not_added || [];
  const allUnstaged = [...status?.modified || [], ...status?.deleted || [], ...status?.created || [], ...untrackedFiles];

  return (
    <div className="source-control-panel">
      <div className="sc-header">
        <span>SOURCE CONTROL</span>
        <button className="sc-close-btn" onClick={toggleGitView}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
        </button>
      </div>

      {!gitState.isRepo && openFolder && (
        <div className="sc-init">
          <p>This folder is not a git repository.</p>
          <button className="sc-init-btn" onClick={handleInit}>Initialize Repository</button>
        </div>
      )}

      {!openFolder && (
        <div className="sc-no-folder">
          <p>Open a folder to use source control.</p>
        </div>
      )}

      {gitState.isRepo && status && (
        <>
          <div className="sc-branch-row">
            <IconBranch size={14} />
            <span className="sc-current-branch">{gitState.currentBranch || 'main'}</span>
            <button className="sc-refresh-btn" onClick={refreshStatus} disabled={loading}>
              <IconRefresh size={12} />
            </button>
          </div>

          {allUnstaged.length > 0 && (
            <button className="sc-stage-all-btn" onClick={handleStageAll}>Stage All Changes</button>
          )}

          <div className="sc-commit-row">
            <input className="sc-commit-input" placeholder="Commit message..." value={commitMsg} onChange={e => setCommitMsg(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCommit(); }} />
            <button className="sc-commit-btn" disabled={!commitMsg.trim() || stagedFiles.length === 0} onClick={handleCommit}>Commit</button>
          </div>

          <div className="sc-sections">
            {stagedFiles.length > 0 && (
              <div className="sc-section">
                <div className="sc-section-header">
                  <span>STAGED</span>
                  <span className="sc-count">{stagedFiles.length}</span>
                </div>
                {stagedFiles.map((file: string) => (
                  <div key={file} className="sc-file-item">
                    <span className="sc-file-status staged">M</span>
                    <span className="sc-file-name">{file}</span>
                    <button className="sc-unstage-btn" onClick={() => handleUnstage(file)} title="Unstage">-</button>
                  </div>
                ))}
              </div>
            )}

            {unmergedFiles.length > 0 && (
              <div className="sc-section">
                <div className="sc-section-header">
                  <span>CONFLICTS</span>
                  <span className="sc-count">{unmergedFiles.length}</span>
                </div>
                {unmergedFiles.map((file: string) => (
                  <div key={file} className="sc-file-item conflict">
                    <span className="sc-file-status conflict">!</span>
                    <span className="sc-file-name">{file}</span>
                  </div>
                ))}
              </div>
            )}

            {allUnstaged.length > 0 && (
              <div className="sc-section">
                <div className="sc-section-header">
                  <span>CHANGES</span>
                  <span className="sc-count">{allUnstaged.length}</span>
                </div>
                {allUnstaged.map((file: string) => (
                  <div key={file} className="sc-file-item">
                    <span className="sc-file-status modified">M</span>
                    <span className="sc-file-name">{file}</span>
                    <button className="sc-stage-btn" onClick={() => handleStage(file)} title="Stage">+</button>
                  </div>
                ))}
              </div>
            )}

            {untrackedFiles.length > 0 && (
              <div className="sc-section">
                <div className="sc-section-header">
                  <span>UNTRACKED</span>
                  <span className="sc-count">{untrackedFiles.length}</span>
                </div>
                {untrackedFiles.map((file: string) => (
                  <div key={file} className="sc-file-item">
                    <span className="sc-file-status untracked">U</span>
                    <span className="sc-file-name">{file}</span>
                    <button className="sc-stage-btn" onClick={() => handleStage(file)} title="Stage">+</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="sc-section">
            <div className="sc-section-header sc-collapsible" onClick={() => setShowBranches(!showBranches)}>
              {showBranches ? <IconChevronDown size={10} /> : <IconChevronRight size={10} />}
              <span>BRANCHES</span>
              <span className="sc-count">{gitState.branches.length}</span>
            </div>
            {showBranches && (
              <div className="sc-branches-list">
                {gitState.branches.map((b: string) => (
                  <div key={b} className={`sc-branch-item ${b === gitState.currentBranch ? 'active' : ''}`}
                    onClick={() => handleCheckout(b)}>
                    <IconBranch size={12} />
                    <span>{b}</span>
                    {b === gitState.currentBranch && <span className="sc-checked">*</span>}
                  </div>
                ))}
                <div className="sc-new-branch-row">
                  <input className="sc-new-branch-input" placeholder="New branch name..." value={newBranchName}
                    onChange={e => setNewBranchName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleCreateBranch(); }} />
                  <button className="sc-create-branch-btn" onClick={handleCreateBranch}>+</button>
                </div>
              </div>
            )}
          </div>

          <div className="sc-section">
            <div className="sc-section-header sc-collapsible" onClick={() => setShowLog(!showLog)}>
              {showLog ? <IconChevronDown size={10} /> : <IconChevronRight size={10} />}
              <span>RECENT COMMITS</span>
              <span className="sc-count">{gitState.log.length}</span>
            </div>
            {showLog && (
              <div className="sc-commits-list">
                {gitState.log.map((c: any) => (
                  <div key={c.hash} className="sc-commit-item">
                    <span className="sc-commit-hash">{c.hash?.slice(0, 7)}</span>
                    <span className="sc-commit-msg">{c.message}</span>
                    <span className="sc-commit-date">{c.date?.slice(0, 10)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default SourceControl;
