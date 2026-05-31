import { useEffect, useRef } from 'react';
import { useStore } from '../store';
import { IconX, IconChevronDown, IconChevronUp } from './Icons';

function FindReplace() {
  const { findReplace, updateFindReplace, toggleFindReplace, findController } = useStore();
  const findInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (findReplace.visible) {
      setTimeout(() => findInputRef.current?.focus(), 100);
    }
  }, [findReplace.visible]);

  const getController = () => {
    const fc = findController;
    if (fc) return fc;
    return null;
  };

  const doFind = (action: 'find' | 'findNext' | 'findPrev') => {
    const ctrl = getController();
    if (!ctrl) return;
    if (action === 'find') ctrl.setSearchString(findReplace.findText);
    if (findReplace.findText) {
      if (action === 'findNext' || action === 'find') ctrl.findNext();
      else if (action === 'findPrev') ctrl.findPrevious();
    }
  };

  const handleFindKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') toggleFindReplace();
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) doFind('findPrev');
      else doFind('findNext');
    }
  };

  const handleReplace = () => {
    const ctrl = getController();
    if (!ctrl || !findReplace.replaceText) return;
    ctrl.replace(findReplace.replaceText);
  };

  const handleReplaceAll = () => {
    const ctrl = getController();
    if (!ctrl || !findReplace.replaceText) return;
    ctrl.replaceAll(findReplace.replaceText);
  };

  if (!findReplace.visible) return null;

  return (
    <div className="find-replace">
      <div className="find-input-row">
        <input
          ref={findInputRef}
          className="fr-input"
          placeholder="Find"
          value={findReplace.findText}
          onChange={e => updateFindReplace({ findText: e.target.value })}
          onKeyDown={handleFindKeyDown}
        />
        <div className="fr-options">
          <button className={`fr-opt ${findReplace.caseSensitive ? 'active' : ''}`}
            onClick={() => {
              updateFindReplace({ caseSensitive: !findReplace.caseSensitive });
              doFind('find');
            }}
            title="Case Sensitive">Aa</button>
          <button className={`fr-opt ${findReplace.useRegex ? 'active' : ''}`}
            onClick={() => {
              updateFindReplace({ useRegex: !findReplace.useRegex });
              doFind('find');
            }}
            title="Use Regex">.*</button>
        </div>
        <button className="fr-nav-btn" title="Previous Match" onClick={() => doFind('findPrev')}><IconChevronUp size={12} /></button>
        <button className="fr-nav-btn" title="Next Match" onClick={() => doFind('findNext')}><IconChevronDown size={12} /></button>
        <button className="fr-close-btn" onClick={toggleFindReplace}><IconX size={12} /></button>
      </div>
      <div className="find-input-row">
        <input
          className="fr-input"
          placeholder="Replace"
          value={findReplace.replaceText}
          onChange={e => updateFindReplace({ replaceText: e.target.value })}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (e.shiftKey) handleReplaceAll();
              else handleReplace();
            }
          }}
        />
        <button className="fr-replace-btn" onClick={handleReplace}>Replace</button>
        <button className="fr-replace-btn" onClick={handleReplaceAll}>Replace All</button>
      </div>
    </div>
  );
}

export default FindReplace;
