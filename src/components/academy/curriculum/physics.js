import { build, rand, shuffle } from './helpers.js';
import { EN, enAsk } from './en.js';

// Vật lý cơ bản — lực, điện, ánh sáng, âm thanh, máy đơn giản; rồi tư duy lập trình cho robot.
// A fact question: [emoji, question vi, question el, [answer vi, answer el] (right first), ...wrong answers]

const fact = (prefix, rows) => () => {
  const i = rand(0, rows.length - 1);
  const [emoji, qVi, qEl, right, ...wrong] = rows[i];
  return {
    sig: prefix + i,
    ask: { vi: qVi, el: qEl, en: EN[qVi] },
    target: null,
    show: { kind: 'emoji', value: emoji },
    choiceStyle: 'text',
    choices: shuffle([
      { label: { vi: right[0], el: right[1], en: EN[right[0]] }, correct: true },
      ...wrong.map((w) => ({ label: { vi: w[0], el: w[1], en: EN[w[0]] }, correct: false })),
    ]),
    explain: {
      vi: 'Đáp án đúng: ' + right[0] + '.',
      el: 'Σωστό: ' + right[1] + '.',
      en: 'The answer is: ' + (EN[right[0]] || right[0]) + '.',
    },
  };
};

// Yes/no or two-way sorting: [emoji, thing vi, thing el, answer index]
const sorter = (prefix, askVi, askEl, answers, rows) => () => {
  const i = rand(0, rows.length - 1);
  const [emoji, vi, el, ok] = rows[i];
  return {
    sig: prefix + i,
    ask: { vi: askVi.replace('{x}', vi), el: askEl.replace('{x}', el), en: enAsk(askVi, vi) },
    target: null,
    show: { kind: 'emoji', value: emoji, sub: { vi, el, en: EN[vi] } },
    choiceStyle: 'text',
    choices: answers.map((a, k) => ({ label: a, correct: k === ok })),
    explain: {
      vi: vi + ': ' + answers[ok].vi + '.',
      el: el + ': ' + answers[ok].el + '.',
      en: (EN[vi] || vi) + ': ' + EN[answers[ok].vi] + '.',
    },
  };
};

const PUSH = { vi: 'Đẩy', el: 'Σπρώχνω' };
const PULL = { vi: 'Kéo', el: 'Τραβώ' };
const pushPull = sorter(
  'pp',
  '{x}: là đẩy hay kéo?',
  '{x}: σπρώχνω ή τραβώ;',
  [PUSH, PULL],
  [
    ['⚽', 'Đá quả bóng', 'Κλωτσάω την μπάλα', 0],
    ['🛒', 'Đẩy xe hàng siêu thị', 'Το καρότσι του σούπερ μάρκετ', 0],
    ['🐕', 'Dắt chó bằng dây', 'Βγάζω βόλτα τον σκύλο με λουρί', 1],
    ['🪁', 'Giữ dây diều', 'Κρατάω τον σπάγκο του χαρταετού', 1],
    ['🛷', 'Kéo xe trượt tuyết', 'Το έλκηθρο με σχοινί', 1],
    ['🔔', 'Bấm chuông cửa', 'Πατάω το κουδούνι', 0],
    ['🧥', 'Kéo khóa áo khoác', 'Το φερμουάρ του μπουφάν', 1],
    ['🏀', 'Ném bóng rổ', 'Ρίχνω την μπάλα στο καλάθι', 0],
    ['🚪', 'Mở ngăn kéo', 'Ανοίγω το συρτάρι', 1],
    ['🎹', 'Bấm phím đàn', 'Πατάω τα πλήκτρα', 0],
  ]
);

