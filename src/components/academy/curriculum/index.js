import { Academy } from '../academyState.js';
import { GREEK } from './greek.js';
import { ENGLISH } from './english.js';
import { MATH } from './math.js';
import { PHYSICS } from './physics.js';

// The four subjects in the order they show on Tin Tin's home screen.
// Each subject also gets a flat `lessons` list: a lesson opens when the one before it is passed.
export const SUBJECTS = [GREEK, ENGLISH, MATH, PHYSICS].map((s) => ({
  ...s,
  icon: 'img/academy/block_' + s.id + '.webp',
  lessons: s.units.flatMap((u, unitIndex) => u.lessons.map((l) => ({ ...l, unitIndex }))),
}));

export const subjectById = (id) => SUBJECTS.find((s) => s.id === id);

Academy.subjectIds = SUBJECTS.map((s) => s.id);
