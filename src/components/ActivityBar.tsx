import { useStore, ActiveView } from '../store';
import { IconExplorer, IconSearch, IconBranch, IconTerminal, IconSettings, IconAI, IconExtensions, IconPlug, IconSnippet } from './Icons';

function ActivityBar() {
  const { view, activeView, setActiveView, toggleExplorer, toggleTerminal, toggleFindReplace } = useStore();

  const handleView = (id: ActiveView) => {
    if (activeView === id) setActiveView('editor');
    else setActiveView(id);
  };

  const items = [
    { id: 'explorer' as const, icon: IconExplorer, title: 'Explorer (Ctrl+B)', active: view.explorer, onClick: toggleExplorer },
    { id: 'extensions' as const, icon: IconExtensions, title: 'Extensions', active: activeView === 'extensions', onClick: () => handleView('extensions') },
    { id: 'search' as const, icon: IconSearch, title: 'Search (Ctrl+F)', active: view.findReplace, onClick: toggleFindReplace },
    { id: 'source-control' as const, icon: IconBranch, title: 'Source Control (Git)', active: activeView === 'source-control', onClick: () => handleView('source-control') },
    { id: 'mcp' as const, icon: IconPlug, title: 'MCP Servers', active: activeView === 'mcp', onClick: () => handleView('mcp') },
    { id: 'snippets' as const, icon: IconSnippet, title: 'Snippets', active: activeView === 'snippets', onClick: () => handleView('snippets') },
    { id: 'ai' as const, icon: IconAI, title: 'AI Assistant (Ctrl+J)', active: activeView === 'ai', onClick: () => handleView('ai') },
    { id: 'terminal' as const, icon: IconTerminal, title: 'Terminal (Ctrl+`)', active: activeView === 'terminal' || view.terminal, onClick: () => handleView('terminal') },
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
          className={`activitybar-btn ${activeView === 'settings' ? 'active' : ''}`}
          onClick={() => handleView('settings')}
          title="Settings (Ctrl+,)"
        >
          <IconSettings size={18} />
        </button>
      </div>
    </div>
  );
}

export default ActivityBar;
