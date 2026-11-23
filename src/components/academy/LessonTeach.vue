<template>
  <!-- Bài giảng trước phần chơi: ba/mẹ đứng cạnh bảng, đọc từng mục, bé bấm Tiếp (23/11/2026) -->
  <div class="teach" data-test="teach">
    <!-- ba và mẹ thay phiên: người đang dạy sáng và cử động, người kia đứng chờ -->
    <div
      v-for="(p, k) in teachers.slice(0, 2)"
      :key="p.img"
      class="teacher"
      :class="['side-' + k, { active: k === speaker, talking: talking && k === speaker }]"
    >
      <img :src="p.img" :alt="t(p.name)" class="no-drag" />
      <span class="name pixel">{{ t(p.name) }}</span>
    </div>

    <section class="board">
      <div class="count pixel">{{ index + 1 }} / {{ slides.length }}</div>
      <div :key="index" class="content">
        <div v-if="s.big" class="big" data-test="teach-big">{{ s.big }}</div>
        <div v-if="s.ipa" class="ipa">{{ s.ipa }}</div>
        <div v-if="s.words.length" class="words">
          <div v-for="w in s.words" :key="w.word" class="word-card" @click="sayWord(w)">
            <span v-if="w.pic" class="pic">{{ w.pic }}</span>
            <span class="en">{{ w.word }}</span>
            <span v-if="w.vi && lang === 'vi'" class="vi">{{ w.vi }}</span>
          </div>
        </div>
        <div v-if="s.sentence" class="sentence">
          <span v-if="s.pic" class="pic">{{ s.pic }}</span>
          <span>{{ s.sentence }}</span>
        </div>
        <p v-if="s.note" class="note">
          <span v-if="s.pic && !s.sentence">{{ s.pic }} </span>{{ t(s.note) }}
        </p>
      </div>
    </section>

    <footer class="nav">
      <button type="button" class="mc-btn" :disabled="index === 0" data-test="teach-prev" @click="go(-1)">
        <em class="fas fa-arrow-left" />
      </button>
      <button type="button" class="mc-btn listen" data-test="teach-say" @click="say">
        <em class="fas fa-volume-up" /> {{ t({ vi: 'Nghe lại', en: 'Listen again', el: 'Άκου ξανά' }) }}
      </button>
      <button v-if="index < slides.length - 1" type="button" class="mc-btn next" data-test="teach-next" @click="go(1)">
        {{ t({ vi: 'Tiếp', en: 'Next', el: 'Επόμενο' }) }} <em class="fas fa-arrow-right" />
      </button>
      <button v-else type="button" class="mc-btn next play" data-test="teach-done" @click="done">
        {{ t({ vi: 'Vào chơi', en: 'Play', el: 'Παίξε' }) }} ▶
      </button>
    </footer>
    <button type="button" class="skip" data-test="teach-skip" @click="done">
      {{ t({ vi: 'Bỏ qua bài giảng', en: 'Skip the lesson', el: 'Παράλειψη' }) }}
    </button>
  </div>
</template>

<script>
  import { AcademySpeech, en } from './academySpeech.js';
  import { pickText } from './curriculum/en.js';

  export default {
    name: 'LessonTeach',
    props: {
      slides: { type: Array, required: true },
      teachers: { type: Array, required: true },
      lang: { type: String, default: 'vi' },
    },
    emits: ['done'],
    data() {
      return { index: 0, talking: false, token: 0 };
    },
    computed: {
      s() {
        return this.slides[this.index];
      },
      // trang 1 ba dạy, trang 2 mẹ dạy, cứ thế luân phiên
      speaker() {
        return this.teachers.length > 1 ? this.index % 2 : 0;
      },
    },
    mounted() {
      this.say();
    },
    unmounted() {
      AcademySpeech.stop();
    },
    methods: {
      t(text) {
        return pickText(text, this.lang);
      },
      // in English or Greek mode the Vietnamese meanings are not read aloud
      parts() {
        return this.s.say.filter((p) => p.lang !== 'vi' || this.lang === 'vi');
      },
      async say() {
        const token = ++this.token;
        this.talking = true;
        await AcademySpeech.say(this.parts());
        if (token === this.token) this.talking = false;
      },
      sayWord(w) {
        AcademySpeech.say([en(w.word, true)]);
      },
      go(step) {
        this.index = Math.max(0, Math.min(this.slides.length - 1, this.index + step));
        this.say();
      },
      done() {
        this.token++;
        AcademySpeech.stop();
        this.$emit('done');
      },
    },
  };
</script>

