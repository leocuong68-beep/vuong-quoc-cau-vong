<template>
  <div class="academy lesson" :style="{ '--accent': subject.color }">
    <header class="bar">
      <button type="button" class="icon-btn" data-test="back" @click="leave">
        <em class="fas fa-arrow-left" />
      </button>
      <div class="titles">
        <span class="subject">{{ t(subject.title) }}</span>
        <span class="lesson-title">{{ t(lesson.title) }}</span>
      </div>
      <div class="progress" :title="index + ' / ' + questions.length">
        <span :style="{ width: (100 * answered) / questions.length + '%' }" />
      </div>
      <span class="score">✓ {{ right }}</span>
    </header>

    <main v-if="!finished && q" class="stage">
      <div class="show">
        <LessonVisual :show="shownVisual" @replay="speakQuestion" />
      </div>
      <button type="button" class="ask" data-test="ask" @click="speakQuestion">
        <em class="fas fa-volume-up" />
        <span>{{ t(q.ask) }}</span>
      </button>
      <div class="choices" :class="'style-' + q.choiceStyle" :data-n="q.choices.length">
        <button
          v-for="(c, i) in q.choices"
          :key="index + '-' + i"
          type="button"
          class="choice"
          :class="choiceClass(c, i)"
          :disabled="picked !== null"
          :data-correct="c.correct ? '1' : '0'"
          @click="answer(c, i)"
        >
          {{ label(c) }}
        </button>
      </div>
      <div class="feedback">
        <template v-if="picked !== null && !wasRight">
          <span class="explain">{{ explainText }}</span>
          <button type="button" class="next" data-test="next" @click="next">
            {{ t({ vi: 'Tiếp', el: 'Επόμενο' }) }} <em class="fas fa-arrow-right" />
          </button>
        </template>
        <template v-else-if="picked !== null && q.explainAlways">
          <span class="explain good">{{ explainText }}</span>
          <button type="button" class="next" data-test="next" @click="next">
            {{ t({ vi: 'Tiếp', el: 'Επόμενο' }) }} <em class="fas fa-arrow-right" />
          </button>
        </template>
      </div>
    </main>

    <main v-else-if="finished" class="result" data-test="result">
      <div class="medal">
        <span v-for="s in 3" :key="s" class="star" :class="{ on: s <= outcome.stars }">★</span>
      </div>
      <h2>{{ right }} / {{ questions.length }}</h2>
      <p class="verdict">{{ verdict }}</p>
      <p v-if="outcome.earned || outcome.bonus" class="won">
        +{{ outcome.earned + outcome.bonus }} ⭐
        <span v-if="outcome.bonus"
          >({{ t({ vi: 'thưởng nhiệm vụ ngày', el: 'μπόνους ημέρας' }) }} +{{
            outcome.bonus
          }})</span
        >
      </p>
      <p v-if="outcome.bonus" class="minecraft">
        ⛏️
        {{
          t({
            vi: 'Xong cả 4 môn! Minecraft đã mở cho hôm nay.',
            el: 'Τέλεια! Το Minecraft άνοιξε για σήμερα.',
          })
        }}
      </p>
      <div class="actions">
        <button type="button" class="secondary" data-test="again" @click="restart">
          {{ t({ vi: 'Làm lại', el: 'Ξανά' }) }}
        </button>
        <button
          v-if="outcome.passed && nextLesson"
          type="button"
          class="primary"
          data-test="next-lesson"
          @click="goNext"
        >
          {{ t({ vi: 'Bài tiếp', el: 'Επόμενο μάθημα' }) }} <em class="fas fa-arrow-right" />
        </button>
        <button type="button" class="secondary" @click="$router.push('/tintin')">
          {{ t({ vi: 'Trang chính', el: 'Αρχική' }) }}
        </button>
      </div>
    </main>
  </div>
</template>

