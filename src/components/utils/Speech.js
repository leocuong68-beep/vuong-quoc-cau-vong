import { logger } from '@/utils/logger.js';
import { Lang } from '../princess/state.js';

const LOCALES = { en: 'en-US', vi: 'vi-VN' };

// Says one line { key, en, vi } in the current language:
// the recorded mp3 when it exists, the browser voice otherwise.
export const Speech = {
  current: null,
  stop() {
    if (this.current) {
      this.current.pause();
      this.current = null;
    }
    try {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    } catch (e) {
      logger.error('speechSynthesis cancel failed', e);
    }
  },
  say(line) {
    if (!line) return;
    this.stop();
    const lang = Lang.current;
    const folder = line.kid && line.kid.includes(lang) ? 'kid' : 'mia';
    const audio = new Audio('sounds/' + lang + '/' + folder + '/' + line.key + '.mp3');
    this.current = audio;
    let fellBack = false;
    const fallback = () => {
      if (fellBack || this.current !== audio) return;
      fellBack = true;
      this.browserVoice(line[lang], LOCALES[lang]);
    };
    audio.addEventListener('error', fallback, { once: true });
    try {
      const played = audio.play();
      if (played && typeof played.catch === 'function') played.catch(fallback);
    } catch (e) {
      fallback();
    }
  },
  browserVoice(text, locale) {
    try {
      const synth = window.speechSynthesis;
      if (!synth || !text) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = locale;
      utterance.rate = 0.9;
      utterance.pitch = 1.2;
      synth.speak(utterance);
    } catch (e) {
      logger.error('speechSynthesis failed', e);
    }
  },
};
