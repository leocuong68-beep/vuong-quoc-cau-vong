<template>
  <div class="academy home">
    <header class="top">
      <button type="button" class="avatar" data-test="avatar" @click="secretTap">
        <img :src="player.avatar" alt="Tin Tin" class="no-drag" />
      </button>
      <div class="hello">
        <span class="kicker">{{ t({ vi: 'Học viện', el: 'Ακαδημία' }) }}</span>
        <h1>{{ player.name }}</h1>
      </div>
      <div class="spacer" />
      <div
        class="wallet"
        data-test="wallet"
        :title="t({ vi: 'Sao để đổi đồ Minecraft', el: 'Αστέρια' })"
      >
        ⭐ <b>{{ wallet }}</b>
      </div>
      <button type="button" class="lang" data-test="voice" @click="toggleVoice">
        {{ lang === 'vi' ? '🇻🇳 Tiếng Việt' : '🇬🇷 Ελληνικά' }}
      </button>
    </header>

    <section class="mission" :class="{ open: minecraftOpen }">
      <div class="mission-text">
        <h2>{{ t({ vi: 'Nhiệm vụ hôm nay', el: 'Η αποστολή σήμερα' }) }}</h2>
        <p v-if="!minecraftOpen">
          {{
            t({
              vi: 'Qua mỗi môn 1 bài để mở Minecraft.',
              el: 'Πέρασε ένα μάθημα σε κάθε μάθημα για να ανοίξει το Minecraft.',
            })
          }}
        </p>
        <p v-else>
          {{
            t({
              vi: 'Hoàn thành! Minecraft đã mở cho hôm nay.',
              el: 'Ολοκληρώθηκε! Το Minecraft είναι ανοιχτό σήμερα.',
            })
          }}
        </p>
      </div>
      <div class="checks">
        <span
          v-for="s in subjects"
          :key="s.id"
          class="check"
          :class="{ done: doneToday(s.id) }"
          :style="{ '--c': s.color }"
        >
          <em :class="doneToday(s.id) ? 'fas fa-check' : 'far fa-circle'" />
          {{ t(s.title) }}
        </span>
      </div>
      <div class="lock" data-test="minecraft">
        <span class="pick">⛏️</span>
        <span>{{
          minecraftOpen
            ? t({ vi: 'Đã mở', el: 'Ανοιχτό' })
            : t({ vi: 'Đang khóa', el: 'Κλειδωμένο' })
        }}</span>
        <em :class="minecraftOpen ? 'fas fa-lock-open' : 'fas fa-lock'" />
      </div>
    </section>

    <section class="subjects">
      <button
        v-for="s in subjects"
        :key="s.id"
        type="button"
        class="subject"
        :style="{ '--c': s.color }"
        :data-subject="s.id"
        @click="$router.push('/tintin/' + s.id)"
      >
        <span class="badge">{{ s.short }}</span>
        <span class="name">{{ t(s.title) }}</span>
        <span class="count"
          >{{ passed(s) }} / {{ s.lessons.length }} {{ t({ vi: 'bài', el: 'μαθήματα' }) }}</span
        >
        <span class="meter"
          ><span :style="{ width: (100 * passed(s)) / s.lessons.length + '%' }"
        /></span>
        <span class="next">
          <em class="fas fa-play" />
          {{ t(s.lessons[nextIndex(s)].title) }}
        </span>
      </button>
    </section>

    <footer class="foot">
      <button type="button" class="link" @click="$router.push('/')">
        ← {{ t({ vi: 'Vương Quốc Cầu Vồng của Mia', el: 'Το παιχνίδι της Μία' }) }}
      </button>
    </footer>
  </div>
</template>

<script>
  import './academy.scss';
  import { SUBJECTS } from './curriculum/index.js';
  import { Academy, PLAYER } from './academyState.js';

  export default {
    name: 'AcademyHome',
    data() {
      return { taps: 0, tapTimer: null };
    },
    computed: {
      player: () => PLAYER,
      subjects: () => SUBJECTS,
      lang: () => Academy.voiceLang,
      wallet: () => Academy.wallet - Academy.spent,
      minecraftOpen: () => Academy.minecraftOpen,
    },
    methods: {
      t(text) {
        return typeof text === 'string' ? text : text[this.lang] || text.vi;
      },
      passed(s) {
        return s.lessons.filter((l) => Academy.isPassed(l.id)).length;
      },
      nextIndex(s) {
        return Academy.nextLessonIndex(s);
      },
      doneToday(id) {
        return Academy.doneToday(id);
      },
      toggleVoice() {
        Academy.toggleVoice();
      },
      // for a parent: tap the avatar 7 times to open every lesson
      secretTap() {
        this.taps++;
        clearTimeout(this.tapTimer);
        this.tapTimer = setTimeout(() => (this.taps = 0), 2500);
        if (this.taps >= 7) {
          Academy.openEverything();
          this.taps = 0;
        }
      },
    },
  };
