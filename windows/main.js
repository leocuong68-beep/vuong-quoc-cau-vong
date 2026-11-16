// Học viện — Windows app of the public study game (Greek, English, Maths, Physics & Robots).
// Opens the live game at #/hoc: the child types a name first, then studies.
// The game updates itself (and has an Update button); it keeps working offline from its cache.
const { app, BrowserWindow, Menu, shell } = require('electron');

const START = 'https://leocuong68-beep.github.io/vuong-quoc-cau-vong/#/hoc';

if (!app.requestSingleInstanceLock()) app.quit();

let win = null;
const createWindow = () => {
  win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#1d2733',
    title: 'Học viện',
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, sandbox: true },
  });
  win.maximize();
  win.loadURL(START);
  // links to other sites open in the normal browser, not in the app
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith('https://leocuong68-beep.github.io/vuong-quoc-cau-vong/')) {
      e.preventDefault();
      shell.openExternal(url);
    }
  });
  // no internet on the very first start: try again every few seconds
  win.webContents.on('did-fail-load', () => setTimeout(() => win && win.loadURL(START), 4000));
  win.on('closed', () => (win = null));
};

app.on('second-instance', () => {
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});
app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();
});
app.on('window-all-closed', () => app.quit());
