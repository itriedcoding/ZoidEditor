import { useStore } from '../store';
import { IconExplorer, IconSearch, IconBranch, IconTerminal, IconSettings, IconAI, IconExtensions } from './Icons';

function ActivityBar() {
  const { view, toggleExplorer, toggleAIPanel, toggleTerminal, toggleSettings, toggleExtensionsView, toggleFindReplace, extensionsView, gitView, toggleGitView } = useStore();

  const items = [
    { id: 'explorer', icon: IconExplorer, title: 'Explorer (Ctrl+B)', active: view.explorer, onClick: toggleExplorer },
    { id: 'extensions', icon: IconExtensions, title: 'Extensions', active: extensionsView, onClick: toggleExtensionsView },
    { id: 'search', icon: IconSearch, title: 'Search (Ctrl+F)', active: view.findReplace, onClick: toggleFindReplace },
    { id: 'source-control', icon: IconBranch, title: 'Source Control (Git)', active: gitView, onClick: toggleGitView },
    { id: 'ai', icon: IconAI, title: 'AI Assistant (Ctrl+J)', active: view.aiPanel, onClick: toggleAIPanel },
    { id: 'terminal', icon: IconTerminal, title: 'Terminal (Ctrl+`)', active: view.terminal, onClick: toggleTerminal },
  ];

  return (
    <div className="activitybar">
      <div className="activitybar-top">
        {items.map(item => (
          <button
            key={item.id}
            className={`activitybar-btn ${item.active ? 'active' : ''}`}
            onClick={item.onClick}
            title={item.title}
          >
            <item.icon size={20} />
          </button>
        ))}
      </div>
      <div className="activitybar-bottom">
        <button
          className={`activitybar-btn ${view.settings ? 'active' : ''}`}
          onClick={toggleSettings}
          title="Settings (Ctrl+,)"
        >
          <IconSettings size={18} />
        </button>
      </div>
    </div>
  );
}

export default ActivityBar;
