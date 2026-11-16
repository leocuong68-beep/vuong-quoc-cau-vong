// Reads lines aloud for Tin Tin's lessons: Vietnamese, Greek or English.
// A line is a list of parts [{ text, lang }], spoken one after another.
// Recorded mp3s (sounds/academy/<lang>/<id>.mp3, listed in sounds/academy/manifest.json)
// are used when they exist; otherwise the browser's own voice for that language.

const LOCALES = { vi: 'vi-VN', el: 'el-GR', en: 'en-GB' };

// Same small hash as scripts/academy-lines.mjs, so both sides agree on the file name.
export const lineId = (lang, text) => {
  let h = 2166136261;
  const s = lang + '|' + text;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
};

// Long number questions ("58 cộng 39 bằng mấy?") are not recorded whole: they are
// spoken as recorded pieces, numbers and the words between them.
export const chunksOf = (text) =>
  text
    .split(/(\d+)/)
    .map((p) => p.trim())
    .filter((p) => /[\p{L}\d]/u.test(p));

// Greek words inside a Vietnamese or English line are read by the Greek voice.
const GREEK = /([\u0370-\u03FF\u1F00-\u1FFF]+(?:[\s,.'’-]+[\u0370-\u03FF\u1F00-\u1FFF]+)*)/;
export const splitGreek = (part) => {
  if (!part || part.lang === 'el' || !GREEK.test(part.text)) return [part];
  return part.text
    .split(GREEK)
    .map((t, i) => ({ ...part, text: t.trim(), lang: i % 2 ? 'el' : part.lang }))
    .filter((p) => /[\p{L}\d]/u.test(p.text));
};

// Each child has an own voice: Tin Tin's guide is Coach Leo (vi) + Wiselady (en, el),
// Mia keeps her Lovely_Girl voice in every language.
// The public Academy (#/hoc) reads Vietnamese with MiniMax's own Vietnamese voice;
// English and Greek are shared with Tin Tin's.
const voiceBase = (lang) => {
  try {
    const h = window.location.hash;
    if (/^#\/mia/.test(h)) return 'sounds/academy_mia/';
    if (/^#\/hoc/.test(h) && lang === 'vi') return 'sounds/academy_pub/';
    return 'sounds/academy/';
  } catch (e) {
    return 'sounds/academy/';
  }
};
const manifests = {};
const loadManifest = (base) => {
  if (manifests[base]) return manifests[base];
  manifests[base] = fetch(base + 'manifest.json')
    .then((r) => (r.ok ? r.json() : {}))
    .catch(() => ({}));
  return manifests[base];
};

const pickVoice = (locale) => {
  try {
    const voices = window.speechSynthesis.getVoices();
    const lang = locale.slice(0, 2);
    return (
      voices.find(
        (v) => v.lang === locale && /Melina|Google|Siri|Premium|Enhanced/i.test(v.name)
      ) ||
      voices.find((v) => v.lang === locale) ||
      voices.find((v) => v.lang && v.lang.startsWith(lang)) ||
      null
    );
  } catch (e) {
    return null;
  }
};

export const AcademySpeech = {
  token: 0,
  audio: null,
  stop() {
    this.token++;
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
    try {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    } catch (e) {
      // no voice on this device
    }
  },
  async say(parts) {
    if (!parts) return;
    const bases = {};
    const files = {};
    for (const lang of ['vi', 'en', 'el']) {
      bases[lang] = voiceBase(lang);
      files[lang] = ((await loadManifest(bases[lang])) || {})[lang] || [];
    }
    const has = (lang, text) => (files[lang] || []).includes(lineId(lang, text));
    // a whole recorded line first; otherwise Greek words by the Greek voice
    const list = (Array.isArray(parts) ? parts : [parts])
      .filter((p) => p && p.text)
      .flatMap((p) => (has(p.lang, p.text) ? [p] : splitGreek(p)));
    this.stop();
    const token = this.token;
    for (const part of list) {
      if (token !== this.token) return;
      const id = lineId(part.lang, part.text);
      const have = files[part.lang] || [];
      const base = bases[part.lang] || 'sounds/academy/';
      const pieces = chunksOf(part.text);
      const pieceIds = pieces.map((p) => lineId(part.lang, p));
      if (have.includes(id)) {
        await this.playFile(base + part.lang + '/' + id + '.mp3', token, part);
      } else if (pieces.length > 1 && pieceIds.every((p) => have.includes(p))) {
        for (const p of pieceIds) {
          if (token !== this.token) return;
          await this.playFile(base + part.lang + '/' + p + '.mp3', token, part);
        }
      } else {
        await this.browserVoice(part, token);
      }
    }
  },
  playFile(src, token, part) {
    return new Promise((resolve) => {
      const audio = new Audio(src);
      this.audio = audio;
      audio.addEventListener('ended', resolve, { once: true });
      audio.addEventListener(
        'error',
        () => {
          if (token === this.token) this.browserVoice(part, token).then(resolve);
          else resolve();
        },
        { once: true }
      );
      const played = audio.play();
      if (played && played.catch) played.catch(() => resolve());
    });
  },
  browserVoice(part, token) {
    return new Promise((resolve) => {
      try {
        const synth = window.speechSynthesis;
        if (!synth || token !== this.token) return resolve();
        const u = new SpeechSynthesisUtterance(part.text);
        u.lang = LOCALES[part.lang] || part.lang;
        const voice = pickVoice(u.lang);
        if (voice) u.voice = voice;
        u.rate = part.slow ? 0.7 : 0.92;
        u.onend = resolve;
        u.onerror = resolve;
        synth.speak(u);
        // some browsers never fire onend
        setTimeout(resolve, 600 + part.text.length * 140);
      } catch (e) {
        resolve();
      }
    });
  },
};

// helpers for writing lessons
export const vi = (text) => ({ text, lang: 'vi' });
export const el = (text, slow) => ({ text, lang: 'el', slow });
export const en = (text, slow) => ({ text, lang: 'en', slow });
