// Every sentence the princess games can say, as { key, en, vi }.
// Recorded voice: public/sounds/<lang>/mia/<key>.mp3 (lang = en | vi).
// The text is shown on screen and read by the browser voice when the mp3 is missing.
// scripts/princess-lines.mjs prints the full list for the voice batch.

export const COLORS = [
  { id: 'pink', vi: 'hồng', hex: '#ff7eb6' },
  { id: 'blue', vi: 'xanh dương', hex: '#4aa8ff' },
  { id: 'yellow', vi: 'vàng', hex: '#ffd23f' },
  { id: 'green', vi: 'xanh lá', hex: '#5fd38d' },
  { id: 'purple', vi: 'tím', hex: '#a77bff' },
  { id: 'red', vi: 'đỏ', hex: '#ff5a5f' },
  { id: 'orange', vi: 'cam', hex: '#ff9f43' },
];

export const PARTS = [
  { id: 'dress', vi: 'chiếc váy' },
  { id: 'crown', vi: 'vương miện' },
  { id: 'bow', vi: 'chiếc nơ' },
];

export const SHAPES = [
  { id: 'circle', vi: 'hình tròn' },
  { id: 'square', vi: 'hình vuông' },
  { id: 'triangle', vi: 'hình tam giác' },
  { id: 'star', vi: 'ngôi sao' },
  { id: 'heart', vi: 'trái tim' },
];

// The family who play along with Mia. `en` / `vi` are how Mia calls them.
export const BUDDIES = {
  pony: { en: 'Pony', vi: 'Pony', src: 'img/princess/pony.webp', height: 78 },
  tintin: { en: 'Tin Tin', vi: 'Anh Tin Tin', src: 'img/princess/tintin.webp', height: 88 },
  mommy: { en: 'Mommy', vi: 'Mẹ', src: 'img/princess/mommy.webp', height: 98 },
  daddy: { en: 'Daddy', vi: 'Ba', src: 'img/princess/daddy.webp', height: 100 },
};

export const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const NUMBER_WORDS = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
];

export const NUMBER_WORDS_VI = [
  'không',
  'một',
  'hai',
  'ba',
  'bốn',
  'năm',
  'sáu',
  'bảy',
  'tám',
  'chín',
  'mười',
];

NUMBER_WORDS.push('eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty');
NUMBER_WORDS_VI.push('mười một', 'mười hai', 'mười ba', 'mười bốn', 'mười lăm', 'mười sáu', 'mười bảy', 'mười tám', 'mười chín', 'hai mươi');

// Clothes for the weather or the occasion.
export const OUTFITS = [
  { id: 'rain', en: 'raincoat', vi: 'áo mưa', whenEn: 'It is raining', whenVi: 'Trời đang mưa' },
  { id: 'pajamas', en: 'pajamas', vi: 'bộ đồ ngủ', whenEn: 'It is bedtime', whenVi: 'Đến giờ đi ngủ rồi' },
  { id: 'winter', en: 'winter coat', vi: 'áo khoác mùa đông', whenEn: 'It is snowing', whenVi: 'Trời đang có tuyết' },
  { id: 'school', en: 'school uniform', vi: 'đồng phục đi học', whenEn: 'It is time for school', whenVi: 'Đến giờ đi học rồi' },
  { id: 'sunny', en: 'sun hat', vi: 'mũ che nắng', whenEn: 'It is sunny', whenVi: 'Trời nắng đẹp' },
  { id: 'sport', en: 'football kit', vi: 'bộ đồ đá bóng', whenEn: 'It is time to play football', whenVi: 'Đến giờ đá bóng rồi' },
];

export const MAKEUP = [
  { id: 'lipstick', en: 'lipstick', vi: 'son môi' },
  { id: 'blush', en: 'blush', vi: 'phấn má' },
  { id: 'eyeshadow', en: 'eyeshadow', vi: 'phấn mắt' },
  { id: 'hairbow', en: 'hair bow', vi: 'nơ cài tóc' },
];

