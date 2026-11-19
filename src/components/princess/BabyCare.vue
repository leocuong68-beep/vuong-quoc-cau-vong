<template>
  <Game
    :is-highlight-animation-running="isGameOver"
    :previous-level-disabled="true"
    :next-level-disabled="true"
    nav-back-path="/princess"
    explanation="mia_baby"
    :current-level="1"
    @restart="restart"
  >
    <div class="baby-care" :class="{ night: state === 'asleep' }">
      <div class="room" ref="room" :style="{ backgroundImage: 'url(img/baby/nursery.webp)' }">
        <div class="hearts" data-test="hearts">
          <span v-for="n in rounds" :key="n" :class="{ on: n <= done }">❤</span>
        </div>

        <div
          ref="baby"
          class="baby"
          :class="['is-' + state, { shake: shaking, hop: hopping, target: dragging }]"
          data-test="baby"
          @click="tapBaby"
        >
          <img :src="'img/baby/baby_' + state + '.webp'" class="no-drag" alt="" />
          <span v-for="b in bubbles" :key="b.id" class="foam" :style="{ left: b.x + '%', top: b.y + '%' }" />
          <div v-if="need && !busy" class="need" :data-need="need">
            <img :src="NEEDS[need].icon" class="no-drag" alt="" />
          </div>
          <div v-if="state === 'asleep'" class="zz">z z z</div>
        </div>

        <img
          v-if="dragging"
          :src="dragging.src"
          class="flying no-drag"
          :style="{ left: drag.x + 'px', top: drag.y + 'px' }"
          alt=""
        />
      </div>

      <div class="ask">
        <button type="button" class="ask-line" data-test="repeat" @click="repeat">
          <em class="fas fa-volume-up" />
          <span>{{ prompt }}</span>
        </button>
        <LangToggle @change="repeat" />
      </div>

      <div class="tray">
        <template v-if="!isGameOver">
          <button
            v-for="tool in TOOLS"
            :key="tool.id"
            type="button"
            class="tool"
            :class="{ picked: selected === tool.id }"
            :data-tool="tool.id"
            @pointerdown="startDrag(tool, $event)"
          >
            <img :src="tool.src" class="no-drag" alt="" />
          </button>
        </template>
        <button v-else type="button" class="done" data-test="next" @click="goToPath">
          <em class="fas fa-arrow-right" />
        </button>
      </div>
    </div>
    <canvas v-if="party" ref="fx" class="fx" />
  </Game>
</template>