const GRAVITY = [
  [
    '🍎',
    'Thả quả táo ra, quả táo sẽ đi đâu?',
    'Αφήνω το μήλο. Πού πάει;',
    ['Rơi xuống đất', 'Πέφτει κάτω'],
    ['Bay lên trời', 'Πετάει πάνω'],
    ['Đứng yên giữa không trung', 'Μένει στον αέρα'],
  ],
  [
    '🏐',
    'Ném bóng lên cao, vì sao bóng lại rơi xuống?',
    'Γιατί η μπάλα ξαναπέφτει;',
    ['Trái Đất kéo bóng xuống', 'Η Γη την τραβάει'],
    ['Gió thổi bóng xuống', 'Τη σπρώχνει ο αέρας'],
    ['Bóng bị mệt', 'Κουράζεται'],
  ],
  [
    '🌍',
    'Lực kéo mọi vật về phía Trái Đất gọi là gì?',
    'Πώς λέγεται η δύναμη που τραβάει τα πάντα προς τη Γη;',
    ['Trọng lực', 'Βαρύτητα'],
    ['Ma sát', 'Τριβή'],
    ['Lực từ', 'Μαγνητισμός'],
  ],
  [
    '📄',
    'Tờ giấy phẳng và tờ giấy vo tròn, thả cùng lúc. Tờ nào chạm đất trước?',
    'Ένα ίσιο χαρτί κι ένα τσαλακωμένο. Ποιο πέφτει πρώτο;',
    ['Tờ vo tròn', 'Το τσαλακωμένο'],
    ['Tờ phẳng', 'Το ίσιο'],
    ['Không tờ nào rơi', 'Κανένα'],
  ],
  [
    '🪂',
    'Cái dù giúp người nhảy dù rơi thế nào?',
    'Το αλεξίπτωτο κάνει την πτώση…',
    ['Chậm hơn', 'Πιο αργή'],
    ['Nhanh hơn', 'Πιο γρήγορη'],
    ['Bay ngược lên', 'Προς τα πάνω'],
  ],
  [
    '🌙',
    'Trên Mặt Trăng trọng lực yếu hơn. Nhảy lên sẽ thế nào?',
    'Στη Σελήνη η βαρύτητα είναι μικρότερη. Αν πηδήξεις…',
    ['Bay cao hơn, rơi chậm hơn', 'Πας πιο ψηλά, πέφτεις πιο αργά'],
    ['Không nhảy được', 'Δεν μπορείς να πηδήξεις'],
    ['Bay mãi không rơi', 'Δεν πέφτεις ποτέ'],
  ],
  [
    '💧',
    'Nước tự chảy theo hướng nào?',
    'Πώς κυλάει μόνο του το νερό;',
    ['Từ cao xuống thấp', 'Από ψηλά προς τα κάτω'],
    ['Từ thấp lên cao', 'Από κάτω προς τα πάνω'],
    ['Không chảy', 'Δεν κυλάει'],
  ],
];

const FRICTION = [
  [
    '🧊',
    'Đi trên mặt nào dễ trượt ngã nhất?',
    'Πού γλιστράμε πιο εύκολα;',
    ['Mặt băng', 'Στον πάγο'],
    ['Tấm thảm', 'Στο χαλί'],
    ['Bãi cỏ', 'Στο γρασίδι'],
  ],
  [
    '👟',
    'Vì sao đế giày có nhiều rãnh?',
    'Γιατί οι σόλες έχουν αυλάκια;',
    ['Để bám đường, không trượt', 'Για να μη γλιστράμε'],
    ['Để giày nhẹ hơn', 'Για να είναι ελαφριά'],
    ['Chỉ để trang trí', 'Μόνο για ομορφιά'],
  ],
  [
    '🤲',
    'Xoa mạnh hai bàn tay vào nhau, tay sẽ thế nào?',
    'Τρίβω τα χέρια μου. Τι νιώθω;',
    ['Ấm lên', 'Ζεσταίνονται'],
    ['Lạnh đi', 'Κρυώνουν'],
    ['Ướt', 'Βρέχονται'],
  ],
  [
    '🚲',
    'Đạp xe trên mặt nào khó đi nhất?',
    'Πού είναι πιο δύσκολο το ποδήλατο;',
    ['Bãi cát', 'Στην άμμο'],
    ['Đường nhựa', 'Στον δρόμο'],
    ['Sàn nhà', 'Στο πάτωμα'],
  ],
  [
    '🛝',
    'Lực làm vật đang trượt chậm dần lại gọi là gì?',
    'Η δύναμη που φρενάρει ένα αντικείμενο που γλιστράει;',
    ['Ma sát', 'Τριβή'],
    ['Trọng lực', 'Βαρύτητα'],
    ['Lực từ', 'Μαγνητισμός'],
  ],
  [
    '🎿',
    'Muốn trượt nhanh hơn, mặt trượt nên thế nào?',
    'Για να γλιστράμε πιο γρήγορα, η επιφάνεια πρέπει να είναι…',
    ['Nhẵn, trơn', 'Λεία'],
    ['Sần sùi', 'Τραχιά'],
    ['Có cát', 'Με άμμο'],
  ],
];

