import { useStore } from '../store';
import { IconClose, getFileIconComponent } from './Icons';

function TabBar() {
  const { tabs, activeTabId, setActiveTab, closeTab } = useStore();
  if (tabs.length === 0) return null;

  return (
    <div className="tabbar">
      {tabs.map(tab => (
        <div
          key={tab.id}
          className={`tab ${tab.id === activeTabId ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
          onMouseDown={(e) => { if (e.button === 1) closeTab(tab.id); }}
        >
          <span className="tab-icon">
            {getFileIconComponent(tab.language, 13)}
          </span>
          <span className="tab-name">{tab.fileName}</span>
          {tab.isDirty && <span className="tab-dirty">●</span>}
          <button className="tab-close" onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}>
            <IconClose size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}

export default TabBar;
