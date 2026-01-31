import { useEffect } from 'react';

// Define keyboard shortcut mappings
interface ShortcutAction {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts() {
  useEffect(() => {
    const shortcuts: ShortcutAction[] = [
      {
        key: 'k',
        ctrlKey: true,
        action: () => {
          // Focus search input
          const searchInput = document.querySelector('input[type="search"], input[placeholder*="search" i]') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
          }
        },
        description: 'Focus search'
      },
      {
        key: 'n',
        ctrlKey: true,
        action: () => {
          // Navigate to new project/job
          window.location.href = '/dashboard/create-project';
        },
        description: 'New project'
      },
      {
        key: 'h',
        ctrlKey: true,
        action: () => {
          // Toggle help modal
          const helpButton = document.querySelector('[data-help-trigger]') as HTMLElement;
          if (helpButton) {
            helpButton.click();
          }
        },
        description: 'Show help'
      }
    ];

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target as HTMLElement)?.contentEditable === 'true'
      ) {
        return;
      }

      shortcuts.forEach(({ key, ctrlKey, shiftKey, altKey, action }) => {
        if (
          event.key.toLowerCase() === key &&
          !!event.ctrlKey === !!ctrlKey &&
          !!event.shiftKey === !!shiftKey &&
          !!event.altKey === !!altKey
        ) {
          event.preventDefault();
          action();
        }
      });
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
}
