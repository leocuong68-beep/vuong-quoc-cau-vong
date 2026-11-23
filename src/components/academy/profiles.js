import { Academy, MiaAcademy } from './academyState.js';
import { SUBJECTS, MIA_SUBJECTS } from './curriculum/index.js';
import { Kids, stateOf } from './publicKids.js';

// Bài giảng: ba và mẹ thay phiên dạy từng trang, cho cả hai bé (23/11/2026)
const FAMILY_TEACHERS = [
  { img: 'img/princess/daddy.webp', name: { vi: 'Ba', en: 'Dad', el: 'Μπαμπάς' } },
  { img: 'img/princess/mommy.webp', name: { vi: 'Mẹ', en: 'Mum', el: 'Μαμά' } },
];

// Each child has an own study space: progress, subjects, look, voice and reward.
export const PROFILES = {
  tintin: {
    id: 'tintin',
    name: 'Tin Tin',
    elName: 'Τιν Τιν',
    base: '/tintin',
    theme: 'mc',
    state: Academy,
    subjects: SUBJECTS,
    // 23/11/2026: avatar 3D chibi như trong Vương Quốc Cầu Vồng
    avatar: 'img/princess/tintin.webp',
    teachers: FAMILY_TEACHERS,
    mood: () => 'img/princess/tintin.webp',
    vox: 'vox',
    // 23/11/2026: bỏ khóa Minecraft; xong nhiệm vụ ngày được cúp vàng
    minecraft: false,
    reward: 'cup',
    kicker: { vi: 'Học viện', el: 'Ακαδημία' },
    back: { path: '/', pick: true, label: { vi: 'Đổi người chơi', el: 'Αλλαγή παίκτη', en: 'Change player' } },
  },
  mia: {
    id: 'mia',
    name: 'Mia',
    elName: 'Μία',
    base: '/mia',
    theme: 'princess',
    state: MiaAcademy,
    subjects: MIA_SUBJECTS,
    avatar: 'img/academy/mia_think.webp',
    teachers: FAMILY_TEACHERS,
    mood: (m) => 'img/academy/mia_' + m + '.webp',
    vox: 'vox_mia',
    minecraft: false,
    reward: 'crown',
    kicker: { vi: 'Lớp học của', el: 'Το σχολείο της' },
    // 23/11/2026: lớp học là trang chủ của Mia; các trò chơi gom vào mục Game
    back: { path: '/princess', label: { vi: '🎮 Game', el: '🎮 Παιχνίδια', en: '🎮 Games' } },
  },
  // public: same lessons as Tin Tin, any child picks a name first, a gold cup as the daily reward
  hoc: {
    id: 'hoc',
    public: true,
    base: '/hoc',
    theme: 'mc',
    get name() {
      return Kids.current ? Kids.current.name : '';
    },
    get state() {
      return stateOf(Kids.current ? Kids.current.id : 'guest');
    },
    subjects: SUBJECTS,
    avatar: 'img/academy/bot.webp',
    teachers: [
      { img: 'img/princess/daddy.webp', name: { vi: 'Thầy', en: 'Teacher', el: 'Δάσκαλος' } },
      { img: 'img/princess/mommy.webp', name: { vi: 'Cô', en: 'Teacher', el: 'Δασκάλα' } },
    ],
    mood: (m) => 'img/academy/bot_' + m + '.webp',
    vox: 'vox',
    minecraft: false,
    reward: 'cup',
    kicker: { vi: 'Học viện', el: 'Ακαδημία' },
    back: null,
  },
};

