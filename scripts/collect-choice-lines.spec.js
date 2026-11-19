import { it } from 'vitest';
import fs from 'fs';
import { SUBJECTS, MIA_SUBJECTS } from '../../src/components/academy/curriculum/index.js';
import { pickText } from '../../src/components/academy/curriculum/en.js';
import { lineId, chunksOf, splitGreek } from '../../src/components/academy/academySpeech.js';
const RIGHT_IS = { vi: 'Đáp án đúng là', el: 'Η σωστή απάντηση είναι', en: 'The right answer is' };
it('choice lines', () => {
  const load = (d) => JSON.parse(fs.readFileSync('public/sounds/' + d + '/manifest.json'));
  const out = [];
  for (const [set, subs] of [['academy', SUBJECTS], ['academy_mia', MIA_SUBJECTS], ['academy_pub', SUBJECTS]]) {
    const m = set === 'academy_pub' ? { ...load('academy'), vi: load('academy_pub').vi } : load(set);
    const has = (l, t) => (m[l] || []).includes(lineId(l, t));
    const need = new Map();
    const want = (lang, text) => {
      const parts = has(lang, text) ? [{ lang, text }] : splitGreek({ lang, text });
      for (const p of parts) {
        if (has(p.lang, p.text)) continue;
        const c = chunksOf(p.text);
        if (c.length > 1 && c.every((x) => has(p.lang, x))) continue;
        need.set(p.lang + '|' + p.text, p);
      }
    };
    for (const s of subs) for (const l of s.lessons) for (let r = 0; r < 200; r++) for (const q of l.make())
      for (const lang of ['vi', 'en', 'el']) {
        want(lang, RIGHT_IS[lang]);
        for (const c of q.choices) {
          if (c.say && c.say.length) { c.say.forEach((p) => want(p.lang, p.text)); continue; }
          const text = String(pickText(c.label, lang) || '').replace(/[\p{Extended_Pictographic}️‍]/gu, '').trim();
          if (!text) continue;
          const ll = s.id === 'english' && /^[A-Za-z][A-Za-z '\-]*$/.test(text) ? 'en' : lang;
          want(ll, text);
        }
      }
    // the public set records only Vietnamese; its English/Greek come from Tin Tin's set
    for (const p of need.values()) {
      const target = set === 'academy_pub' ? (p.lang === 'vi' ? 'academy_pub' : 'academy') : set;
      out.push({ set: target, lang: p.lang, text: p.text, key: lineId(p.lang, p.text) });
    }
  }
  const uniq = [...new Map(out.map((x) => [x.set + x.lang + x.text, x])).values()];
  fs.writeFileSync('/tmp/choice-lines.json', JSON.stringify(uniq, null, 1));
  const by = {}; uniq.forEach((x) => (by[x.set + ':' + x.lang] = (by[x.set + ':' + x.lang] || 0) + 1));
  console.log('NEED', uniq.length, JSON.stringify(by), uniq.slice(0, 15).map((x) => x.text).join(' | '));
});
