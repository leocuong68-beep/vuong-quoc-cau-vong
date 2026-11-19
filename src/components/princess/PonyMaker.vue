<template>
  <Game
    :is-highlight-animation-running="celebrating"
    :previous-level-disabled="true"
    :next-level-disabled="true"
    nav-back-path="/princess"
    explanation="mia_pony"
    :current-level="1"
    @restart="reset"
  >
    <div class="pony-maker" :class="'bg-' + look.bg">
      <div class="stage-area">
        <div class="pony-wrap" :class="['pose-' + look.pose, { party: celebrating }]" @click="tapPony">
          <canvas ref="canvas" width="640" height="640" class="pony no-drag" data-test="pony" />
          <img v-if="accessory" :src="accessory.src" class="acc no-drag" :class="'acc-' + accessory.kind" alt="" />
        </div>
        <div class="saved" v-if="stable.length">
          <button
            v-for="(p, i) in stable"
            :key="p.id"
            type="button"
            class="saved-pony"
            :data-saved="i"
            @click="loadSaved(p)"
          >
            <img :src="p.thumb" alt="" class="no-drag" />
          </button>
        </div>
      </div>

      <div class="panel">
        <div class="ask">
          <button type="button" class="ask-line" data-test="repeat" @click="repeat">
            <em class="fas fa-volume-up" />
            <span>{{ prompt }}</span>
          </button>
          <LangToggle @change="repeat" />
        </div>

        <div class="tabs">
          <button
            v-for="tab in TABS"
            :key="tab.id"
            type="button"
            class="tab"
            :class="{ on: tab.id === current }"
            :data-tab="tab.id"
            @click="openTab(tab.id)"
          >
            <span class="tab-icon">{{ tab.icon }}</span>
            <span class="tab-name">{{ tab[lang] }}</span>
          </button>
        </div>

        <div v-if="optionsOf(current).length" class="options">
          <button
            v-for="o in optionsOf(current)"
            :key="o.id"
            type="button"
            class="option"
            :class="{ on: look[current] === o.id }"
            :data-option="o.id"
            @click="choose(current, o.id)"
          >
            <span v-if="o.icon" class="option-icon">{{ o.icon }}</span>
            <img v-else-if="o.thumb" :src="o.thumb" alt="" class="no-drag" />
          </button>
        </div>

        <div v-if="colorKey" class="colors">
          <button
            v-for="c in COLORS"
            :key="c"
            type="button"
            class="swatch"
            :class="{ on: look[colorKey] === c }"
            :style="{ background: c }"
            :data-color="c"
            @click="paint(c)"
          />
        </div>

        <div class="actions">
          <button type="button" class="act" data-test="random" @click="surprise">🎲 {{ t(TXT.random) }}</button>
          <button type="button" class="act save" data-test="save" @click="save">💖 {{ t(TXT.save) }}</button>
        </div>
      </div>
      <canvas v-if="celebrating" ref="fx" class="fx" />
    </div>
  </Game>
</template>

