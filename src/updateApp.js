// Update button: asks the service worker for the newest version on GitHub Pages,
// waits for it to take over, then reloads. Works in the browser, Mia's Android app
// and Tin Tin's Mac app (all three load the same website).
export async function updateApp() {
  const reload = () => window.location.reload();
  try {
    if (!('serviceWorker' in navigator)) return reload();
    const regs = await navigator.serviceWorker.getRegistrations();
    if (!regs.length) return reload();
    const changed = new Promise((resolve) => {
      navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true });
      setTimeout(resolve, 6000);
    });
    await Promise.all(regs.map((r) => r.update().catch(() => {})));
    regs.forEach((r) => r.waiting && r.waiting.postMessage({ type: 'SKIP_WAITING' }));
    await changed;
  } catch (e) {
    // no service worker here: a plain reload is the update
  }
  reload();
}

export const appVersion = () =>
  (import.meta.env.APP_VERSION || '') + (import.meta.env.APP_COMMIT ? ' · ' + import.meta.env.APP_COMMIT : '');

// On start (and every few minutes): if the server has a newer build, take it.
// A guard in sessionStorage stops a reload loop if the server and the cache disagree for a while.
export async function checkForNewVersion() {
  try {
    const r = await fetch('version.json?t=' + Date.now(), { cache: 'no-store' });
    if (!r.ok) return;
    const { build } = await r.json();
    const mine = import.meta.env.APP_BUILD;
    if (!build || !mine || build === mine) return;
    const key = 'vqcv_updating_to';
    if (sessionStorage.getItem(key) === build) return;
    sessionStorage.setItem(key, build);
    await updateApp();
  } catch (e) {
    // offline: keep playing the version we have
  }
}
