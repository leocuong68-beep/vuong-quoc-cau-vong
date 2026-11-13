<template>
  <Game
    :is-highlight-animation-running="isGameOver"
    :previous-level-disabled="true"
    :next-level-disabled="true"
    nav-back-path="/princess"
    explanation="mia_paint"
    :current-level="1"
    @restart="restart"
  >
    <div class="princess-game">
      <div ref="scene" class="scene easel">
        <canvas
          ref="canvas"
          data-test="canvas"
          @pointerdown.prevent="start"
          @pointermove.prevent="move"
          @pointerup="stop"
          @pointercancel="stop"
          @pointerleave="stop"
        />
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
            v-for="color in colors"
            :key="color.id"
            type="button"
            class="choice brush"
            :class="{ selected: tool === color.id }"
            :data-brush="color.id"
            :style="{ background: color.hex }"
            @click="tool = color.id"
          />
          <button
            v-for="stamp in stamps"
            :key="stamp.id"
            type="button"
            class="choice brush"
            :class="{ selected: tool === stamp.id }"
            :data-stamp="stamp.id"
            @click="tool = stamp.id"
          >
            <img :src="stamp.src" class="no-drag" alt="" />
          </button>
          <button type="button" class="choice brush" data-test="clear" @click="clear">
            <em class="fas fa-trash" />
          </button>
          <button type="button" class="done" data-test="done" @click="finish">
            <em class="fas fa-check" />
          </button>
        </template>
        <button v-else type="button" class="done" data-test="next" @click="goToPath">
          <em class="fas fa-arrow-right" />
        </button>
      </div>
      <div class="dots" />
    </div>
  </Game>
</template>

<script>
  import Game from '../Game.vue';
  import LangToggle from './LangToggle.vue';
  import { COLORS, Lines } from './princessLines.js';
  import { gameMixin } from './gameMixin.js';

  const P = 'img/princess/';
  const STAMPS = [
    { id: 'stamp-flower', src: P + 'flower_pink.webp' },
    { id: 'stamp-crown', src: P + 'crown_yellow.webp' },
    { id: 'stamp-pony', src: P + 'pony.webp' },
  ];

  export default {
    name: 'PaintGame',
    components: { Game, LangToggle },
    mixins: [gameMixin],
    data() {
      return { colors: COLORS, stamps: STAMPS, tool: 'pink', drawing: false, last: null, strokes: 0 };
    },
    created() {
      this.images = {};
      STAMPS.forEach((stamp) => {
        const image = new Image();
        image.src = stamp.src;
        this.images[stamp.id] = image;
      });
    },
    mounted() {
      this.fitCanvas();
      this.say(Lines.freePaint());
    },
    methods: {
      fitCanvas() {
        const canvas = this.$refs.canvas;
        const scale = Math.min(2, window.devicePixelRatio || 1);
        canvas.width = Math.max(1, Math.round(canvas.clientWidth * scale));
        canvas.height = Math.max(1, Math.round(canvas.clientHeight * scale));
        this.scale = scale;
        this.clear();
      },
      restart() {
        this.clearTimers();
        this.isGameOver = false;
        this.fitCanvas();
        this.say(Lines.freePaint());
      },
      clear() {
        const canvas = this.$refs.canvas;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        this.strokes = 0;
      },
      point(event) {
        const box = this.$refs.canvas.getBoundingClientRect();
        return { x: (event.clientX - box.left) * this.scale, y: (event.clientY - box.top) * this.scale };
      },
      start(event) {
        if (this.isGameOver) return;
        const p = this.point(event);
        const ctx = this.$refs.canvas.getContext('2d');
        this.strokes++;
        const image = this.images[this.tool];
        if (image) {
          if (!image.naturalWidth) return;
          const size = 90 * this.scale;
          const w = image.naturalWidth >= image.naturalHeight ? size : (size * image.naturalWidth) / image.naturalHeight;
          const h = image.naturalWidth >= image.naturalHeight ? (size * image.naturalHeight) / image.naturalWidth : size;
          ctx.drawImage(image, p.x - w / 2, p.y - h / 2, w, h);
          return;
        }
        this.drawing = true;
        this.last = p;
        ctx.fillStyle = this.colors.find((c) => c.id === this.tool).hex;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6 * this.scale, 0, Math.PI * 2);
        ctx.fill();
      },
      move(event) {
        if (!this.drawing) return;
        const p = this.point(event);
        const ctx = this.$refs.canvas.getContext('2d');
        ctx.strokeStyle = this.colors.find((c) => c.id === this.tool).hex;
        ctx.lineWidth = 12 * this.scale;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(this.last.x, this.last.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        this.last = p;
      },
      stop() {
        this.drawing = false;
      },
      finish() {
        if (this.isGameOver || this.strokes === 0) return;
        this.finishStage('paint');
      },
    },
  };
</script>

<style scoped lang="scss">
  @use './princess.scss';

  .easel {
    padding: 6pt;
    background: #c9a27a;
    align-items: stretch;
  }

  canvas {
    width: 100%;
    height: 100%;
    display: block;
    border-radius: 8pt;
    background: #ffffff;
    touch-action: none;
    cursor: crosshair;
  }

  .choice.brush {
    width: 46pt;
    height: 46pt;
    border-radius: 50%;
    font-size: 1.2rem;
  }

  .choice.brush.selected {
    outline: 4pt solid #4a2a57;
    transform: scale(1.12);
  }
</style>
