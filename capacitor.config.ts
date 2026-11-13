import type { CapacitorConfig } from '@capacitor/cli';

// The app shows the game from GitHub Pages, so a new web build reaches the tablet
// without reinstalling. The service worker keeps the last loaded version for offline play.
const config: CapacitorConfig = {
  appId: 'com.leocuong.vuongquoccauvong',
  appName: 'Vuong Quoc Cau Vong',
  webDir: process.env.VQCV_REMOTE === '1' ? '../../shell' : 'dist',
  // tells the web game that this shell hides the system bars itself
  appendUserAgent: ' VQCV/6',
};

// Build with VQCV_REMOTE=1 once the GitHub Pages site is live; without it the game is bundled in the APK.
if (process.env.VQCV_REMOTE === '1') {
  config.server = {
    url: 'https://leocuong68-beep.github.io/vuong-quoc-cau-vong/',
    errorPath: 'offline.html',
  };
}

export default config;
