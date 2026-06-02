import { useState, useCallback } from 'react';
import { useStore } from '../store';
import {
  IconFolder, IconChevronRight, IconChevronDown,
  getFileIconComponent, IconNewFile, IconNewFolder, IconTrash, IconRefresh
} from './Icons';
import GitHubLogin from './GitHubLogin';

interface SidebarProps {
  openFolder: string | null;
  onOpenFolder: () => void;
  onOpenFile: (path: string) => void;
  onFileDrop: (path: string) => void;
  onRefreshFolder?: () => void;
}

interface TreeNode {
  name: string; path: string; isDirectory: boolean; ext?: string; children?: TreeNode[];
}

function FileTreeNode({ node, depth, onOpenFile, onContextMenu }: { node: TreeNode; depth: number; onOpenFile: (path: string) => void; onContextMenu: (e: React.MouseEvent, node: TreeNode) => void }) {
  const [expanded, setExpanded] = useState(depth < 1);
  const ext = node.isDirectory ? '' : (node.name.split('.').pop()?.toLowerCase() || '');

  const toggle = () => {
    if (node.isDirectory) setExpanded(!expanded);
    else onOpenFile(node.path);
  };

  return (
    <div>
      <div className="file-tree-item" style={{ paddingLeft: depth * 14 + 8 }} onClick={toggle} onContextMenu={(e) => onContextMenu(e, node)}>
        {node.isDirectory ? (
          expanded ? <IconChevronDown size={10} /> : <IconChevronRight size={10} />
        ) : (
          <span className="file-icon-node">{getFileIconComponent(ext, 14)}</span>
        )}
        <span className={`file-name ${node.isDirectory ? 'dir' : ''}`}>{node.name}</span>
      </div>
      {node.isDirectory && expanded && node.children && (
        <div>{node.children.map((child, i) => (
          <FileTreeNode key={child.path} node={child} depth={depth + 1} onOpenFile={onOpenFile} onContextMenu={onContextMenu} />
        ))}</div>
      )}
    </div>
  );
}

function Sidebar({ openFolder, onOpenFolder, onOpenFile, onRefreshFolder }: SidebarProps) {
  const { fileTree, tabs, activeTabId, closeTab, notify, showContextMenu } = useStore();
  const [showOpenFiles, setShowOpenFiles] = useState(true);
  const [showWorkspace, setShowWorkspace] = useState(true);

  const folderName = openFolder
    ? openFolder.split('\\').pop()?.split('/').pop() || 'Workspace'
    : 'Workspace';

  const handleFileTreeContextMenu = useCallback((e: React.MouseEvent, node: TreeNode) => {
    e.preventDefault();
    e.stopPropagation();
    const api = (window as any).electronAPI;
    const items: any[] = [];
    if (node.isDirectory) {
      items.push({
        label: 'New File', onClick: async () => {
          const name = prompt('File name:');
          if (name && api?.file?.create) {
            await api.file.create(node.path + '/' + name);
            if (openFolder && api?.file?.readTree) {
              const tree = await api.file.readTree(openFolder);
              useStore.getState().setFileTree(tree || []);
            }
          }
        },
      });
      items.push({
        label: 'New Folder', onClick: async () => {
          const name = prompt('Folder name:');
          if (name && api?.file?.mkdir) {
            await api.file.mkdir(node.path + '/' + name);
            if (openFolder && api?.file?.readTree) {
              const tree = await api.file.readTree(openFolder);
              useStore.getState().setFileTree(tree || []);
            }
          }
        },
      });
      items.push({ separator: true });
      items.push({
        label: 'Delete Folder', onClick: async () => {
          if (confirm('Delete folder "' + node.name + '" and all its contents?')) {
            if (api?.file?.delete) await api.file.delete(node.path);
            if (openFolder && api?.file?.readTree) {
              const tree = await api.file.readTree(openFolder);
              useStore.getState().setFileTree(tree || []);
            }
          }
        },
      });
    } else {
      items.push({
        label: 'Rename File', onClick: async () => {
          const name = prompt('New name:', node.name);
          if (name && name !== node.name && api?.file?.read && api?.file?.write) {
            const parent = node.path.substring(0, node.path.lastIndexOf('/') > 0 ? node.path.lastIndexOf('/') : node.path.lastIndexOf('\\'));
            const newPath = parent + '/' + name;
            const content = await api.file.read(node.path);
            if (!content.error) {
              await api.file.write(newPath, content.content);
              await api.file.delete(node.path);
              if (openFolder && api?.file?.readDir) {
                const tree = await api.file.readDir(openFolder);
                useStore.getState().setFileTree(tree);
              }
            }
          }
        },
      });
      items.push({ separator: true });
      items.push({
        label: 'Delete File', onClick: async () => {
          if (confirm('Delete "' + node.name + '"?')) {
            if (api?.file?.delete) await api.file.delete(node.path);
            if (openFolder && api?.file?.readTree) {
              const tree = await api.file.readTree(openFolder);
              useStore.getState().setFileTree(tree || []);
            }
          }
        },
      });
    }
    showContextMenu(e.clientX, e.clientY, items);
  }, [openFolder, showContextMenu]);

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <IconFolder size={14} />
        <span className="sidebar-title">{openFolder ? folderName : 'Explorer'}</span>
        {openFolder && (
          <button className="sidebar-header-btn" onClick={onRefreshFolder || onOpenFolder} title="Refresh">
            <IconRefresh size={12} />
          </button>
        )}
      </div>

      {!openFolder && (
        <div className="sidebar-section">
          <div className="sidebar-placeholder" onClick={onOpenFolder}>
            <IconFolder size={18} />
            <span>Open Folder</span>
          </div>
        </div>
      )}

      {openFolder && (
        <div className="sidebar-section">
          <div className="sidebar-section-header" onClick={() => setShowOpenFiles(!showOpenFiles)}>
            {showOpenFiles ? <IconChevronDown size={10} /> : <IconChevronRight size={10} />}
            <span>OPEN FILES</span>
            <span className="section-count">{tabs.length}</span>
          </div>
          {showOpenFiles && tabs.length > 0 && (
            <div className="open-files-list">
              {tabs.map(tab => (
                <div key={tab.id} className={`open-file-item ${tab.id === activeTabId ? 'active' : ''}`}
                  onClick={() => useStore.getState().setActiveTab(tab.id)}>
                  <span className="file-icon-node">{getFileIconComponent(tab.language, 13)}</span>
                  <span className="file-name">{tab.fileName}</span>
                  {tab.isDirty && <span className="dirty-dot">●</span>}
                  <button className="file-close" onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
          {showOpenFiles && tabs.length === 0 && (
            <div className="sidebar-empty-hint">No open files</div>
          )}
        </div>
      )}

      {openFolder && (
        <div className="sidebar-section" style={{ flex: 1, overflow: 'auto' }}>
          <div className="sidebar-section-header" onClick={() => setShowWorkspace(!showWorkspace)}>
            {showWorkspace ? <IconChevronDown size={10} /> : <IconChevronRight size={10} />}
            <span>WORKSPACE</span>
          </div>
          {showWorkspace && (
            <div className="file-tree">
              {fileTree.length === 0 && (
                <div className="sidebar-empty-hint">Empty directory</div>
              )}
              {fileTree.map((node: TreeNode) => (
                <FileTreeNode key={node.path} node={node} depth={0} onOpenFile={onOpenFile} onContextMenu={handleFileTreeContextMenu} />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="sidebar-section sidebar-footer">
        <GitHubLogin />
      </div>
    </div>
  );
}

export default Sidebar;
