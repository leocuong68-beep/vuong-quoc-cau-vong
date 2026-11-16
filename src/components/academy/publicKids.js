import { reactive } from 'vue';
import { makeAcademy } from './academyState.js';
import { SUBJECTS } from './curriculum/index.js';

// The public study space (/hoc, and the Windows app): any child types a name at the start.
// Several children can share one device; each name keeps its own progress.

const read = (key) => {
  try {
    return localStorage[key];
  } catch (e) {
    return undefined;
  }
};
const write = (key, value) => {
  try {
    localStorage[key] = value;
  } catch (e) {
    // progress lasts for this visit only
  }
};

const loadKids = () => {
  try {
    const list = JSON.parse(read('hoc_kids') || '[]');
    return Array.isArray(list) ? list.filter((k) => k && k.id && k.name) : [];
  } catch (e) {
    return [];
  }
};

export const Kids = reactive({
  list: loadKids(),
  active: read('hoc_active') || '',
  // chosen in the picker; the picker shows again until a name is chosen in this visit
  chosen: false,
  get current() {
    return this.list.find((k) => k.id === this.active) || null;
  },
});

const states = {};
export const stateOf = (id) => {
  if (!states[id]) {
    states[id] = makeAcademy('hoc_' + id);
    states[id].subjectIds = SUBJECTS.map((s) => s.id);
  }
  return states[id];
};

export const cleanName = (name) =>
  String(name || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 20);

export const chooseKid = (id) => {
  Kids.active = id;
  Kids.chosen = true;
  write('hoc_active', id);
};

export const addKid = (name) => {
  const clean = cleanName(name);
  if (!clean) return null;
  const same = Kids.list.find((k) => k.name.toLowerCase() === clean.toLowerCase());
  if (same) {
    chooseKid(same.id);
    return same;
  }
  const kid = { id: Date.now().toString(36), name: clean };
  Kids.list.push(kid);
  write('hoc_kids', JSON.stringify(Kids.list));
  chooseKid(kid.id);
  return kid;
};

export const removeKid = (id) => {
  Kids.list = Kids.list.filter((k) => k.id !== id);
  write('hoc_kids', JSON.stringify(Kids.list));
  if (Kids.active === id) {
    Kids.active = '';
    write('hoc_active', '');
  }
};

export const showPicker = () => {
  Kids.chosen = false;
};