const YES = { vi: 'Có', el: 'Ναι' };
const NO = { vi: 'Không', el: 'Όχι' };
const magnet = sorter(
  'mg',
  'Nam châm có hút {x} không?',
  'Ο μαγνήτης τραβάει: {x};',
  [YES, NO],
  [
    ['📎', 'kẹp giấy bằng sắt', 'τον συνδετήρα', 0],
    ['🔩', 'con ốc sắt', 'τη βίδα', 0],
    ['✂️', 'cây kéo thép', 'το ψαλίδι', 0],
    ['🥫', 'lon đồ hộp bằng sắt', 'την κονσέρβα', 0],
    ['🪵', 'miếng gỗ', 'το ξύλο', 1],
    ['🧸', 'con gấu bông', 'το αρκουδάκι', 1],
    ['🥛', 'cốc thủy tinh', 'το γυάλινο ποτήρι', 1],
    ['🍌', 'quả chuối', 'την μπανάνα', 1],
    ['📄', 'tờ giấy', 'το χαρτί', 1],
    ['🪨', 'hòn đá', 'την πέτρα', 1],
  ]
);
const MAGNET_FACTS = [
  [
    '🧲',
    'Hai đầu nam châm cùng cực đặt gần nhau thì sao?',
    'Δύο ίδιοι πόλοι μαγνήτη…',
    ['Đẩy nhau ra', 'Απωθούνται'],
    ['Hút chặt vào nhau', 'Έλκονται'],
    ['Phát sáng', 'Ανάβουν'],
  ],
  [
    '🧭',
    'Kim la bàn luôn chỉ về hướng nào?',
    'Η πυξίδα δείχνει πάντα…',
    ['Hướng Bắc', 'Τον Βορρά'],
    ['Hướng Đông', 'Την Ανατολή'],
    ['Chỗ có kẹo', 'Τις καραμέλες'],
  ],
];

// Circuits drawn on screen: battery, bulb, switch.
const circuit = () => {
  const cases = [
    { battery: true, closed: true, broken: false, lit: true },
    { battery: true, closed: false, broken: false, lit: false },
    { battery: true, closed: true, broken: true, lit: false },
    { battery: false, closed: true, broken: false, lit: false },
    { battery: true, closed: true, broken: false, lit: true },
  ];
  const k = rand(0, cases.length - 1);
  const c = cases[k];
  const why = !c.battery
    ? { vi: 'Không có pin thì không có điện.', el: 'Χωρίς μπαταρία δεν έχει ρεύμα.' }
    : !c.closed
      ? { vi: 'Công tắc đang mở, mạch bị hở.', el: 'Ο διακόπτης είναι ανοιχτός.' }
      : c.broken
        ? { vi: 'Dây bị đứt, điện không chạy vòng được.', el: 'Το καλώδιο είναι κομμένο.' }
        : {
            vi: 'Mạch kín: điện chạy một vòng từ pin qua bóng đèn rồi về pin.',
            el: 'Το κύκλωμα είναι κλειστό.',
          };
  return {
    sig: 'cir' + k,
    ask: { vi: 'Bóng đèn này có sáng không?', el: 'Ανάβει η λάμπα;' },
    target: null,
    show: { kind: 'circuit', ...c, lit: false },
    reveal: { kind: 'circuit', ...c },
    choiceStyle: 'text',
    choices: [
      { label: { vi: 'Sáng', el: 'Ανάβει' }, correct: c.lit },
      { label: { vi: 'Không sáng', el: 'Δεν ανάβει' }, correct: !c.lit },
    ],
    explain: why,
    explainAlways: true,
  };
};

