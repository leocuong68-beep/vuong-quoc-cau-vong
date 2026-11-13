import { Speech } from '../utils/Speech.js';
import { Lang, Progress } from './state.js';
import { Lines } from './princessLines.js';

// What the three princess games share: the line on screen, the characters' mood,
// timers that stop when the child leaves, and finishing a stage.
export const gameMixin = {
  data() {
    return {
      shown: null,
      mood: 'idle',
      isGameOver: false,
      isBusy: false,
      timers: [],
    };
  },
  computed: {
    lang() {
      return Lang.current;
    },
    prompt() {
      return this.shown ? this.shown[this.lang] : '';
    },
  },
  unmounted() {
    this.clearTimers();
    Speech.stop();
  },
  methods: {
    say(line) {
      this.shown = line;
      Speech.say(line);
    },
    repeat() {
      if (this.shown) Speech.say(this.shown);
    },
    later(fn, ms) {
      this.timers.push(setTimeout(fn, ms));
    },
    clearTimers() {
      this.timers.forEach((t) => clearTimeout(t));
      this.timers = [];
    },
    setMood(mood, ms = 1700) {
      this.mood = mood;
      this.later(() => (this.mood = 'idle'), ms);
    },
    finishStage(stageId, line = Lines.stageDone()) {
      this.say(line);
      this.mood = 'happy';
      Progress.complete(stageId);
      this.isGameOver = true;
      this.emitter.emit('showReward', [1]);
    },
    goToPath() {
      this.$router.push('/princess');
    },
  },
};
