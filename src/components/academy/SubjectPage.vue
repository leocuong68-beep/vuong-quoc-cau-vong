<template>
  <div class="academy subject-page" :style="{ '--accent': subject.color }">
    <header class="bar">
      <button type="button" class="icon-btn" data-test="back" @click="$router.push('/tintin')">
        <em class="fas fa-arrow-left" />
      </button>
      <span class="badge">{{ subject.short }}</span>
      <h1>{{ t(subject.title) }}</h1>
    </header>

    <section v-for="(unit, u) in subject.units" :key="u" class="unit">
      <h2>
        <span class="unit-no">{{ u + 1 }}</span>
        {{ t(unit.title) }}
      </h2>
      <div class="lessons">
        <button
          v-for="lesson in unit.lessons"
          :key="lesson.id"
          type="button"
          class="lesson"
          :class="state(lesson)"
          :disabled="state(lesson) === 'locked'"
          :data-lesson="lesson.id"
          @click="open(lesson)"
        >
          <span class="no">
            <em v-if="state(lesson) === 'locked'" class="fas fa-lock" />
            <em v-else-if="state(lesson) === 'passed'" class="fas fa-check" />
            <template v-else>{{ position(lesson) + 1 }}</template>
          </span>
          <span class="title">{{ t(lesson.title) }}</span>
          <span class="stars">
            <span v-for="s in 3" :key="s" :class="{ on: s <= stars(lesson) }">★</span>
          </span>
        </button>
      </div>
    </section>
  </div>
</template>

<script>
  import './academy.scss';
  import { subjectById } from './curriculum/index.js';
  import { Academy } from './academyState.js';

  export default {
    name: 'SubjectPage',
    computed: {
      subject() {
        return subjectById(this.$route.params.subject);
      },
      lang: () => Academy.voiceLang,
    },
    created() {
      if (!this.subject) this.$router.replace('/tintin');
    },
    methods: {
      t(text) {
        return typeof text === 'string' ? text : text[this.lang] || text.vi;
      },
      position(lesson) {
        return this.subject.lessons.findIndex((l) => l.id === lesson.id);
      },
      stars(lesson) {
        return Academy.starsOf(lesson.id);
      },
      state(lesson) {
        if (Academy.isPassed(lesson.id)) return 'passed';
        return Academy.isOpen(this.subject, this.position(lesson)) ? 'open' : 'locked';
      },
      open(lesson) {
        this.$router.push('/tintin/' + this.subject.id + '/' + lesson.id);
      },
    },
  };
</script>

<style scoped lang="scss">
  .bar {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 0 0.4rem;
    h1 {
      margin: 0;
      font-size: 1.9rem;
    }
  }
  .badge {
    width: 3rem;
    height: 3rem;
    border-radius: 0.9rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    font-size: 1.3rem;
    color: #0b1220;
    background: var(--accent);
  }
  .unit h2 {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 1.15rem;
    color: var(--muted);
    margin: 1.2rem 0 0.6rem;
  }
  .unit-no {
    width: 1.8rem;
    height: 1.8rem;
    border-radius: 50%;
    border: 2px solid var(--accent);
    color: var(--accent);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
  }
  .lessons {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
    gap: 0.7rem;
  }
  .lesson {
    display: flex;
    align-items: center;
    gap: 0.9rem;
    text-align: left;
    background: var(--card);
    color: var(--text);
    border: 1px solid var(--line);
    border-radius: 1rem;
    padding: 0.8rem 1rem;
    cursor: pointer;
    font-size: 1.05rem;
    font-weight: 700;
    &.open {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 20%, transparent);
    }
    &.locked {
      opacity: 0.45;
      cursor: not-allowed;
    }
  }
  .no {
    width: 2.2rem;
    height: 2.2rem;
    flex: none;
    border-radius: 0.7rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #1e293b;
    font-weight: 900;
    .passed & {
      background: var(--accent);
      color: #0b1220;
    }
  }
  .title {
    flex: 1;
  }
  .stars span {
    color: #334155;
    &.on {
      color: #fbbf24;
    }
  }
</style>