<script>
  import Game from '../Game.vue';
  import LangToggle from './LangToggle.vue';
  import { gameMixin } from './gameMixin.js';
  import { Lines } from './princessLines.js';
  import { sfx } from '../academy/sfx.js';

  // Make your own pony: every part is a picture drawn on the same 640×640 pony,
  // the plain parts (body, mane, horn, wings, eye colour) are white and get their colour here.
  const IMG = 'img/pony/';
  const COLORS = [
    '#ffffff', '#ffd1e6', '#ff8fc7', '#ff5a8a', '#ff9f43', '#ffd23f', '#b8f07a', '#5fd38d',
    '#7ee0ff', '#4aa8ff', '#b39cff', '#8a5cff', '#c9a27e', '#7a5a46', '#555566', '#222233',
  ];
  const TABS = [
    { id: 'body', icon: '🐴', vi: 'Thân', en: 'Body' },
    { id: 'mane', icon: '💇', vi: 'Bờm', en: 'Mane' },
    { id: 'eyes', icon: '👀', vi: 'Mắt', en: 'Eyes' },
    { id: 'nose', icon: '👃', vi: 'Mũi', en: 'Nose' },
    { id: 'mouth', icon: '👄', vi: 'Miệng', en: 'Mouth' },
    { id: 'horn', icon: '🦄', vi: 'Sừng', en: 'Horn' },
    { id: 'wings', icon: '🪽', vi: 'Cánh', en: 'Wings' },
    { id: 'acc', icon: '👑', vi: 'Phụ kiện', en: 'Extras' },
    { id: 'pose', icon: '💃', vi: 'Dáng', en: 'Pose' },
    { id: 'bg', icon: '🌈', vi: 'Nền', en: 'Place' },
  ];
  const thumb = (n) => IMG + n + '.webp';
  const OPTIONS = {
    body: [],
    mane: [1, 2, 3, 4].map((i) => ({ id: 'mane' + i, thumb: thumb('mane' + i) })),
    eyes: [1, 2, 3, 4].map((i) => ({ id: 'eyes' + i, thumb: thumb('eyes' + i) })),
    nose: [
      { id: 'none', icon: '⭕' },
      { id: 'nose1', thumb: thumb('nose1') },
      { id: 'nose2', thumb: thumb('nose2') },
    ],
    mouth: [1, 2, 3].map((i) => ({ id: 'mouth' + i, thumb: thumb('mouth' + i) })),
    horn: [{ id: 'none', icon: '⭕' }, { id: 'horn1', thumb: thumb('horn1') }, { id: 'horn2', thumb: thumb('horn2') }],
    wings: [{ id: 'none', icon: '⭕' }, { id: 'wing1', thumb: thumb('wing1') }, { id: 'wing2', thumb: thumb('wing2') }],
    acc: [
      { id: 'none', icon: '⭕' },
      ...['pink', 'yellow', 'purple'].map((c) => ({ id: 'crown_' + c, thumb: 'img/princess/crown_' + c + '.webp' })),
      ...['pink', 'blue'].map((c) => ({ id: 'bow_' + c, thumb: 'img/princess/bow_' + c + '.webp' })),
      ...['pink', 'yellow'].map((c) => ({ id: 'flower_' + c, thumb: 'img/princess/flower_' + c + '.webp' })),
    ],
    pose: [
      { id: 'stand', icon: '🧍' },
      { id: 'jump', icon: '🦘' },
      { id: 'dance', icon: '💃' },
      { id: 'fly', icon: '🕊️' },
      { id: 'sleep', icon: '😴' },
    ],
    bg: [
      { id: 'rainbow', icon: '🌈' },
      { id: 'meadow', icon: '🌼' },
      { id: 'night', icon: '🌙' },
      { id: 'castle', icon: '🏰' },
    ],
  };
  // which colour belongs to which tab
  const COLOR_OF = { body: 'bodyColor', mane: 'maneColor', eyes: 'eyeColor', horn: 'hornColor', wings: 'wingColor' };
  const START = {
    body: '', mane: 'mane1', eyes: 'eyes1', nose: 'nose1', mouth: 'mouth1', horn: 'horn1', wings: 'none',
    acc: 'none', pose: 'stand', bg: 'rainbow',
    bodyColor: '#ffd1e6', maneColor: '#b39cff', eyeColor: '#4aa8ff', hornColor: '#ffd23f', wingColor: '#ffffff',
  };
  const TXT = {
    random: { vi: 'Bất ngờ', en: 'Surprise' },
    save: { vi: 'Lưu pony', en: 'Save' },
  };
  const KEY = 'mia_ponies';
  const loadStable = () => {
    try {
      const list = JSON.parse(localStorage[KEY] || '[]');
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  };
  const pick = (list) => list[Math.floor(Math.random() * list.length)];

  const cache = {};
  const loadImg = (src) =>
    cache[src] ||
    (cache[src] = new Promise((resolve) => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = () => resolve(null);
      im.src = src;
    }));

  export default {
    name: 'PonyMaker',
    components: { Game, LangToggle },
    mixins: [gameMixin],
    data() {
      return {
        TABS,
        COLORS,
        TXT,
        current: 'body',
        look: { ...START },
        stable: loadStable(),
        celebrating: false,
        drawing: 0,
      };
    },
    computed: {
      colorKey() {
        if (this.current === 'horn' && this.look.horn === 'none') return null;
        if (this.current === 'wings' && this.look.wings === 'none') return null;
        return COLOR_OF[this.current] || null;
      },
      accessory() {
        const a = this.look.acc;
        if (!a || a === 'none') return null;
        return { kind: a.split('_')[0], src: 'img/princess/' + a + '.webp' };
      },
    },
    watch: {
      look: {
        deep: true,
        handler() {
          this.draw();
        },
      },
    },
    mounted() {
      this.draw();
      this.say(Lines.ponyHello());
    },
    methods: {
      t(text) {
        return text[this.lang] || text.vi;
      },
      optionsOf(tab) {
        return OPTIONS[tab] || [];
      },
      openTab(id) {
        sfx.click();
        this.current = id;
        const line = Lines.ponyTab(id);
        if (line) this.say(line);
      },
      choose(tab, id) {
        sfx.tap ? sfx.tap() : sfx.click();
        this.look[tab] = id;
        if (tab === 'pose' && id === 'fly' && this.look.wings === 'none') this.look.wings = 'wing1';
      },
      paint(color) {
        sfx.click();
        this.look[this.colorKey] = color;
      },
      reset() {
        this.look = { ...START };
        this.current = 'body';
      },
      surprise() {
        sfx.pop ? sfx.pop() : sfx.click();
        const L = this.look;
        L.mane = pick(OPTIONS.mane).id;
        L.eyes = pick(OPTIONS.eyes).id;
        L.mouth = pick(OPTIONS.mouth).id;
        L.nose = pick(OPTIONS.nose).id;
        L.horn = pick(OPTIONS.horn).id;
        L.wings = pick(OPTIONS.wings).id;
        L.acc = pick(OPTIONS.acc).id;
        L.bodyColor = pick(COLORS.slice(0, 13));
        L.maneColor = pick(COLORS);
        L.eyeColor = pick(COLORS.slice(2, 12));
        L.hornColor = pick(COLORS.slice(0, 12));
        L.wingColor = pick(COLORS.slice(0, 12));
      },
      tapPony() {
        voiceHappy(this);
      },
      // draws the parts in order; white parts are coloured with "multiply" so the shading stays
      async draw() {
        const ticket = ++this.drawing;
        const L = this.look;
        const layers = [];
        if (L.wings !== 'none') layers.push([L.wings, L.wingColor]);
        layers.push(['body', L.bodyColor]);
        layers.push([L.mane, L.maneColor]);
        if (L.horn !== 'none') layers.push([L.horn, L.hornColor]);
        layers.push([L.eyes, null]);
        if (L.eyes !== 'eyes2') layers.push([L.eyes + '_iris', L.eyeColor]);
        if (L.nose !== 'none') layers.push([L.nose, null]);
        layers.push([L.mouth, null]);
        const imgs = await Promise.all(layers.map(([n]) => loadImg(IMG + n + '.webp')));
        if (ticket !== this.drawing) return;
        const c = this.$refs.canvas;
        if (!c) return;
        const g = c.getContext('2d');
        g.clearRect(0, 0, 640, 640);
        const tmp = document.createElement('canvas');
        tmp.width = tmp.height = 640;
        const tg = tmp.getContext('2d');
        layers.forEach(([, color], i) => {
          const im = imgs[i];
          if (!im) return;
          if (!color) {
            g.drawImage(im, 0, 0, 640, 640);
            return;
          }
          tg.globalCompositeOperation = 'source-over';
          tg.clearRect(0, 0, 640, 640);
          tg.drawImage(im, 0, 0, 640, 640);
          tg.globalCompositeOperation = 'multiply';
          tg.fillStyle = color;
          tg.fillRect(0, 0, 640, 640);
          tg.globalCompositeOperation = 'destination-in';
          tg.drawImage(im, 0, 0, 640, 640);
          g.drawImage(tmp, 0, 0);
        });
      },
      save() {
        const c = this.$refs.canvas;
        if (!c) return;
        const small = document.createElement('canvas');
        small.width = small.height = 160;
        small.getContext('2d').drawImage(c, 0, 0, 160, 160);
        const entry = { id: Date.now(), look: { ...this.look }, thumb: small.toDataURL('image/png') };
        this.stable = [entry, ...this.stable].slice(0, 8);
        try {
          localStorage[KEY] = JSON.stringify(this.stable);
        } catch (e) {
          // the stable is kept for this visit only
        }
        this.celebrate();
      },
      loadSaved(p) {
        sfx.click();
        this.look = { ...START, ...p.look };
      },
      celebrate() {
        this.celebrating = true;
        sfx.fanfare();
        this.say(Lines.ponySaved());
        this.$nextTick(() => fireworks(this));
        this.later(() => (this.celebrating = false), 4500);
      },
    },
  };

  function voiceHappy(vm) {
    sfx.click();
    vm.say(Lines.ponyLove());
  }

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
      if (!vm.celebrating || !vm.$refs.fx) return;
      if (frame % 25 === 0 && frame < 200) {
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
  .pony-maker {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
    gap: 1rem;
    height: 100%;
    padding: 0.5rem 1rem 1rem;
    font-family: 'Baloo 2', system-ui, sans-serif;
    color: #4a2a57;
    border-radius: 1.2rem;
  }
  .bg-rainbow {
    background: radial-gradient(circle at 30% 110%, #fff 0 18%, transparent 19%),
      radial-gradient(circle at 30% 110%, #ff8fc7 0 34%, #ffd23f 34% 40%, #7dff9a 40% 46%, #7ee0ff 46% 52%,
        #b39cff 52% 58%, transparent 58%),
      linear-gradient(#e9f6ff, #fff4fb);
  }
  .bg-meadow {
    background: linear-gradient(#bfe9ff 0 58%, #a8e07a 58% 100%);
  }
  .bg-night {
    background: radial-gradient(circle at 80% 15%, #fff7c2 0 5%, transparent 6%), linear-gradient(#2a2160, #5c3d8f 70%, #7a5aa8);
  }
  .bg-castle {
    background: linear-gradient(#ffe3f1 0 60%, #ffc6e0 60% 100%);
  }
  .stage-area {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 0;
  }
  .pony-wrap {
    position: relative;
    width: min(100%, 64vh);
    aspect-ratio: 1;
    cursor: pointer;
  }
  .pony {
    width: 100%;
    height: 100%;
    filter: drop-shadow(0 14px 10px rgba(74, 42, 87, 0.25));
  }
  .acc {
    position: absolute;
    pointer-events: none;
  }
  .acc-crown {
    left: 18%;
    top: -2%;
    width: 26%;
    transform: rotate(-8deg);
  }
  .acc-bow {
    left: 40%;
    top: 4%;
    width: 18%;
  }
  .acc-flower {
    left: 15%;
    top: 4%;
    width: 15%;
  }
  .pose-stand {
    animation: breathe 3s ease-in-out infinite;
  }
  .pose-jump {
    animation: hop 0.9s ease-in-out infinite;
  }
  .pose-dance {
    animation: dance 1.2s ease-in-out infinite;
    transform-origin: 50% 95%;
  }
  .pose-fly {
    animation: fly 2.4s ease-in-out infinite;
  }
  .pose-sleep {
    transform: rotate(-4deg) scale(0.95);
    filter: saturate(0.85);
  }
  .pose-sleep::after {
    content: 'z z z';
    position: absolute;
    right: 18%;
    top: 4%;
    font-size: 2rem;
    font-weight: 800;
    color: #8a5cff;
    animation: zz 2s ease-in-out infinite;
  }
  .party {
    animation: hop 0.5s ease-in-out 6 !important;
  }
  @keyframes breathe {
    50% {
      transform: scale(1.015, 0.99);
    }
  }
  @keyframes hop {
    0%,
    100% {
      transform: translateY(0) scale(1, 1);
    }
    15% {
      transform: translateY(0) scale(1.05, 0.95);
    }
    50% {
      transform: translateY(-14%) scale(0.98, 1.02);
    }
  }
  @keyframes dance {
    25% {
      transform: rotate(-6deg);
    }
    75% {
      transform: rotate(6deg);
    }
  }
  @keyframes fly {
    0%,
    100% {
      transform: translateY(-6%) rotate(-3deg);
    }
    50% {
      transform: translateY(-14%) rotate(3deg);
    }
  }
  @keyframes zz {
    50% {
      transform: translateY(-10px);
      opacity: 0.5;
    }
  }
  .saved {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 0.3rem;
  }
  .saved-pony {
    width: 3.6rem;
    height: 3.6rem;
    border-radius: 50%;
    border: 3px solid #fff;
    background: rgba(255, 255, 255, 0.7);
    padding: 0;
    box-shadow: 0 2px 6px rgba(74, 42, 87, 0.25);
    cursor: pointer;
  }
  .saved-pony img {
    width: 100%;
    height: 100%;
  }
  .panel {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
    min-height: 0;
    overflow: auto;
    padding: 0.8rem;
    background: rgba(255, 255, 255, 0.82);
    border-radius: 1.2rem;
    box-shadow: 0 6px 18px rgba(74, 42, 87, 0.15);
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
    background: #fff0f7;
    border-radius: 999px;
    padding: 0.5rem 0.9rem;
    font: inherit;
    font-weight: 700;
    color: inherit;
    text-align: left;
    cursor: pointer;
  }
  .tabs {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 0.35rem;
  }
  .tab {
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 3px solid transparent;
    border-radius: 0.9rem;
    background: #fff;
    padding: 0.3rem 0.1rem;
    font: inherit;
    color: inherit;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(74, 42, 87, 0.12);
  }
  .tab.on {
    border-color: #ff7eb6;
    background: #ffe3f1;
  }
  .tab-icon {
    font-size: 1.6rem;
    line-height: 1.2;
  }
  .tab-name {
    font-size: 0.85rem;
    font-weight: 700;
  }
  .options {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(5rem, 1fr));
    gap: 0.45rem;
  }
  .option {
    aspect-ratio: 1;
    border: 3px solid transparent;
    border-radius: 1rem;
    background: #f6f0ff;
    padding: 0.2rem;
    cursor: pointer;
    overflow: hidden;
  }
  .option.on {
    border-color: #8a5cff;
    background: #ece4ff;
  }
  .option img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 0 1px #4a2a57) drop-shadow(0 0 1px #4a2a57);
  }
  .option-icon {
    font-size: 2.2rem;
  }
  .colors {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 0.4rem;
  }
  .swatch {
    aspect-ratio: 1;
    border-radius: 50%;
    border: 3px solid #fff;
    box-shadow: 0 0 0 2px rgba(74, 42, 87, 0.25);
    cursor: pointer;
  }
  .swatch.on {
    box-shadow: 0 0 0 4px #4a2a57;
    transform: scale(1.1);
  }
  .actions {
    display: flex;
    gap: 0.5rem;
    margin-top: auto;
  }
  .act {
    flex: 1;
    border: 0;
    border-radius: 999px;
    padding: 0.7rem;
    font: inherit;
    font-size: 1.1rem;
    font-weight: 800;
    color: #fff;
    background: #8a5cff;
    cursor: pointer;
    box-shadow: 0 4px 0 #5e3bc4;
  }
  .act.save {
    background: #ff5a8a;
    box-shadow: 0 4px 0 #c93a66;
  }
  .fx {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 60;
  }
  @media (max-aspect-ratio: 1/1) {
    .pony-maker {
      grid-template-columns: 1fr;
      grid-template-rows: auto 1fr;
    }
    .pony-wrap {
      width: min(80vw, 42vh);
    }
  }
</style>
