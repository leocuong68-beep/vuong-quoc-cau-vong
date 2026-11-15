// Học viện Tin Tin — macOS window for the study game.
// It opens the live game (it updates itself) and keeps working offline from the game's own cache.
const { app, BrowserWindow, Menu, shell } = require('electron');

const HOME = 'https://leocuong68-beep.github.io/vuong-quoc-cau-vong/';
const START = HOME + '#/tintin';

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 640,
    title: 'Học viện Tin Tin',
    backgroundColor: '#1d2a44',
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, sandbox: true },
  });
  win.loadURL(START);
  // stay inside the game; anything else opens in the normal browser
  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith(HOME)) {
      e.preventDefault();
      shell.openExternal(url);
    }
  });
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

const template = [
  {
    label: 'Học viện Tin Tin',
    submenu: [{ role: 'reload', label: 'Tải lại' }, { role: 'togglefullscreen', label: 'Toàn màn hình' }, { type: 'separator' }, { role: 'quit', label: 'Thoát' }],
  },
  { role: 'editMenu' },
];

app.whenReady().then(() => {
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on('window-all-closed', () => app.quit());
