import { createApp } from 'vue';
import App from './App.vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import '@fortawesome/fontawesome-free/css/all.css';
import mitt from 'mitt';
import { logger } from './utils/logger.js';


const APP_VERSION = import.meta.env.APP_VERSION;
const APP_COMMIT = import.meta.env.APP_COMMIT;

if (typeof window !== 'undefined') {
  window.__APP_VERSION__ = APP_VERSION;
  window.__APP_COMMIT__ = APP_COMMIT;
  logger.version(`Edukiz v${APP_VERSION} (${APP_COMMIT})`);
}
import Memory from './components/memory/MemoryNavPage.vue';
import MemoryAnimals from './components/memory/MemoryAnimals.vue';
import MemoryCharacters from './components/memory/MemoryCharacters.vue';
import DDNavPage from './components/drag_drop/DDNavPage.vue';
import DDBuildWordsGame from './components/drag_drop/DDBuildWordsGame.vue';
import DDCharacters from './components/drag_drop/DDCharacters.vue';
import MiscNavPage from './components/misc/MiscNavPage.vue';
import CalculateNumbers0To18 from './components/misc/CalculateNumbers0To18.vue';
import TextToSpeech from './components/misc/TextToSpeech.vue';
import PrincessNavPage from './components/princess/PrincessNavPage.vue';
import DressUpGame from './components/princess/DressUpGame.vue';
import FeedPonyGame from './components/princess/FeedPonyGame.vue';
import QuizGame from './components/princess/QuizGame.vue';
import MakeupGame from './components/princess/MakeupGame.vue';
import MemoryGame from './components/princess/MemoryGame.vue';
import BubblesGame from './components/princess/BubblesGame.vue';
import RoomGame from './components/princess/RoomGame.vue';
import PlantGame from './components/princess/PlantGame.vue';
import CollectGame from './components/princess/CollectGame.vue';
import HairGame from './components/princess/HairGame.vue';
import NailGame from './components/princess/NailGame.vue';
import ColorNumberGame from './components/princess/ColorNumberGame.vue';
import BabyCare from './components/princess/BabyCare.vue';
import ShopGame from './components/princess/ShopGame.vue';
import PonyMaker from './components/princess/PonyMaker.vue';
import PaintGame from './components/princess/PaintGame.vue';
import AcademyHome from './components/academy/AcademyHome.vue';
import SubjectPage from './components/academy/SubjectPage.vue';
import LessonGame from './components/academy/LessonGame.vue';
import { Kids } from './components/academy/publicKids.js';
import './registerServiceWorker';

