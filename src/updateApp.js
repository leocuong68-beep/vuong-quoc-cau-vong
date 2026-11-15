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