const conductor = sorter(
  'co',
  '{x} có cho điện chạy qua không?',
  'Περνάει ρεύμα από: {x};',
  [YES, NO],
  [
    ['🥄', 'cái thìa kim loại', 'το μεταλλικό κουτάλι', 0],
    ['📎', 'kẹp giấy', 'τον συνδετήρα', 0],
    ['🪙', 'đồng xu', 'το κέρμα', 0],
    ['🔌', 'lõi dây đồng', 'το χάλκινο σύρμα', 0],
    ['🪵', 'que gỗ', 'το ξύλο', 1],
    ['🧦', 'chiếc tất vải', 'την κάλτσα', 1],
    ['🎈', 'quả bóng cao su', 'το μπαλόνι', 1],
    ['🥤', 'cốc nhựa', 'το πλαστικό ποτήρι', 1],
    ['🧽', 'miếng bọt biển khô', 'το στεγνό σφουγγάρι', 1],
  ]
);
const ELECTRIC_SAFETY = [
  [
    '⚡',
    'Có được chọc đồ vật vào ổ điện không?',
    'Βάζουμε αντικείμενα στην πρίζα;',
    ['Không bao giờ, rất nguy hiểm', 'Ποτέ, είναι επικίνδυνο'],
    ['Được nếu cẩn thận', 'Ναι, με προσοχή'],
    ['Được nếu là thìa', 'Ναι, ένα κουτάλι'],
  ],
  [
    '🔋',
    'Pin cung cấp gì cho bóng đèn?',
    'Τι δίνει η μπαταρία στη λάμπα;',
    ['Năng lượng điện', 'Ηλεκτρική ενέργεια'],
    ['Nước', 'Νερό'],
    ['Không khí', 'Αέρα'],
  ],
];

const LIGHT = [
  [
    '🔦',
    'Vật nào tự phát ra ánh sáng?',
    'Ποιο βγάζει δικό του φως;',
    ['Đèn pin đang bật', 'Ο αναμμένος φακός'],
    ['Cái gương', 'Ο καθρέφτης'],
    ['Quyển sách', 'Το βιβλίο'],
  ],
  [
    '🌗',
    'Mặt Trăng sáng là nhờ đâu?',
    'Γιατί φωτίζει η Σελήνη;',
    ['Phản chiếu ánh sáng Mặt Trời', 'Αντανακλά το φως του Ήλιου'],
    ['Mặt Trăng tự cháy', 'Καίγεται'],
    ['Có đèn trên đó', 'Έχει λάμπες'],
  ],
  [
    '👤',
    'Cái bóng xuất hiện khi nào?',
    'Πότε έχουμε σκιά;',
    ['Khi có vật chắn ánh sáng', 'Όταν κάτι κρύβει το φως'],
    ['Khi trời tối hẳn', 'Όταν είναι σκοτάδι'],
    ['Khi trời mưa', 'Όταν βρέχει'],
  ],
  [
    '🪟',
    'Vật nào cho ánh sáng đi qua?',
    'Από ποιο περνάει το φως;',
    ['Kính cửa sổ', 'Το τζάμι'],
    ['Tấm gỗ', 'Το ξύλο'],
    ['Bức tường', 'Ο τοίχος'],
  ],
  [
    '🪞',
    'Cái gương làm gì với ánh sáng?',
    'Τι κάνει ο καθρέφτης στο φως;',
    ['Phản chiếu lại', 'Το ανακλά'],
    ['Nuốt mất ánh sáng', 'Το εξαφανίζει'],
    ['Biến thành nước', 'Το κάνει νερό'],
  ],
  [
    '☀️',
    'Buổi trưa nắng chiếu thẳng trên đầu, bóng của em thế nào?',
    'Το μεσημέρι ο ήλιος είναι ψηλά. Η σκιά σου είναι…',
    ['Rất ngắn', 'Πολύ κοντή'],
    ['Rất dài', 'Πολύ μακριά'],
    ['Biến thành màu đỏ', 'Κόκκινη'],
  ],
];