<script>
  import './academy.scss';
  import LessonVisual from './LessonVisual.vue';
  import { subjectById } from './curriculum/index.js';
  import { Academy } from './academyState.js';
  import { AcademySpeech } from './academySpeech.js';

  const playSound = (name) => {
    try {
      const a = new Audio('sounds/' + name + '.mp3');
      a.volume = 0.5;
      a.play().catch(() => {});
    } catch (e) {
      // no sound
    }
  };

  export default {
    name: 'LessonGame',
    components: { LessonVisual },
    data() {
      return {
        questions: [],
        index: 0,
        right: 0,
        picked: null,
        wasRight: false,
        finished: false,
        outcome: null,
        timer: null,
      };
    },
    computed: {
      lang() {
        return Academy.voiceLang;
      },
      subject() {
        return subjectById(this.$route.params.subject);
      },
      lessonIndex() {
        return this.subject.lessons.findIndex((l) => l.id === this.$route.params.lesson);
      },
      lesson() {
        return this.subject.lessons[this.lessonIndex];
      },
      nextLesson() {
        return this.subject.lessons[this.lessonIndex + 1] || null;
      },
      q() {
        return this.questions[this.index];
      },
      answered() {
        if (this.finished) return this.questions.length;
        return this.index + (this.picked !== null ? 1 : 0);
      },
      shownVisual() {
        return this.picked !== null && this.q.reveal ? this.q.reveal : this.q.show;
      },
      explainText() {
        const right = this.q.choices.find((c) => c.correct);
        return this.q.explain ? this.t(this.q.explain) : '→ ' + this.label(right);
      },
      verdict() {
        if (!this.outcome.passed)
          return this.t({
            vi: 'Cần đúng 8 câu để qua bài. Thử lại nhé!',
            el: 'Χρειάζεσαι 8 σωστές. Ξαναπροσπάθησε!',
          });
        if (this.outcome.stars === 3)
          return this.t({ vi: 'Tuyệt đối! Không sai câu nào.', el: 'Τέλεια! Κανένα λάθος.' });
        return this.t({
          vi: 'Qua bài! Bài tiếp theo đã mở.',
          el: 'Πέρασες! Το επόμενο μάθημα άνοιξε.',
        });
      },
    },
    watch: {
      '$route.params.lesson'() {
        if (this.$route.params.lesson) this.start();
      },
    },
    mounted() {
      if (!this.subject || !this.lesson || !Academy.isOpen(this.subject, this.lessonIndex)) {
        this.$router.replace('/tintin');
        return;
      }
      this.start();
    },
    unmounted() {
      clearTimeout(this.timer);
      AcademySpeech.stop();
    },
    methods: {
      t(text) {
        if (!text) return '';
        return typeof text === 'string' ? text : text[this.lang] || text.vi;
      },
      label(c) {
        return this.t(c.label);
      },
      start() {
        this.questions = this.lesson.make();
        this.index = 0;
        this.right = 0;
        this.picked = null;
        this.finished = false;
        this.outcome = null;
        this.$nextTick(() => this.speakQuestion());
      },
      restart() {
        this.start();
      },
      speakQuestion() {
        if (!this.q) return;
        AcademySpeech.say([
          { text: this.t(this.q.ask), lang: this.lang },
          ...(this.q.target || []),
        ]);
      },
      choiceClass(c, i) {
        if (this.picked === null) return '';
        if (c.correct) return 'right';
        if (i === this.picked) return 'wrong';
        return 'dim';
      },
      answer(c, i) {
        if (this.picked !== null) return;
        this.picked = i;
        this.wasRight = !!c.correct;
        if (c.correct) {
          this.right++;
          playSound('success' + (1 + Math.floor(Math.random() * 5)));
          const parts = [];
          if (c.say) parts.push(...c.say);
          if (this.q.explainAlways && this.q.explain)
            parts.push({ text: this.t(this.q.explain), lang: this.lang });
          if (parts.length) AcademySpeech.say(parts);
          else AcademySpeech.stop();
          if (!this.q.explainAlways) this.timer = setTimeout(() => this.next(), c.say ? 1500 : 900);
        } else {
          playSound('error1');
          const parts = [];
          if (this.q.explain) parts.push({ text: this.t(this.q.explain), lang: this.lang });
          if (this.q.explainSay) parts.push(...this.q.explainSay);
          AcademySpeech.say(parts);
        }
      },
      next() {
        clearTimeout(this.timer);
        if (this.index + 1 >= this.questions.length) {
          this.finish();
          return;
        }
        this.index++;
        this.picked = null;
        this.$nextTick(() => this.speakQuestion());
      },
      finish() {
        this.picked = null;
        this.finished = true;
        this.outcome = Academy.finish(
          this.subject.id,
          this.lesson.id,
          this.right,
          this.questions.length
        );
        playSound(this.outcome.passed ? 'success3' : 'error2');
        AcademySpeech.say([{ text: this.verdict, lang: this.lang }]);
      },
      goNext() {
        this.$router.replace('/tintin/' + this.subject.id + '/' + this.nextLesson.id);
      },
      leave() {
        this.$router.push('/tintin/' + this.subject.id);
      },
    },
  };
