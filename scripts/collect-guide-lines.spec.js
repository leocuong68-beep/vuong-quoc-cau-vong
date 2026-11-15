import { it } from 'vitest';
import fs from 'fs';
import { SUBJECTS, MIA_SUBJECTS } from '../../src/components/academy/curriculum/index.js';
import { pickText } from '../../src/components/academy/curriculum/en.js';
import { lineId, chunksOf, splitGreek } from '../../src/components/academy/academySpeech.js';

// Not a test: collects every Vietnamese and English guide line (Tin Tin + Mia) for MiniMax.
it('collect guide lines', () => {
  const lines = new Map();
  const addOne = (lang, text) => {
    if (!text || !['vi', 'en', 'el'].includes(lang)) return;
    lines.set(lang + '|' + text, { key: lineId(lang, text), lang, text });
  };
  // the app reads Greek words inside other lines with the Greek voice
  const add = (lang, text) => splitGreek({ lang, text }).forEach((p) => addOne(p.lang, p.text));
  const both = (o) => {
    if (!o) return;
    add('vi', pickText(o, 'vi'));
    add('en', pickText(o, 'en'));
    if (o.el) add('el', o.el);
  };
  // Lessons with many number variants are recorded as pieces (see chunksOf).
  for (const subs of [SUBJECTS, MIA_SUBJECTS])
    for (const s of subs)
      for (const l of s.lessons) {
        const local = new Map();
        const put = (lang, text) => {
          if (text && ['vi', 'en', 'el'].includes(lang)) local.set(lang + '|' + text, { lang, text });
        };
        const two = (o) =>
          o && (put('vi', pickText(o, 'vi')), put('en', pickText(o, 'en')), put('el', pickText(o, 'el')));
        for (let r = 0; r < 300; r++)
          for (const q of l.make()) {
            two(q.ask);
            two(q.explain);
            (q.target || []).forEach((p) => put(p.lang, p.text));
            (q.explainSay || []).forEach((p) => put(p.lang, p.text));
            q.choices.forEach((c) => (c.say || []).forEach((p) => put(p.lang, p.text)));
          }
        const many = local.size > 120;
        for (const { lang, text } of local.values()) {
          const pieces = chunksOf(text);
          if (many && pieces.length > 1) pieces.forEach((p) => add(lang, p));
          else add(lang, text);
        }
      }
  const n = (k) => (k === 1 ? 'subject' : 'subjects');
  for (const [name] of [['Tin Tin'], ['Mia']]) {
    both({ vi: 'Chào ' + name + '! Hôm nay học gì nào?', en: 'Hi ' + name + '! What shall we learn today?' });
  }
  [
    { vi: 'Mia giỏi quá! Vương miện là của Mia!' },
    { vi: 'Xong nhiệm vụ rồi! Vào Minecraft thôi!' },
    { vi: 'Cần đúng 8 câu để qua bài. Thử lại nhé!' },
    { vi: 'Tuyệt đối! Không sai câu nào.' },
    { vi: 'Qua bài! Bài tiếp theo đã mở.' },
  ].forEach(both);
  [1, 2, 3].forEach((k) => {
    both({ vi: 'Còn ' + k + ' môn nữa là có vương miện!', en: k + ' more ' + n(k) + ' to win the crown!' });
    both({ vi: 'Còn ' + k + ' môn nữa là mở Minecraft!', en: k + ' more ' + n(k) + ' to open Minecraft!' });
  });
  const out = [...lines.values()];
  fs.writeFileSync('/tmp/guide-lines.json', JSON.stringify(out, null, 1));
  const by = {};
  out.forEach((x) => (by[x.lang] = (by[x.lang] || 0) + 1));
  console.log('lines', out.length, JSON.stringify(by), 'chars', out.reduce((a, x) => a + x.text.length, 0));
});