</script>

<style scoped lang="scss">
  .home {
    display: flex;
    flex-direction: column;
    gap: 1.1rem;
  }
  .top {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding-top: 1rem;
  }
  .avatar {
    width: 4.6rem;
    height: 4.6rem;
    border-radius: 1.3rem;
    overflow: hidden;
    border: 2px solid #38bdf8;
    background: linear-gradient(160deg, #1e3a5f, #0f172a);
    padding: 0;
    cursor: pointer;
    flex: none;
    img {
      width: 100%;
      height: 160%;
      object-fit: cover;
      object-position: top;
    }
  }
  .kicker {
    color: #38bdf8;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-size: 0.8rem;
  }
  h1 {
    margin: 0;
    font-size: 2rem;
  }
  .spacer {
    flex: 1;
  }
  .wallet {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 1rem;
    padding: 0.6rem 1rem;
    font-size: 1.3rem;
    b {
      color: #fbbf24;
    }
  }
  .lang {
    background: var(--card);
    border: 1px solid var(--line);
    color: var(--text);
    border-radius: 1rem;
    padding: 0.7rem 1rem;
    font-weight: 700;
    cursor: pointer;
  }
  .mission {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.6rem 1rem;
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 1.4rem;
    padding: 1.1rem 1.3rem;
    &.open {
      border-color: #22c55e;
      background: linear-gradient(135deg, #0f2f1f, var(--card));
    }
    h2 {
      margin: 0;
      font-size: 1.3rem;
    }
    p {
      margin: 0.2rem 0 0;
      color: var(--muted);
    }
  }
  .checks {
    grid-column: 1;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .check {
    border: 1px solid var(--line);
    border-radius: 2rem;
    padding: 0.35rem 0.8rem;
    font-weight: 700;
    font-size: 0.95rem;
    color: var(--muted);
    em {
      margin-right: 0.3rem;
    }
    &.done {
      color: #0b1220;
      background: var(--c);
      border-color: var(--c);
    }
  }
  .lock {
    grid-column: 2;
    grid-row: 1 / span 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.2rem;
    min-width: 7rem;
    border-radius: 1rem;
    background: #0b1220;
    border: 1px solid var(--line);
    padding: 0.6rem;
    font-weight: 800;
    .pick {
      font-size: 2.2rem;
    }
    .open & {
      border-color: #22c55e;
      color: #4ade80;
    }
  }
  .subjects {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  .subject {
    position: relative;
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-areas:
      'badge name'
      'badge count'
      'meter meter'
      'next next';
    gap: 0.3rem 1rem;
    text-align: left;
    background: var(--card);
    color: var(--text);
    border: 1px solid var(--line);
    border-radius: 1.4rem;
    padding: 1.1rem 1.2rem;
    cursor: pointer;
    overflow: hidden;
    transition:
      transform 0.15s,
      border-color 0.2s;
    &::before {
      content: '';
      position: absolute;
      inset: 0 auto 0 0;
      width: 5px;
      background: var(--c);
    }
    &:hover {
      border-color: var(--c);
      transform: translateY(-2px);
    }
  }
  .badge {
    grid-area: badge;
    width: 3.4rem;
    height: 3.4rem;
    border-radius: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 900;
    color: #0b1220;
    background: var(--c);
  }
  .name {
    grid-area: name;
    font-size: 1.35rem;
    font-weight: 800;
    align-self: end;
  }
  .count {
    grid-area: count;
    color: var(--muted);
    font-weight: 700;
  }
  .meter {
    grid-area: meter;
    height: 0.5rem;
    border-radius: 1rem;
    background: #1e293b;
    margin-top: 0.5rem;
    overflow: hidden;
    span {
      display: block;
      height: 100%;
      background: var(--c);
    }
  }
  .next {
    grid-area: next;
    margin-top: 0.4rem;
    font-weight: 700;
    color: var(--c);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    em {
      margin-right: 0.4rem;
    }
  }
  .foot {
    margin-top: auto;
    .link {
      background: none;
      border: none;
      color: var(--muted);
      cursor: pointer;
      font-weight: 700;
      padding: 0.6rem 0;
    }
  }
  @media (max-width: 700px) {
    .subjects {
      grid-template-columns: 1fr;
    }
    .mission {
      grid-template-columns: 1fr;
    }
    .lock {
      grid-column: 1;
      grid-row: auto;
      flex-direction: row;
    }
  }
</style>