<script>
  import Game from '../Game.vue';
  import LangToggle from './LangToggle.vue';
  import { gameMixin } from './gameMixin.js';
  import { Lines } from './princessLines.js';
  import { ArrayUtils } from '../utils/ArrayUtils.js';
  import { sfx } from '../academy/sfx.js';

  // Look after the baby (like BabyBus): the baby shows what it needs,
  // Mia drags the right thing onto the baby (or taps the thing, then the baby).
  const B = 'img/baby/';
  const TOOLS = [
    'bottle', 'porridge', 'soap', 'towel', 'diaper', 'rattle', 'teddy', 'pacifier', 'blanket', 'duck',
  ].map((id) => ({ id, src: B + id + '.webp' }));
  // what each need looks like, which things help, and what the baby does then
  const NEEDS = {
    hungry: { icon: B + 'bottle.webp', fix: ['bottle', 'porridge'], during: 'drink' },
    dirty: { icon: B + 'soap.webp', fix: ['soap'], during: 'bath', then: 'towel' },
    stinky: { icon: B + 'diaper.webp', fix: ['diaper'] },
    cry: { icon: B + 'rattle.webp', fix: ['rattle', 'teddy', 'pacifier', 'duck'] },
    sleepy: { icon: B + 'blanket.webp', fix: ['blanket', 'teddy'], during: 'asleep' },
  };

  export default {
    name: 'BabyCare',
    components: { Game, LangToggle },
    mixins: [gameMixin],
    data() {
      return {
        TOOLS,
        NEEDS,
        rounds: 5,
        done: 0,
        plan: [],
        state: 'happy',
        step: null, // 'towel' after the bath
        busy: false,
        shaking: false,
        hopping: false,
        bubbles: [],
        scrubs: 0,
        selected: null,
        dragging: null,
        drag: { x: 0, y: 0, moved: false },
        party: false,
      };
    },
    computed: {
      need() {
        if (this.step === 'towel') return null;
        return this.plan[this.done] || null;
      },
    },
    created() {
      this.restart();
    },
    beforeUnmount() {
      this.stopDrag();
    },
    methods: {
      restart() {
        this.clearTimers();
        this.done = 0;
        this.isGameOver = false;
        this.busy = false;
        this.step = null;
        this.bubbles = [];
        this.plan = ArrayUtils.shuffleArray(Object.keys(NEEDS));
        this.say(Lines.babyHello());
        this.later(() => this.showNeed(), 2600);
      },
      showNeed() {
        const n = this.need;
        if (!n) return;
        this.state = n;
        this.say(Lines.babyNeed(n));
        if (n === 'cry') sfx.wrong();
      },
      // drag a thing from the tray; a short tap just picks it
      startDrag(tool, e) {
        if (this.busy || this.isGameOver) return;
        e.preventDefault();
        sfx.click();
        this.dragging = tool;
        this.drag = { x: e.clientX, y: e.clientY, moved: false, sx: e.clientX, sy: e.clientY };
        window.addEventListener('pointermove', this.onMove);
        window.addEventListener('pointerup', this.onUp);
      },
      onMove(e) {
        this.drag.x = e.clientX;
        this.drag.y = e.clientY;
        if (Math.abs(e.clientX - this.drag.sx) + Math.abs(e.clientY - this.drag.sy) > 12) this.drag.moved = true;
      },
      onUp(e) {
        const tool = this.dragging;
        const moved = this.drag.moved;
        this.stopDrag();
        if (!tool) return;
        if (!moved) {
          this.selected = tool.id;
          return;
        }
        const r = this.$refs.baby && this.$refs.baby.getBoundingClientRect();
        if (r && e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom) this.use(tool.id);
      },
      stopDrag() {
        this.dragging = null;
        window.removeEventListener('pointermove', this.onMove);
        window.removeEventListener('pointerup', this.onUp);
      },
      tapBaby(e) {
        if (this.selected) {
          const id = this.selected;
          this.selected = null;
          this.use(id);
          return;
        }
        // scrubbing in the bath makes more bubbles
        if (this.state === 'bath' && this.step === 'scrub') {
          const r = this.$refs.baby.getBoundingClientRect();
          this.bubbles.push({ id: Date.now() + Math.random(), x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
          sfx.pop ? sfx.pop() : sfx.click();
          this.scrubs++;
          if (this.scrubs >= 4) this.afterScrub();
          return;
        }
        if (!this.busy && this.state === 'happy') {
          this.hopping = true;
          sfx.click();
          this.later(() => (this.hopping = false), 600);
        }
      },
      use(toolId) {
        if (this.busy || this.isGameOver) return;
        if (this.step === 'towel') {
          if (toolId !== 'towel') return this.wrong();
          this.bubbles = [];
          this.step = null;
          return this.helped('dirty');
        }
        const n = this.need;
        if (!n) return;
        if (!NEEDS[n].fix.includes(toolId)) return this.wrong();
        sfx.right();
        const during = NEEDS[n].during;
        if (n === 'dirty') {
          this.state = 'bath';
          this.step = 'scrub';
          this.scrubs = 0;
          this.say(Lines.babyScrub());
          return;
        }
        this.busy = true;
        if (during) this.state = during;
        if (n === 'sleepy') sfx.lullaby();
        this.later(() => this.helped(n), during === 'asleep' ? 4500 : during ? 2600 : 600);
      },
      afterScrub() {
        this.step = 'towel';
        sfx.right();
        this.say(Lines.babyTowel());
      },
      helped(n) {
        this.busy = true;
        this.state = 'happy';
        this.hopping = true;
        this.say(Lines.babyGood(n));
        this.done++;
        this.later(() => (this.hopping = false), 900);
        this.later(() => {
          this.busy = false;
          if (this.done >= this.rounds) this.finish();
          else this.showNeed();
        }, 2600);
      },
      wrong() {
        sfx.wrong();
        this.shaking = true;
        this.later(() => (this.shaking = false), 500);
        this.say(Lines.babyWrong());
        this.later(() => {
          if (!this.busy && !this.isGameOver) {
            if (this.step === 'towel') this.say(Lines.babyTowel());
            else if (this.need) this.say(Lines.babyNeed(this.need));
          }
        }, 1800);
      },
      finish() {
        this.party = true;
        sfx.fanfare();
        this.finishStage('baby', Lines.babyDone());
        this.$nextTick(() => fireworks(this));
        this.later(() => (this.party = false), 5000);
      },
    },
  };

  function fireworks(vm) {
    const c = vm.$refs.fx;
    if (!c) return;
    const g = c.getContext('2d');
    const W = (c.width = window.innerWidth);
    const H = (c.height = window.innerHeight);
    const colors = ['#ff5fa2', '#ffd84a', '#7ee0ff', '#b98cff', '#7dff9a'];
    const parts = [];
    let frame = 0;
    const step = () => {
      if (!vm.party || !vm.$refs.fx) return;
      if (frame % 25 === 0 && frame < 220) {
        const x = W * (0.2 + Math.random() * 0.6);
        const y = H * (0.15 + Math.random() * 0.3);
        const col = colors[Math.floor(Math.random() * colors.length)];
        for (let i = 0; i < 70; i++) {
          const a = (Math.PI * 2 * i) / 70;
          const v = 2 + Math.random() * 3;
          parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 80, col });
        }
      }
      g.clearRect(0, 0, W, H);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.life -= 1;
        if (p.life <= 0) {
          parts.splice(i, 1);
          continue;
        }
        g.globalAlpha = Math.min(1, p.life / 40);
        g.fillStyle = p.col;
        g.fillRect(p.x - 3, p.y - 3, 7, 7);
      }
      frame += 1;
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
</script>

<style scoped lang="scss">
  .baby-care {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    height: 100%;
    padding: 0.4rem 0.8rem 0.8rem;
    font-family: 'Baloo 2', system-ui, sans-serif;
    color: #4a2a57;
    touch-action: none;
    user-select: none;
  }
  .room {
    position: relative;
    flex: 1;
    min-height: 0;
    border-radius: 1.2rem;
    background-position: center;
    background-size: cover;
    overflow: hidden;
    transition: filter 0.8s;
  }
  // night: a dark blue veil over the room, the sleeping baby stays bright
  .room::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(30, 24, 80, 0);
    transition: background 0.8s;
    z-index: 1;
    pointer-events: none;
  }
  .night .room::before {
    background: rgba(30, 24, 80, 0.55);
  }
  .hearts {
    position: absolute;
    top: 0.6rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 0.3rem;
    font-size: 2rem;
    color: rgba(255, 255, 255, 0.7);
    text-shadow: 0 2px 4px rgba(74, 42, 87, 0.4);
    z-index: 3;
  }
  .hearts .on {
    color: #ff4f8b;
  }
  .baby {
    position: absolute;
    left: 50%;
    bottom: 4%;
    height: 78%;
    aspect-ratio: 0.85;
    transform: translateX(-50%);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    cursor: pointer;
    z-index: 2;
  }
  .baby img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 12px 10px rgba(74, 42, 87, 0.3));
  }
  .baby.target img {
    filter: drop-shadow(0 0 18px #fff6a8) drop-shadow(0 12px 10px rgba(74, 42, 87, 0.3));
  }
  .baby.shake {
    animation: shake 0.45s;
  }
  .baby.hop {
    animation: hop 0.45s ease-in-out 2;
  }
  .is-cry img {
    animation: sob 0.6s ease-in-out infinite;
  }
  @keyframes shake {
    25% {
      transform: translateX(calc(-50% - 12px));
    }
    75% {
      transform: translateX(calc(-50% + 12px));
    }
  }
  @keyframes hop {
    50% {
      transform: translateX(-50%) translateY(-8%);
    }
  }
  @keyframes sob {
    50% {
      transform: translateY(-1.5%) scale(1.01, 0.99);
    }
  }
  .need {
    position: absolute;
    right: -18%;
    top: 4%;
    width: 30%;
    aspect-ratio: 1;
    background: #fff;
    border-radius: 50%;
    display: grid;
    place-items: center;
    box-shadow: 0 6px 14px rgba(74, 42, 87, 0.25);
    animation: bob 1.4s ease-in-out infinite;
  }
  .need::after {
    content: '';
    position: absolute;
    left: 6%;
    bottom: -4%;
    width: 22%;
    height: 22%;
    background: #fff;
    border-radius: 50%;
  }
  .need img {
    width: 70%;
    height: 70%;
    object-fit: contain;
  }
  @keyframes bob {
    50% {
      transform: translateY(-8px) scale(1.05);
    }
  }
  .foam {
    position: absolute;
    width: 14%;
    aspect-ratio: 1;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    background: radial-gradient(circle at 35% 30%, #fff 0 18%, rgba(255, 255, 255, 0.85) 19% 55%, rgba(200, 230, 255, 0.5) 56%);
    box-shadow: 0 0 6px rgba(255, 255, 255, 0.9);
    pointer-events: none;
    animation: grow 0.4s ease-out;
  }
  @keyframes grow {
    from {
      transform: translate(-50%, -50%) scale(0.2);
    }
  }
  .zz {
    position: absolute;
    right: 0;
    top: 0;
    font-size: 2.4rem;
    font-weight: 800;
    color: #fff7c2;
    animation: bob 2s ease-in-out infinite;
  }
  .flying {
    position: fixed;
    width: 7rem;
    transform: translate(-50%, -60%) rotate(-8deg);
    pointer-events: none;
    z-index: 80;
    filter: drop-shadow(0 10px 8px rgba(0, 0, 0, 0.3));
  }
  .ask {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
  .ask-line {
    flex: 1;
    display: flex;
    gap: 0.5rem;
    align-items: center;
    border: 0;
    background: #fff;
    border-radius: 999px;
    padding: 0.5rem 0.9rem;
    font: inherit;
    font-weight: 700;
    color: inherit;
    text-align: left;
    cursor: pointer;
  }
  .tray {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    flex-wrap: wrap;
    padding: 0.4rem;
    background: rgba(255, 255, 255, 0.85);
    border-radius: 1.2rem;
  }
  .tool {
    width: 5.2rem;
    height: 5.2rem;
    border: 3px solid transparent;
    border-radius: 1rem;
    background: #fff0f7;
    padding: 0.25rem;
    cursor: grab;
    touch-action: none;
  }
  .tool img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    pointer-events: none;
  }
  .tool.picked {
    border-color: #ff5a8a;
    transform: scale(1.08);
  }
  .done {
    border: 0;
    border-radius: 999px;
    width: 5rem;
    height: 5rem;
    font-size: 2rem;
    color: #fff;
    background: #5fd38d;
    cursor: pointer;
  }
  .fx {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 60;
  }
</style>
