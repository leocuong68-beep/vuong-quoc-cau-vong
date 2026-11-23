import { it, expect } from 'vitest';
import { makeAcademy } from '../../src/components/academy/academyState.js';

it('stars only on the first pass, a present every 30 stars', () => {
  const a = makeAcademy('test_stars_' + Math.random());
  a.subjectIds = ['english', 'math'];
  expect(a.finish('english', 'l1', 10, 10).earned).toBe(3);
  // the same lesson again: no more stars
  expect(a.finish('english', 'l1', 10, 10).earned).toBe(0);
  // failing gives nothing
  expect(a.finish('english', 'l2', 7, 10).earned).toBe(0);
  a.wallet = 28;
  const r = a.finish('math', 'm1', 10, 10);
  expect(r.gift).toBe(1);
  expect(a.toNextGift).toBe(30 - (a.wallet % 30));
  expect(a.finish('math', 'm2', 8, 10).gift).toBe(0);
});

it('a lesson with a worksheet waits for the parents', () => {
  const a = makeAcademy('test_sheet_' + Math.random());
  a.subjectIds = ['english'];
  const subject = { lessons: [{ id: 'w1' }, { id: 'w2' }] };
  const r = a.finish('english', 'w1', 9, 10, true);
  expect(r.pendingSheet).toBe(true);
  expect(r.earned).toBe(0);
  expect(a.isPending('w1')).toBe(true);
  expect(a.isOpen(subject, 1)).toBe(false);
  const ok = a.approve('english', 'w1');
  expect(ok.earned).toBe(2);
  expect(a.isPassed('w1')).toBe(true);
  expect(a.isPending('w1')).toBe(false);
  expect(a.isOpen(subject, 1)).toBe(true);
  // replaying an approved lesson: no pending, no stars
  expect(a.finish('english', 'w1', 10, 10, true).earned).toBe(0);
});
