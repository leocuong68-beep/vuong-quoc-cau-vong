import { reactive } from 'vue';

// Language the princess games speak and write in, and the stars earned per stage.
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
    // storage can be unavailable; the game still works for this session
  }
};

const parseStars = () => {
  try {
    const parsed = JSON.parse(read('princess_stars') || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (e) {
    return {};
  }
};

export const Lang = reactive({
  current: read('princess_lang') === 'vi' ? 'vi' : 'en',
  toggle() {
    this.current = this.current === 'en' ? 'vi' : 'en';
    write('princess_lang', this.current);
  },
});

export const MAX_STARS = 3;

export const Progress = reactive({
  stars: parseStars(),
  allUnlocked: read('princess_unlock_all') === '1',
  starsOf(id) {
    return Number(this.stars[id]) || 0;
  },
  complete(id) {
    this.stars[id] = Math.min(MAX_STARS, this.starsOf(id) + 1);
    write('princess_stars', JSON.stringify(this.stars));
  },
  unlockAll() {
    this.allUnlocked = true;
    write('princess_unlock_all', '1');
  },
});
