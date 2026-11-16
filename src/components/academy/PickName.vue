<template>
  <div class="pick-name" data-test="pick-name">
    <div class="card slab">
      <img :src="botSrc" alt="" class="bot no-drag" />
      <h1 class="pixel">{{ t({ vi: 'Học viện', el: 'Ακαδημία', en: 'Academy' }) }}</h1>
      <p class="ask">{{ t({ vi: 'Con tên là gì?', el: 'Πώς σε λένε;', en: 'What is your name?' }) }}</p>

      <div v-if="kids.length" class="kids">
        <div v-for="k in kids" :key="k.id" class="kid">
          <button type="button" class="mc-btn name" :data-kid="k.name" @click="choose(k.id)">{{ k.name }}</button>
          <button
            type="button"
            class="remove"
            :title="t({ vi: 'Xóa tên này', el: 'Διαγραφή', en: 'Remove' })"
            @click="remove(k)"
          >
            ✕
          </button>
        </div>
      </div>

      <form class="new" @submit.prevent="add">
        <input
          v-model="name"
          data-test="name-input"
          maxlength="20"
          autocomplete="off"
          :placeholder="t({ vi: 'Nhập tên của con', el: 'Γράψε το όνομά σου', en: 'Type your name' })"
        />
        <button type="submit" class="mc-btn go" data-test="name-go" :disabled="!clean">
          {{ t({ vi: 'Bắt đầu ▶', el: 'Ξεκίνα ▶', en: 'Start ▶' }) }}
        </button>
      </form>

      <div class="langs">
        <button
          v-for="l in ['vi', 'en', 'el']"
          :key="l"
          type="button"
          :class="{ on: lang === l }"
          @click="setLang(l)"
        >
          {{ { vi: 'Tiếng Việt', en: 'English', el: 'Ελληνικά' }[l] }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
  import { Kids, addKid, chooseKid, removeKid, cleanName } from './publicKids.js';
  import { pickText } from './curriculum/en.js';
  import { sfx } from './sfx.js';

  const LANG_KEY = 'hoc_lang';
  const readLang = () => {
    try {
      return ['vi', 'en', 'el'].includes(localStorage[LANG_KEY]) ? localStorage[LANG_KEY] : 'vi';
    } catch (e) {
      return 'vi';
    }
  };

  export default {
    name: 'PickName',
    emits: ['picked'],
    data: () => ({ name: '', lang: readLang(), botSrc: 'img/academy/bot.webp' }),
    computed: {
      kids: () => Kids.list,
      clean() {
        return cleanName(this.name);
      },
    },
    methods: {
      t(text) {
        return pickText(text, this.lang);
      },
      setLang(l) {
        this.lang = l;
        try {
          localStorage[LANG_KEY] = l;
        } catch (e) {
          // fine
        }
      },
      done() {
        sfx.click();
        this.$emit('picked', this.lang);
      },
      choose(id) {
        chooseKid(id);
        this.done();
      },
      add() {
        if (!addKid(this.name)) return;
        this.name = '';
        this.done();
      },
      remove(k) {
        const ask = this.t({
          vi: 'Xóa tên ' + k.name + ' và kết quả học?',
          el: 'Διαγραφή ' + k.name + ';',
          en: 'Remove ' + k.name + ' and their progress?',
        });
        if (window.confirm(ask)) removeKid(k.id);
      },
    },
  };
</script>

<style scoped lang="scss">
  .pick-name {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: grid;
    place-items: center;
    padding: 1rem;
    background: rgba(10, 14, 20, 0.6);
    backdrop-filter: blur(4px);
  }
  .card {
    width: min(30rem, 100%);
    max-height: 100%;
    overflow: auto;
    padding: 1.5rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
    align-items: center;
  }
  .bot {
    height: 9rem;
  }
  h1 {
    margin: 0;
    font-size: 2rem;
  }
  .ask {
    margin: 0;
    font-size: 1.3rem;
  }
  .kids {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
  }
  .kid {
    position: relative;
  }
  .remove {
    position: absolute;
    top: -0.5rem;
    right: -0.5rem;
    width: 1.5rem;
    height: 1.5rem;
    border: 0;
    border-radius: 50%;
    background: #c33;
    color: #fff;
    font-size: 0.75rem;
    cursor: pointer;
  }
  .new {
    display: flex;
    gap: 0.5rem;
    width: 100%;
  }
  input {
    flex: 1;
    min-width: 0;
    padding: 0.7rem 0.9rem;
    font: inherit;
    font-size: 1.15rem;
    border: 3px solid #222;
    border-radius: 0.4rem;
  }
  .go:disabled {
    opacity: 0.5;
  }
  .langs {
    display: flex;
    gap: 0.4rem;
  }
  .langs button {
    border: 0;
    border-radius: 999px;
    padding: 0.35rem 0.8rem;
    background: rgba(255, 255, 255, 0.2);
    color: inherit;
    font: inherit;
    cursor: pointer;
  }
  .langs .on {
    background: #ffd84a;
    color: #222;
  }
</style>
