// The voice lines call the player "Mia". For any other child the game speaks without a name:
// English drops the name ("Mia, find the cup!" -> "Find the cup!"), Vietnamese says "bé" instead.

const upperFirst = (s) => s.replace(/^(\s*["“]?)(\p{Ll})/u, (m, pre, c) => pre + c.toUpperCase());
// capital letter at the start of every sentence
const sentences = (s) => upperFirst(s).replace(/([.!?]\s+["“]?)(\p{Ll})/gu, (m, pre, c) => pre + c.toUpperCase());

export const noNameEn = (text) => {
  if (!/Mia/.test(text)) return text;
  let s = text
    .replace(/^Hi Mia!/, 'Hi there!')
    .replace(/,\s*Mia([.!?])/g, '$1') // "Great job, Mia!"
    .replace(/(^|[.!?]\s+)Mia,\s*/g, '$1') // "Mia, find the cup!"
    .replace(/\bwith Mia\b/g, 'with you')
    .replace(/\babout Mia\b/g, 'about you')
    .replace(/\bof Mia\b/g, 'of you')
    .replace(/\bMia's\b/g, 'your')
    .replace(/\bMia is\b/g, 'you are')
    .replace(/\bMia looks\b/g, 'you look')
    .replace(/\bMia has\b/g, 'you have')
    .replace(/\bMia\b/g, 'you');
  return sentences(s);
};

export const noNameVi = (text) => {
  if (!/Mia/.test(text)) return text;
  return sentences(text.replace(/\bMia\b/g, 'bé'));
};
