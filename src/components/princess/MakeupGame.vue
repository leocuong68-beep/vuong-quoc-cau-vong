<template>
  <Game
    :is-highlight-animation-running="isGameOver"
    :previous-level-disabled="true"
    :next-level-disabled="true"
    nav-back-path="/princess"
    explanation="mia_makeup"
    :current-level="level"
    @restart="restart"
  >
    <div class="princess-game">
      <div class="scene">
        <div class="face" :class="'mood-' + mood">
          <img :src="'img/princess/mia_face.webp'" class="no-drag" alt="Mia" />
          <span v-if="worn.eyeshadow" class="shadow left" :style="glow(worn.eyeshadow)" />
          <span v-if="worn.eyeshadow" class="shadow right" :style="glow(worn.eyeshadow)" />
          <span v-if="worn.blush" class="cheek left" :style="glow(worn.blush)" />
          <span v-if="worn.blush" class="cheek right" :style="glow(worn.blush)" />
          <span v-if="worn.lipstick" class="lips" :style="{ background: hex(worn.lipstick) }" />
          <img v-if="worn.hairbow" :src="'img/princess/bow_' + worn.hairbow + '.webp'" class="hairbow no-drag" alt="" />
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
            v-for="choice in choices"
            :key="part + choice.id"
            type="button"
            class="choice"
            :class="{ shake: wrongId === choice.id }"
            :data-color="choice.id"
            @click="pick(choice)"
          >
            <img v-if="part === 'hairbow'" :src="'img/princess/bow_' + choice.id + '.webp'" class="no-drag" :alt="choice.id" />
            <span v-else class="pot" :class="part" :style="{ background: choice.hex }" />
          </button>
        </template>
        <button v-else type="button" class="done" data-test="next" @click="goToPath">
          <em class="fas fa-arrow-right" />
        </button>
      </div>
      <div class="dots">
        <span v-for="n in parts.length" :key="n" :class="{ on: n <= stepIndex }" />
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
  import { COLORS, MAKEUP, Lines } from './princessLines.js';
  import { gameMixin } from './gameMixin.js';

  export default {
    name: 'MakeupGame',
    components: { Game, ErrorAnimation, LangToggle },
    mixins: [gameMixin],
    data() {
      return {
        level: 1, // 1, 2, 3 -> 3, 5, 7 colours to choose from
        parts: MAKEUP.map((m) => m.id),
        stepIndex: 0,
        worn: { lipstick: null, blush: null, eyeshadow: null, hairbow: null },
        choices: [],
        target: null,
        wrongId: null,
      };
    },
    computed: {
      part() {
        return this.parts[this.stepIndex] || null;
      },
    },
    created() {
      const level = Number.parseInt(this.$route && this.$route.params.level);
      this.level = level >= 1 && level <= 3 ? level : 1;
      this.restart();
    },
    methods: {
      hex(color) {
        return COLORS.find((c) => c.id === color).hex;
      },
      glow(color) {
        return { background: 'radial-gradient(closest-side, ' + this.hex(color) + ' 35%, transparent 100%)' };
      },
      restart() {
        this.clearTimers();
        this.isGameOver = false;
        this.isBusy = false;
        this.mood = 'idle';
        this.stepIndex = 0;
        this.worn = { lipstick: null, blush: null, eyeshadow: null, hairbow: null };
        this.nextStep();
      },
      nextStep() {
        if (!this.part) {
          this.target = null;
          this.choices = [];
          this.finishStage('makeup' + this.level, Lines.makeupDone());
          return;
        }
        // blush only comes in warm colours, so it never looks like a bruise
        const pool = this.part === 'blush' ? COLORS.filter((c) => ['pink', 'red', 'orange'].includes(c.id)) : COLORS;
        this.choices = ArrayUtils.shuffleArray(pool.slice()).slice(0, 1 + this.level * 2);
        this.target = ArrayUtils.getRandomArrayElement(this.choices);
        this.say(Lines.makeup(this.part, this.target.id));
      },
      pick(choice) {
        if (this.isBusy || this.isGameOver) return;
        if (choice.id !== this.target.id) {
          this.wrongId = choice.id;
          this.later(() => (this.wrongId = null), 500);
          this.setMood('oops', 900);
          this.$refs.errorAnimation.showError(() => this.say(Lines.thatIs(choice.id)));
          return;
        }
        this.isBusy = true;
        this.worn[this.part] = choice.id;
        this.setMood('happy');
        this.say(Lines.makeupYes(this.part, choice.id));
        this.later(() => {
          this.isBusy = false;
          this.stepIndex++;
          this.nextStep();
        }, 2600);
      },
    },
  };
</script>

<style scoped lang="scss">
  @use './princess.scss';

  .scene {
    align-items: center;
    padding-bottom: 8pt;
  }

  // square portrait; every overlay is placed in % of the picture
  .face {
    position: relative;
    aspect-ratio: 1 / 1;
    height: 100%;
    max-width: 100%;
    transform-origin: 50% 100%;
  }

  .face.mood-idle {
    animation: princess-breathe 2.6s ease-in-out infinite;
  }

  .face > img:first-child {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }

  .face span,
  .face .hairbow {
    position: absolute;
    pointer-events: none;
  }

  .cheek {
    width: 15%;
    height: 12%;
    top: 52.5%;
    opacity: 0.55;
    mix-blend-mode: multiply;
  }

  .cheek.left {
    left: 27%;
  }

  .cheek.right {
    left: 58.5%;
  }

  .shadow {
    width: 15%;
    height: 6%;
    top: 42.3%;
    opacity: 0.6;
    mix-blend-mode: multiply;
  }

  .shadow.left {
    left: 30%;
  }

  .shadow.right {
    left: 55.5%;
  }

  .lips {
    left: 45.4%;
    top: 57.4%;
    width: 9.6%;
    height: 2.7%;
    border-radius: 10% 10% 50% 50% / 10% 10% 90% 90%;
    opacity: 0.8;
    mix-blend-mode: multiply;
  }

  .hairbow {
    left: 63%;
    top: 17%;
    width: 22%;
    transform: rotate(18deg);
  }

  .pot {
    width: 80%;
    height: 80%;
    border-radius: 50%;
    border: 2pt solid #4a2a57;
    box-shadow: inset 0 -5pt 0 rgba(0, 0, 0, 0.12);
  }

  .pot.lipstick {
    width: 40%;
    height: 86%;
    border-radius: 40% 40% 12% 12% / 22% 22% 6% 6%;
  }

  .pot.eyeshadow {
    border-radius: 22%;
  }
</style>
