<template>
  <div class="academy home" :class="'theme-' + profile.theme">
    <aside class="hero">
      <div class="bubble slab pixel">{{ greeting }}</div>
      <button type="button" class="tintin" data-test="avatar" @click="secretTap">
        <img :src="profile.avatar" :alt="profile.name" class="no-drag" />
      </button>
      <div class="shadow" />
    </aside>

    <main class="board">
      <header class="top">
        <h1 class="pixel title">
          <span class="small">{{ t(profile.kicker) }}</span>
          {{ profile.name }}
        </h1>
        <div class="spacer" />
        <div
          class="wallet slab pixel"
          data-test="wallet"
          :title="t({ vi: 'Sao của ' + profile.name, el: 'Αστέρια', en: profile.name + '\'s stars' })"
        >
          <span class="star">★</span>
          <b>{{ wallet }}</b>
        </div>
        <button type="button" class="mc-btn lang" data-test="voice" @click="toggleVoice">
          {{ { vi: 'VI · Tiếng Việt', en: 'EN · English', el: 'EL · Ελληνικά' }[lang] }}
        </button>
      </header>

      <section class="mission slab" :class="{ open: minecraftOpen }">
        <div class="mission-head">
          <h2 class="pixel">{{ t({ vi: 'Nhiệm vụ hôm nay', el: 'Η αποστολή σήμερα' }) }}</h2>
          <p>{{ missionText }}</p>
        </div>
        <div class="hotbar">
          <div
            v-for="s in subjects"
            :key="s.id"
            class="slot"
            :class="{ done: doneToday(s.id) }"
            :title="t(s.title)"
            :data-slot="s.id"
          >
            <img :src="s.icon" alt="" class="no-drag" />
            <span v-if="doneToday(s.id)" class="tick">✔</span>
          </div>
          <span class="arrow pixel">➜</span>
          <div class="slot mine" :class="{ done: minecraftOpen }" data-test="minecraft">
            <span class="pick">{{ profile.minecraft ? '⛏️' : '👑' }}</span>
            <span class="lock">{{ minecraftOpen ? '🔓' : '🔒' }}</span>
          </div>
        </div>
        <button
          v-if="inApp && profile.minecraft"
          type="button"
          class="play-mc pixel"
          :class="{ ready: minecraftOpen }"
          :disabled="!minecraftOpen"
          data-test="play-minecraft"
          @click="playMinecraft"
        >
          {{
            minecraftOpen
              ? t({ vi: '⛏️ CHƠI MINECRAFT', el: '⛏️ ΠΑΙΞΕ MINECRAFT' })
              : t({ vi: '🔒 Minecraft đang khóa', el: '🔒 Κλειδωμένο' })
          }}
        </button>
      </section>

      <section class="subjects">
        <button
          v-for="(s, i) in subjects"
          :key="s.id"
          type="button"
          class="subject slab"
          :style="{ '--c': s.color, '--delay': i * 0.4 + 's' }"
          :data-subject="s.id"
          @click="go(profile.base + '/' + s.id)"
        >
          <img :src="s.icon" alt="" class="block no-drag" />
          <span class="info">
            <span class="name pixel">{{ t(s.title) }}</span>
            <span class="count"
              >{{ passed(s) }} / {{ s.lessons.length }} {{ t({ vi: 'bài', el: 'μαθήματα' }) }}</span
            >
            <span class="xp"
              ><span :style="{ width: (100 * passed(s)) / s.lessons.length + '%' }"
            /></span>
            <span class="next">▶ {{ t(s.lessons[nextIndex(s)].title) }}</span>
          </span>
        </button>
      </section>

      <footer class="foot">
        <button type="button" class="link" @click="$router.push(profile.back.path)">
          ← {{ t(profile.back.label) }}
        </button>
      </footer>
    </main>
  </div>
</template>

