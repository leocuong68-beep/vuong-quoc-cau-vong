// A small burst of coloured squares from an element, like a block breaking.
export const burst = (el, color) => {
  if (!el || typeof document === 'undefined') return;
  const r = el.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  const colors = [color, '#ffffff', '#ffcf3f'];
  for (let i = 0; i < 16; i++) {
    const p = document.createElement('span');
    p.className = 'mc-burst';
    const a = (Math.PI * 2 * i) / 16 + Math.random() * 0.4;
    const d = 60 + Math.random() * 90;
    p.style.left = cx - 6 + 'px';
    p.style.top = cy - 6 + 'px';
    p.style.background = colors[i % colors.length];
    p.style.setProperty('--dx', Math.cos(a) * d + 'px');
    p.style.setProperty('--dy', Math.sin(a) * d - 30 + 'px');
    p.style.setProperty('--rot', Math.round(Math.random() * 360) + 'deg');
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 800);
  }
};