</script>

<style scoped lang="scss">
  .lesson {
    display: flex;
    flex-direction: column;
  }
  .bar {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.8rem 0;
  }
  .titles {
    display: flex;
    flex-direction: column;
    min-width: 0;
    .subject {
      color: var(--accent);
      font-weight: 800;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .lesson-title {
      font-weight: 700;
      font-size: 1.1rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  .progress {
    flex: 1;
    height: 0.7rem;
    background: #1e293b;
    border-radius: 1rem;
    overflow: hidden;
    span {
      display: block;
      height: 100%;
      background: var(--accent);
      transition: width 0.3s;
    }
  }
  .score {
    font-weight: 800;
    color: #4ade80;
    min-width: 3rem;
    text-align: right;
  }
  .stage {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    min-height: 0;
  }
  .show {
    flex: 1;
    min-height: 9rem;
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 1.4rem;
    padding: 1rem;
    display: flex;
  }
  .ask {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    background: transparent;
    border: none;
    color: var(--text);
    font-size: 1.35rem;
    font-weight: 700;
    text-align: left;
    cursor: pointer;
    padding: 0.2rem 0;
    em {
      color: var(--accent);
    }
  }
  .choices {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.8rem;
    &[data-n='2'] {
      grid-template-columns: repeat(2, 1fr);
    }
    &.style-big {
      grid-template-columns: repeat(4, 1fr);
      .choice {
        font-size: 3rem;
        padding: 0.8rem;
      }
    }
    &.style-emoji {
      grid-template-columns: repeat(4, 1fr);
      .choice {
        font-size: 3.2rem;
      }
    }
    &.style-code .choice {
      font-size: 1.7rem;
      letter-spacing: 0.08em;
    }
  }
  .choice {
    background: var(--card);
    color: var(--text);
    border: 2px solid var(--line);
    border-radius: 1rem;
    padding: 1rem;
    font-size: 1.4rem;
    font-weight: 700;
    cursor: pointer;
    transition:
      transform 0.1s,
      border-color 0.2s;
    &:hover:not(:disabled) {
      border-color: var(--accent);
    }
    &:active:not(:disabled) {
      transform: scale(0.97);
    }
    &.right {
      border-color: #22c55e;
      background: #14532d;
    }
    &.wrong {
      border-color: #ef4444;
      background: #450a0a;
      animation: shake 0.3s;
    }
    &.dim {
      opacity: 0.4;
    }
  }
  @keyframes shake {
    25% {
      transform: translateX(-6px);
    }
    75% {
      transform: translateX(6px);
    }
  }
  .feedback {
    min-height: 3.2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }
  .explain {
    color: #fca5a5;
    font-weight: 700;
    font-size: 1.15rem;
    &.good {
      color: #86efac;
    }
  }
  .next {
    background: var(--accent);
    color: #0b1220;
    border: none;
    border-radius: 0.8rem;
    padding: 0.7rem 1.4rem;
    font-weight: 800;
    font-size: 1.1rem;
    cursor: pointer;
  }
  .result {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    text-align: center;
    h2 {
      font-size: 3rem;
      margin: 0;
    }
  }
  .medal .star {
    font-size: 4rem;
    color: #334155;
    margin: 0 0.3rem;
    &.on {
      color: #fbbf24;
      text-shadow: 0 0 18px rgba(251, 191, 36, 0.5);
    }
  }
  .verdict {
    font-size: 1.3rem;
    font-weight: 700;
  }
  .won {
    font-size: 1.4rem;
    font-weight: 800;
    color: #fbbf24;
    span {
      font-size: 1rem;
      color: var(--muted);
    }
  }
  .minecraft {
    background: #14532d;
    border: 1px solid #22c55e;
    padding: 0.8rem 1.2rem;
    border-radius: 1rem;
    font-weight: 700;
  }
  .actions {
    display: flex;
    gap: 0.8rem;
    margin-top: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }
</style>