<style scoped lang="scss">
  .teach {
    position: relative;
    display: grid;
    grid-template-columns: minmax(90px, 17%) 1fr minmax(90px, 17%);
    grid-template-rows: 1fr auto;
    grid-template-areas: 'left board right' 'left nav right';
    gap: 10pt 12pt;
    height: calc(100vh - 64px);
    height: calc(100dvh - 64px);
    min-height: 0;
    padding: 10pt;
    box-sizing: border-box;
  }
  .board {
    grid-area: board;
  }
  .nav {
    grid-area: nav;
  }
  .teacher {
    grid-row: 1 / span 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    min-height: 0;
    opacity: 0.55;
    filter: saturate(0.6);
    transition: opacity 0.3s, filter 0.3s, transform 0.3s;
    &.side-0 {
      grid-area: left;
    }
    &.side-1 {
      grid-area: right;
    }
    &.active {
      opacity: 1;
      filter: none;
      transform: scale(1.06);
    }
    img {
      max-width: 100%;
      max-height: calc(100dvh - 140px);
      object-fit: contain;
      transform-origin: bottom center;
      filter: drop-shadow(0 8px 10px rgba(0, 0, 0, 0.25));
    }
    &.talking img {
      animation: talk 0.9s ease-in-out infinite;
    }
    .name {
      margin-top: 4pt;
      padding: 2pt 12pt;
      border-radius: 10pt;
      background: rgba(255, 255, 255, 0.9);
      color: #333;
      font-size: 13pt;
    }
  }
  @keyframes talk {
    0%,
    100% {
      transform: rotate(0deg) translateY(0);
    }
    50% {
      transform: rotate(-1.5deg) translateY(-4px);
    }
  }
  .board {
    position: relative;
    display: grid;
    place-items: center;
    min-height: 0;
    border: 8pt solid #8b5a2b;
    border-radius: 14pt;
    background: #2f5d3a;
    color: #fffdf5;
    box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.35), 0 6px 14px rgba(0, 0, 0, 0.25);
    overflow: hidden;
  }
  .count {
    position: absolute;
    top: 8pt;
    right: 12pt;
    font-size: 12pt;
    opacity: 0.8;
  }
  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8pt;
    padding: 14pt;
    text-align: center;
    animation: chalk 0.45s ease-out;
  }
  @keyframes chalk {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
  }
  .big {
    font-family: 'Baloo 2', 'Nunito', system-ui, sans-serif;
    font-size: clamp(56pt, 14vh, 120pt);
    font-weight: 800;
    line-height: 1;
    letter-spacing: 0.08em;
  }
  .ipa {
    font-size: clamp(20pt, 5vh, 34pt);
    color: #fde68a;
  }
  .words {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 12pt;
  }
  .word-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 120px;
    padding: 8pt 16pt;
    border-radius: 12pt;
    background: rgba(255, 255, 255, 0.12);
    cursor: pointer;
    .pic {
      font-size: clamp(44pt, 11vh, 84pt);
      line-height: 1.1;
    }
    .en {
      font-size: clamp(22pt, 5vh, 36pt);
      font-weight: 700;
    }
    .vi {
      font-size: clamp(13pt, 2.6vh, 18pt);
      color: #bbf7d0;
    }
  }
  .sentence {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6pt;
    font-size: clamp(22pt, 5vh, 38pt);
    font-weight: 700;
    .pic {
      font-size: clamp(50pt, 12vh, 90pt);
    }
  }
  .note {
    max-width: 30em;
    font-size: clamp(13pt, 2.6vh, 18pt);
    color: #fde68a;
  }
  .nav {
    display: flex;
    justify-content: center;
    gap: 10pt;
    .mc-btn {
      font-size: 15pt;
      padding: 8pt 16pt;
    }
    .next {
      min-width: 140px;
    }
    .play {
      background: #16a34a;
      color: #fff;
    }
  }
  .skip {
    position: absolute;
    top: 14pt;
    left: calc(17% + 26pt);
    border: 0;
    background: rgba(0, 0, 0, 0.35);
    color: #fff;
    border-radius: 8pt;
    padding: 3pt 10pt;
    font-size: 10pt;
    cursor: pointer;
  }
  @media (max-aspect-ratio: 1/1) {
    .teach {
      grid-template-columns: 1fr 1fr;
      grid-template-rows: auto 1fr auto;
      grid-template-areas: 'left right' 'board board' 'nav nav';
    }
    .teacher {
      grid-row: auto;
      img {
        max-height: 20vh;
      }
    }
    .skip {
      left: 14pt;
    }
  }
</style>