const SOUND = [
  [
    '🎸',
    'Gảy dây đàn, dây đàn làm gì để phát ra tiếng?',
    'Τι κάνει η χορδή για να βγάλει ήχο;',
    ['Rung lên', 'Δονείται'],
    ['Nóng lên', 'Ζεσταίνεται'],
    ['Đổi màu', 'Αλλάζει χρώμα'],
  ],
  [
    '🥁',
    'Âm thanh sinh ra khi vật…',
    'Ο ήχος δημιουργείται όταν κάτι…',
    ['Rung động', 'Δονείται'],
    ['Đứng yên', 'Μένει ακίνητο'],
    ['Bị lạnh', 'Κρυώνει'],
  ],
  [
    '🚀',
    'Ngoài vũ trụ không có không khí. Có nghe được tiếng nổ không?',
    'Στο διάστημα δεν υπάρχει αέρας. Ακούμε μια έκρηξη;',
    ['Không nghe được', 'Όχι'],
    ['Nghe rất to', 'Ναι, πολύ δυνατά'],
    ['Nghe thành nhạc', 'Ακούγεται σαν μουσική'],
  ],
  [
    '🙉',
    'Bịt hai tai lại thì tiếng ồn nghe thế nào?',
    'Αν κλείσω τα αυτιά μου, ο θόρυβος…',
    ['Nhỏ hơn', 'Ακούγεται πιο σιγά'],
    ['To hơn', 'Πιο δυνατά'],
    ['Không đổi', 'Ίδιος'],
  ],
  [
    '🐋',
    'Cá voi gọi nhau dưới biển. Âm thanh có đi trong nước được không?',
    'Ταξιδεύει ο ήχος μέσα στο νερό;',
    ['Có', 'Ναι'],
    ['Không', 'Όχι'],
    ['Chỉ ban ngày', 'Μόνο τη μέρα'],
  ],
  [
    '📯',
    'Tiếng vọng (echo) là gì?',
    'Τι είναι η ηχώ;',
    ['Âm thanh dội lại từ vách núi, bức tường', 'Ήχος που γυρίζει πίσω από τοίχο'],
    ['Một loài chim', 'Ένα πουλί'],
    ['Âm thanh của ánh sáng', 'Ο ήχος του φωτός'],
  ],
];

const MACHINES = [
  [
    '⚖️',
    'Cái bập bênh là loại máy đơn giản nào?',
    'Η τραμπάλα είναι…',
    ['Đòn bẩy', 'Μοχλός'],
    ['Ròng rọc', 'Τροχαλία'],
    ['Bánh xe', 'Τροχός'],
  ],
  [
    '🏳️',
    'Kéo lá cờ lên đỉnh cột dùng gì?',
    'Πώς ανεβαίνει η σημαία στον ιστό;',
    ['Ròng rọc', 'Με τροχαλία'],
    ['Đòn bẩy', 'Με μοχλό'],
    ['Nam châm', 'Με μαγνήτη'],
  ],
  [
    '🛞',
    'Bánh xe giúp ta…',
    'Ο τροχός μάς βοηθάει να…',
    ['Di chuyển đồ nặng dễ hơn', 'Μετακινούμε εύκολα βαριά πράγματα'],
    ['Làm đồ nặng hơn', 'Κάνουμε τα πράγματα βαρύτερα'],
    ['Phát ra ánh sáng', 'Βγάζουμε φως'],
  ],
  [
    '♿',
    'Con dốc thoải giúp đẩy xe lăn lên cao dễ hơn gọi là gì?',
    'Η ράμπα για το αναπηρικό καρότσι λέγεται…',
    ['Mặt phẳng nghiêng', 'Κεκλιμένο επίπεδο'],
    ['Ròng rọc', 'Τροχαλία'],
    ['Lò xo', 'Ελατήριο'],
  ],
  [
    '🍾',
    'Cái khui nắp chai dùng nguyên lý gì?',
    'Το ανοιχτήρι μπουκαλιών είναι…',
    ['Đòn bẩy', 'Μοχλός'],
    ['Nam châm', 'Μαγνήτης'],
    ['Trọng lực', 'Βαρύτητα'],
  ],
  [
    '🏗️',
    'Cần cẩu nâng vật nặng nhờ dây và…',
    'Ο γερανός σηκώνει βάρη με σχοινί και…',
    ['Ròng rọc', 'Τροχαλίες'],
    ['Bóng bay', 'Μπαλόνια'],
    ['Gương', 'Καθρέφτες'],
  ],
];

