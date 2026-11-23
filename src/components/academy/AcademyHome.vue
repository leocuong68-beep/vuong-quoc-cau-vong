<template>
  <div class="academy home" :class="'theme-' + profile.theme">
    <PickName v-if="needName" @picked="picked" />
    <canvas v-if="celebrating" ref="fireworks" class="fireworks" />
    <aside class="hero">
      <div class="bubble slab pixel">{{ greeting }}</div>
      <button type="button" class="tintin" :class="{ jump: celebrating }" data-test="avatar" @click="secretTap">
        <img :src="profile.avatar" :alt="profile.name" class="no-drag" />
        <span v-if="crowned" class="worn" :class="{ landing: celebrating }" data-test="worn">{{ reward.icon }}</span>
      </button>
      <div class="shadow" />
    </aside>

    <main class="board">
      <header class="top">
        <h1 class="pixel title">
          <span class="small">{{ t(profile.kicker) }}</span>
          {{ profile.name }}
        </h1>
        <button
          v-if="profile.id === 'mia'"
          type="button"
          class="mc-btn games"
          data-test="to-games"
          @click="$router.push('/princess')"
        >
          {{ t({ vi: '🎮 Game', el: '🎮 Παιχνίδια', en: '🎮 Games' }) }}
        </button>
        <div class="spacer" />
        <div
          class="wallet slab pixel"
          data-test="wallet"
          :title="t({ vi: 'Sao của ' + profile.name, el: 'Αστέρια', en: profile.name + '\'s stars' })"
        >
          <span class="star">★</span>
          <b>{{ wallet }}</b>
        </div>
        <div
          class="gift-hint slab pixel"
          data-test="gift-hint"
          :title="t({ vi: 'Còn ' + acad.toNextGift + ' sao nữa là có quà của Ba', el: 'Δώρο από τον μπαμπά', en: acad.toNextGift + ' more stars for a present from Dad' })"
        >
          🎁 <b>{{ acad.toNextGift }}</b>
        </div>
        <button type="button" class="mc-btn lang" data-test="voice" @click="toggleVoice">
          {{ { vi: 'VI · Tiếng Việt', en: 'EN · English', el: 'EL · Ελληνικά' }[lang] }}
        </button>
        <UpdateButton
          :label="t({ vi: 'Cập nhật', el: 'Ενημέρωση', en: 'Update' })"
          :busy-label="t({ vi: 'Đang tải…', el: 'Φόρτωση…', en: 'Loading…' })"
        />
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
          <button
            type="button"
            class="slot mine"
            :class="{ done: minecraftOpen, claim: canClaim }"
            :disabled="!canClaim && !crowned"
            data-test="minecraft"
            @click="claimReward"
          >
            <span class="pick">{{ reward.icon }}</span>
            <span v-if="!minecraftOpen" class="lock">🔒</span>
          </button>
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
        <button v-if="profile.back" type="button" class="link" @click="goBack">
          ← {{ t(profile.back.label) }}
        </button>
        <button v-if="profile.public" type="button" class="link" data-test="switch-kid" @click="switchKid">
          👤 {{ t({ vi: 'Đổi bạn học', el: 'Άλλο παιδί', en: 'Change player' }) }}
        </button>
      </footer>
    </main>
  </div>
</template>

