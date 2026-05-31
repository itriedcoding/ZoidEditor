/// <reference types="vite/client" />

interface Window {
  electronAPI: {
    file: {
      read: (filePath: string) => Promise<{ content: string; ext: string; fileName: string; error?: string }>;
      write: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>;
      open: () => Promise<{ files: Array<{ path: string; fileName: string; ext: string; content: string }> }>;
      openFolder: () => Promise<{ folder: string | null }>;
      saveAs: (content: string) => Promise<{ path: string; fileName: string; error?: string }>;
      readDir: (dirPath: string) => Promise<{
        items: Array<{ name: string; path: string; isDirectory: boolean; ext: string }>;
        error?: string;
      }>;
      delete: (filePath: string) => Promise<{ success: boolean; error?: string }>;
      create: (filePath: string) => Promise<{ success: boolean; error?: string }>;
      mkdir: (dirPath: string) => Promise<{ success: boolean; error?: string }>;
    };
    dialog: {
      save: (options: any) => Promise<{ canceled: boolean; filePath?: string }>;
    };
    window: {
      minimize: () => Promise<void>;
      maximize: () => Promise<void>;
      close: () => Promise<void>;
      isMaximized: () => Promise<boolean>;
    };
    app: {
      getVersion: () => Promise<string>;
      getPath: (name: string) => Promise<string>;
      getPlatform: () => Promise<string>;
    };
    onMenuAction: (callback: (action: string) => void) => () => void;
  };
}