// ---- robot on a grid: the first steps into code ----
const DIRS = { '→': [1, 0], '←': [-1, 0], '↑': [0, -1], '↓': [0, 1] };
const pathFor = (from, to) => {
  const steps = [];
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  for (let i = 0; i < Math.abs(dx); i++) steps.push(dx > 0 ? '→' : '←');
  for (let i = 0; i < Math.abs(dy); i++) steps.push(dy > 0 ? '↓' : '↑');
  return steps;
};
const walk = (from, steps) => steps.reduce((p, s) => [p[0] + DIRS[s][0], p[1] + DIRS[s][1]], from);
const sameCell = (a, b) => a[0] === b[0] && a[1] === b[1];

const robot = (withLoops) => () => {
  const size = 5;
  let from, to, path;
  do {
    from = [rand(0, size - 1), rand(0, size - 1)];
    to = [rand(0, size - 1), rand(0, size - 1)];
    path = pathFor(from, to);
  } while (path.length < 2 || path.length > 6);
  const fmt = (steps) => {
    if (!withLoops) return steps.join(' ');
    // group runs: "lặp 3 × →"
    const out = [];
    let i = 0;
    while (i < steps.length) {
      let j = i;
      while (j < steps.length && steps[j] === steps[i]) j++;
      out.push(j - i > 1 ? '🔁' + (j - i) + '×' + steps[i] : steps[i]);
      i = j;
    }
    return out.join('  ');
  };
  const wrongs = [];
  const flip = { '→': '←', '←': '→', '↑': '↓', '↓': '↑' };
  wrongs.push(path.slice(0, -1));
  wrongs.push([...path, path[path.length - 1]]);
  wrongs.push(path.map((s, k) => (k === 0 ? flip[s] : s)));
  wrongs.push(path.map((s) => (s === '↑' || s === '↓' ? flip[s] : s)));
  wrongs.push(path.map((s) => (s === '→' || s === '←' ? flip[s] : s)));
  const seen = new Set([fmt(path)]);
  const choices = [{ label: fmt(path), correct: true }];
  for (const w of shuffle(wrongs)) {
    if (!w.length) continue;
    const end = walk(from, w);
    const label = fmt(w);
    if (seen.has(label) || sameCell(end, to)) continue;
    seen.add(label);
    choices.push({ label, correct: false });
    if (choices.length >= 3) break;
  }
  return {
    sig: 'rb' + from + to,
    ask: withLoops
      ? {
          vi: 'Chọn chương trình ngắn nhất có vòng lặp 🔁 để robot đến ngôi sao.',
          el: 'Διάλεξε το πρόγραμμα με επανάληψη 🔁 για να φτάσει το ρομπότ στο αστέρι.',
        }
      : {
          vi: 'Chọn dãy lệnh đưa robot đến ngôi sao.',
          el: 'Ποιες εντολές πάνε το ρομπότ στο αστέρι;',
        },
    target: null,
    show: { kind: 'grid', size, from, to },
    choiceStyle: 'code',
    choices: shuffle(choices),
    explain: {
      vi: 'Đếm từng ô: ' + fmt(path),
      el: 'Μέτρα τα τετράγωνα: ' + fmt(path),
      en: 'Count the squares: ' + fmt(path),
    },
  };
};

