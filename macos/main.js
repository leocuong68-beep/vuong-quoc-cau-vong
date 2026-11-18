// Học viện Tin Tin — macOS app for Tin Tin's study game.
// - Opens the live game (it updates itself; works offline from the game's cache).
// - Minecraft lock: the Minecraft launcher may only run on a day Tin Tin has finished
//   his daily mission (one lesson in each of the 4 subjects). The game page then shows a
//   "Play Minecraft" button that asks this app to open the launcher. If the launcher is
//   started any other way on a locked day, this app closes it and shows the study page.
// - Starts at login and keeps running in the background; quitting needs the parent code.
const { app, BrowserWindow, Menu, shell, ipcMain, dialog, powerMonitor } = require('electron');
const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');

const HOME = 'https://leocuong68-beep.github.io/vuong-quoc-cau-vong/';
const START = HOME + '#/tintin';
const PARENT_CODE_DEFAULT = '6868';

let win = null;
let allowedDay = '';
let allowQuit = false;
let lastWarn = 0;

const today = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
};

// settings kept next to the app's data: parent code, day already allowed
const settingsFile = () => path.join(app.getPath('userData'), 'hoc-vien.json');
const readSettings = () => {
  try {
    return JSON.parse(fs.readFileSync(settingsFile(), 'utf8'));
  } catch (e) {
    return {};
  }
};
const writeSettings = (s) => {
  try {
    fs.writeFileSync(settingsFile(), JSON.stringify(s, null, 2));
  } catch (e) {
    // not fatal
  }
};
const parentCode = () => String(readSettings().parentCode || PARENT_CODE_DEFAULT);

// ---- Minecraft launcher ----
// The Java Edition launcher is /Applications/Minecraft.app (executable Contents/MacOS/launcher);
// the game itself runs as java with net.minecraft.client.main.Main.
const LAUNCHER_PATTERN = 'Minecraft.app/Contents/MacOS';
const GAME_PATTERN = 'net.minecraft.client.main.Main';

const run = (cmd, args) =>
  new Promise((resolve) => {
    execFile(cmd, args, { timeout: 5000 }, (err, stdout) => resolve({ ok: !err, out: String(stdout || '') }));
  });

const isRunning = async (pattern) => (await run('/usr/bin/pgrep', ['-f', pattern])).ok;
const stop = (pattern) => run('/usr/bin/pkill', ['-f', pattern]);

// The game page writes academy_minecraft_open = today's date when the mission is done.
const missionDoneToday = async () => {
  if (!win || win.isDestroyed()) return false;
  try {
    const ok = await win.webContents.executeJavaScript(
      `(function(){try{
        var t=${JSON.stringify(today())};
        if(localStorage.academy_minecraft_open===t)return true;
        var p=JSON.parse(localStorage.academy_progress||'{}');var d=(p.days||{})[t]||[];
        return ['greek','english','math','physics'].every(function(s){return d.indexOf(s)>=0});
      }catch(e){return false}})()`,
      true
    );
    return ok === true;
  } catch (e) {
    return false;
  }
};

const isAllowed = async () => {
  if (allowedDay === today()) return true;
  if (await missionDoneToday()) {
    allowedDay = today();
    writeSettings({ ...readSettings(), allowedDay });
    return true;
  }
  return false;
};

const showStudy = (message) => {
  if (!win || win.isDestroyed()) createWindow();
  win.show();
  win.focus();
  app.focus({ steal: true });
  const now = Date.now();
  if (message && now - lastWarn > 8000) {
    lastWarn = now;
    dialog.showMessageBox(win, {
      type: 'info',
      title: 'Minecraft đang khóa',
      message,
      buttons: ['OK'],
    });
  }
};

// every 2 seconds: on a locked day, close the launcher (and the game) if they were opened
const watch = async () => {
  const launcher = await isRunning(LAUNCHER_PATTERN);
  const game = await isRunning(GAME_PATTERN);
  if (!launcher && !game) return;
  if (await isAllowed()) return;
  if (launcher) await stop(LAUNCHER_PATTERN);
  if (game) await stop(GAME_PATTERN);
  if (win && !win.isDestroyed()) win.webContents.executeJavaScript("location.hash = '#/tintin'").catch(() => {});
  showStudy('Học xong mỗi môn 1 bài thì Minecraft mới mở nhé Tin Tin!');
};

const openMinecraft = async () => {
  if (!(await isAllowed())) {
    showStudy('Học xong mỗi môn 1 bài thì Minecraft mới mở nhé Tin Tin!');
    return { ok: false, reason: 'locked' };
  }
  let res = await run('/usr/bin/open', ['-a', 'Minecraft']);
  if (!res.ok) res = await run('/usr/bin/open', ['-b', 'com.mojang.minecraftlauncher']);
  if (!res.ok) {
    dialog.showMessageBox(win, { type: 'warning', message: 'Không tìm thấy Minecraft trong thư mục Applications.' });
    return { ok: false, reason: 'not-found' };
  }
  return { ok: true };
};

// ---- keep running: a per-user LaunchAgent starts the app at login and restarts it if it is
// force-quit. Only the parent code stops it (until the next login). No admin rights needed.
const LABEL = 'com.leocuong.hocvientintin';
const os = require('os');
const agentFile = () => path.join(os.homedir(), 'Library', 'LaunchAgents', LABEL + '.plist');
const fromLaunchd = process.env.XPC_SERVICE_NAME === LABEL;
const uid = () => (process.getuid ? process.getuid() : 501);

