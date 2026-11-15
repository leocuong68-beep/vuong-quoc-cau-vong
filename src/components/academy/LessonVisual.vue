<template>
  <div class="visual" :class="'kind-' + show.kind">
    <button
      v-if="show.kind === 'listen'"
      type="button"
      class="listen"
      data-test="listen"
      @click="$emit('replay')"
    >
      <em class="fas fa-volume-up" />
    </button>

    <div v-else-if="show.kind === 'big'" class="big">{{ show.value }}</div>

    <div v-else-if="show.kind === 'text'" class="word">{{ show.value }}</div>

    <div v-else-if="show.kind === 'emoji'" class="emoji-wrap">
      <span class="emoji">{{ show.value }}</span>
      <span v-if="sub" class="sub">{{ sub }}</span>
    </div>

    <div v-else-if="show.kind === 'expr'" class="expr">
      <span v-for="(line, i) in String(show.value).split('\n')" :key="i">{{ line }}</span>
    </div>

    <div v-else-if="show.kind === 'dots'" class="groups">
      <div v-for="g in show.groups" :key="g" class="group">
        <span v-for="d in show.each" :key="d" class="dot" />
      </div>
    </div>

    <div v-else-if="show.kind === 'share'" class="share">
      <div class="cards">
        <span v-for="c in show.total" :key="c" class="card" />
      </div>
      <div class="kids">
        <span v-for="k in show.people" :key="k" class="kid">🧒</span>
      </div>
    </div>

    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-else-if="show.kind === 'circuit'" class="svgbox" v-html="circuitSvg" />

    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-else-if="show.kind === 'grid'" class="svgbox" v-html="gridSvg" />
  </div>
</template>

<script>
  import { Academy } from './academyState.js';

  export default {
    name: 'LessonVisual',
    props: { show: { type: Object, required: true } },
    emits: ['replay'],
    computed: {
      sub() {
        const s = this.show.sub;
        if (!s) return '';
        return typeof s === 'string' ? s : s[Academy.voiceLang] || s.vi;
      },
      circuitSvg() {
        const c = this.show;
        const wire = '#94a3b8';
        const glow = c.lit
          ? '<circle cx="200" cy="58" r="44" fill="#fde047" opacity="0.35"/><circle cx="200" cy="58" r="30" fill="#fde047" opacity="0.5"/>'
          : '';
        const bulb =
          glow +
          `<circle cx="200" cy="58" r="22" fill="${c.lit ? '#fef08a' : '#334155'}" stroke="#e2e8f0" stroke-width="3"/>` +
          '<rect x="190" y="78" width="20" height="14" rx="3" fill="#64748b"/>';
        const battery = c.battery
          ? '<rect x="40" y="150" width="28" height="70" rx="5" fill="#f59e0b"/><rect x="47" y="142" width="14" height="10" rx="2" fill="#e2e8f0"/><text x="54" y="195" font-size="22" text-anchor="middle" fill="#0b1220" font-weight="700">+</text>'
          : '<rect x="40" y="150" width="28" height="70" rx="5" fill="none" stroke="#475569" stroke-dasharray="6 5" stroke-width="3"/><text x="54" y="192" font-size="20" text-anchor="middle" fill="#64748b">?</text>';
        // wires: battery top -> up to bulb; bulb -> right side -> down -> switch on bottom -> back to battery bottom
        const top = `<path d="M54 142 V92 H190" stroke="${wire}" stroke-width="5" fill="none"/>`;
        const right = c.broken
          ? `<path d="M210 92 H340 V150" stroke="${wire}" stroke-width="5" fill="none"/><path d="M340 172 V250 H270" stroke="${wire}" stroke-width="5" fill="none"/><path d="M332 152 l16 18 M348 152 l-16 18" stroke="#ef4444" stroke-width="4"/>`
          : `<path d="M210 92 H340 V250 H270" stroke="${wire}" stroke-width="5" fill="none"/>`;
        const sw = c.closed
          ? `<path d="M270 250 H170" stroke="${wire}" stroke-width="5"/><circle cx="250" cy="250" r="7" fill="#e2e8f0"/><circle cx="190" cy="250" r="7" fill="#e2e8f0"/>`
          : `<circle cx="250" cy="250" r="7" fill="#e2e8f0"/><circle cx="190" cy="250" r="7" fill="#e2e8f0"/><path d="M250 250 L200 214" stroke="${wire}" stroke-width="5" stroke-linecap="round"/><path d="M270 250 H250 M190 250 H170" stroke="${wire}" stroke-width="5"/>`;
        const bottom = `<path d="M170 250 H54 V220" stroke="${wire}" stroke-width="5" fill="none"/>`;
        return `<svg viewBox="0 0 380 290" xmlns="http://www.w3.org/2000/svg">${top}${right}${sw}${bottom}${battery}${bulb}</svg>`;
      },
      gridSvg() {
        const { size, from, to } = this.show;
        const cell = 56;
        const pad = 4;
        let out = '';
        for (let y = 0; y < size; y++)
          for (let x = 0; x < size; x++)
            out += `<rect x="${pad + x * cell}" y="${pad + y * cell}" width="${cell - 4}" height="${cell - 4}" rx="8" fill="#16223a" stroke="#22304a"/>`;
        const at = (p, ch) =>
          `<text x="${pad + p[0] * cell + (cell - 4) / 2}" y="${pad + p[1] * cell + (cell - 4) / 2 + 12}" font-size="34" text-anchor="middle">${ch}</text>`;
        out += at(to, '⭐') + at(from, '🤖');
        const w = pad * 2 + size * cell;
        return `<svg viewBox="0 0 ${w} ${w}" xmlns="http://www.w3.org/2000/svg">${out}</svg>`;
      },
    },
  };
