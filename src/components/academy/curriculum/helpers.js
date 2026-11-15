// Small helpers the lesson files share.

export const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
export const pick = (list) => list[Math.floor(Math.random() * list.length)];
export const shuffle = (list) => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
export const sample = (list, n) => shuffle(list).slice(0, n);

// Choices: the right answer plus up to n-1 different wrong ones, mixed.
// `key` turns an item into the text that must differ (labels must be unique).
export const choicesFrom = (correct, wrongPool, n = 4, key = (x) => String(x)) => {
  const seen = new Set([key(correct)]);
  const wrong = [];
  for (const w of shuffle(wrongPool)) {
    const k = key(w);
    if (!seen.has(k)) {
      seen.add(k);
      wrong.push(w);
    }
    if (wrong.length >= n - 1) break;
  }
  return shuffle([
    { value: correct, correct: true },
    ...wrong.map((w) => ({ value: w, correct: false })),
  ]);
};

// Make `count` questions by cycling through the generators, never the same question twice in a row.
export const build = (count, generators) => {
  const out = [];
  let guard = 0;
  while (out.length < count && guard < count * 20) {
    guard++;
    const gen = generators[out.length % generators.length];
    const q = gen();
    const prev = out[out.length - 1];
    if (prev && prev.sig && q.sig && prev.sig === q.sig) continue;
    if (out.filter((x) => x.sig && x.sig === q.sig).length >= 2) continue;
    out.push(q);
  }
  return shuffle(out);
};

// Greek accents
export const stripAccents = (s) => s.normalize('NFD').replace(/[́̈]/g, '').normalize('NFC');
const VOWELS = 'αεηιουω';
const ACCENTED = { α: 'ά', ε: 'έ', η: 'ή', ι: 'ί', ο: 'ό', υ: 'ύ', ω: 'ώ' };
// The same word with the accent on another vowel, or with none.
export const accentVariants = (word) => {
  const plain = stripAccents(word);
  const out = new Set();
  const chars = [...plain];
  chars.forEach((c, i) => {
    if (!VOWELS.includes(c)) return;
    // in αι, ει, οι, ου, υι the accent sits on the second letter
    const next = chars[i + 1];
    if (next && ['αι', 'ει', 'οι', 'ου', 'υι'].includes(c + next)) return;
    const v = [...chars];
    v[i] = ACCENTED[c];
    out.add(v.join(''));
  });
  out.add(plain);
  out.delete(word);
  return [...out];
};
