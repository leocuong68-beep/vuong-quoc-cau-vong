<template>
  <Game
    :is-highlight-animation-running="isGameOver"
    :previous-level-disabled="true"
    :next-level-disabled="true"
    nav-back-path="/princess"
    explanation="mia_dressup"
    :current-level="level"
    @restart="restart"
  >
    <div class="princess-game">
      <div class="scene">
        <div class="mia" :class="'mood-' + mood">
          <img :src="miaImage" class="no-drag" alt="Mia" />
          <img v-if="worn.crown" :src="itemImage('crown', worn.crown)" class="crown no-drag" alt="" />
        </div>
        <div class="pony" :class="'mood-' + mood">
          <img :src="'img/princess/pony.webp'" class="no-drag" alt="pony" />
          <img v-if="worn.bow" :src="itemImage('bow', worn.bow)" class="bow no-drag" alt="" />
        </div>
      </div>
      <div class="ask">
        <button type="button" class="ask-line" data-test="repeat" @click="repeat">
          <em class="fas fa-volume-up" />
          <span v-if="target && level === 1" class="swatch" :style="{ background: target.hex }" />
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
            <img :src="choiceImage(choice.id)" class="no-drag" :alt="choice.id" />
          </button>
        </template>
        <button v-else type="button" class="done" data-test="next" @click="goToPath">
          <em class="fas fa-arrow-right" />
        </button>
      </div>
      <div class="dots">
        <span v-for="n in 3" :key="n" :class="{ on: n <= stepIndex }" />
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
  import { COLORS, PARTS, Lines } from './princessLines.js';
  import { gameMixin } from './gameMixin.js';

  export default {
    name: 'DressUpGame',
    components: { Game, ErrorAnimation, LangToggle },
    mixins: [gameMixin],
    data() {
      return {
        level: 1, // 1, 2, 3 -> 3, 4, 5 colours to choose from
        stepIndex: 0,
        worn: { dress: 'blue', crown: null, bow: null },
        choices: [],
        target: null,
        wrongId: null,
      };
    },
    computed: {
      part() {
        return PARTS[this.stepIndex] ? PARTS[this.stepIndex].id : null;
      },
      miaImage() {
        return 'img/princess/mia_' + this.worn.dress + '.webp';
      },
    },
    created() {
      const level = Number.parseInt(this.$route && this.$route.params.level);
      this.level = level >= 1 && level <= 3 ? level : 1;
      this.restart();
    },
    methods: {
      itemImage(part, color) {
        return 'img/princess/' + part + '_' + color + '.webp';
      },
      choiceImage(color) {
        return this.part === 'dress'
          ? 'img/princess/mia_' + color + '.webp'
          : this.itemImage(this.part, color);
      },
      restart() {
        this.clearTimers();
        this.isGameOver = false;
        this.isBusy = false;
        this.mood = 'idle';
        this.stepIndex = 0;
        this.worn = { dress: 'blue', crown: null, bow: null };
        this.nextStep();
      },
      nextStep() {
        if (!this.part) {
          this.target = null;
          this.choices = [];
          this.finishStage('dress' + this.level, Lines.dressUpDone());
          return;
        }
        // never ask for the colour already worn, so a right answer always changes the picture
        const pool = COLORS.filter((c) => c.id !== this.worn[this.part]);
        this.choices = ArrayUtils.shuffleArray(pool.slice()).slice(0, 2 + this.level);
        this.target = ArrayUtils.getRandomArrayElement(this.choices);
        this.say(Lines.find(this.part, this.target.id));
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
        this.say(Lines.yes(this.part, choice.id));
        this.later(() => {
          this.isBusy = false;
          this.stepIndex++;
          this.nextStep();
        }, 2400);
      },
    },
  };
</script>

<style scoped lang="scss">
  @use './princess.scss';

  // the wrappers hug their picture, so the crown and bow stay on Mia and Pony at any screen shape
  .mia,
  .pony {
    height: auto;
    display: flex;
  }

  .mia {
    max-height: 96%;
    aspect-ratio: 443 / 640;
    width: min(46%, calc((100vh - 230pt) * 0.66));
  }

  .pony {
    max-height: 78%;
    aspect-ratio: 623 / 640;
    width: min(44%, calc((100vh - 230pt) * 0.74));
  }

  .mia > img:first-child,
  .pony > img:first-child {
    width: 100%;
    height: 100%;
  }

  .mia .crown {
    position: absolute;
    left: 50%;
    top: -7%;
    width: 46%;
    transform: translateX(-50%);
  }

  .pony .bow {
    position: absolute;
    left: 20%;
    top: 47%;
    width: 24%;
  }
</style>
