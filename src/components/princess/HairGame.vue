<template>
  <Game
    :is-highlight-animation-running="isGameOver"
    :previous-level-disabled="true"
    :next-level-disabled="true"
    nav-back-path="/princess"
    explanation="mia_hair"
    :current-level="1"
    @restart="restart"
  >
    <div class="princess-game">
      <div class="scene fit">
        <div class="fit-box salon">
          <img :key="current" :src="srcOf(current)" class="portrait no-drag" :data-hair="current" alt="Mia" />
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
            v-for="hair in hairs"
            :key="hair.id"
            type="button"
            class="choice big"
            :class="{ shake: wrongId === hair.id }"
            :data-choice="hair.id"
            @click="pick(hair)"
          >
            <img :src="hair.src" class="no-drag" alt="" />
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
  import { HAIRS, Lines } from './princessLines.js';

  export default {
    name: 'HairGame',
    components: { Game, ErrorAnimation, LangToggle },
    mixins: [gameMixin],
    data() {
      return { rounds: 4, finished: 0, current: 'long', target: null, hairs: HAIRS, wrongId: null };
    },
    created() {
      this.restart();
    },
    methods: {
      srcOf(id) {
        return HAIRS.find((h) => h.id === id).src;
      },
      restart() {
        this.clearTimers();
        this.finished = 0;
        this.isGameOver = false;
        this.isBusy = false;
        this.current = 'long';
        this.ask();
      },
      ask() {
        this.hairs = ArrayUtils.shuffleArray(HAIRS.slice());
        this.target = ArrayUtils.getRandomArrayElement(HAIRS.filter((h) => h.id !== this.current)).id;
        this.say(Lines.findHair(this.target));
      },
      pick(hair) {
        if (this.isBusy || this.isGameOver) return;
        if (hair.id !== this.target) {
          this.wrongId = hair.id;
          this.later(() => (this.wrongId = null), 500);
          this.wrongThenRepeat();
          return;
        }
        this.isBusy = true;
        this.current = hair.id;
        this.finished++;
        this.say(Lines.yesHair(hair.id));
        this.later(() => {
          this.isBusy = false;
          if (this.finished >= this.rounds) this.finishStage('hair', Lines.makeupDone());
          else this.ask();
        }, 2300);
      },
    },
  };
</script>

<style scoped lang="scss">
  @use './princess.scss';

  .salon {
    --ratio: 1;
  }

  .portrait {
    position: absolute;
    left: 6%;
    top: 6%;
    width: 88%;
    height: 94%;
    object-fit: contain;
    object-position: 50% 100%;
    animation: princess-pop 0.35s ease-out both;
  }
</style>
