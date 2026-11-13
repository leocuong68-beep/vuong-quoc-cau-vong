<template>
  <Game
    :is-highlight-animation-running="isGameOver"
    :previous-level-disabled="true"
    :next-level-disabled="true"
    nav-back-path="/princess"
    explanation="mia_colornumber"
    :current-level="level"
    @restart="restart"
  >
    <div class="princess-game">
      <div class="scene fit">
        <div class="fit-box paper">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" stroke="#4a2a57" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">
            <component
              :is="region.tag"
              v-for="(region, index) in picture.regions"
              :key="pictureId + '-' + index"
              v-bind="region.attrs"
              class="region"
              :class="{ shake: wrongIndex === index }"
              :data-n="region.n"
              :data-filled="filled[index] ? 1 : 0"
              :fill="filled[index] ? hexOf(region.n) : '#ffffff'"
              @click="paint(index)"
            />
            <template v-for="(region, index) in picture.regions" :key="'t' + index">
              <text v-if="region.at && !filled[index]" :x="region.at[0]" :y="region.at[1] + 5" class="label">{{ region.n }}</text>
            </template>
            <path v-for="(d, index) in picture.lines || []" :key="'l' + index" :d="d" fill="none" class="extra" />
            <circle v-for="(dot, index) in picture.dots || []" :key="'d' + index" :cx="dot[0]" :cy="dot[1]" :r="dot[2]" fill="#4a2a57" class="extra" />
          </svg>
        </div>
      </div>
      <div class="ask">
        <button type="button" class="ask-line" data-test="repeat" @click="repeat">
          <em class="fas fa-volume-up" />
          <span>{{ prompt }}</span>
        </button>
        <LangToggle @change="repeat" />
      </div>
      <div class="choices">
        <template v-if="!isGameOver">
          <button
            v-for="(colorId, index) in picture.palette"
            :key="colorId"
            type="button"
            class="choice pot"
            :class="{ selected: selected === index + 1 }"
            :data-number="index + 1"
            :style="{ background: hexOf(index + 1) }"
            @click="choose(index + 1)"
          >
            {{ index + 1 }}
          </button>
        </template>
        <button v-else type="button" class="done" data-test="next" @click="goToPath">
          <em class="fas fa-arrow-right" />
        </button>
      </div>
      <div class="dots" />
    </div>
    <ErrorAnimation ref="errorAnimation" />
  </Game>
</template>