<script>
  import './academy.scss';
  import { profileOf } from './profiles.js';
  import { pickText } from './curriculum/en.js';
  import { AcademySpeech } from './academySpeech.js';
  import { sfx, voice } from './sfx.js';

  export default {
    name: 'AcademyHome',
    data() {
      return { taps: 0, tapTimer: null };
    },
    computed: {
      profile() {
        return profileOf(this.$route);
      },
      acad() {
        return this.profile.state;
      },
      subjects() {
        return this.profile.subjects;
      },
      lang() {
        return this.acad.voiceLang;
      },
      wallet() {
        return this.acad.wallet - this.acad.spent;
      },
      // daily mission done (Tin Tin: Minecraft opens; Mia: she gets the crown)
      minecraftOpen() {
        return this.acad.minecraftOpen;
      },
      // only inside the Mac app "Học viện Tin Tin", which can open the Minecraft launcher
      inApp: () => typeof window !== 'undefined' && !!window.hocVienApp,
      missionText() {
        if (this.profile.minecraft)
          return this.minecraftOpen
            ? this.t({
                vi: 'Hoàn thành! Minecraft đã mở cho hôm nay.',
                el: 'Ολοκληρώθηκε! Το Minecraft είναι ανοιχτό σήμερα.',
              })
            : this.t({
                vi: 'Qua mỗi môn 1 bài để mở khóa Minecraft.',
                el: 'Πέρασε ένα μάθημα σε κάθε μάθημα για το Minecraft.',
              });
        return this.minecraftOpen
          ? this.t({
              vi: 'Hoàn thành! Mia được đội vương miện hôm nay.',
              el: 'Ολοκληρώθηκε! Η Μία φοράει το στέμμα.',
            })
          : this.t({
              vi: 'Học mỗi môn 1 bài để nhận vương miện.',
              el: 'Ένα μάθημα σε κάθε μάθημα για το στέμμα.',
            });
      },
      greeting() {
        const mc = this.profile.minecraft;
        const name = this.profile.name;
        const elName = mc ? 'Τιν Τιν' : 'Μία';
        if (this.minecraftOpen)
          return mc
            ? this.t({
                vi: 'Xong nhiệm vụ rồi! Vào Minecraft thôi!',
                el: 'Τα κατάφερες! Πάμε για Minecraft!',
              })
            : this.t({
                vi: 'Mia giỏi quá! Vương miện là của Mia!',
                el: 'Μπράβο Μία! Το στέμμα είναι δικό σου!',
              });
        const left = this.subjects.filter((s) => !this.acad.doneToday(s.id)).length;
        if (left === this.subjects.length)
          return this.t({
            vi: 'Chào ' + name + '! Hôm nay học gì nào?',
            el: 'Γεια σου ' + elName + '! Τι θα μάθουμε σήμερα;',
            en: 'Hi ' + name + '! What shall we learn today?',
          });
        return mc
          ? this.t({
              vi: 'Còn ' + left + ' môn nữa là mở Minecraft!',
              el: 'Άλλα ' + left + ' μαθήματα για το Minecraft!',
              en: left + ' more ' + (left === 1 ? 'subject' : 'subjects') + ' to open Minecraft!',
            })
          : this.t({
              vi: 'Còn ' + left + ' môn nữa là có vương miện!',
              el: 'Άλλα ' + left + ' για το στέμμα!',
              en: left + ' more ' + (left === 1 ? 'subject' : 'subjects') + ' to win the crown!',
            });
      },
    },
    unmounted() {
      AcademySpeech.stop();
    },
    methods: {
      playMinecraft() {
        sfx.chest();
        voice('unlock', this.profile.vox);
        window.hocVienApp.openMinecraft();
      },
      go(path) {
        sfx.click();
        this.$router.push(path);
      },
      t(text) {
        return pickText(text, this.lang);
      },
      passed(s) {
        return s.lessons.filter((l) => this.acad.isPassed(l.id)).length;
      },
      nextIndex(s) {
        return this.acad.nextLessonIndex(s);
      },
      doneToday(id) {
        return this.acad.doneToday(id);
      },
      toggleVoice() {
        this.acad.toggleVoice();
        AcademySpeech.say([{ text: this.greeting, lang: this.lang }]);
      },
      // a tap says hello; 7 quick taps (for a parent) open every lesson
      secretTap() {
        AcademySpeech.say([{ text: this.greeting, lang: this.lang }]);
        this.taps++;
        clearTimeout(this.tapTimer);
        this.tapTimer = setTimeout(() => (this.taps = 0), 2500);
        if (this.taps >= 7) {
          this.acad.openEverything();
          this.taps = 0;
        }
      },
    },
  };