const installAgent = () => {
  const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>${LABEL}</string>
  <key>ProgramArguments</key><array><string>${process.execPath}</string></array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>ThrottleInterval</key><integer>5</integer>
  <key>ProcessType</key><string>Interactive</string>
</dict></plist>
`;
  try {
    fs.mkdirSync(path.dirname(agentFile()), { recursive: true });
    let old = '';
    try {
      old = fs.readFileSync(agentFile(), 'utf8');
    } catch (e) {
      // first install
    }
    if (old !== plist) fs.writeFileSync(agentFile(), plist);
    return true;
  } catch (e) {
    return false;
  }
};

const startAgent = async () => {
  const domain = 'gui/' + uid();
  const res = await run('/bin/launchctl', ['bootstrap', domain, agentFile()]);
  if (!res.ok) await run('/bin/launchctl', ['kickstart', domain + '/' + LABEL]);
  return true;
};

const stopAgent = () => run('/bin/launchctl', ['bootout', 'gui/' + uid() + '/' + LABEL]);

// ---- parent code to quit ----
const askParentCode = () =>
  new Promise((resolve) => {
    const w = new BrowserWindow({
      width: 360,
      height: 190,
      parent: win || undefined,
      modal: !!win,
      resizable: false,
      minimizable: false,
      title: 'Phụ huynh',
      webPreferences: { contextIsolation: true, sandbox: true },
    });
    const html = `<!doctype html><meta charset="utf-8"><body style="font:15px -apple-system;padding:18px;background:#24212c;color:#fff">
      <div>Nhập mã phụ huynh để thoát app:</div>
      <input id="c" type="password" autofocus style="font-size:20px;width:100%;margin:12px 0;padding:6px">
      <button onclick="document.title='CODE:'+document.getElementById('c').value" style="font-size:15px;padding:6px 16px">Thoát app</button>
      <script>document.getElementById('c').addEventListener('keydown',e=>{if(e.key==='Enter')document.title='CODE:'+e.target.value})</script></body>`;
    w.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
    let done = false;
    w.on('page-title-updated', (e, title) => {
      if (!title.startsWith('CODE:')) return;
      e.preventDefault();
      done = true;
      const ok = title.slice(5) === parentCode();
      w.close();
      resolve(ok);
    });
    w.on('closed', () => {
      if (!done) resolve(false);
    });
  });

const parentQuit = async () => {
  if (await askParentCode()) {
    allowQuit = true;
    // stop the background agent for this session (it starts again at the next login)
    if (fromLaunchd) await stopAgent();
    app.quit();
  }
};

// ---- window ----
function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 640,
    title: 'Học viện Tin Tin',
    backgroundColor: '#1d2a44',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
      devTools: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  win.loadURL(START);
  // The app starts at login, often before Wi-Fi is up: a failed load used to leave an empty
  // dark window. Now it tries again every few seconds until the game shows.
  let loaded = false;
  win.webContents.on('did-fail-load', (e, code, desc, url, isMain) => {
    if (!isMain) return;
    loaded = false;
    setTimeout(() => win && !win.isDestroyed() && win.loadURL(START), 4000);
  });
  win.webContents.on('did-finish-load', () => {
    loaded = true;
    // the page loaded but shows nothing (e.g. an old cache): reload once from the network
    setTimeout(async () => {
      if (!win || win.isDestroyed()) return;
      const empty = await win.webContents
        .executeJavaScript("!document.querySelector('#app') || !document.querySelector('#app').children.length")
        .catch(() => false);
      if (empty) win.webContents.reloadIgnoringCache();
    }, 8000);
  });
  win.on('show', () => {
    if (!loaded) win.loadURL(START);
  });
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
  // closing the window only hides it, so the lock keeps working
  win.on('close', (e) => {
    if (!allowQuit) {
      e.preventDefault();
      win.hide();
    }
  });
}

const template = [
  {
    label: 'Học viện Tin Tin',
    submenu: [
      { label: 'Mở trang học', click: () => showStudy() },
      { role: 'reload', label: 'Tải lại' },
      { role: 'togglefullscreen', label: 'Toàn màn hình' },
      { type: 'separator' },
      { label: 'Phụ huynh: thoát app…', click: parentQuit },
    ],
  },
  { role: 'editMenu' },
];

const single = app.requestSingleInstanceLock();
if (!single) {
  app.quit();
} else {
  app.on('second-instance', () => showStudy());
  app.whenReady().then(() => {
    allowedDay = readSettings().allowedDay || '';
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
    ipcMain.handle('open-minecraft', openMinecraft);
    // Started by hand (e.g. from Applications): install the background agent and hand over to it,
    // so there is one copy that macOS keeps alive. If that fails, just run normally.
    if (process.execPath.includes('/AppTranslocation/') || !process.execPath.startsWith('/Applications/')) {
      dialog.showMessageBoxSync({
        type: 'info',
        message: 'Hãy kéo "Hoc vien Tin Tin" vào thư mục Applications rồi mở lại từ đó, để khóa Minecraft chạy được.',
      });
    } else if (!fromLaunchd && app.isPackaged && installAgent()) {
      allowQuit = true;
      startAgent().then(() => app.exit(0));
      return;
    }
    createWindow();
    setInterval(watch, 2000);
    // never block the Mac from shutting down or restarting
    powerMonitor.on('shutdown', () => {
      allowQuit = true;
      app.quit();
    });
    app.on('activate', () => showStudy());
  });
  // Cmd+Q and the Dock "Quit" need the parent code
  app.on('before-quit', (e) => {
    if (!allowQuit) {
      e.preventDefault();
      parentQuit();
    }
  });
  app.on('window-all-closed', () => {
    // keep running in the background
  });
}
