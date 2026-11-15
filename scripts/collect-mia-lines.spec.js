import { it } from 'vitest';
import fs from 'fs';
import { MIA_SUBJECTS } from '../../src/components/academy/curriculum/index.js';
import { lineId } from '../../src/components/academy/academySpeech.js';

// Not a test: collects every line Mia's school can say, for recording with MiniMax.
it('collect Mia lines', () => {
  const lines = new Map();
  const add = (lang, text) => {
    if (!text) return;
    lines.set(lang + '|' + text, { key: lineId(lang, text), lang, text });
  };
  const both = (o) => {
    if (!o) return;
    if (typeof o === 'string') return add('vi', o);
    add('vi', o.vi);
    add('el', o.el);
  };
  for (const s of MIA_SUBJECTS)
    for (const l of s.lessons)
      for (let r = 0; r < 300; r++)
        for (const q of l.make()) {
          both(q.ask);
          both(q.explain);
          (q.target || []).forEach((p) => add(p.lang, p.text));
          (q.explainSay || []).forEach((p) => add(p.lang, p.text));
          q.choices.forEach((c) => (c.say || []).forEach((p) => add(p.lang, p.text)));
        }
  // home and result screens
  [
    { vi: 'Chào Mia! Hôm nay học gì nào?', el: 'Γεια σου Μία! Τι θα μάθουμε σήμερα;' },
    { vi: 'Mia giỏi quá! Vương miện là của Mia!', el: 'Μπράβο Μία! Το στέμμα είναι δικό σου!' },
    { vi: 'Cần đúng 8 câu để qua bài. Thử lại nhé!', el: 'Χρειάζεσαι 8 σωστές. Ξαναπροσπάθησε!' },
    { vi: 'Tuyệt đối! Không sai câu nào.', el: 'Τέλεια! Κανένα λάθος.' },
    { vi: 'Qua bài! Bài tiếp theo đã mở.', el: 'Πέρασες! Το επόμενο μάθημα άνοιξε.' },
  ].forEach(both);
  [1, 2, 3].forEach((n) => both({ vi: 'Còn ' + n + ' môn nữa là có vương miện!', el: 'Άλλα ' + n + ' για το στέμμα!' }));
  const out = [...lines.values()];
  fs.writeFileSync('/tmp/mia-lines.json', JSON.stringify(out, null, 1));
  const by = {};
  out.forEach((x) => (by[x.lang] = (by[x.lang] || 0) + 1));
  console.log('lines', out.length, JSON.stringify(by), 'chars', out.reduce((a, x) => a + x.text.length, 0));
});
