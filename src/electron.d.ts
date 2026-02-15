export interface ElectronFileData {
  name: string;
  content: string;
  path: string;
}

export interface ElectronAPI {
  openFiles: () => Promise<ElectronFileData[]>;
  onFileOpened: (callback: (file: ElectronFileData) => void) => () => void;
  onMenuOpenFile: (callback: () => void) => () => void;
  onMenuToggleTheme: (callback: () => void) => () => void;
  onMenuIncreaseFontSize: (callback: () => void) => () => void;
  onMenuDecreaseFontSize: (callback: () => void) => () => void;
  onMenuToggleEditor: (callback: () => void) => () => void;
  onMenuNewFile: (callback: () => void) => () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
