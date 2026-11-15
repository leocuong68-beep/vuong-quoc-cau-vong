import { Academy, MiaAcademy } from '../academyState.js';
import { GREEK } from './greek.js';
import { ENGLISH } from './english.js';
import { MATH } from './math.js';
import { PHYSICS } from './physics.js';
import { MIA_GREEK } from './mia/greek.js';
import { MIA_ENGLISH } from './mia/english.js';
import { MIA_MATH } from './mia/math.js';
import { MIA_SCIENCE } from './mia/science.js';

// Each subject also gets a flat `lessons` list: a lesson opens when the one before it is passed.
const prepare = (list, icon) =>
  list.map((s) => ({
    ...s,
    icon: icon(s),
    lessons: s.units.flatMap((u, unitIndex) => u.lessons.map((l) => ({ ...l, unitIndex }))),
  }));

// Tin Tin (8, Β΄ Δημοτικού): the four subjects in the order they show on his home screen.
export const SUBJECTS = prepare(
  [GREEK, ENGLISH, MATH, PHYSICS],
  (s) => 'img/academy/block_' + s.id + '.webp'
);
// Mia (pre-school): the same four subjects, easier.
export const MIA_SUBJECTS = prepare(
  [MIA_GREEK, MIA_ENGLISH, MIA_MATH, MIA_SCIENCE],
  (s) => 'img/academy/mia_block_' + s.icon + '.webp'
);

export const subjectById = (id) => SUBJECTS.find((s) => s.id === id);

Academy.subjectIds = SUBJECTS.map((s) => s.id);
MiaAcademy.subjectIds = MIA_SUBJECTS.map((s) => s.id);
