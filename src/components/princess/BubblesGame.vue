<template>
  <Game
    :is-highlight-animation-running="isGameOver"
    :previous-level-disabled="true"
    :next-level-disabled="true"
    nav-back-path="/princess"
    explanation="mia_bubbles"
    :current-level="level"
    @restart="restart"
  >
    <div class="princess-game">
      <div class="scene sky">
        <button
          v-for="bubble in bubbles"
          :key="roundId + '-' + bubble.n"
          type="button"
          class="bubble"
          :class="{ popped: bubble.popped, shake: wrongN === bubble.n }"
          :data-n="bubble.n"
          :style="{ left: bubble.x + '%', top: bubble.y + '%', animationDelay: bubble.delay + 's', background: bubble.color }"
          @click="pop(bubble)"
        >
          {{ bubble.n }}
        </button>
      </div>
      <div class="ask">
        <button type="button" class="ask-line" data-test="repeat" @click="repeat">
          <em class="fas fa-volume-up" />
          <span>{{ prompt }}</span>
        </button>
        <LangToggle @change="repeat" />
      </div>
      <div class="choices">
        <button v-if="isGameOver" type="button" class="done" data-test="next" @click="goToPath">
          <em class="fas fa-arrow-right" />
        </button>
      </div>
      <div class="dots">
        <span v-for="n in count" :key="n" :class="{ on: n <= popped }" />
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
  import { Speech } from '../utils/Speech.js';
  import { COLORS, Lines } from './princessLines.js';
  import { gameMixin } from './gameMixin.js';

  const LEVELS = { 1: { count: 5, down: false }, 2: { count: 10, down: false }, 3: { count: 10, down: true } };

  export default {
    name: 'BubblesGame',
    components: { Game, ErrorAnimation, LangToggle },
    mixins: [gameMixin],
    data() {
      return { level: 1, count: 5, down: false, bubbles: [], popped: 0, wrongN: null, roundId: 0 };
    },
    computed: {
      expected() {
        return this.down ? this.count - this.popped : this.popped + 1;
      },
    },
    created() {
      const level = Number.parseInt(this.$route && this.$route.params.level);
      this.level = LEVELS[level] ? level : 1;
      this.restart();
    },
    methods: {
      restart() {
        this.clearTimers();
        const config = LEVELS[this.level];
        this.count = config.count;
        this.down = config.down;
        this.isGameOver = false;
        this.popped = 0;
        this.roundId++;
        // 4 x 3 slots, shuffled, so bubbles never sit on top of each other
        const slots = [];
        for (let row = 0; row < 3; row++) for (let col = 0; col < 4; col++) slots.push({ col, row });
        const places = ArrayUtils.shuffleArray(slots).slice(0, this.count);
        this.bubbles = places.map((slot, i) => ({
          n: i + 1,
          x: 3 + slot.col * 24 + Math.random() * 5,
          y: 4 + slot.row * 31 + Math.random() * 6,
          delay: -(Math.random() * 3).toFixed(2),
          color: COLORS[i % COLORS.length].hex,
          popped: false,
        }));
        this.say(Lines.bubbles(this.count, this.down));
      },
      pop(bubble) {
        if (this.isGameOver || bubble.popped) return;
        if (bubble.n !== this.expected) {
          this.wrongN = bubble.n;
          this.later(() => (this.wrongN = null), 500);
          const question = this.shown;
          this.$refs.errorAnimation.showError(() => {
            this.say(Lines.tryAgain());
            this.shown = question;
          });
          return;
        }
        bubble.popped = true;
        this.popped++;
        Speech.say(Lines.number(bubble.n));
        if (this.popped >= this.count) {
          this.later(() => this.finishStage('bubbles' + this.level), 900);
        }
      },
    },
  };
</script>

<style scoped lang="scss">
  @use './princess.scss';

  .sky {
    position: relative;
    display: block;
    padding: 0;
    background: linear-gradient(#bfe6ff, #e8f7ff);
  }

  .bubble {
    position: absolute;
    width: 19%;
    aspect-ratio: 1 / 1;
    max-width: 96pt;
    border-radius: 50%;
    border: 2pt solid rgba(74, 42, 87, 0.55);
    box-shadow: inset -6pt -8pt 0 rgba(255, 255, 255, 0.28), inset 5pt 6pt 0 rgba(255, 255, 255, 0.45);
    font: inherit;
    font-size: 1.7rem;
    font-weight: 800;
    color: #4a2a57;
    cursor: pointer;
    touch-action: manipulation;
    animation: bubble-float 3.2s ease-in-out infinite;
  }

  .bubble.popped {
    animation: bubble-pop 0.3s ease-out forwards;
    pointer-events: none;
  }

  @keyframes bubble-float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-9%);
    }
  }

  @keyframes bubble-pop {
    to {
      transform: scale(1.6);
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .bubble {
      animation: none;
    }

    .bubble.popped {
      opacity: 0;
    }
  }
</style>