<script>
  import './academy.scss';
  import { profileOf, REWARD } from './profiles.js';
  import { Kids, showPicker } from './publicKids.js';
  import PickName from './PickName.vue';
  import UpdateButton from '../common/UpdateButton.vue';
  import { pickText } from './curriculum/en.js';
  import { Profiles } from '../princess/state.js';
  import { AcademySpeech } from './academySpeech.js';
  import { sfx, voice } from './sfx.js';

  export default {
    name: 'AcademyHome',
    components: { UpdateButton, PickName },
    data() {
      return { taps: 0, tapTimer: null, crowned: false, celebrating: false, celebrateTimer: null };
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
      needName() {
        return !!this.profile.public && (!Kids.chosen || !Kids.current);
      },
      // crown / cup: done for today, waiting to be put on
      canClaim() {
        return this.minecraftOpen && this.profile.reward !== 'minecraft' && !this.crowned;
      },
      crownKey() {
        return 'reward_' + this.profile.id + '_' + (this.profile.public ? this.profile.name : '');
      },
      reward() {
        return REWARD[this.profile.reward];
      },
      missionText() {
        if (this.canClaim) return this.t(this.reward.claim);
        return this.t(this.minecraftOpen ? this.reward.open : this.reward.todo);
      },
      greeting() {
        return this.greet(this.profile.name);
      },
      // the public space has no recording of each child's name: the voice says it without a name
      spokenGreeting() {
        return this.profile.public ? this.greet('') : this.greeting;
      },
    },
    watch: {
      crownKey: {
        immediate: true,
        handler() {
          let day = '';
          try {
            day = localStorage[this.crownKey] || '';
          } catch (e) {
            day = '';
          }
          this.crowned = day === new Date().toDateString() && this.minecraftOpen;
        },
      },
    },
    unmounted() {
      clearTimeout(this.celebrateTimer);
      this.celebrating = false;
      AcademySpeech.stop();
    },
    methods: {
      // Tin Tin's "change player" goes back to the account picker on the web
      goBack() {
        if (this.profile.back.pick) Profiles.currentId = null;
        this.$router.push(this.profile.back.path);
      },
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
      greet(name) {
        if (this.minecraftOpen) return this.t(this.reward.done);
        const left = this.subjects.filter((s) => !this.acad.doneToday(s.id)).length;
        if (left === this.subjects.length)
          return name
            ? this.t({
                vi: 'Chào ' + name + '! Hôm nay học gì nào?',
                el: 'Γεια σου ' + (this.profile.elName || name) + '! Τι θα μάθουμε σήμερα;',
                en: 'Hi ' + name + '! What shall we learn today?',
              })
            : this.t({
                vi: 'Chào con! Hôm nay học gì nào?',
                el: 'Γεια σου! Τι θα μάθουμε σήμερα;',
                en: 'Hi there! What shall we learn today?',
              });
        return this.t(this.reward.left(left));
      },
      // the child studies in the language chosen on the name screen
      picked(lang) {
        while (this.acad.voiceLang !== lang) this.acad.toggleVoice();
        AcademySpeech.say([{ text: this.spokenGreeting, lang: this.lang }]);
      },
      // tap the crown (or cup) once the mission is done: it flies onto the head,
      // fireworks, a fanfare, and the avatar jumps for joy
      claimReward() {
        if (this.profile.reward === 'minecraft' || !this.minecraftOpen) return;
        this.crowned = true;
        try {
          localStorage[this.crownKey] = new Date().toDateString();
        } catch (e) {
          // fine for this visit
        }
        this.celebrating = true;
        sfx.fanfare();
        setTimeout(() => voice('pass', this.profile.vox), 1700);
        setTimeout(() => AcademySpeech.say([{ text: this.t(this.reward.done), lang: this.lang }]), 3200);
        this.$nextTick(() => this.fireworks());
        clearTimeout(this.celebrateTimer);
        this.celebrateTimer = setTimeout(() => (this.celebrating = false), 6500);
      },
      fireworks() {
        const c = this.$refs.fireworks;
        if (!c || !c.getContext) return;
        const g = c.getContext('2d');
        const W = (c.width = window.innerWidth);
        const H = (c.height = window.innerHeight);
        const colors = ['#ff5fa2', '#ffd84a', '#7ee0ff', '#b98cff', '#7dff9a', '#ffffff'];
        const parts = [];
        const burst = () => {
          const x = W * (0.15 + Math.random() * 0.7);
          const y = H * (0.12 + Math.random() * 0.35);
          const col = colors[Math.floor(Math.random() * colors.length)];
          for (let i = 0; i < 80; i++) {
            const a = (Math.PI * 2 * i) / 80;
            const v = 2 + Math.random() * 3.5;
            parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 70 + Math.random() * 30, col });
          }
          sfx.pop();
        };
        let frame = 0;
        const step = () => {
          if (!this.celebrating || !this.$refs.fireworks) return;
          if (frame % 28 === 0 && frame < 300) burst();
          g.clearRect(0, 0, W, H);
          for (let i = parts.length - 1; i >= 0; i--) {
            const p = parts[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.05;
            p.vx *= 0.985;
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
      },
      switchKid() {
        sfx.click();
        showPicker();
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
        AcademySpeech.say([{ text: this.spokenGreeting, lang: this.lang }]);
      },
      // a tap says hello; 7 quick taps (for a parent) open every lesson
      secretTap() {
        AcademySpeech.say([{ text: this.spokenGreeting, lang: this.lang }]);
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
  .fireworks {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    z-index: 60;
    pointer-events: none;
  }
  .tintin {
    position: relative;
  }
  .tintin.jump {
    animation: joy 0.55s ease-in-out 6;
  }
  @keyframes joy {
    0%,
    100% {
      transform: translateY(0) scale(1, 1);
    }
    20% {
      transform: translateY(0) scale(1.06, 0.94);
    }
    55% {
      transform: translateY(-18%) scale(0.97, 1.03);
    }
  }
  // the crown (or cup) sitting on the head
  .worn {
    position: absolute;
    left: 50%;
    top: -3%;
    font-size: min(9vh, 4.5rem);
    line-height: 1;
    transform: translateX(-50%) rotate(-6deg);
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3)) drop-shadow(0 0 12px rgba(255, 216, 74, 0.8));
    pointer-events: none;
  }
  .worn.landing {
    animation: land 1.6s cubic-bezier(0.2, 0.9, 0.3, 1.2) both;
  }
  @keyframes land {
    0% {
      transform: translate(120%, -260%) scale(2.6) rotate(25deg);
      opacity: 0;
    }
    30% {
      opacity: 1;
    }
    100% {
      transform: translateX(-50%) rotate(-6deg) scale(1);
    }
  }
  .slot.mine {
    font: inherit;
    padding: 0;
  }
  .slot.mine.claim {
    cursor: pointer;
    animation: claim 1s ease-in-out infinite;
  }
  @keyframes claim {
    0%,
    100% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(255, 216, 74, 0.9);
    }
    50% {
      transform: scale(1.12);
      box-shadow: 0 0 0 10px rgba(255, 216, 74, 0);
    }
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
  .gift-hint {
    padding: 4pt 10pt;
    font-size: 13pt;
  }
  .games {
    font-size: 15pt;
    padding: 6pt 14pt;
  }
</style>
