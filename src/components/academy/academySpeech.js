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

let manifest = null;
const loadManifest = () => {
  if (manifest) return manifest;
  manifest = fetch('sounds/academy/manifest.json')
    .then((r) => (r.ok ? r.json() : {}))
    .catch(() => ({}));
  return manifest;
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
    const list = (Array.isArray(parts) ? parts : [parts]).filter((p) => p && p.text);
    this.stop();
    const token = this.token;
    const files = await loadManifest();
    for (const part of list) {
      if (token !== this.token) return;
      const id = lineId(part.lang, part.text);
      if (files[part.lang] && files[part.lang].includes(id)) {
        await this.playFile('sounds/academy/' + part.lang + '/' + id + '.mp3', token, part);
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
