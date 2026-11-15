import { Academy, MiaAcademy } from './academyState.js';
import { SUBJECTS, MIA_SUBJECTS } from './curriculum/index.js';

// Each child has an own study space: progress, subjects, look, voice and reward.
export const PROFILES = {
  tintin: {
    id: 'tintin',
    name: 'Tin Tin',
    base: '/tintin',
    theme: 'mc',
    state: Academy,
    subjects: SUBJECTS,
    avatar: 'img/academy/tintin.webp',
    mood: (m) => 'img/academy/tintin_' + m + '.webp',
    vox: 'vox',
    minecraft: true,
    kicker: { vi: 'Học viện', el: 'Ακαδημία' },
    back: { path: '/', label: { vi: 'Vương Quốc Cầu Vồng của Mia', el: 'Το παιχνίδι της Μία' } },
  },
  mia: {
    id: 'mia',
    name: 'Mia',
    base: '/mia',
    theme: 'princess',
    state: MiaAcademy,
    subjects: MIA_SUBJECTS,
    avatar: 'img/academy/mia_think.webp',
    mood: (m) => 'img/academy/mia_' + m + '.webp',
    vox: 'vox_mia',
    minecraft: false,
    kicker: { vi: 'Lớp học của', el: 'Το σχολείο της' },
    back: { path: '/princess', label: { vi: 'Về Vương Quốc Cầu Vồng', el: 'Πίσω στο βασίλειο' } },
  },
};

export const profileOf = (route) =>
  PROFILES[(route && route.meta && route.meta.profile) || 'tintin'];
