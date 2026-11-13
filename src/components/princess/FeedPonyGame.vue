<template>
  <Game
    :is-highlight-animation-running="isGameOver"
    :previous-level-disabled="true"
    :next-level-disabled="true"
    nav-back-path="/princess"
    explanation="mia_feedpony"
    :current-level="level"
    @restart="restart"
  >
    <div class="princess-game">
      <div class="scene">
        <div class="pony side" :class="'mood-' + mood">
          <img :src="'img/princess/pony.webp'" class="no-drag" alt="pony" />
        </div>
        <div class="board" data-test="bowl">
          <img
            v-for="n in given"
            :key="roundId + '-' + n"
            :src="'img/princess/apple.webp'"
            class="item no-drag"
            alt="apple"
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
            v-for="apple in basket"
            :key="apple.id"
            type="button"
            class="choice small"
            :class="{ used: apple.used }"
            data-test="apple"
            @click="giveApple(apple)"
          >
            <img :src="'img/princess/apple.webp'" class="no-drag" alt="apple" />
          </button>
          <button type="button" class="done" data-test="done" @click="checkGiven">
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
  import { Lines } from './princessLines.js';
  import { gameMixin } from './gameMixin.js';

  // level -> how many apples Pony may ask for, and how many are in the basket
  const LEVELS = {
    1: { min: 1, max: 4, basket: 6 },
    2: { min: 3, max: 6, basket: 8 },
    3: { min: 5, max: 10, basket: 10 },
  };

  export default {
    name: 'FeedPonyGame',
    components: { Game, ErrorAnimation, LangToggle },
    mixins: [gameMixin],
    data() {
      return {
        level: 1,
        rounds: 3,
        finished: 0,
        roundId: 0,
        need: 0,
        given: 0,
        basket: [],
      };
    },
    created() {
      const level = Number.parseInt(this.$route && this.$route.params.level);
      this.level = LEVELS[level] ? level : 1;
      this.restart();
    },
    methods: {
      restart() {
        this.clearTimers();
        this.finished = 0;
        this.isGameOver = false;
        this.mood = 'idle';
        this.nextRound();
      },
      nextRound() {
        const config = LEVELS[this.level];
        let need = this.need;
        for (let i = 0; i < 6 && need === this.need; i++) {
          need = config.min + Math.floor(Math.random() * (config.max - config.min + 1));
        }
        this.need = need;
        this.given = 0;
        this.roundId++;
        this.isBusy = false;
        this.basket = Array.from({ length: config.basket }, (_, i) => ({ id: i + 1, used: false }));
        this.say(Lines.give(this.need));
      },
      giveApple(apple) {
        if (this.isBusy || this.isGameOver || apple.used) return;
        apple.used = true;
        this.given++;
        // counting out loud keeps the question on screen
        const question = this.shown;
        this.say(Lines.number(this.given));
        this.shown = question;
      },
      checkGiven() {
        if (this.isBusy || this.isGameOver || this.given === 0) return;
        this.isBusy = true;
        if (this.given === this.need) {
          this.finished++;
          this.setMood('happy');
          this.say(Lines.giveYes(this.need));
          this.later(() => {
            if (this.finished >= this.rounds) {
              this.isBusy = false;
              this.finishStage('feed' + this.level);
            } else {
              this.nextRound();
            }
          }, 2600);
          return;
        }
        this.setMood('oops', 900);
        const question = Lines.give(this.need);
        this.$refs.errorAnimation.showError(() => this.say(Lines.countAgain()));
        this.later(() => {
          this.given = 0;
          this.basket.forEach((apple) => (apple.used = false));
          this.isBusy = false;
          this.say(question);
        }, 3600);
      },
    },
  };
</script>

<style scoped lang="scss">
  @use './princess.scss';

  .choice.small {
    width: 46pt;
    height: 46pt;
  }
</style>