</script>

<style scoped lang="scss">
  .home {
    display: grid;
    grid-template-columns: minmax(14rem, 22rem) 1fr;
    gap: 1.5rem;
  }
  .hero {
    position: sticky;
    top: 0;
    height: calc(100vh - 2rem);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    padding-bottom: 1rem;
  }
  .bubble {
    position: relative;
    font-size: 1.6rem;
    font-weight: 800;
    line-height: 1.15;
    padding: 0.7rem 1rem;
    margin-bottom: 0.8rem;
    text-align: center;
    max-width: 18rem;
    background: rgba(255, 255, 255, 0.95);
    color: #1d1b22;
    &::after {
      content: '';
      position: absolute;
      left: 50%;
      bottom: -18px;
      width: 16px;
      height: 14px;
      background: #0d0c10;
      transform: translateX(-50%);
    }
  }
  .tintin {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    height: min(68vh, 34rem);
    animation: idle 3.2s ease-in-out infinite;
    img {
      height: 100%;
      width: auto;
      filter: drop-shadow(0 10px 0 rgba(0, 0, 0, 0.25));
    }
    &:active {
      animation: jump 0.4s;
    }
  }
  .shadow {
    width: 9rem;
    height: 1rem;
    background: rgba(0, 0, 0, 0.35);
    margin-top: -0.4rem;
  }
  @keyframes idle {
    50% {
      transform: translateY(-6px);
    }
  }
  @keyframes jump {
    40% {
      transform: translateY(-40px);
    }
  }
  .board {
    display: flex;
    flex-direction: column;
    gap: 1.1rem;
    padding-top: 1rem;
    min-width: 0;
  }
  .top {
    display: flex;
    align-items: center;
    gap: 0.9rem;
  }
  .title {
    margin: 0;
    font-size: 3.6rem;
    line-height: 0.9;
    font-weight: 800;
    color: #fff;
    text-shadow:
      4px 4px 0 #0d0c10,
      0 0 24px rgba(0, 0, 0, 0.4);
    .small {
      display: block;
      font-size: 1.5rem;
      color: var(--gold);
      text-transform: uppercase;
      letter-spacing: 0.15em;
    }
  }
  .spacer {
    flex: 1;
  }
  .wallet {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.3rem 1rem;
    font-size: 2rem;
    font-weight: 800;
    .star {
      color: var(--gold);
      text-shadow: 2px 2px 0 #7a5400;
    }
  }
  .lang {
    background: #3b82f6;
    color: #fff;
    text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.4);
    font-size: 1.4rem;
    padding: 0.55rem 0.9rem;
  }
  .mission {
    display: flex;
    align-items: center;
    gap: 1.2rem;
    padding: 1rem 1.2rem;
    flex-wrap: wrap;
    &.open {
      background: rgba(30, 70, 25, 0.88);
    }
    h2 {
      margin: 0;
      font-size: 2rem;
      color: var(--gold);
    }
    p {
      margin: 0.1rem 0 0;
      color: var(--muted);
      font-weight: 600;
    }
  }
  .play-mc {
    flex-basis: 100%;
    font-size: 2rem;
    font-weight: 800;
    padding: 0.5rem 1rem;
    color: #fff;
    background: #6b6b75;
    border: 4px solid #0d0c10;
    text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.45);
    box-shadow:
      inset 4px 4px 0 rgba(255, 255, 255, 0.3),
      inset -4px -4px 0 rgba(0, 0, 0, 0.35),
      0 5px 0 #0d0c10;
    cursor: not-allowed;
    &.ready {
      background: #5fbf3a;
      cursor: pointer;
      animation: glow 1.4s ease-in-out infinite;
    }
    &.ready:active {
      transform: translateY(4px);
    }
  }
  .mission-head {
    flex: 1;
    min-width: 14rem;
  }
  .hotbar {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.35rem;
    background: rgba(0, 0, 0, 0.45);
    border: 3px solid #0d0c10;
  }
  .slot {
    position: relative;
    width: 3.6rem;
    height: 3.6rem;
    background: #8b8b93;
    border: 3px solid #0d0c10;
    box-shadow:
      inset 3px 3px 0 rgba(0, 0, 0, 0.35),
      inset -3px -3px 0 rgba(255, 255, 255, 0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    img {
      width: 78%;
      filter: grayscale(0.85) brightness(0.7);
    }
    &.done {
      background: #c6c6cc;
      outline: 3px solid #fff;
      img {
        filter: none;
        animation: pop 0.4s;
      }
    }
  }
  .tick {
    position: absolute;
    right: -6px;
    bottom: -8px;
    color: #5fbf3a;
    font-size: 1.5rem;
    font-weight: 900;
    text-shadow: 2px 2px 0 #0d0c10;
  }
  .arrow {
    color: #fff;
    font-size: 1.8rem;
    padding: 0 0.2rem;
  }
  .mine {
    background: #5a3d22;
    .pick {
      font-size: 2rem;
      filter: grayscale(0.8);
    }
    .lock {
      position: absolute;
      right: -8px;
      bottom: -8px;
      font-size: 1.3rem;
    }
    &.done {
      background: #5fbf3a;
      animation: glow 1.4s ease-in-out infinite;
      .pick {
        filter: none;
      }
    }
  }
  @keyframes pop {
    50% {
      transform: scale(1.3);
    }
  }
  @keyframes glow {
    50% {
      box-shadow: 0 0 18px 4px rgba(166, 255, 90, 0.7);
    }
  }
  .subjects {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.1rem;
  }
  .subject {
    display: flex;
    align-items: center;
    gap: 1.1rem;
    text-align: left;
    color: var(--text);
    padding: 1rem 1.1rem;
    cursor: pointer;
    transition:
      transform 0.12s,
      background 0.2s;
    border-left: 10px solid var(--c);
    &:hover {
      transform: translateY(-3px);
      background: rgba(40, 36, 50, 0.92);
    }
    &:hover .block {
      animation-duration: 0.9s;
    }
    &:active {
      transform: translateY(2px);
    }
  }
  .block {
    width: 6.2rem;
    flex: none;
    animation: bob 2.6s ease-in-out infinite;
    animation-delay: var(--delay);
    filter: drop-shadow(0 8px 0 rgba(0, 0, 0, 0.35));
  }
  @keyframes bob {
    50% {
      transform: translateY(-8px) rotate(-3deg);
    }
  }
  .info {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    min-width: 0;
    flex: 1;
  }
  .name {
    font-size: 2.1rem;
    font-weight: 800;
    line-height: 1;
    color: #fff;
    text-shadow: 3px 3px 0 #0d0c10;
  }
  .count {
    color: var(--muted);
    font-weight: 700;
  }
  .next {
    color: var(--c);
    font-weight: 800;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    filter: brightness(1.25);
  }
  .foot {
    margin-top: auto;
    .link {
      background: rgba(0, 0, 0, 0.4);
      border: none;
      color: var(--muted);
      cursor: pointer;
      font-weight: 700;
      padding: 0.5rem 0.8rem;
    }
  }
  @media (max-width: 1000px) {
    .home {
      grid-template-columns: 1fr;
    }
    .hero {
      position: static;
      height: auto;
      flex-direction: row;
      justify-content: flex-start;
      gap: 1rem;
      order: -1;
      padding: 0.6rem 0 0;
    }
    .tintin {
      height: 9rem;
      order: -1;
    }
    .shadow {
      display: none;
    }
    .bubble::after {
      left: -14px;
      bottom: 40%;
    }
  }
  @media (max-width: 760px) {
    .subjects {
      grid-template-columns: 1fr;
    }
  }
</style>