<script>
  import Game from '../Game.vue';
  import ErrorAnimation from '../ErrorAnimation.vue';
  import LangToggle from './LangToggle.vue';
  import { ArrayUtils } from '../utils/ArrayUtils.js';
  import { Speech } from '../utils/Speech.js';
  import { COLORS, Lines } from './princessLines.js';
  import { gameMixin } from './gameMixin.js';

  const r = (tag, attrs, n, at) => ({ tag, attrs, n, at });
  const petal = (cx, cy) => r('circle', { cx, cy, r: 22 }, 1, [cx, cy]);

  // Pictures are drawn on a 200 x 200 sheet; `n` is the number (and so the colour) of each part.
  const PICTURES = {
    butterfly: {
      palette: ['pink', 'purple', 'yellow', 'blue'],
      regions: [
        r('ellipse', { cx: 62, cy: 72, rx: 42, ry: 36 }, 1, [80, 48]),
        r('ellipse', { cx: 138, cy: 72, rx: 42, ry: 36 }, 1, [120, 48]),
        r('ellipse', { cx: 70, cy: 136, rx: 32, ry: 28 }, 2, [66, 138]),
        r('ellipse', { cx: 130, cy: 136, rx: 32, ry: 28 }, 2, [134, 138]),
        r('circle', { cx: 52, cy: 78, r: 14 }, 3, [52, 78]),
        r('circle', { cx: 148, cy: 78, r: 14 }, 3, [148, 78]),
        r('ellipse', { cx: 100, cy: 104, rx: 11, ry: 52 }, 4, [100, 104]),
      ],
      lines: ['M96 54 Q88 30 76 26', 'M104 54 Q112 30 124 26'],
    },
    flower: {
      palette: ['red', 'yellow', 'green', 'orange'],
      regions: [
        r('rect', { x: 94, y: 96, width: 12, height: 66 }, 3, null),
        r('ellipse', { cx: 72, cy: 138, rx: 22, ry: 10 }, 3, [72, 138]),
        r('ellipse', { cx: 128, cy: 128, rx: 22, ry: 10 }, 3, [128, 128]),
        petal(100, 38),
        petal(130, 60),
        petal(118, 94),
        petal(82, 94),
        petal(70, 60),
        r('circle', { cx: 100, cy: 68, r: 19 }, 2, [100, 68]),
        r('polygon', { points: '66,160 134,160 124,196 76,196' }, 4, [100, 179]),
      ],
    },
    house: {
      palette: ['yellow', 'red', 'orange', 'blue', 'green'],
      regions: [
        r('rect', { x: 0, y: 176, width: 200, height: 24 }, 5, [22, 187]),
        r('rect', { x: 42, y: 88, width: 116, height: 92 }, 1, [100, 112]),
        r('polygon', { points: '26,90 100,30 174,90' }, 2, [100, 68]),
        r('rect', { x: 86, y: 130, width: 28, height: 50 }, 3, [100, 156]),
        r('rect', { x: 52, y: 122, width: 24, height: 24 }, 4, [64, 134]),
        r('rect', { x: 124, y: 122, width: 24, height: 24 }, 4, [136, 134]),
        r('circle', { cx: 176, cy: 26, r: 17 }, 1, [176, 26]),
      ],
    },
    fish: {
      palette: ['orange', 'red', 'yellow', 'blue', 'green'],
      regions: [
        r('polygon', { points: '48,100 12,66 12,134' }, 2, [24, 100]),
        r('polygon', { points: '84,64 128,64 102,34' }, 2, [104, 52]),
        r('ellipse', { cx: 108, cy: 100, rx: 66, ry: 42 }, 1, [70, 100]),
        r('ellipse', { cx: 100, cy: 100, rx: 10, ry: 34 }, 3, [100, 100]),
        r('ellipse', { cx: 128, cy: 100, rx: 9, ry: 29 }, 3, [128, 100]),
        r('circle', { cx: 186, cy: 62, r: 10 }, 4, [186, 62]),
        r('circle', { cx: 176, cy: 32, r: 8 }, 4, [176, 32]),
        r('path', { d: 'M20 190 Q30 150 40 190 Q52 160 62 190 Z' }, 5, [41, 182]),
        r('path', { d: 'M130 190 Q142 150 152 190 Q164 164 174 190 Z' }, 5, [152, 182]),
      ],
      dots: [[152, 90, 5]],
    },
  };
  const LEVELS = { 1: ['butterfly', 'flower'], 2: ['house', 'fish'] };

  export default {
    name: 'ColorNumberGame',
    components: { Game, ErrorAnimation, LangToggle },
    mixins: [gameMixin],
    data() {
      return { level: 1, pictureName: 'butterfly', pictureId: 0, filled: [], selected: 1, wrongIndex: null };
    },
    computed: {
      picture() {
        return PICTURES[this.pictureName];
      },
    },
    created() {
      const level = Number.parseInt(this.$route && this.$route.params.level);
      this.level = LEVELS[level] ? level : 1;
      this.restart();
    },
    methods: {
      hexOf(n) {
        return COLORS.find((c) => c.id === this.picture.palette[n - 1]).hex;
      },
      restart() {
        this.clearTimers();
        this.isGameOver = false;
        const names = LEVELS[this.level];
        const others = names.filter((name) => name !== this.pictureName || this.pictureId === 0);
        this.pictureName = ArrayUtils.getRandomArrayElement(others.length ? others : names);
        this.pictureId++;
        this.filled = this.picture.regions.map(() => false);
        this.selected = 1;
        this.say(Lines.colorByNumber());
      },
      choose(n) {
        if (this.isGameOver) return;
        this.selected = n;
        const question = this.shown;
        Speech.say(Lines.number(n));
        this.shown = question;
      },
      paint(index) {
        if (this.isGameOver || this.filled[index]) return;
        const region = this.picture.regions[index];
        if (region.n !== this.selected) {
          this.wrongIndex = index;
          this.later(() => (this.wrongIndex = null), 500);
          const question = this.shown;
          this.$refs.errorAnimation.showError(() => {
            this.say(Lines.tryAgain());
            this.shown = question;
          });
          return;
        }
        this.filled[index] = true;
        if (this.filled.every(Boolean)) this.later(() => this.finishStage('colornumber' + this.level), 500);
      },
    },
  };
</script>

<style scoped lang="scss">
  @use './princess.scss';

  .paper {
    --ratio: 1;
    background: #fffaf2;
    border-radius: 12pt;
  }

  .paper svg {
    position: absolute;
    inset: 3%;
    width: 94%;
    height: 94%;
    overflow: visible;
  }

  .region {
    cursor: pointer;
    transition: fill 0.25s;
  }

  .label {
    font-size: 15px;
    font-weight: 800;
    text-anchor: middle;
    fill: #4a2a57;
    stroke: none;
    pointer-events: none;
  }

  .extra {
    pointer-events: none;
  }

  .choice.pot {
    border-radius: 50%;
    color: #4a2a57;
    text-shadow: 0 0 3pt #ffffff, 0 0 3pt #ffffff;
  }

  .choice.pot.selected {
    outline: 5pt solid #4a2a57;
    transform: scale(1.12);
  }
</style>
