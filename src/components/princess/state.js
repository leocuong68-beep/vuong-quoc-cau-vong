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

const parseJson = (key, fallback) => {
  try {
    const parsed = JSON.parse(read(key) || 'null');
    return parsed && typeof parsed === 'object' ? parsed : fallback;
  } catch (e) {
    return fallback;
  }
};

// --- who is playing ---
// Each child on the tablet has a profile: a name, girl or boy, and stars of their own.
// The recorded voice calls the player "Mia", so only a girl named Mia hears her name.
export const GENDERS = ['girl', 'boy'];

// The public web version (npm run build:public) is for every child: it never says "Mia".
export const IS_PUBLIC = (() => {
  try {
    return import.meta.env.VITE_PUBLIC === '1';
  } catch (e) {
    return false;
  }
})();

const cleanName = (name) => String(name || '').replace(/\s+/g, ' ').trim().slice(0, 16);

// Mia's own app has a single player, Mia; profiles are only offered on the public web version.
const MIA = { id: 'mia', name: 'Mia', gender: 'girl' };

// Web (23/11/2026): Mia's own account is always on the picker (her stars, her name in the voice);
// Tin Tin's account opens his Academy; any other child creates a new profile.
const loadProfiles = () => {
  if (!IS_PUBLIC) return [{ ...MIA }];
  const list = parseJson('vqcv_profiles', null);
  const others = Array.isArray(list)
    ? list
        .filter((p) => p && p.id && p.id !== MIA.id && GENDERS.includes(p.gender))
        .map((p) => ({ ...p, name: cleanName(p.name) }))
    : [];
  return [{ ...MIA, family: true }, ...others];
};

const starsKey = (id) => (id === 'mia' ? 'princess_stars' : 'princess_stars_' + id);

export const Profiles = reactive({
  list: loadProfiles(),
  currentId: IS_PUBLIC ? null : MIA.id,
  get current() {
    return this.list.find((p) => p.id === this.currentId) || null;
  },
  get isBoy() {
    return !!this.current && this.current.gender === 'boy';
  },
  // the recorded lines say "Mia"; the public version speaks without a name
  get nameless() {
    return IS_PUBLIC && this.currentId !== MIA.id;
  },
  save() {
    write('vqcv_profiles', JSON.stringify(this.list.filter((p) => !p.family)));
  },
  add(name, gender) {
    const profile = { id: 'p' + Date.now().toString(36), name: cleanName(name), gender: GENDERS.includes(gender) ? gender : 'girl' };
    this.list.push(profile);
    this.save();
    return profile;
  },
  remove(id) {
    if (id === MIA.id) return;
    this.list = this.list.filter((p) => p.id !== id);
    this.save();
    try {
      localStorage.removeItem(starsKey(id));
    } catch (e) {
      // nothing to clean up
    }
    if (this.currentId === id) this.currentId = null;
  },
  choose(id) {
    this.currentId = id;
    write('vqcv_last_profile', id);
    Progress.load();
  },
  lastId() {
    return read('vqcv_last_profile');
  },
});

export const Lang = reactive({
  current: read('princess_lang') === 'vi' ? 'vi' : 'en',
  toggle() {
    this.current = this.current === 'en' ? 'vi' : 'en';
    write('princess_lang', this.current);
  },
});

export const MAX_STARS = 3;

export const Progress = reactive({
  stars: parseJson('princess_stars', {}),
  load() {
    this.stars = parseJson(starsKey(Profiles.currentId || 'mia'), {});
  },
  allUnlocked: read('princess_unlock_all') === '1',
  starsOf(id) {
    return Number(this.stars[id]) || 0;
  },
  complete(id) {
    this.stars[id] = Math.min(MAX_STARS, this.starsOf(id) + 1);
    write(starsKey(Profiles.currentId || 'mia'), JSON.stringify(this.stars));
  },
  unlockAll() {
    this.allUnlocked = true;
    write('princess_unlock_all', '1');
  },
});
