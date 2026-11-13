<template>
  <Game
    :is-highlight-animation-running="isGameOver"
    :previous-level-disabled="true"
    :next-level-disabled="true"
    nav-back-path="/princess"
    explanation="mia_plant"
    :current-level="1"
    @restart="restart"
  >
    <div class="princess-game">
      <div class="scene fit">
        <div class="fit-box garden">
          <img v-if="sunOut" :src="'img/princess/thing_sun.webp'" class="sun no-drag" alt="" />
          <div v-for="(pot, index) in pots" :key="index" class="pot" :class="{ now: index === current && !isGameOver }" :data-stage="pot.stage" :style="{ left: 7 + 32 * index + '%' }">
            <img :src="pot.stage === 3 ? 'img/princess/thing_sprout.webp' : 'img/princess/thing_pot.webp'" class="no-drag" alt="" />
            <span v-if="pot.stage === 1 || pot.stage === 2" class="hole"><span v-if="pot.stage === 2" class="seed" /></span>
            <span v-if="pot.stage === 4" class="bloom">
              <img :src="'img/princess/flower_' + pot.color + '.webp'" class="no-drag" alt="" />
              <span class="stem" />
            </span>
            <img v-if="index === current && toolShown" :key="toolShown" :src="toolSrc(toolShown)" class="tool no-drag" alt="" />
          </div>
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
            v-for="tool in tools"
            :key="tool.id"
            type="button"
            class="choice big"
            :class="{ shake: wrongId === tool.id }"
            :data-choice="tool.id"
            @click="pick(tool)"
          >
            <img :src="tool.src" class="no-drag" alt="" />
          </button>
        </template>
        <button v-else type="button" class="done" data-test="next" @click="goToPath">
          <em class="fas fa-arrow-right" />
        </button>
      </div>
      <div class="dots">
        <span v-for="n in pots.length" :key="n" :class="{ on: n <= finished }" />
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
  import { COLORS, Lines } from './princessLines.js';
  import { gameMixin } from './gameMixin.js';

  const T = 'img/princess/thing_';
  // the order a flower is planted in
  const TOOLS = [
    { id: 'shovel', src: T + 'shovel.webp' },
    { id: 'seeds', src: T + 'seeds.webp' },
    { id: 'can', src: T + 'can.webp' },
    { id: 'sun', src: T + 'sun.webp' },
  ];

  export default {
    name: 'PlantGame',
    components: { Game, ErrorAnimation, LangToggle },
    mixins: [gameMixin],
    data() {
      return { pots: [], current: 0, finished: 0, tools: [], toolShown: null, sunOut: false, wrongId: null };
    },
    created() {
      this.restart();
    },
    methods: {
      toolSrc(id) {
        return TOOLS.find((t) => t.id === id).src;
      },
      restart() {
        this.clearTimers();
        this.isGameOver = false;
        this.isBusy = false;
        this.finished = 0;
        this.current = 0;
        this.toolShown = null;
        this.sunOut = false;
        const colors = ArrayUtils.shuffleArray(COLORS.map((c) => c.id)).slice(0, 3);
        this.pots = colors.map((color) => ({ color, stage: 0 }));
        this.ask();
      },
      ask() {
        this.tools = ArrayUtils.shuffleArray(TOOLS.slice());
        this.say(Lines.plantStep(this.pots[this.current].stage));
      },
      pick(tool) {
        if (this.isBusy || this.isGameOver) return;
        const pot = this.pots[this.current];
        if (tool.id !== TOOLS[pot.stage].id) {
          this.wrongId = tool.id;
          this.later(() => (this.wrongId = null), 500);
          this.wrongThenRepeat();
          return;
        }
        this.isBusy = true;
        this.toolShown = tool.id === 'sun' ? null : tool.id;
        if (tool.id === 'sun') this.sunOut = true;
        this.later(() => {
          this.toolShown = null;
          pot.stage++;
          if (pot.stage < 4) {
            this.isBusy = false;
            this.ask();
            return;
          }
          this.finished++;
          this.say(Lines.plantGrow());
          this.later(() => {
            this.isBusy = false;
            this.sunOut = false;
            if (this.finished >= this.pots.length) {
              this.finishStage('plant');
            } else {
              this.current++;
              this.ask();
            }
          }, 2400);
        }, 900);
      },
    },
  };
</script>

<style scoped lang="scss">
  @use './princess.scss';

  .garden {
    --ratio: 1.5;
    background: linear-gradient(#bfe6ff 0 70%, #8fd18a 70% 100%);
  }

  .sun {
    position: absolute;
    right: 3%;
    top: 3%;
    width: 20%;
    animation: princess-breathe 2.6s ease-in-out infinite;
  }

  .pot {
    position: absolute;
    bottom: 8%;
    width: 22%;
    opacity: 0.8;
  }

  .pot.now,
  .pot[data-stage='4'] {
    opacity: 1;
  }

  .pot.now::after {
    content: '';
    position: absolute;
    left: 10%;
    right: 10%;
    bottom: -9%;
    height: 5%;
    border-radius: 4pt;
    background: #ffd23f;
  }

  .pot > img:first-child {
    width: 100%;
    display: block;
  }

  .hole {
    position: absolute;
    left: 32%;
    top: 12%;
    width: 36%;
    height: 14%;
    border-radius: 50%;
    background: #3a2415;
    display: grid;
    place-items: center;
  }

  .seed {
    width: 30%;
    height: 60%;
    border-radius: 50%;
    background: #c99a5b;
  }

  .bloom {
    position: absolute;
    left: 10%;
    right: 10%;
    bottom: 82%;
    display: flex;
    flex-direction: column;
    align-items: center;
    transform-origin: 50% 100%;
    animation: grow 0.9s ease-out both;
  }

  .bloom img {
    width: 100%;
    position: relative;
    z-index: 1;
  }

  .bloom .stem {
    width: 9%;
    height: 0;
    padding-bottom: 42%;
    margin-top: -12%;
    border-radius: 3pt;
    background: #35b36b;
  }

  .tool {
    position: absolute;
    left: 20%;
    bottom: 96%;
    width: 70%;
    animation: tool-use 0.9s ease-in-out both;
  }

  @keyframes grow {
    from {
      transform: scale(0.1);
    }
    to {
      transform: scale(1);
    }
  }

  @keyframes tool-use {
    0% {
      transform: translateY(-20%) rotate(0);
      opacity: 0;
    }
    30% {
      transform: translateY(0) rotate(-18deg);
      opacity: 1;
    }
    70% {
      transform: translateY(0) rotate(12deg);
      opacity: 1;
    }
    100% {
      transform: translateY(0) rotate(-10deg);
      opacity: 0.9;
    }
  }
</style>
