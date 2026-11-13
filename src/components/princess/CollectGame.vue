<template>
  <Game
    :is-highlight-animation-running="isGameOver"
    :previous-level-disabled="true"
    :next-level-disabled="true"
    nav-back-path="/princess"
    explanation="mia_collect"
    :current-level="1"
    @restart="restart"
  >
    <div class="princess-game">
      <div class="scene">
        <div class="pony side" :class="'mood-' + mood">
          <img :src="buddy.src" class="no-drag" :alt="buddy.en" />
        </div>
        <div class="board">
          <img v-if="isGameOver && config.doneImg" :src="config.doneImg" class="picture no-drag" alt="" />
          <template v-else>
            <img :src="config.target" class="target no-drag" alt="" />
            <img
              v-for="n in given"
              :key="roundId + '-' + n"
              :src="wanted.src"
              class="item no-drag"
              data-test="given"
              alt=""
            />
          </template>
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
            v-for="thing in tray"
            :key="roundId + '-' + thing.key"
            type="button"
            class="choice small"
            :class="{ used: thing.used, shake: wrongKey === thing.key }"
            :data-kind="thing.id"
            @click="take(thing)"
          >
            <img :src="thing.src" class="no-drag" alt="" />
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
  import { BUDDIES, INGREDIENTS, VEGS, Lines } from './princessLines.js';

  const KINDS = {
    harvest: { stage: 'harvest', buddy: 'daddy', items: VEGS, target: 'img/princess/thing_basket.webp', ask: (n, id) => Lines.harvest(n, id) },
    bake: {
      stage: 'bake',
      buddy: 'mommy',
      items: INGREDIENTS,
      target: 'img/princess/thing_mixbowl.webp',
      ask: (n, id) => Lines.bake(n, id),
      doneImg: 'img/princess/thing_cake.webp',
      doneLine: () => Lines.bakeDone(),
    },
  };

  export default {
    name: 'CollectGame',
    components: { Game, ErrorAnimation, LangToggle },
    mixins: [gameMixin],
    data() {
      return { kind: 'harvest', rounds: 3, finished: 0, roundId: 0, need: 0, given: 0, wanted: null, tray: [], wrongKey: null };
    },
    computed: {
      config() {
        return KINDS[this.kind];
      },
      buddy() {
        return BUDDIES[this.config.buddy];
      },
    },
    created() {
      const kind = this.$route && this.$route.params.kind;
      this.kind = KINDS[kind] ? kind : 'harvest';
      this.restart();
    },
    methods: {
      restart() {
        this.clearTimers();
        this.finished = 0;
        this.isGameOver = false;
        this.mood = 'idle';
        this.wanted = null;
        this.nextRound();
      },
      nextRound() {
        const items = this.config.items;
        const others = items.filter((x) => x !== this.wanted);
        this.wanted = ArrayUtils.getRandomArrayElement(others);
        this.need = 1 + Math.floor(Math.random() * 5);
        this.given = 0;
        this.roundId++;
        this.isBusy = false;
        const tray = [];
        const add = (item, count) => {
          for (let i = 0; i < count; i++) tray.push({ key: item.id + i, id: item.id, src: item.src, used: false });
        };
        add(this.wanted, Math.min(6, this.need + 1 + Math.floor(Math.random() * 2)));
        items.filter((x) => x !== this.wanted).forEach((item) => add(item, 2));
        this.tray = ArrayUtils.shuffleArray(tray);
        this.say(this.question());
      },
      question() {
        return this.config.ask(this.need, this.wanted.id);
      },
      take(thing) {
        if (this.isBusy || this.isGameOver || thing.used) return;
        if (thing.id !== this.wanted.id) {
          this.wrongKey = thing.key;
          this.later(() => (this.wrongKey = null), 500);
          this.setMood('oops', 900);
          this.wrongThenRepeat();
          return;
        }
        thing.used = true;
        this.given++;
        // counting out loud keeps the question on screen
        const question = this.shown;
        this.say(Lines.number(this.given));
        this.shown = question;
      },
      check() {
        if (this.isBusy || this.isGameOver || this.given === 0) return;
        this.isBusy = true;
        if (this.given === this.need) {
          this.finished++;
          this.setMood('happy');
          this.say(Lines.yesCount(this.need));
          this.later(() => {
            if (this.finished >= this.rounds) {
              this.isBusy = false;
              this.finishStage(this.config.stage, this.config.doneLine ? this.config.doneLine() : Lines.buddyDone(this.config.buddy));
            } else {
              this.nextRound();
            }
          }, 2400);
          return;
        }
        this.setMood('oops', 900);
        const question = this.question();
        this.$refs.errorAnimation.showError(() => this.say(Lines.countAgain()));
        this.later(() => {
          this.given = 0;
          this.tray.forEach((thing) => (thing.used = false));
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
    width: 50pt;
    height: 50pt;
  }

  .board .target {
    width: min(48%, 150pt);
    height: auto;
    margin-right: 4pt;
  }
</style>
