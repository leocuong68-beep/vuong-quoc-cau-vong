// Prints the lines that change when the player is not Mia, for one language: [{ key, en, vi }, ...]
// Usage: node scripts/princess-lines-kid.mjs en > kid-en.json; record them into public/sounds/en/kid/<key>.mp3
import { Lines } from '../src/components/princess/princessLines.js';
import { noNameEn, noNameVi } from '../src/components/princess/noName.js';

const lang = process.argv[2] === 'vi' ? 'vi' : 'en';
const strip = lang === 'en' ? noNameEn : noNameVi;
const out = Lines.all()
  .filter((x) => strip(x[lang]) !== x[lang])
  .map((x) => ({ key: x.key, en: lang === 'en' ? noNameEn(x.en) : x.en, vi: lang === 'vi' ? noNameVi(x.vi) : x.vi }));
console.log(JSON.stringify(out, null, 2));