// Picture words; `vi` already carries the Vietnamese classifier.
export const WORDS = [
  { id: 'cat', vi: 'con mèo', src: 'img/cat1.png' },
  { id: 'dog', vi: 'con chó', src: 'img/dog1.svg' },
  { id: 'bird', vi: 'con chim', src: 'img/bird1.svg' },
  { id: 'fish', vi: 'con cá', src: 'img/fish1.svg' },
  { id: 'frog', vi: 'con ếch', src: 'img/frog1.svg' },
  { id: 'rabbit', vi: 'con thỏ', src: 'img/rabbit1.svg' },
  { id: 'goat', vi: 'con dê', src: 'img/goat1.svg' },
  { id: 'penguin', vi: 'chim cánh cụt', src: 'img/penguin1.svg' },
  { id: 'snail', vi: 'con ốc sên', src: 'img/snail1.svg' },
  { id: 'butterfly', vi: 'con bướm', src: 'img/butterfly.svg' },
  { id: 'chicken', vi: 'con gà', src: 'img/chicken1.svg' },
  { id: 'car', vi: 'xe ô tô', src: 'img/car1.svg' },
  { id: 'tree', vi: 'cái cây', src: 'img/tree1.svg' },
  { id: 'star', vi: 'ngôi sao', src: 'img/star1.svg' },
  { id: 'rainbow', vi: 'cầu vồng', src: 'img/rainbow1.svg' },
  { id: 'tractor', vi: 'máy kéo', src: 'img/tractor1.svg' },
];

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const en = (n) => NUMBER_WORDS[n];
const vi = (n) => NUMBER_WORDS_VI[n];
const apples = (n) => en(n) + (n === 1 ? ' apple' : ' apples');
const colorVi = (id) => COLORS.find((c) => c.id === id).vi;
const partVi = (id) => PARTS.find((p) => p.id === id).vi;
const shapeVi = (id) => SHAPES.find((s) => s.id === id).vi;
const line = (key, enText, viText) => ({ key, en: enText, vi: viText });

