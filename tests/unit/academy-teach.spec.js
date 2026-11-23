import { it, expect } from 'vitest';
import { SUBJECTS, MIA_SUBJECTS } from '../../src/components/academy/curriculum/index.js';

it('every English lesson with a lecture has readable slides', () => {
  for (const subs of [SUBJECTS, MIA_SUBJECTS]) {
    const e = subs.find((s) => s.id === 'english');
    let taught = 0;
    for (const l of e.lessons) {
      if (!l.teach) continue;
      const slides = l.teach();
      if (slides.length) taught++;
      for (const s of slides) {
        expect(s.big || s.sentence).toBeTruthy();
        expect(s.say.length).toBeGreaterThan(0);
      }
    }
    expect(taught).toBeGreaterThan(20);
  }
});
