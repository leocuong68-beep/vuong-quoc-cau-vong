<template>
  <Game
    :is-highlight-animation-running="isGameOver"
    :previous-level-disabled="true"
    :next-level-disabled="true"
    nav-back-path="/princess"
    explanation="mia_memory"
    :current-level="level"
    @restart="restart"
  >
    <div class="princess-game">
      <div class="scene cards" :class="'cols-' + columns">
        <button
          v-for="card in cards"
          :key="card.key"
          type="button"
          class="card"
          :class="{ open: card.open || card.done, done: card.done }"
          :data-pair="card.pair"
          @click="flip(card)"
        >
          <img v-if="card.open || card.done" :src="card.src" class="no-drag" alt="" />
          <span v-else class="back">?</span>
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
        <span v-for="n in pairs" :key="n" :class="{ on: n <= found }" />
      </div>
    </div>
  </Game>
</template>

<script>
  import Game from '../Game.vue';
  import LangToggle from './LangToggle.vue';
  import { ArrayUtils } from '../utils/ArrayUtils.js';
  import { Lines } from './princessLines.js';
  import { gameMixin } from './gameMixin.js';

  const P = 'img/princess/';
  const PICTURES = [
    P + 'mia_pink.webp', P + 'tintin.webp', P + 'mommy.webp', P + 'daddy.webp', P + 'pony.webp',
    P + 'apple.webp', P + 'crown_yellow.webp', P + 'flower_purple.webp', P + 'thing_sun.webp', P + 'food_strawberry.webp',
  ];
  const LEVELS = { 1: { pairs: 3, columns: 3 }, 2: { pairs: 4, columns: 4 }, 3: { pairs: 6, columns: 4 } };

  export default {
    name: 'MemoryGame',
    components: { Game, LangToggle },
    mixins: [gameMixin],
    data() {
      return { level: 1, pairs: 3, columns: 3, cards: [], found: 0, first: null };
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
        this.pairs = config.pairs;
        this.columns = config.columns;
        this.isGameOver = false;
        this.isBusy = false;
        this.found = 0;
        this.first = null;
        // the family always plays; the other pictures fill the rest
        const pictures = [...PICTURES.slice(0, 5), ...ArrayUtils.shuffleArray(PICTURES.slice(5))].slice(0, config.pairs);
        const cards = [];
        pictures.forEach((src, pair) => {
          cards.push({ key: pair + 'a', pair, src, open: false, done: false });
          cards.push({ key: pair + 'b', pair, src, open: false, done: false });
        });
        this.cards = ArrayUtils.shuffleArray(cards);
        this.say(Lines.memory());
      },
      flip(card) {
        if (this.isBusy || this.isGameOver || card.open || card.done) return;
        card.open = true;
        if (!this.first) {
          this.first = card;
          return;
        }
        const first = this.first;
        this.first = null;
        if (first.pair === card.pair) {
          first.done = card.done = true;
          this.found++;
          if (this.found >= this.pairs) {
            this.later(() => this.finishStage('memory' + this.level), 600);
          }
          return;
        }
        this.isBusy = true;
        this.later(() => {
          first.open = card.open = false;
          this.isBusy = false;
        }, 1100);
      },
    },
  };
</script>

<style scoped lang="scss">
  @use './princess.scss';

  .cards {
    display: grid;
    gap: 6pt;
    padding: 8pt;
    align-items: stretch;
    justify-items: stretch;
    grid-auto-rows: minmax(0, 1fr);
  }

  .cards.cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .cards.cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .card {
    min-height: 0;
    padding: 4pt;
    border: 2pt solid #4a2a57;
    border-radius: 12pt;
    background: #a77bff;
    cursor: pointer;
    display: grid;
    place-items: center;
    touch-action: manipulation;
    transition: transform 0.15s;
  }

  .card.open {
    background: #fffaf2;
    animation: princess-pop 0.25s ease-out;
  }

  .card.done {
    background: #e6f7e2;
  }

  .card img {
    max-width: 100%;
    max-height: 100%;
    min-height: 0;
    object-fit: contain;
  }

  .card .back {
    font-size: 2rem;
    font-weight: 800;
    color: #fffaf2;
  }
</style>