</script>

<style scoped lang="scss">
  .visual {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }
  .listen {
    width: 9rem;
    height: 9rem;
    border-radius: 50%;
    border: none;
    background: var(--accent);
    color: #0b1220;
    font-size: 3.6rem;
    cursor: pointer;
    box-shadow: 0 0 0 10px color-mix(in srgb, var(--accent) 25%, transparent);
    animation: pulse 1.8s ease-in-out infinite;
  }
  @keyframes pulse {
    50% {
      box-shadow: 0 0 0 18px color-mix(in srgb, var(--accent) 12%, transparent);
    }
  }
  .big {
    font-size: 8rem;
    font-weight: 800;
    line-height: 1;
    color: #f1f5f9;
  }
  .word {
    font-size: 4.2rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    color: #f1f5f9;
  }
  .emoji-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
  }
  .emoji {
    font-size: 7rem;
    line-height: 1.1;
  }
  .sub {
    font-size: 1.6rem;
    color: #cbd5e1;
    font-weight: 700;
  }
  .expr {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 4.6rem;
    font-weight: 800;
    color: #f1f5f9;
    font-variant-numeric: tabular-nums;
    span + span {
      font-size: 0.8em;
    }
  }
  .groups {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
  }
  .group {
    display: grid;
    grid-template-columns: repeat(3, 1.6rem);
    gap: 0.4rem;
    padding: 0.8rem;
    border: 2px solid var(--accent);
    border-radius: 1rem;
  }
  .dot {
    width: 1.6rem;
    height: 1.6rem;
    border-radius: 50%;
    background: var(--accent);
  }
  .share {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  .cards {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    max-width: 26rem;
    justify-content: center;
  }
  .card {
    width: 1.6rem;
    height: 2.2rem;
    border-radius: 0.3rem;
    background: linear-gradient(135deg, #f472b6, #a78bfa);
  }
  .kid {
    font-size: 2.6rem;
    margin: 0 0.3rem;
  }
  .svgbox {
    height: 100%;
    max-height: 18rem;
    width: 100%;
    display: flex;
    justify-content: center;
    :deep(svg) {
      height: 100%;
      max-width: 100%;
    }
  }
</style>
