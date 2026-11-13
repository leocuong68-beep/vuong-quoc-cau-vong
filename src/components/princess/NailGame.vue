<template>
  <Game
    :is-highlight-animation-running="isGameOver"
    :previous-level-disabled="true"
    :next-level-disabled="true"
    nav-back-path="/princess"
    explanation="mia_nails"
    :current-level="1"
    @restart="restart"
  >
    <div class="princess-game">
      <div class="scene fit">
        <div class="fit-box hand">
          <img :src="'img/princess/hand.webp'" class="no-drag" alt="" />
          <button
            v-for="(nail, index) in nails"
            :key="index"
            type="button"
            class="nail"
            :class="{ painted: nail.color }"
            data-test="nail"
            :data-color="nail.color || ''"
            :style="nailStyle(nail)"
            @click="paint(nail)"
          />
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
            v-for="color in colors"
            :key="color.id"
            type="button"
            class="choice polish"
            :class="{ selected: selected === color.id }"
            :data-polish="color.id"
            @click="choose(color)"
          >
            <span class="swatch-big" :style="{ background: color.hex }" />
          </button>
          <button type="button" class="done" data-test="done" @click="check">
            <em class="fas fa-check" />
          </button>
        </template>
        <button v-else type="button" class="done" data-test="next" @click="goToPath">
          <em class="fas fa-arrow-right" />
        </button>
      </div>
      <div class="dots">
        <span v-for="n in rounds" :key="n" :class="{ on: n <= finished }" />
      </div>
    </div>
    <ErrorAnimation ref="errorAnimation" />
  </Game>
</template>

<script>
  import Game from '../Game.vue';
  import ErrorAnimation from '../ErrorAnimation.vue';
  import LangToggle from './LangToggle.vue';
  import { ArrayUtils } from '../utils/ArrayUtils.js';
  import { gameMixin } from './gameMixin.js';
  import { COLORS, Lines } from './princessLines.js';

  // each fingernail on img/princess/hand.webp, in % of the picture
  const NAILS = [
    { x: 6, y: 50.5, w: 8.5, h: 9.5, turn: -24 },
    { x: 25.5, y: 14.5, w: 9.5, h: 9.5, turn: -10 },
    { x: 51, y: 6.5, w: 9.5, h: 9, turn: 0 },
    { x: 77, y: 14.5, w: 9, h: 8.5, turn: 12 },
    { x: 95, y: 30.5, w: 7.5, h: 7.5, turn: 24 },
  ];

  export default {
    name: 'NailGame',
    components: { Game, ErrorAnimation, LangToggle },
    mixins: [gameMixin],
    data() {
      return { rounds: 3, finished: 0, colors: COLORS, selected: null, target: null, need: 0, nails: [] };
    },
    created() {
      this.restart();
    },
    methods: {
      nailStyle(nail) {
        return {
          // the picture sits 3% inside the box
          left: 3 + 0.94 * (nail.x - nail.w / 2) + '%',
          top: 3 + 0.94 * (nail.y - nail.h / 2) + '%',
          width: 0.94 * nail.w + '%',
          height: 0.94 * nail.h + '%',
          transform: 'rotate(' + nail.turn + 'deg)',
          background: nail.color ? this.colors.find((c) => c.id === nail.color).hex : null,
        };
      },
      restart() {
        this.clearTimers();
        this.finished = 0;
        this.isGameOver = false;
        this.target = null;
        this.nextRound();
      },
      nextRound() {
        this.isBusy = false;
        this.nails = NAILS.map((n) => ({ ...n, color: null }));
        this.target = ArrayUtils.getRandomArrayElement(COLORS.filter((c) => c.id !== this.target)).id;
        this.need = 1 + Math.floor(Math.random() * 5);
        this.selected = null;
        this.say(Lines.paintNails(this.need, this.target));
      },
      choose(color) {
        if (this.isBusy || this.isGameOver) return;
        this.selected = color.id;
      },
      paint(nail) {
        if (this.isBusy || this.isGameOver) return;
        if (!this.selected) {
          this.repeat();
          return;
        }
        nail.color = nail.color === this.selected ? null : this.selected;
      },
      check() {
        if (this.isBusy || this.isGameOver || !this.nails.some((n) => n.color)) return;
        const painted = this.nails.filter((n) => n.color === this.target).length;
        if (painted !== this.need) {
          this.wrongThenRepeat(Lines.countAgain());
          return;
        }
        this.isBusy = true;
        this.finished++;
        this.say(Lines.yesCount(this.need));
        this.later(() => {
          if (this.finished >= this.rounds) {
            this.isBusy = false;
            this.finishStage('nails', Lines.makeupDone());
          } else {
            this.nextRound();
          }
        }, 2400);
      },
    },
  };
</script>

<style scoped lang="scss">
  @use './princess.scss';

  .hand {
    --ratio: 0.92;
  }

  .hand > img {
    position: absolute;
    inset: 3%;
    width: 94%;
    height: 94%;
  }

  .nail {
    position: absolute;
    padding: 0;
    border: 1.5pt dashed rgba(74, 42, 87, 0.55);
    border-radius: 42% 42% 30% 30%;
    background: rgba(255, 255, 255, 0.25);
    cursor: pointer;
    touch-action: manipulation;
  }

  .nail.painted {
    border: 1pt solid rgba(74, 42, 87, 0.5);
    box-shadow: inset 2pt 2pt 0 rgba(255, 255, 255, 0.5);
  }

  .choice.polish {
    width: 50pt;
    height: 50pt;
    padding: 5pt;
  }

  .choice.polish.selected {
    outline: 4pt solid #ffd23f;
    transform: scale(1.1);
  }

  .swatch-big {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 2pt solid #4a2a57;
    box-sizing: border-box;
  }
</style>