// Daily mission texts for each reward
export const REWARD = {
  minecraft: {
    icon: '⛏️',
    open: { vi: 'Hoàn thành! Minecraft đã mở cho hôm nay.', el: 'Ολοκληρώθηκε! Το Minecraft είναι ανοιχτό σήμερα.' },
    todo: { vi: 'Qua mỗi môn 1 bài để mở khóa Minecraft.', el: 'Πέρασε ένα μάθημα σε κάθε μάθημα για το Minecraft.' },
    done: { vi: 'Xong nhiệm vụ rồi! Vào Minecraft thôi!', el: 'Τα κατάφερες! Πάμε για Minecraft!' },
    left: (n) => ({
      vi: 'Còn ' + n + ' môn nữa là mở Minecraft!',
      el: 'Άλλα ' + n + ' μαθήματα για το Minecraft!',
      en: n + ' more ' + (n === 1 ? 'subject' : 'subjects') + ' to open Minecraft!',
    }),
    bonus: { vi: '⛏️ Xong cả 4 môn! Minecraft đã mở cho hôm nay.', el: '⛏️ Τέλεια! Το Minecraft άνοιξε για σήμερα.' },
  },
  crown: {
    icon: '👑',
    open: { vi: 'Hoàn thành! Mia được đội vương miện hôm nay.', el: 'Ολοκληρώθηκε! Η Μία φοράει το στέμμα.' },
    todo: { vi: 'Học mỗi môn 1 bài để nhận vương miện.', el: 'Ένα μάθημα σε κάθε μάθημα για το στέμμα.' },
    done: { vi: 'Mia giỏi quá! Vương miện là của Mia!', el: 'Μπράβο Μία! Το στέμμα είναι δικό σου!' },
    left: (n) => ({
      vi: 'Còn ' + n + ' môn nữa là có vương miện!',
      el: 'Άλλα ' + n + ' για το στέμμα!',
      en: n + ' more ' + (n === 1 ? 'subject' : 'subjects') + ' to win the crown!',
    }),
    claim: {
      vi: 'Hoàn thành! Chạm vào vương miện để đội lên nào!',
      el: 'Τα κατάφερες! Άγγιξε το στέμμα να το φορέσεις!',
      en: 'Done! Tap the crown to put it on!',
    },
    bonus: { vi: '👑 Xong cả 4 môn! Mia được vương miện hôm nay.', el: '👑 Τέλεια! Η Μία πήρε το στέμμα σήμερα.' },
  },
  cup: {
    icon: '🏆',
    open: {
      vi: 'Hoàn thành! Con nhận cúp vàng hôm nay.',
      el: 'Ολοκληρώθηκε! Πήρες το χρυσό κύπελλο σήμερα.',
      en: 'Done! You won the gold cup today.',
    },
    todo: {
      vi: 'Qua mỗi môn 1 bài để nhận cúp vàng.',
      el: 'Πέρασε ένα μάθημα σε κάθε μάθημα για το κύπελλο.',
      en: 'Pass one lesson in every subject to win the gold cup.',
    },
    done: {
      vi: 'Giỏi quá! Cúp vàng hôm nay là của con!',
      el: 'Μπράβο! Το χρυσό κύπελλο είναι δικό σου!',
      en: 'Well done! The gold cup is yours today!',
    },
    left: (n) => ({
      vi: 'Còn ' + n + ' môn nữa là có cúp vàng!',
      el: 'Άλλα ' + n + ' για το κύπελλο!',
      en: n + ' more ' + (n === 1 ? 'subject' : 'subjects') + ' to win the gold cup!',
    }),
    claim: {
      vi: 'Hoàn thành! Chạm vào cúp vàng để nhận cúp nào!',
      el: 'Τα κατάφερες! Άγγιξε το κύπελλο!',
      en: 'Done! Tap the gold cup to take it!',
    },
    bonus: {
      vi: '🏆 Xong cả 4 môn! Con nhận cúp vàng hôm nay.',
      el: '🏆 Τέλεια! Πήρες το χρυσό κύπελλο σήμερα.',
      en: '🏆 All 4 subjects done! You won the gold cup today.',
    },
  },
};

export const profileOf = (route) =>
  PROFILES[(route && route.meta && route.meta.profile) || 'tintin'];
