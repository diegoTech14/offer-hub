'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { HelpCircle, Keyboard } from 'lucide-react';

const shortcuts = [
  { keys: 'Ctrl + K', description: 'Focus search' },
  { keys: 'Ctrl + N', description: 'New project' },
  { keys: 'Ctrl + H', description: 'Show help' }
];

export function ShortcutHelp() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        data-help-trigger
        className="text-muted-foreground hover:text-foreground"
        aria-label="Show keyboard shortcuts"
      >
        <Keyboard className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Keyboard Shortcuts
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {shortcut.description}
                </span>
                <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded border">
                  {shortcut.keys}
                </kbd>
              </div>
            ))}
          </div>
          
          <div className="text-xs text-muted-foreground pt-2 border-t">
            Press Ctrl+H to open this help dialog anytime
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
