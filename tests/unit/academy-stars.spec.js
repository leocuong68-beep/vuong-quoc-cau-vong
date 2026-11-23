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
