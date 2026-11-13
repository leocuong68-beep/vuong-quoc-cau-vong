<template>
  <button type="button" class="lang-toggle" data-test="lang" @click="toggle">
    <span :class="{ on: lang === 'en' }">EN</span>
    <span :class="{ on: lang === 'vi' }">VI</span>
  </button>
</template>

<script>
  import { Lang } from './state.js';

  export default {
    name: 'LangToggle',
    emits: ['change'],
    computed: {
      lang() {
        return Lang.current;
      },
    },
    methods: {
      toggle() {
        Lang.toggle();
        this.$emit('change', Lang.current);
      },
    },
  };
</script>

<style scoped>
  .lang-toggle {
    flex: none;
    display: grid;
    grid-template-rows: 1fr 1fr;
    gap: 2pt;
    padding: 3pt;
    min-width: 40pt;
    font: inherit;
    font-weight: 800;
    font-size: 0.85rem;
    color: #4a2a57;
    background: #fffaf2;
    border: 2pt solid #4a2a57;
    border-radius: 12pt;
    cursor: pointer;
    touch-action: manipulation;
  }

  .lang-toggle span {
    display: grid;
    place-items: center;
    border-radius: 7pt;
    padding: 1pt 4pt;
    opacity: 0.45;
  }

  .lang-toggle span.on {
    background: #ffd23f;
    opacity: 1;
  }
</style>
