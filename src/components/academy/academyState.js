import { reactive } from 'vue';

// Tin Tin's study path: his own profile, kept apart from Mia's princess stars.
// Saved in localStorage under academy_* keys on the device he studies on.

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
    // storage can be unavailable; progress then lasts for this visit only
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

export const PLAYER = { id: 'tintin', name: 'Tin Tin', avatar: 'img/academy/tintin.webp' };

// A lesson is passed with 8 of 10 right; stars for the score.
export const PASS_RATIO = 0.8;
export const starsForScore = (right, total) => {
  const r = total ? right / total : 0;
  if (r >= 1) return 3;
  if (r >= 0.9) return 2;
  if (r >= PASS_RATIO) return 1;
  return 0;
};

// Daily goal: one lesson passed in every subject. Then Minecraft opens for the day.
export const DAILY_BONUS = 5;

export const today = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
};

const saved = parseJson('academy_progress', {});

export const Academy = reactive({
  // best stars per lesson id (1..3 means passed)
  best: saved.best || {},
  // stars to spend (shop comes with the Minecraft link)
  wallet: Number(saved.wallet) || 0,
  spent: Number(saved.spent) || 0,
  // date -> list of subject ids passed that day
  days: saved.days || {},
  bonusDays: saved.bonusDays || {},
  unlockAll: read('academy_unlock_all') === '1',
  // instruction language: vi (Vietnamese) or el (Greek)
  voiceLang: read('academy_voice_lang') === 'el' ? 'el' : 'vi',

  save() {
    write(
      'academy_progress',
      JSON.stringify({
        best: this.best,
        wallet: this.wallet,
        spent: this.spent,
        days: this.days,
        bonusDays: this.bonusDays,
      })
    );
    write('academy_minecraft_open', this.minecraftOpen ? today() : '');
  },
  starsOf(lessonId) {
    return Number(this.best[lessonId]) || 0;
  },
  isPassed(lessonId) {
    return this.starsOf(lessonId) > 0;
  },
  // A lesson opens when the one before it in the subject is passed.
  isOpen(subject, index) {
    if (this.unlockAll || index === 0) return true;
    const prev = subject.lessons[index - 1];
    return !!prev && this.isPassed(prev.id);
  },
  nextLessonIndex(subject) {
    const i = subject.lessons.findIndex((l) => !this.isPassed(l.id));
    return i === -1 ? subject.lessons.length - 1 : i;
  },
  doneToday(subjectId) {
    return (this.days[today()] || []).includes(subjectId);
  },
  get minecraftOpen() {
    return this.subjectIds.length > 0 && this.subjectIds.every((id) => this.doneToday(id));
  },
  subjectIds: [],
  // Record one finished attempt. Returns what was won, for the result screen.
  finish(subjectId, lessonId, right, total) {
    const stars = starsForScore(right, total);
    const before = this.starsOf(lessonId);
    let earned = 0;
    let bonus = 0;
    if (stars > 0) {
      // new stars only for a better result than before, so stars mean progress
      earned = Math.max(0, stars - before);
      if (stars > before) this.best[lessonId] = stars;
      const day = today();
      const list = this.days[day] || [];
      if (!list.includes(subjectId)) this.days[day] = [...list, subjectId];
      // practising an old lesson again still counts for today's goal, worth 1 star once a day
      if (earned === 0 && !list.includes(subjectId)) earned = 1;
      if (this.minecraftOpen && !this.bonusDays[day]) {
        this.bonusDays[day] = true;
        bonus = DAILY_BONUS;
      }
      this.wallet += earned + bonus;
      this.save();
    }
    return { stars, earned, bonus, passed: stars > 0, firstPass: before === 0 && stars > 0 };
  },
  toggleVoice() {
    this.voiceLang = this.voiceLang === 'vi' ? 'el' : 'vi';
    write('academy_voice_lang', this.voiceLang);
  },
  openEverything() {
    this.unlockAll = true;
    write('academy_unlock_all', '1');
  },
});
