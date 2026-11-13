<template>
  <div class="picker" data-test="picker">
    <div class="picker-box">
      <div class="picker-top">
        <h2>{{ adding ? t('Thêm bé mới', 'New player') : t('Ai đang chơi?', 'Who is playing?') }}</h2>
        <LangToggle />
      </div>

      <div v-if="!adding" class="cards">
        <div v-for="p in profiles" :key="p.id" class="card-wrap">
          <button type="button" class="card" :data-profile="p.name" @click="choose(p)">
            <img :src="avatar(p.gender)" class="no-drag" alt="" />
            <span class="name">{{ p.name }}</span>
          </button>
          <button
            type="button"
            class="remove"
            :class="{ sure: removing === p.id }"
            :data-remove="p.name"
            @click="remove(p)"
          >
            {{ removing === p.id ? t('Xóa?', 'Delete?') : '×' }}
          </button>
        </div>
        <button type="button" class="card add" data-test="add" @click="startAdding">
          <span class="plus">+</span>
          <span class="name">{{ t('Thêm bé', 'Add') }}</span>
        </button>
      </div>

      <form v-else class="form" @submit.prevent="save">
        <div class="genders">
          <button
            v-for="g in genders"
            :key="g.id"
            type="button"
            class="gender"
            :class="{ on: gender === g.id }"
            :data-gender="g.id"
            @click="gender = g.id"
          >
            <img :src="avatar(g.id)" class="no-drag" alt="" />
            <span>{{ t(g.vi, g.en) }}</span>
          </button>
        </div>
        <input
          ref="name"
          v-model="name"
          class="name-input"
          data-test="name"
          maxlength="16"
          autocomplete="off"
          :placeholder="t('Tên của bé', 'Name')"
        />
        <div class="actions">
          <button v-if="profiles.length" type="button" class="secondary" @click="adding = false">
            {{ t('Quay lại', 'Back') }}
          </button>
          <button type="submit" class="primary" data-test="save" :disabled="!name.trim()">
            <em class="fas fa-check" />
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
  import LangToggle from './LangToggle.vue';
  import { Lang, Profiles } from './state.js';

  export default {
    name: 'ProfilePicker',
    components: { LangToggle },
    emits: ['chosen'],
    data() {
      return {
        adding: Profiles.list.length === 0,
        gender: 'girl',
        name: '',
        removing: null,
        genders: [
          { id: 'girl', vi: 'Bé gái', en: 'Girl' },
          { id: 'boy', vi: 'Bé trai', en: 'Boy' },
        ],
      };
    },
    computed: {
      profiles() {
        return Profiles.list;
      },
    },
    methods: {
      t(vi, en) {
        return Lang.current === 'vi' ? vi : en;
      },
      avatar(gender) {
        return gender === 'boy' ? 'img/princess/tintin.webp' : 'img/princess/mia_pink.webp';
      },
      startAdding() {
        this.adding = true;
        this.name = '';
        this.gender = 'girl';
        this.$nextTick(() => this.$refs.name && this.$refs.name.focus());
      },
      choose(profile) {
        Profiles.choose(profile.id);
        this.$emit('chosen', profile);
      },
      // two taps to delete, so a child does not remove a profile by accident
      remove(profile) {
        if (this.removing !== profile.id) {
          this.removing = profile.id;
          setTimeout(() => {
            if (this.removing === profile.id) this.removing = null;
          }, 3000);
          return;
        }
        this.removing = null;
        Profiles.remove(profile.id);
        if (!Profiles.list.length) this.adding = true;
      },
      save() {
        if (!this.name.trim()) return;
        this.choose(Profiles.add(this.name, this.gender));
      },
    },
  };
</script>

<style scoped lang="scss">
  .picker {
    position: fixed;
    inset: 0;
    z-index: 60;
    display: grid;
    place-items: center;
    padding: calc(12pt + var(--safe-top, 0px)) 12pt calc(12pt + var(--safe-bottom, 0px));
    background: linear-gradient(#a9d8ee, #c9efe4 60%, #a5db8c);
    font-family: 'Baloo 2', 'Nunito', 'Trebuchet MS', system-ui, sans-serif;
    color: #4a2a57;
    overflow-y: auto;
  }

  .picker-box {
    width: min(100%, 560pt);
    display: grid;
    gap: 14pt;
  }

  .picker-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10pt;
  }

  h2 {
    margin: 0;
    font-size: 2rem;
    font-weight: 800;
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120pt, 1fr));
    gap: 12pt;
  }

  .card-wrap {
    position: relative;
  }

  .card {
    width: 100%;
    display: grid;
    grid-template-rows: 130pt auto;
    justify-items: center;
    gap: 4pt;
    padding: 10pt 6pt 8pt;
    font: inherit;
    color: inherit;
    background: #fffaf2;
    border: 3pt solid #4a2a57;
    border-radius: 18pt;
    cursor: pointer;
    touch-action: manipulation;
  }

  .card img {
    height: 100%;
    width: auto;
    max-width: 100%;
    object-fit: contain;
  }

  .card .name {
    font-size: 1.35rem;
    font-weight: 800;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .card.add {
    border-style: dashed;
    background: rgba(255, 250, 242, 0.6);
  }

  .plus {
    align-self: center;
    font-size: 4rem;
    font-weight: 800;
    line-height: 1;
  }

  .remove {
    position: absolute;
    top: 6pt;
    right: 6pt;
    min-width: 26pt;
    height: 26pt;
    padding: 0 6pt;
    border: 2pt solid #4a2a57;
    border-radius: 13pt;
    background: #fffaf2;
    color: #4a2a57;
    font: inherit;
    font-weight: 800;
    font-size: 1rem;
    line-height: 1;
    cursor: pointer;
    opacity: 0.55;
  }

  .remove.sure {
    background: #ff5a5f;
    color: #ffffff;
    opacity: 1;
  }

  .form {
    display: grid;
    gap: 12pt;
  }

  .genders {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12pt;
  }

  .gender {
    display: grid;
    grid-template-rows: 150pt auto;
    justify-items: center;
    gap: 4pt;
    padding: 10pt 6pt 8pt;
    font: inherit;
    font-size: 1.35rem;
    font-weight: 800;
    color: inherit;
    background: #fffaf2;
    border: 3pt solid #b9b4c2;
    border-radius: 18pt;
    cursor: pointer;
    opacity: 0.6;
    touch-action: manipulation;
  }

  .gender.on {
    border-color: #4a2a57;
    background: #fff2b3;
    opacity: 1;
    box-shadow: 0 0 0 4pt #ffd23f;
  }

  .gender img {
    height: 100%;
    width: auto;
  }

  .name-input {
    width: 100%;
    box-sizing: border-box;
    padding: 10pt 14pt;
    font: inherit;
    font-size: 1.6rem;
    font-weight: 800;
    color: inherit;
    text-align: center;
    background: #ffffff;
    border: 3pt solid #4a2a57;
    border-radius: 16pt;
  }

  .actions {
    display: flex;
    justify-content: center;
    gap: 12pt;
  }

  .actions button {
    min-height: 50pt;
    padding: 6pt 26pt;
    font: inherit;
    font-size: 1.3rem;
    font-weight: 800;
    border: 2pt solid #4a2a57;
    border-radius: 14pt;
    cursor: pointer;
  }

  .primary {
    background: #35b36b;
    color: #ffffff;
  }

  .primary:disabled {
    opacity: 0.4;
    cursor: default;
  }

  .secondary {
    background: #fffaf2;
    color: #4a2a57;
  }
</style>
