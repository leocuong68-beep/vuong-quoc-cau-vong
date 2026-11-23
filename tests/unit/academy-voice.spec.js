import { it, expect } from 'vitest';
import fs from 'fs';
import { SUBJECTS, MIA_SUBJECTS } from '../../src/components/academy/curriculum/index.js';
import { pickText } from '../../src/components/academy/curriculum/en.js';
import { lineId, chunksOf, splitGreek } from '../../src/components/academy/academySpeech.js';
it('both voices cover every line', () => {
  const load = (d) => JSON.parse(fs.readFileSync('public/sounds/' + d + '/manifest.json'));
  for (const [dir, subs] of [['academy', SUBJECTS], ['academy_mia', MIA_SUBJECTS], ['academy_pub', SUBJECTS]]) {
    // the public space: Vietnamese from academy_pub, English and Greek shared with Tin Tin
    const own = load(dir);
    // Mia: English/Greek lines without her own recording use Tin Tin's (AcademySpeech falls back to sounds/academy)
    const tin = load('academy');
    const m = dir === 'academy_pub' ? { ...tin, vi: load('academy_pub').vi }
      : dir === 'academy_mia' ? { vi: own.vi, en: tin.en, el: [...own.el, ...tin.el] } : own;
    const has = (l, t) => (m[l] || []).includes(lineId(l, t));
    const miss = new Set();
    const ok = (lang, text) => { if (!text) return;
      const parts = has(lang, text) ? [{ lang, text }] : splitGreek({ lang, text });
      for (const p of parts) { if (has(p.lang, p.text)) continue; const c = chunksOf(p.text);
        if (c.length > 1 && c.every((x) => has(p.lang, x))) continue; miss.add(p.lang + '|' + p.text); } };
    for (const s of subs) for (const l of s.lessons) for (let r = 0; r < 50; r++) for (const q of l.make())
      for (const lang of ['vi', 'en', 'el']) { ok(lang, pickText(q.ask, lang)); ok(lang, pickText(q.explain, lang)); }
    console.log(dir, 'missing', miss.size, [...miss].slice(0, 5));
    expect(miss.size).toBe(0);
  }
});
