import { it } from 'vitest';
import fs from 'fs';
import { SUBJECTS } from '../../src/components/academy/curriculum/index.js';
import { pickText } from '../../src/components/academy/curriculum/en.js';
import { REWARD } from '../../src/components/academy/profiles.js';
import { lineId, chunksOf, splitGreek } from '../../src/components/academy/academySpeech.js';
it('public lines', () => {
  const shared = JSON.parse(fs.readFileSync('public/sounds/academy/manifest.json'));
  const has = (l, t) => (shared[l] || []).includes(lineId(l, t));
  const out = new Map();
  const add = (lang, text, voice) => out.set(voice + lang + '|' + text, { key: lineId(lang, text), lang, text, voice });
  const want = (lang, text) => {
    if (!text) return;
    const parts = lang !== 'vi' && has(lang, text) ? [{ lang, text }] : splitGreek({ lang, text });
    for (const p of parts) {
      if (p.lang === 'vi') add('vi', p.text, 'pub');
      else if (!has(p.lang, p.text)) {
        const c = chunksOf(p.text);
        if (!(c.length > 1 && c.every((x) => has(p.lang, x)))) add(p.lang, p.text, 'shared');
      }
    }
  };
  for (const s of SUBJECTS) for (const l of s.lessons) {
    const local = new Map();
    for (let r = 0; r < 300; r++) for (const q of l.make()) for (const lang of ['vi', 'en', 'el']) for (const o of [q.ask, q.explain]) { const t = pickText(o, lang); if (t) local.set(lang + '|' + t, { lang, text: t }); }
    const many = local.size > 120;
    for (const { lang, text } of local.values()) {
      const pieces = chunksOf(text);
      if (lang === 'vi' && many && pieces.length > 1) pieces.forEach((p) => want('vi', p));
      else want(lang, text);
    }
  }
  const fixed = [
    { vi: 'Chào con! Hôm nay học gì nào?', el: 'Γεια σου! Τι θα μάθουμε σήμερα;', en: 'Hi there! What shall we learn today?' },
    REWARD.cup.done,
    { vi: 'Cần đúng 8 câu để qua bài. Thử lại nhé!' },
    { vi: 'Tuyệt đối! Không sai câu nào.' },
    { vi: 'Qua bài! Bài tiếp theo đã mở.' },
  ];
  [1, 2, 3].forEach((n) => fixed.push(REWARD.cup.left(n)));
  for (const o of fixed) for (const lang of ['vi', 'en', 'el']) want(lang, pickText(o, lang));
  const list = [...out.values()];
  fs.writeFileSync('/tmp/pub-lines.json', JSON.stringify(list, null, 1));
  const by = {}; list.forEach((x) => (by[x.voice + x.lang] = (by[x.voice + x.lang] || 0) + 1));
  console.log('PUB', list.length, JSON.stringify(by), list.filter((x) => x.voice === 'shared').map((x) => x.text).slice(0, 12));
});
