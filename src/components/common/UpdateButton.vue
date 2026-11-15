<template>
  <button type="button" class="update-btn" :class="{ busy }" data-test="update" :title="version" @click="run">
    <em class="fas fa-sync-alt" :class="{ 'fa-spin': busy }" />
    <span>{{ busy ? busyLabel : label }}</span>
  </button>
</template>

<script>
  import { updateApp, appVersion } from '../../updateApp.js';

  export default {
    name: 'UpdateButton',
    props: {
      label: { type: String, default: 'Cập nhật' },
      busyLabel: { type: String, default: 'Đang tải…' },
    },
    data: () => ({ busy: false }),
    computed: {
      version: () => 'Phiên bản ' + appVersion(),
    },
    methods: {
      run() {
        if (this.busy) return;
        this.busy = true;
        updateApp();
      },
    },
  };
</script>

<style scoped>
  .update-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4em;
    padding: 0.45em 0.8em;
    border: 0;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.85);
    color: #333;
    font: inherit;
    font-size: 0.9em;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    align-self: center;
    flex-shrink: 0;
    white-space: nowrap;
  }
  .update-btn.busy {
    opacity: 0.8;
  }
</style>
