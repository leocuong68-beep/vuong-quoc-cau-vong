<template>
  <div
    class="academy subject-page"
    :class="'theme-' + profile.theme"
    :style="{ '--accent': subject.color }"
  >
    <header class="bar">
      <button type="button" class="icon-btn" data-test="back" @click="$router.push(profile.base)">
        <em class="fas fa-arrow-left" />
      </button>
      <img :src="subject.icon" alt="" class="block no-drag" />
      <div>
        <h1 class="pixel">{{ t(subject.title) }}</h1>
        <span class="xp wide"
          ><span :style="{ width: (100 * passedCount) / subject.lessons.length + '%' }"
        /></span>
      </div>
      <span class="pixel total">{{ passedCount }} / {{ subject.lessons.length }}</span>
    </header>

    <section v-for="(unit, u) in subject.units" :key="u" class="unit">
      <h2 class="sign pixel">
        <span class="unit-no">{{ u + 1 }}</span>
        {{ t(unit.title) }}
      </h2>
      <div class="lessons">
        <button
          v-for="lesson in unit.lessons"
          :key="lesson.id"
          type="button"
          class="tile"
          :class="state(lesson)"
          :disabled="state(lesson) === 'locked'"
          :data-lesson="lesson.id"
          @click="open(lesson)"
        >
          <span class="cube pixel">
            <em v-if="state(lesson) === 'locked'" class="fas fa-lock" />
            <template v-else>{{ position(lesson) + 1 }}</template>
          </span>
          <span class="title">{{ t(lesson.title) }}</span>
          <span class="stars">
            <span v-for="s in 3" :key="s" :class="{ on: s <= stars(lesson) }">★</span>
          </span>
          <span v-if="state(lesson) === 'open'" class="here pixel">{{
            t({ vi: 'HỌC NGAY', el: 'ΠΑΜΕ' })
          }}</span>
          <span v-if="state(lesson) === 'pending'" class="here pixel wait">{{
            t({ vi: '✏️ CHỜ DUYỆT', en: '✏️ TO CHECK', el: '✏️ ΕΛΕΓΧΟΣ' })
          }}</span>
        </button>
      </div>
    </section>
  </div>
</template>

<script>
  import './academy.scss';
  import { profileOf } from './profiles.js';
  import { pickText } from './curriculum/en.js';
  import { sfx } from './sfx.js';

  export default {
    name: 'SubjectPage',
    computed: {
      profile() {
        return profileOf(this.$route);
      },
      acad() {
        return this.profile.state;
      },
      subject() {
        return this.profile.subjects.find((s) => s.id === this.$route.params.subject);
      },
      lang() {
        return this.acad.voiceLang;
      },
      passedCount() {
        return this.subject.lessons.filter((l) => this.acad.isPassed(l.id)).length;
      },
    },
    created() {
      if (!this.subject) this.$router.replace(this.profile.base);
    },
    methods: {
      t(text) {
        return pickText(text, this.lang);
      },
      position(lesson) {
        return this.subject.lessons.findIndex((l) => l.id === lesson.id);
      },
      stars(lesson) {
        return this.acad.starsOf(lesson.id);
      },
      state(lesson) {
        if (this.acad.isPassed(lesson.id)) return 'passed';
        if (this.acad.isPending(lesson.id)) return 'pending';
        return this.acad.isOpen(this.subject, this.position(lesson)) ? 'open' : 'locked';
      },
      open(lesson) {
        sfx.click();
        this.$router.push(this.profile.base + '/' + this.subject.id + '/' + lesson.id);
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
      font-size: 3rem;
      line-height: 1;
      color: #fff;
      text-shadow: 4px 4px 0 #0d0c10;
    }
    > div {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      max-width: 30rem;
    }
  }
  .block {
    width: 5rem;
    filter: drop-shadow(0 6px 0 rgba(0, 0, 0, 0.35));
    animation: bob 2.6s ease-in-out infinite;
  }
  @keyframes bob {
    50% {
      transform: translateY(-6px);
    }
  }
  .total {
    margin-left: auto;
    font-size: 2rem;
    font-weight: 800;
    color: var(--gold);
    text-shadow: 3px 3px 0 #0d0c10;
  }
  .sign {
    display: inline-flex;
    align-items: center;
    gap: 0.7rem;
    font-size: 1.8rem;
    margin: 1.3rem 0 0.7rem;
    padding: 0.2rem 1rem 0.2rem 0.4rem;
    background: #a0763f;
    color: #fff3d6;
    border: 4px solid #3b2a14;
    box-shadow:
      inset 3px 3px 0 rgba(255, 255, 255, 0.25),
      inset -3px -3px 0 rgba(0, 0, 0, 0.3),
      0 5px 0 rgba(0, 0, 0, 0.4);
    text-shadow: 2px 2px 0 #3b2a14;
  }
  .unit-no {
    width: 2.2rem;
    height: 2.2rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--accent);
    border: 3px solid #3b2a14;
    color: #fff;
  }
  .lessons {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(12.5rem, 1fr));
    gap: 0.9rem;
  }
  .tile {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.45rem;
    text-align: center;
    padding: 0.9rem 0.7rem 0.8rem;
    color: var(--text);
    cursor: pointer;
    background: var(--panel);
    border: 4px solid var(--line);
    box-shadow:
      inset 4px 4px 0 rgba(255, 255, 255, 0.1),
      inset -4px -4px 0 rgba(0, 0, 0, 0.35),
      0 6px 0 rgba(0, 0, 0, 0.35);
    transition: transform 0.12s;
    &:hover:not(:disabled) {
      transform: translateY(-3px);
    }
    &.open {
      outline: 4px solid #fff;
      animation: beckon 1.6s ease-in-out infinite;
    }
    &.locked {
      cursor: not-allowed;
      filter: grayscale(0.9) brightness(0.6);
    }
  }
  @keyframes beckon {
    50% {
      transform: translateY(-5px);
    }
  }
  .cube {
    width: 3.6rem;
    height: 3.6rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: 800;
    color: #fff;
    text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.5);
    background: var(--accent);
    border: 4px solid var(--line);
    box-shadow:
      inset 4px 4px 0 rgba(255, 255, 255, 0.35),
      inset -4px -4px 0 rgba(0, 0, 0, 0.3);
    .passed & {
      background: #5fbf3a;
    }
  }
  .title {
    font-weight: 700;
    font-size: 1rem;
    line-height: 1.2;
    min-height: 2.4em;
  }
  .stars span {
    font-size: 1.3rem;
    color: #3f3f46;
    &.on {
      color: var(--gold);
      text-shadow: 2px 2px 0 #7a5400;
    }
  }
  .here {
    position: absolute;
    top: -14px;
    right: -8px;
    background: var(--gold);
    color: #3b2a14;
    font-weight: 800;
    font-size: 1.1rem;
    padding: 0 0.5rem;
    border: 3px solid var(--line);
  }
  .wide {
    width: 100%;
  }
  .here.wait {
    background: #f59e0b;
    color: #fff;
  }
</style>
