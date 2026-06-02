import { useStore } from '../store';
import { IconBranch, IconX, IconCheckCircle, IconAI } from './Icons';

function StatusBar() {
  const { settings, activeTabId, tabs, gitState, githubUser } = useStore();
  const activeTab = tabs.find(t => t.id === activeTabId);
  const cursorPos = useStore(s => s.cursorPosition);

  return (
    <div className="statusbar">
      <div className="statusbar-left">
        {gitState.isRepo && gitState.currentBranch && (
          <span className="status-item" title="Git Branch" onClick={() => useStore.getState().setActiveView('source-control')}>
            <IconBranch size={13} />
            {gitState.currentBranch}
          </span>
        )}
        {githubUser && (
          <span className="status-item" title="GitHub User">
            {githubUser.login}
          </span>
        )}
      </div>
      <div className="statusbar-right">
        {settings.aiModel && (
          <span className="status-item" title="AI Model">
            <IconAI size={13} />
            {settings.aiModel.split('-')[0]}
          </span>
        )}
        {activeTab && (
          <>
            <span className="status-item">{activeTab.language || 'Plain Text'}</span>
            {activeTab.encoding && <span className="status-item">{activeTab.encoding}</span>}
            {activeTab.eol && <span className="status-item">{activeTab.eol === 1 ? 'LF' : 'CRLF'}</span>}
            <span className="status-item">
              Ln {cursorPos.lineNumber}, Col {cursorPos.column}
            </span>
            {activeTab.isDirty && <span className="status-item dirty"><IconX size={11} /> unsaved</span>}
          </>
        )}
        {!activeTab && <span className="status-item">No file open</span>}
        <span className="status-item">
          <IconCheckCircle size={13} />
          Ready
        </span>
      </div>
    </div>
  );
}

export default StatusBar;
