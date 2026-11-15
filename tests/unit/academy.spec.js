import { describe, it, expect } from 'vitest';
import { SUBJECTS } from '../../src/components/academy/curriculum/index.js';

describe('Tin Tin academy lessons', () => {
  for (const s of SUBJECTS) {
    for (const lesson of s.lessons) {
      it(s.id + ' / ' + lesson.id + ' makes 10 good questions', () => {
        for (let round = 0; round < 15; round++) {
          const qs = lesson.make();
          expect(qs.length).toBe(10);
          for (const q of qs) {
            expect(q.ask.vi).toBeTruthy();
            expect(q.choices.length).toBeGreaterThanOrEqual(2);
            expect(q.choices.filter((c) => c.correct).length).toBe(1);
            const labels = q.choices.map((c) => (typeof c.label === 'string' ? c.label : c.label.vi));
            expect(new Set(labels).size).toBe(labels.length);
            labels.forEach((l) => expect(String(l).length).toBeGreaterThan(0));
          }
        }
      });
    }
  }
  it('lesson ids are unique', () => {
    const ids = SUBJECTS.flatMap((s) => s.lessons.map((l) => l.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
});