if (!localStorage.rewards) {
  localStorage.rewards = 0;
}

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: PrincessNavPage,
    },
    { path: '/tintin', name: 'Academy', component: AcademyHome, meta: { profile: 'tintin' } },
    { path: '/tintin/:subject', name: 'AcademySubject', component: SubjectPage, meta: { profile: 'tintin' } },
    { path: '/tintin/:subject/:lesson', name: 'AcademyLesson', component: LessonGame, meta: { profile: 'tintin' } },
    { path: '/hoc', name: 'PublicAcademy', component: AcademyHome, meta: { profile: 'hoc' } },
    { path: '/hoc/:subject', name: 'PublicSubject', component: SubjectPage, meta: { profile: 'hoc' } },
    { path: '/hoc/:subject/:lesson', name: 'PublicLesson', component: LessonGame, meta: { profile: 'hoc' } },
    { path: '/mia', name: 'MiaSchool', component: AcademyHome, meta: { profile: 'mia' } },
    { path: '/mia/:subject', name: 'MiaSubject', component: SubjectPage, meta: { profile: 'mia' } },
    { path: '/mia/:subject/:lesson', name: 'MiaLesson', component: LessonGame, meta: { profile: 'mia' } },
    {
      path: '/memory',
      name: 'Memory',
      component: Memory,
    },
    {
      path: '/memory/animals',
      name: 'MemoryAnimals',
      component: MemoryAnimals,
    },
    {
      path: '/memory/characters',
      name: 'MemoryCharacters',
      component: MemoryCharacters,
    },
    {
      path: '/dragdrop',
      name: 'DragDrop',
      component: DDNavPage,
    },
    {
      path: '/dragdrop/build-words',
      name: 'DDBuildWords',
      component: DDBuildWordsGame,
    },
    {
      path: '/dragdrop/characters',
      name: 'DDCharacters',
      component: DDCharacters,
    },
    {
      path: '/misc',
      name: 'Misc',
      component: MiscNavPage,
    },
    {
      path: '/misc/numbers-0-to-18',
      name: 'CalculateNumbers0To18',
      component: CalculateNumbers0To18,
    },
    {
      path: '/misc/t2s',
      name: 'TextToSpeech',
      component: TextToSpeech,
    },
    {
      path: '/princess',
      name: 'Princess',
      component: PrincessNavPage,
    },
    {
      path: '/princess/dress/:level',
      name: 'PrincessDressUp',
      component: DressUpGame,
    },
    {
      path: '/princess/feed/:level',
      name: 'PrincessFeedPony',
      component: FeedPonyGame,
    },
    {
      path: '/princess/makeup/:level',
      name: 'PrincessMakeup',
      component: MakeupGame,
    },
    {
      path: '/princess/memory/:level',
      name: 'PrincessMemory',
      component: MemoryGame,
    },
    {
      path: '/princess/bubbles/:level',
      name: 'PrincessBubbles',
      component: BubblesGame,
    },
    { path: '/princess/room', name: 'PrincessRoom', component: RoomGame },
    { path: '/princess/plant', name: 'PrincessPlant', component: PlantGame },
    { path: '/princess/collect/:kind', name: 'PrincessCollect', component: CollectGame },
    { path: '/princess/hair', name: 'PrincessHair', component: HairGame },
    { path: '/princess/nails', name: 'PrincessNails', component: NailGame },
    { path: '/princess/colornumber/:level', name: 'PrincessColorNumber', component: ColorNumberGame },
    { path: '/princess/paint', name: 'PrincessPaint', component: PaintGame },
    { path: '/princess/pony', name: 'PrincessPony', component: PonyMaker },
    { path: '/princess/baby', name: 'PrincessBaby', component: BabyCare },
    { path: '/princess/shop', name: 'PrincessShop', component: ShopGame },
    {
      path: '/princess/stage/:id',
      name: 'PrincessStage',
      component: QuizGame,
    },
    {
      path: '/github',
      name: 'github',
      beforeEnter() {
        location.href = 'https://github.com/timmalich/edukiz';
      },
    },
  ],
});

// A device where Tin Tin studies opens straight on his study page; Mia's tablet keeps her kingdom.
let firstNavigation = true;
// Mia's Android tablet app (Capacitor shell) is Mia's only: Tin Tin's study space stays off it.
const onMiaTablet = (() => {
  try {
    const cap = window.Capacitor;
    if (cap && cap.isNativePlatform && cap.isNativePlatform()) return true;
    return /; wv\)/.test(navigator.userAgent);
  } catch (e) {
    return false;
  }
})();
window.__onMiaTablet = onMiaTablet;
router.beforeEach((to) => {
  // the public Academy starts on the name screen
  if (to.path.startsWith('/hoc/') && !(Kids.chosen && Kids.current)) return '/hoc';
  if (onMiaTablet && to.path.startsWith('/tintin')) return '/princess';
  const isAcademy = to.path.startsWith('/tintin');
  try {
    if (firstNavigation && to.path === '/' && localStorage.academy_device === '1') {
      firstNavigation = false;
      return '/tintin';
    }
    if (isAcademy) localStorage.academy_device = '1';
    else if (to.path === '/' && !firstNavigation) localStorage.academy_device = '0';
  } catch (e) {
    // no storage: every visit starts on the home page
  }
  firstNavigation = false;
  return true;
});

const emitter = mitt();
const app = createApp(App);
app.use(router);
app.config.globalProperties.emitter = emitter;
app.mount('#app');

// The first Android shells (before 1.5) draw the game under the status bar and the task bar.
// Shell 1.5 and later hide those bars and add "VQCV/" to the user agent.
const userAgent = navigator.userAgent || '';
const inAndroidShell = (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) || /; wv\)/.test(userAgent);
if (inAndroidShell && !/VQCV\//.test(userAgent)) document.documentElement.classList.add('under-system-bars');
