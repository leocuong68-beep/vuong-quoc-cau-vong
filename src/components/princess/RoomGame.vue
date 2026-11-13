<template>
  <Game
    :is-highlight-animation-running="isGameOver"
    :previous-level-disabled="true"
    :next-level-disabled="true"
    nav-back-path="/princess"
    explanation="mia_room"
    :current-level="1"
    @restart="restart"
  >
    <div class="princess-game">
      <div class="scene fit">
        <div class="fit-box room">
          <img :src="'img/princess/thing_bed.webp'" class="bed no-drag" alt="" />
          <img :src="'img/princess/thing_table.webp'" class="table no-drag" alt="" />
          <img
            v-for="p in placed"
            :key="p.item.id"
            :src="p.item.src"
            class="thing no-drag"
            :data-placed="p.spot"
            :style="thingStyle(p.spot)"
            alt=""
          />
          <template v-if="!isGameOver">
            <button
              v-for="spot in freeSpots"
              :key="spot"
              type="button"
              class="mark"
              :class="{ shake: wrongSpot === spot }"
              :data-spot="spot"
              :style="markStyle(spot)"
              @click="pick(spot)"
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
        <img v-if="!isGameOver && current" :key="current.item.id" :src="current.item.src" class="holding no-drag" alt="" />
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
  import { ROOM_ITEMS, ROOM_SPOTS, Lines } from './princessLines.js';
  import { gameMixin } from './gameMixin.js';

  // where a thing stands for each place, in % of the room: x = middle, base = its bottom edge
  const POS = {
    on_bed: { x: 27, base: 60, z: 3 },
    next_bed: { x: 57, base: 93, z: 3 },
    on_table: { x: 80, base: 58, z: 3 },
    under_table: { x: 80, base: 91, z: 1 },
  };

  export default {
    name: 'RoomGame',
    components: { Game, ErrorAnimation, LangToggle },
    mixins: [gameMixin],
    data() {
      return { rounds: 4, finished: 0, plan: [], placed: [], wrongSpot: null };
    },
    computed: {
      current() {
        return this.plan[this.finished];
      },
      freeSpots() {
        const used = this.placed.map((p) => p.spot);
        return ROOM_SPOTS.map((s) => s.id).filter((id) => !used.includes(id));
      },
    },
    created() {
      this.restart();
    },
    methods: {
      restart() {
        this.clearTimers();
        this.finished = 0;
        this.isGameOver = false;
        this.isBusy = false;
        this.placed = [];
        const items = ArrayUtils.shuffleArray(ROOM_ITEMS.slice());
        const spots = ArrayUtils.shuffleArray(ROOM_SPOTS.map((s) => s.id));
        this.plan = items.map((item, i) => ({ item, spot: spots[i] }));
        this.ask();
      },
      ask() {
        this.say(Lines.putItem(this.current.item.id, this.current.spot));
      },
      thingStyle(spot) {
        const p = POS[spot];
        return { left: p.x + '%', bottom: 100 - p.base + '%', zIndex: p.z };
      },
      markStyle(spot) {
        const p = POS[spot];
        return { left: p.x + '%', top: p.base - 11 + '%' };
      },
      pick(spot) {
        if (this.isBusy || this.isGameOver) return;
        if (spot !== this.current.spot) {
          this.wrongSpot = spot;
          this.later(() => (this.wrongSpot = null), 500);
          this.wrongThenRepeat();
          return;
        }
        this.isBusy = true;
        this.placed.push({ item: this.current.item, spot });
        this.say(Lines.yesSpot(spot));
        this.finished++;
        this.later(() => {
          this.isBusy = false;
          if (this.finished >= this.rounds) this.finishStage('room', Lines.roomDone());
          else this.ask();
        }, 2200);
      },
    },
  };
</script>

<style scoped lang="scss">
  @use './princess.scss';

  .room {
    --ratio: 1.333;
    background: linear-gradient(#ffe9d6 0 64%, #e8b98a 64% 100%);
  }

  .bed {
    position: absolute;
    left: 3%;
    bottom: 10%;
    width: 48%;
    z-index: 2;
  }

  .table {
    position: absolute;
    right: 5%;
    bottom: 8%;
    width: 31%;
    z-index: 2;
  }

  .thing {
    position: absolute;
    width: 15%;
    transform: translateX(-50%);
    animation: princess-pop 0.35s ease-out both;
  }

  .mark {
    position: absolute;
    width: 14%;
    aspect-ratio: 1 / 1;
    transform: translate(-50%, -50%);
    border: 3pt dashed #4a2a57;
    border-radius: 50%;
    background: rgba(255, 210, 63, 0.55);
    cursor: pointer;
    z-index: 4;
    touch-action: manipulation;
  }

  .holding {
    height: 62pt;
    width: auto;
    animation: princess-pop 0.35s ease-out both;
  }

  @keyframes princess-pop {
    from {
      scale: 0.2;
      opacity: 0;
    }
    to {
      scale: 1;
      opacity: 1;
    }
  }
</style>
