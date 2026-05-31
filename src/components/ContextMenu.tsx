import { useEffect, useRef } from 'react';
import { useStore } from '../store';

function ContextMenu() {
  const { contextMenu, closeContextMenu } = useStore();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => closeContextMenu();
    const clickHandler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        closeContextMenu();
      }
    };
    if (contextMenu.visible) {
      document.addEventListener('scroll', handler);
      document.addEventListener('contextmenu', handler);
      window.addEventListener('mousedown', clickHandler);
    }
    return () => {
      document.removeEventListener('scroll', handler);
      document.removeEventListener('contextmenu', handler);
      window.removeEventListener('mousedown', clickHandler);
    };
  }, [contextMenu.visible]);

  if (!contextMenu.visible || contextMenu.items.length === 0) return null;

  return (
    <div
      ref={ref}
      className="context-menu"
      style={{ left: contextMenu.x, top: contextMenu.y }}
    >
      {contextMenu.items.map((item, i) => (
        item.separator ? (
          <div key={i} className="context-menu-separator" />
        ) : (
          <button
            key={i}
            className={`context-menu-item ${item.disabled ? 'disabled' : ''}`}
            disabled={item.disabled}
            onClick={() => {
              if (!item.disabled && item.onClick) { item.onClick(); }
              closeContextMenu();
            }}
          >
            <span className="context-menu-label">{item.label}</span>
            {item.shortcut && <span className="context-menu-shortcut">{item.shortcut}</span>}
          </button>
        )
      ))}
    </div>
  );
}

export default ContextMenu;