export const Lines = {
  // --- general ---
  hello: () => line('hello', "Hi Mia! Let's play!", 'Chào Mia! Mình cùng chơi nhé!'),
  praise(i) {
    const all = [
      line('praise_1', 'Great job, Mia!', 'Mia giỏi lắm!'),
      line('praise_2', 'Well done, Mia!', 'Mia làm tốt lắm!'),
      line('praise_3', 'You are a star, Mia!', 'Mia là ngôi sao nhỏ!'),
    ];
    return all[i % all.length];
  },
  stageDone: () => line('stage_done', 'Hooray! You did it, Mia!', 'Hoan hô! Mia giỏi quá!'),
  tryAgain: () =>
    line('try_again', 'Not quite, Mia. Try again!', 'Chưa đúng rồi, Mia thử lại nhé!'),
  countAgain: () =>
    line('count_again', 'Not quite, Mia. Count again!', 'Chưa đúng, Mia đếm lại nhé!'),
  locked: () =>
    line(
      'locked',
      'Play the game before this one first, Mia!',
      'Mia chơi xong trò trước đã nhé!'
    ),

  buddyHello(who) {
    const b = BUDDIES[who];
    return line(`hello_${who}`, `${b.en} wants to play with Mia!`, `${b.vi} muốn chơi cùng Mia!`);
  },
  buddyDone(who) {
    const b = BUDDIES[who];
    return who === 'tintin'
      ? line('done_tintin', 'Tin Tin says: you did it, Mia!', 'Anh Tin Tin nói: Mia giỏi quá!')
      : line(`done_${who}`, `${b.en} is so proud of you, Mia!`, `${b.vi} tự hào về Mia lắm!`);
  },

  // --- dress up ---
  find(part, color) {
    return part === 'bow'
      ? line(
          `find_bow_${color}`,
          `Mia, Pony wants the ${color} bow!`,
          `Mia ơi, pony thích chiếc nơ màu ${colorVi(color)}!`
        )
      : line(
          `find_${part}_${color}`,
          `Mia, find the ${color} ${part}!`,
          `Mia ơi, tìm ${partVi(part)} màu ${colorVi(color)} nào!`
        );
  },
  yes(part, color) {
    return line(
      `yes_${part}_${color}`,
      `Yes! The ${color} ${part}!`,
      `Đúng rồi! ${cap(partVi(part))} màu ${colorVi(color)}!`
    );
  },
  thatIs(color) {
    return line(
      `that_is_${color}`,
      `That is ${color}. Try again, Mia!`,
      `Đây là màu ${colorVi(color)}. Mia thử lại nhé!`
    );
  },
  dressUpDone: () =>
    line(
      'dressup_done',
      'Hooray! The princess is ready for the party!',
      'Hoan hô! Công chúa đã sẵn sàng đi dự tiệc!'
    ),

  // --- numbers and counting ---
  number: (n) => line(`number_${n}`, cap(en(n)), cap(vi(n))),
  give: (n) =>
    line(`give_${n}`, `Mia, give Pony ${apples(n)}!`, `Mia ơi, cho pony ${vi(n)} quả táo nào!`),
  giveYes: (n) =>
    line(
      `give_yes_${n}`,
      `Yes! ${cap(apples(n))}! Yummy!`,
      `Đúng rồi! ${cap(vi(n))} quả táo! Ngon quá!`
    ),
  findNumber: (n) =>
    line(`find_number_${n}`, `Mia, find number ${en(n)}!`, `Mia ơi, tìm số ${vi(n)} nào!`),
  yesNumber: (n) =>
    line(`yes_number_${n}`, `Yes! Number ${en(n)}!`, `Đúng rồi! Số ${vi(n)}!`),
  howMany(item) {
    return item === 'apple'
      ? line('how_many_apples', 'Mia, how many apples?', 'Mia ơi, có mấy quả táo?')
      : line('how_many_flowers', 'Mia, how many flowers?', 'Mia ơi, có mấy bông hoa?');
  },
  yesCount: (n) => line(`yes_count_${n}`, `Yes! ${cap(en(n))}!`, `Đúng rồi! ${cap(vi(n))}!`),

  // --- shapes and colours ---
  findShape: (shape) =>
    line(`find_shape_${shape}`, `Mia, find the ${shape}!`, `Mia ơi, tìm ${shapeVi(shape)} nào!`),
  yesShape: (shape) =>
    line(`yes_shape_${shape}`, `Yes! The ${shape}!`, `Đúng rồi! ${cap(shapeVi(shape))}!`),
  findFlower: (color) =>
    line(
      `find_flower_${color}`,
      `Mia, find the ${color} flower!`,
      `Mia ơi, tìm bông hoa màu ${colorVi(color)} nào!`
    ),
  yesColor: (color) =>
    line(`yes_color_${color}`, `Yes! ${cap(color)}!`, `Đúng rồi! Màu ${colorVi(color)}!`),

  // --- comparing and patterns ---
  more: () =>
    line('more', 'Mia, which side has more apples?', 'Mia ơi, bên nào nhiều táo hơn?'),
  fewer: () =>
    line('fewer', 'Mia, which side has fewer apples?', 'Mia ơi, bên nào ít táo hơn?'),
  yesMore: () => line('yes_more', 'Yes! This side has more!', 'Đúng rồi! Bên này nhiều hơn!'),
  yesFewer: () => line('yes_fewer', 'Yes! This side has fewer!', 'Đúng rồi! Bên này ít hơn!'),
  pattern: () => line('pattern', 'Mia, what comes next?', 'Mia ơi, tiếp theo là gì nhỉ?'),
  yesPattern: () =>
    line('yes_pattern', 'Yes! You found the pattern!', 'Đúng rồi! Mia tìm ra quy luật rồi!'),

  // --- adding and taking away ---
  add: (a, b) =>
    line(
      `add_${a}_${b}`,
      `Pony has ${apples(a)}. Here ${b === 1 ? 'is' : 'are'} ${en(b)} more. How many apples, Mia?`,
      `Pony có ${vi(a)} quả táo. Thêm ${vi(b)} quả nữa. Có tất cả mấy quả táo hả Mia?`
    ),
  addYes: (a, b) =>
    line(
      `add_yes_${a}_${b}`,
      `Yes! ${cap(en(a))} and ${en(b)} make ${en(a + b)}!`,
      `Đúng rồi! ${cap(vi(a))} cộng ${vi(b)} bằng ${vi(a + b)}!`
    ),
  sub: (a, b) =>
    line(
      `sub_${a}_${b}`,
      `Pony has ${apples(a)}. Pony eats ${en(b)}. How many are left, Mia?`,
      `Pony có ${vi(a)} quả táo. Pony ăn ${vi(b)} quả. Còn lại mấy quả hả Mia?`
    ),
  subYes: (a, b) =>
    line(
      `sub_yes_${a}_${b}`,
      `Yes! ${cap(en(a))} take away ${en(b)} is ${en(a - b)}!`,
      `Đúng rồi! ${cap(vi(a))} trừ ${vi(b)} bằng ${vi(a - b)}!`
    ),

  // --- makeup, outfits, picture words ---
  makeup(part, color) {
    const p = MAKEUP.find((m) => m.id === part);
    return line(`makeup_${part}_${color}`, `Mia, find the ${color} ${p.en}!`, `Mia ơi, tìm ${p.vi} màu ${colorVi(color)} nào!`);
  },
  makeupYes(part, color) {
    const p = MAKEUP.find((m) => m.id === part);
    return line(`makeup_yes_${part}_${color}`, `Yes! ${cap(color)} ${p.en}! So pretty!`, `Đúng rồi! ${cap(p.vi)} màu ${colorVi(color)}! Xinh quá!`);
  },
  makeupDone: () => line('makeup_done', 'Wow! Mia looks beautiful!', 'Ồ! Mia xinh quá!'),
  findOutfit(id) {
    const o = OUTFITS.find((x) => x.id === id);
    return line(`outfit_${id}`, `${o.whenEn}. Mia, find the ${o.en}!`, `${o.whenVi}. Mia ơi, tìm ${o.vi} nào!`);
  },
  yesOutfit(id) {
    const o = OUTFITS.find((x) => x.id === id);
    return line(`outfit_yes_${id}`, `Yes! The ${o.en}!`, `Đúng rồi! ${cap(o.vi)}!`);
  },
  findWord(id) {
    const w = WORDS.find((x) => x.id === id);
    return line(`word_${id}`, `Mia, find the ${id}!`, `Mia ơi, tìm ${w.vi} nào!`);
  },
  yesWord(id) {
    const w = WORDS.find((x) => x.id === id);
    return line(`word_yes_${id}`, `Yes! The ${id}!`, `Đúng rồi! ${cap(w.vi)}!`);
  },
  firstLetter(id) {
    const w = WORDS.find((x) => x.id === id);
    return line(`first_${id}`, `${cap(id)}. Which letter does ${id} start with, Mia?`, `${cap(w.vi)} tiếng Anh là "${id}". Chữ đầu tiên của "${id}" là chữ gì hả Mia?`);
  },
  yesFirst(id) {
    const letter = id.charAt(0).toUpperCase();
    return line(`first_yes_${id}`, `Yes! ${cap(id)} starts with ${letter}!`, `Đúng rồi! "${cap(id)}" bắt đầu bằng chữ ${letter}!`);
  },

  // --- number sense ---
  missing: () => line('missing', 'Mia, which number is missing?', 'Mia ơi, số nào còn thiếu?'),
  bigger: () => line('bigger', 'Mia, which number is bigger?', 'Mia ơi, số nào lớn hơn?'),
  smaller: () => line('smaller', 'Mia, which number is smaller?', 'Mia ơi, số nào nhỏ hơn?'),
  yesBigger: () => line('yes_bigger', 'Yes! That number is bigger!', 'Đúng rồi! Số đó lớn hơn!'),
  yesSmaller: () => line('yes_smaller', 'Yes! That number is smaller!', 'Đúng rồi! Số đó nhỏ hơn!'),

  // --- letters ---
  findLetter: (letter) =>
    line(
      `find_letter_${letter.toLowerCase()}`,
      `Mia, find the letter ${letter}!`,
      `Mia ơi, tìm chữ ${letter} nào!`
    ),
  yesLetter: (letter) =>
    line(
      `yes_letter_${letter.toLowerCase()}`,
      `Yes! The letter ${letter}!`,
      `Đúng rồi! Chữ ${letter}!`
    ),

  all() {
    const out = [
      this.hello(),
      this.praise(0),
      this.praise(1),
      this.praise(2),
      this.stageDone(),
      this.tryAgain(),
      this.countAgain(),
      this.locked(),
      this.dressUpDone(),
      this.howMany('apple'),
      this.howMany('flower'),
      this.more(),
      this.fewer(),
      this.yesMore(),
      this.yesFewer(),
      this.pattern(),
      this.yesPattern(),
    ];
    for (const who of ['tintin', 'mommy', 'daddy']) {
      out.push(this.buddyHello(who), this.buddyDone(who));
    }
    for (const p of PARTS) {
      for (const c of COLORS) out.push(this.find(p.id, c.id), this.yes(p.id, c.id));
    }
    for (const c of COLORS) {
      out.push(this.thatIs(c.id), this.findFlower(c.id), this.yesColor(c.id));
    }
    for (const s of SHAPES) out.push(this.findShape(s.id), this.yesShape(s.id));
    for (let n = 1; n <= 20; n++) {
      out.push(this.number(n), this.findNumber(n), this.yesNumber(n), this.yesCount(n));
      if (n <= 10) out.push(this.give(n), this.giveYes(n));
    }
    out.push(this.makeupDone(), this.missing(), this.bigger(), this.smaller(), this.yesBigger(), this.yesSmaller());
    for (const m of MAKEUP) {
      for (const c of COLORS) out.push(this.makeup(m.id, c.id), this.makeupYes(m.id, c.id));
    }
    for (const o of OUTFITS) out.push(this.findOutfit(o.id), this.yesOutfit(o.id));
    for (const w of WORDS) {
      out.push(this.findWord(w.id), this.yesWord(w.id), this.firstLetter(w.id), this.yesFirst(w.id));
    }
    for (let a = 1; a <= 9; a++) {
      for (let b = 1; b <= 9; b++) {
        if (a + b <= 10) out.push(this.add(a, b), this.addYes(a, b));
      }
    }
    for (let a = 2; a <= 10; a++) {
      for (let b = 1; b < a; b++) out.push(this.sub(a, b), this.subYes(a, b));
    }
    for (const letter of LETTERS) out.push(this.findLetter(letter), this.yesLetter(letter));
    return out;
  },
};