const LOGIC = [
  [
    '🚦',
    'Lệnh cho robot: NẾU đèn đỏ THÌ dừng. Đèn đang đỏ, robot làm gì?',
    'ΑΝ είναι κόκκινο ΤΟΤΕ σταμάτα. Είναι κόκκινο. Τι κάνει το ρομπότ;',
    ['Dừng lại', 'Σταματά'],
    ['Chạy tiếp', 'Συνεχίζει'],
    ['Quay vòng', 'Γυρίζει'],
  ],
  [
    '🧱',
    'NẾU gặp tường THÌ rẽ phải. Robot gặp tường, robot sẽ…',
    'ΑΝ βρεις τοίχο ΤΟΤΕ στρίψε δεξιά. Το ρομπότ βρίσκει τοίχο…',
    ['Rẽ phải', 'Στρίβει δεξιά'],
    ['Đâm vào tường', 'Πέφτει στον τοίχο'],
    ['Rẽ trái', 'Στρίβει αριστερά'],
  ],
  [
    '🔁',
    'Lệnh "Lặp 3 lần: nhảy" làm robot nhảy mấy lần?',
    'Η εντολή "Επανάλαβε 3 φορές: πήδα" — πόσα πηδήματα;',
    ['3 lần', '3'],
    ['1 lần', '1'],
    ['30 lần', '30'],
  ],
  [
    '🤖',
    'Máy tính và robot làm theo lệnh như thế nào?',
    'Πώς ακολουθεί εντολές ο υπολογιστής;',
    ['Đúng từng lệnh, theo thứ tự', 'Ακριβώς, με τη σειρά'],
    ['Tự đoán ý mình', 'Μαντεύει τι θέλουμε'],
    ['Làm lệnh nào thích', 'Ό,τι του αρέσει'],
  ],
  [
    '🐞',
    'Chương trình chạy sai, lỗi đó gọi là gì?',
    'Πώς λέγεται ένα λάθος στο πρόγραμμα;',
    ['Bug (lỗi)', 'Bug (σφάλμα)'],
    ['Pin', 'Μπαταρία'],
    ['Robot', 'Ρομπότ'],
  ],
  [
    '🍳',
    'Làm trứng chiên, bước nào phải làm TRƯỚC?',
    'Για τηγανητό αυγό, τι κάνουμε ΠΡΩΤΑ;',
    ['Đập trứng vào chảo', 'Σπάμε το αυγό στο τηγάνι'],
    ['Ăn trứng', 'Τρώμε το αυγό'],
    ['Rửa đĩa', 'Πλένουμε το πιάτο'],
  ],
];

const L = (id, vi, elTitle, make) => ({ id: 'ph-' + id, title: { vi, el: elTitle }, make });
const ten =
  (...gens) =>
  () =>
    build(10, gens);

export const PHYSICS = {
  id: 'physics',
  title: { vi: 'Vật lý & Robot', el: 'Φυσική & Ρομπότ' },
  short: '⚡',
  color: '#14b8a6',
  units: [
    {
      title: { vi: 'Lực và chuyển động', el: 'Δυνάμεις και κίνηση' },
      lessons: [
        L('push', 'Đẩy và kéo', 'Σπρώχνω και τραβώ', ten(pushPull)),
        L('grav', 'Trọng lực: vì sao vật rơi', 'Η βαρύτητα', ten(fact('gr', GRAVITY))),
        L('fric', 'Ma sát: trơn hay bám', 'Η τριβή', ten(fact('fr', FRICTION))),
        L('mag', 'Nam châm', 'Ο μαγνήτης', ten(magnet, magnet, fact('mf', MAGNET_FACTS))),
      ],
    },
    {
      title: { vi: 'Điện, ánh sáng, âm thanh', el: 'Ρεύμα, φως, ήχος' },
      lessons: [
        L(
          'circ',
          'Mạch điện: đèn có sáng không?',
          'Το κύκλωμα',
          ten(circuit, circuit, fact('es', ELECTRIC_SAFETY))
        ),
        L('cond', 'Vật dẫn điện, vật cách điện', 'Αγωγοί και μονωτές', ten(conductor)),
        L('light', 'Ánh sáng và bóng', 'Φως και σκιά', ten(fact('li', LIGHT))),
        L('sound', 'Âm thanh', 'Ο ήχος', ten(fact('so', SOUND))),
        L('mach', 'Máy đơn giản: đòn bẩy, ròng rọc', 'Απλές μηχανές', ten(fact('ma', MACHINES))),
      ],
    },
    {
      title: { vi: 'Lập trình robot', el: 'Προγραμματισμός ρομπότ' },
      lessons: [
        L('rob1', 'Ra lệnh cho robot', 'Εντολές στο ρομπότ', ten(robot(false))),
        L('rob2', 'Vòng lặp 🔁', 'Επανάληψη 🔁', ten(robot(true))),
        L('logic', 'Nếu… thì… và thứ tự', 'Αν… τότε…', ten(fact('lg', LOGIC))),
      ],
    },
  ],
};
