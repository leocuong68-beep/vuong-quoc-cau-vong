<template>
  <NavPage nav-back-path="/">
    <div class="path">
      <div class="path-top">
        <button type="button" class="path-mia mood-idle" data-test="mia" @click="tapMia">
          <img :src="'img/princess/mia_pink.webp'" class="no-drag" alt="Mia" />
        </button>
        <div class="path-family">
          <img v-for="who in ['tintin', 'mommy', 'daddy', 'pony']" :key="who" :src="buddies[who].src" class="no-drag" :alt="buddies[who].en" />
        </div>
        <button type="button" class="ask-line" data-test="repeat" @click="hello">
          <em class="fas fa-volume-up" />
          <span>{{ greeting }}</span>
        </button>
        <LangToggle @change="hello" />
      </div>
      <div class="path-grid">
        <button
          v-for="(stage, index) in stages"
          :key="stage.id"
          type="button"
          class="stage"
          :class="{ locked: !isUnlocked(index), done: starsOf(stage) > 0, shake: lockedId === stage.id }"
          :data-stage="stage.id"
          @click="open(stage, index)"
        >
          <span class="stage-number">{{ index + 1 }}</span>
          <span class="stage-icon">
            <img v-if="stage.icon.src" :src="stage.icon.src" class="no-drag" alt="" />
            <!-- eslint-disable-next-line vue/no-v-html -->
            <span v-else-if="stage.icon.shape" class="shape" v-html="shape(stage.icon)" />
            <span v-else class="stage-text">{{ stage.icon.text }}</span>
          </span>
          <img v-if="stage.buddy" :src="buddies[stage.buddy].src" class="stage-buddy no-drag" alt="" />
          <span class="stage-title">{{ stage[lang] }}</span>
          <span class="stage-stars">
            <span v-for="n in 3" :key="n" :class="{ on: n <= starsOf(stage) }">★</span>
          </span>
          <em v-if="!isUnlocked(index)" class="fas fa-lock stage-lock" />
        </button>
      </div>
    </div>
  </NavPage>
</template>

<script>
  import NavPage from '../NavPage.vue';
  import LangToggle from './LangToggle.vue';
  import { Speech } from '../utils/Speech.js';
  import { Lang, Progress } from './state.js';
  import { BUDDIES, Lines } from './princessLines.js';
  import { STAGES, stageRoute, shapeSvg } from './stages.js';

  export default {
    name: 'PrincessNavPage',
    components: { NavPage, LangToggle },
    data() {
      return {
        stages: STAGES,
        buddies: BUDDIES,
        shown: Lines.hello(),
        lockedId: null,
        miaTaps: 0,
      };
    },
    computed: {
      lang() {
        return Lang.current;
      },
      greeting() {
        return this.shown[this.lang];
      },
    },
    mounted() {
      Speech.say(this.shown);
    },
    unmounted() {
      Speech.stop();
    },
    methods: {
      shape(icon) {
        return shapeSvg(icon.shape, icon.hex);
      },
      starsOf(stage) {
        return Progress.starsOf(stage.id);
      },
      isUnlocked(index) {
        // every stage is open from the start (set to false to unlock them one by one again)
        const openAll = true;
        return openAll || index === 0 || Progress.allUnlocked || this.starsOf(this.stages[index - 1]) > 0;
      },
      hello() {
        this.shown = Lines.hello();
        Speech.say(this.shown);
      },
      open(stage, index) {
        if (!this.isUnlocked(index)) {
          this.lockedId = stage.id;
          setTimeout(() => (this.lockedId = null), 500);
          this.shown = Lines.locked();
          Speech.say(this.shown);
          return;
        }
        this.$router.push(stageRoute(stage));
      },
      // for parents: tap Mia seven times to open every stage
      tapMia() {
        this.miaTaps++;
        if (this.miaTaps >= 7) Progress.unlockAll();
      },
    },
  };
</script>

<style scoped lang="scss">
  @use './princess.scss';

  .path {
    width: 100%;
    padding: 6pt 0 10pt;
    box-sizing: border-box;
    font-family: 'Baloo 2', 'Nunito', 'Trebuchet MS', system-ui, sans-serif;
    color: #4a2a57;
  }

  .path-top {
    display: flex;
    align-items: stretch;
    gap: 6pt;
    margin-bottom: 8pt;
  }

  .path-mia {
    flex: none;
    width: 46pt;
    height: 58pt;
    padding: 0;
    border: 0;
    background: none;
    transform-origin: 50% 100%;
    animation: princess-breathe 2.6s ease-in-out infinite;
  }

  .path-mia img {
    height: 100%;
    width: auto;
  }

  .path-family {
    flex: none;
    display: flex;
    align-items: flex-end;
    gap: 2pt;
    height: 58pt;
  }

  .path-family img {
    height: 100%;
    width: auto;
  }

  .path-family img:first-child {
    height: 86%;
  }

  .path-family img:last-child {
    height: 70%;
  }

  @media (max-width: 520px) {
    .path-family {
      display: none;
    }
  }

  .path-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(92pt, 1fr));
    gap: 8pt;
  }

  .stage {
    position: relative;
    display: grid;
    grid-template-rows: 54pt auto auto;
    justify-items: center;
    gap: 2pt;
    padding: 8pt 4pt 6pt;
    font: inherit;
    color: inherit;
    background: #fffaf2;
    border: 2pt solid #4a2a57;
    border-radius: 14pt;
    cursor: pointer;
    touch-action: manipulation;
  }

  .stage.done {
    background: #e6f7e2;
  }

  .stage.locked {
    background: #cfcbd6;
  }

  .stage.locked .stage-icon,
  .stage.locked .stage-title {
    opacity: 0.35;
  }

  .stage-number {
    position: absolute;
    left: 5pt;
    top: 3pt;
    font-size: 0.8rem;
    font-weight: 800;
    opacity: 0.6;
  }

  .stage-icon {
    width: 54pt;
    height: 54pt;
    display: grid;
    place-items: center;
  }

  .stage-icon img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .stage-buddy {
    position: absolute;
    right: 4pt;
    top: 18pt;
    height: 40pt;
    width: auto;
  }

  .stage-text {
    font-size: 1.7rem;
    white-space: nowrap;
    font-weight: 800;
  }

  .stage-title {
    font-size: 0.9rem;
    font-weight: 700;
    text-align: center;
    line-height: 1.15;
  }

  .stage-stars {
    font-size: 0.95rem;
    letter-spacing: 1pt;
    color: #b9b4c2;
  }

  .stage-stars .on {
    color: #f5b400;
  }

  .stage-lock {
    position: absolute;
    right: 6pt;
    top: 5pt;
    font-size: 0.9rem;
  }
</style>
