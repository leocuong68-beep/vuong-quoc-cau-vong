import { test } from 'vitest';
import { SUBJECTS, MIA_SUBJECTS } from '../../src/components/academy/curriculum/index.js';
import { pickText } from '../../src/components/academy/curriculum/en.js';
import fs from 'fs';
const VI = /[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹàáèéìíòóùúýõã]/i;
test('en coverage', () => {
  const miss = new Set();
  const chk = (t) => { if (!t) return; const s = pickText(t, 'en'); if (typeof s === 'string' && VI.test(s)) miss.add(typeof t === 'string' ? t : (t.vi||s)); };
  for (const subs of [SUBJECTS, MIA_SUBJECTS]) for (const s of subs) {
    chk(s.title);
    for (const u of s.units || []) { chk(u.title); for (const l of u.lessons) { chk(l.title);
      for (let k = 0; k < 40; k++) { for (const q of l.make()) { chk(q.ask); chk(q.explain); chk(q.show && q.show.sub); for (const c of q.choices||[]) if (typeof c.label==='object') chk(c.label); } } } }
    for (const l of s.lessons || []) chk(l.title);
  }
  fs.writeFileSync('/tmp/en-miss.json', JSON.stringify([...miss], null, 1));
  console.log('MISSING', miss.size, 'checked');
});
