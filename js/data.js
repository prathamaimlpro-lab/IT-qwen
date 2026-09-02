import { LESSONS2, QUESTIONS2 } from './content2.js';
/* IT QUEST v2 — content brain: levels, deep lessons, per-topic questions, arena, achievements. */

export const XP = { lesson: 10, easy: 20, medium: 40, hard: 80, gate: 30, arena: 40 };
export const DAILY_GOAL_XP = 30;

export const PLAYER_LEVELS = [
  { level: 1, minXp: 0,    title: 'Rookie',    avatar: '🌱' },
  { level: 2, minXp: 100,  title: 'Apprentice',avatar: '' },
  { level: 3, minXp: 250,  title: 'Builder',   avatar: '🛠️' },
  { level: 4, minXp: 500,  title: 'Engineer',  avatar: '⚙️' },
  { level: 5, minXp: 1000, title: 'Architect', avatar: '🏛️' }
];
export function levelInfo(xp) {
  let cur = PLAYER_LEVELS[0];
  for (const l of PLAYER_LEVELS) if (xp >= l.minXp) cur = l;
  const i = PLAYER_LEVELS.indexOf(cur), nxt = PLAYER_LEVELS[i + 1] || null;
  const into = xp - cur.minXp, span = nxt ? nxt.minXp - cur.minXp : 0;
  return { level: cur.level, title: cur.title, avatar: cur.avatar, isMax: !nxt, into, span,
    need: nxt ? nxt.minXp - xp : 0, pct: nxt ? Math.min(100, Math.round(into / span * 100)) : 100,
    nextLevel: nxt ? nxt.level : null, nextTitle: nxt ? nxt.title : null };
}

export const LEVELS = [
  { id: 'l0', num: 0, icon: '🖥️', title: 'Computer Basics', tagline: 'Start here. Zero experience needed.',
    lessons: [
      { id: 'cb-computer', title: 'What Is a Computer?', minutes: 10 },
      { id: 'cb-cpu',      title: 'CPU — The Thinking Machine', minutes: 12 },
      { id: 'cb-mem',      title: 'RAM & Storage — Memory That Stays', minutes: 12 },
      { id: 'cb-files',    title: 'Files & Folders', minutes: 10, soon: true },
      { id: 'cb-paths',    title: 'Paths & Extensions', minutes: 10, soon: true },
      { id: 'cb-os',       title: 'Operating Systems', minutes: 12, soon: true },
      { id: 'cb-term',     title: 'Terminal & Linux Basics', minutes: 12, soon: true }
    ] },
  { id: 'l1', num: 1, icon: '💻', title: 'Programming', tagline: 'Think like a programmer.', soon: true, lessons: [] },
  { id: 'l2', num: 2, icon: '🐧', title: 'Linux + Git', tagline: 'Work like a real developer.', soon: true, lessons: [] },
  { id: 'l3', num: 3, icon: '🧩', title: 'DSA', tagline: 'The engine room of fast software.', soon: true, lessons: [] },
  { id: 'l4', num: 4, icon: '🗄️', title: 'Databases + SQL', tagline: 'Where data lives.', soon: true, lessons: [] },
  { id: 'l5', num: 5, icon: '🌐', title: 'Networking', tagline: 'How messages cross the world.', soon: true, lessons: [] }
];

/* ---- Deep lessons: 10-layer template (analogy→basics→mechanism→viz→activity→realworld→pitfalls→deepdive→interview→summary+gate) ---- */
export const LESSONS = {
  'cb-computer': {
    title: 'What Is a Computer?',
    blocks: [
      { kind: 'analogy', title: 'The Kitchen', html: 'Think of a restaurant kitchen. Order slips coming in are the <b>input</b>. The chefs cooking are the <b>processing</b>. The plated dish served to you is the <b>output</b>. The pantry and fridge — where ingredients wait for later — that is <b>storage</b>. Every computer on Earth is this kitchen, just faster.' },
      { kind: 'p', html: 'A <b class="tm">computer</b> is an electronic machine that does four jobs: it takes in information (<b>input</b>), works on it (<b>processing</b>), gives back a result (<b>output</b>), and remembers things for later (<b>storage</b>). The information itself is called <b class="tm">data</b>: numbers, text, photos, sounds, taps.' },
      { kind: 'terms', items: [
        { t: 'Data', d: 'Any information a computer can work with.' },
        { t: 'Hardware', d: 'The physical parts you can touch.' },
        { t: 'Software', d: 'The invisible instructions telling hardware what to do.' } ] },
      { kind: 'steps', title: 'The four jobs, in order', items: [
        '<b>Input</b> — a keyboard, mic, camera or touchscreen sends data in.',
        '<b>Processing</b> — the CPU follows instructions and calculates.',
        '<b>Output</b> — screen, speakers or printer give you the result.',
        '<b>Storage</b> — saved data survives even when power goes off.' ] },
      { kind: 'viz', id: 'pipeline', title: 'Run the machine yourself' },
      { kind: 'realworld', title: 'Industrial view', html: 'Your phone, a smart TV, an ATM, a car, a factory robot — all computers. A modern CPU performs <b>billions</b> of steps per second, yet it is never "smart": it only follows instructions extremely fast. Engineers design systems by asking: <i>what is the input, what is the output, and where is the state stored?</i> — the same four jobs at any scale.' },
      { kind: 'pitfall', title: 'Beginner traps', html: '① "Computers are smart" — no; they are fast obedient machines. ② A touchscreen is <b>both</b> input (your tap) and output (the picture). ③ If it was never <b>saved</b>, power-off kills it — storage is a deliberate step, not magic.' },
      { kind: 'deepdive', title: 'Under the hood', html: 'Deep down, all data is just <b>bits</b> — on/off switches (1/0). A photo, a song, this lesson: all of it is billions of 1s and 0s grouped into patterns. Eight bits make a <b>byte</b>, the classic unit of storage (KB, MB, GB, TB).' },
      { kind: 'interview', title: 'Interview angle', html: '"Name the four jobs of a computer and give one real example of each." You can now answer this in one breath — that is exactly what interviews test: crisp fundamentals.' },
      { kind: 'summary', points: [
        'Four jobs: input → processing → output, plus storage.',
        'Data = any information: numbers, text, photos, sound.',
        'The CPU processes; screens/speakers output; storage remembers.',
        'Everything is bits (1/0) grouped into bytes.' ] }
    ]
  },
  'cb-cpu': {
    title: 'CPU — The Thinking Machine',
    blocks: [
      { kind: 'analogy', title: 'The Recipe Follower', html: 'A CPU is a chef who never invents: it reads one instruction ("crack egg"), does it, reads the next ("stir"), does it — billions of times per second, without ever getting tired or bored.' },
      { kind: 'p', html: 'The <b class="tm">CPU</b> (Central Processing Unit) is the chip that executes every instruction of every program. A <b class="tm">program</b> is just a long list of tiny instructions stored in memory, waiting for the CPU to pick them up.' },
      { kind: 'steps', title: 'Fetch → Decode → Execute', items: [
        '<b>Fetch</b> — the CPU grabs the next instruction from memory.',
        '<b>Decode</b> — it figures out what the instruction means.',
        '<b>Execute</b> — it does it (calculate, move data, decide).',
        'Then repeat. Forever. This loop is called the <b>instruction cycle</b>.' ] },
      { kind: 'viz', id: 'cpu', title: 'Watch the instruction cycle' },
      { kind: 'realworld', title: 'Cores & GHz', html: 'A <b>core</b> is one instruction-following worker; a "quad-core" CPU has four chefs in one kitchen. <b>Clock speed</b> (GHz) = how many steps per second each worker takes (3 GHz ≈ 3 billion steps/sec). Real systems balance cores vs speed: games want speed, servers want cores.' },
      { kind: 'pitfall', title: 'Beginner traps', html: '① CPU ≠ memory: the CPU <i>works</i>, RAM <i>holds</i>. ② More GHz isn\'t always faster — architecture matters. ③ The CPU gets hot doing this loop; that\'s why fans and throttling exist.' },
      { kind: 'deepdive', title: 'Cache — the CPU\'s pocket', html: 'Fetching from RAM is slow for a CPU, so it keeps a tiny super-fast memory called <b>cache</b> (L1/L2/L3) right on the chip. Keeping data close to the CPU is one of the biggest ideas in all of engineering — you\'ll meet it again in databases and web systems.' },
      { kind: 'interview', title: 'Interview angle', html: '"Explain the instruction cycle." Answer: fetch, decode, execute, repeat — then add that cache and cores exist to feed that loop faster. Instant credibility.' },
      { kind: 'summary', points: [
        'The CPU executes program instructions.',
        'Instruction cycle: fetch → decode → execute → repeat.',
        'Cores = parallel workers; GHz = steps per second.',
        'Cache keeps data close so the loop never waits.' ] }
    ]
  },
  'cb-mem': {
    title: 'RAM & Storage — Memory That Stays',
    blocks: [
      { kind: 'analogy', title: 'Desk vs Bookshelf', html: 'RAM is your <b>desk</b>: small, fast, everything you\'re working on right now. Storage is the <b>bookshelf</b>: huge, slower, but things stay there forever. When you open a file, you carry it from the shelf to the desk. When the lights go out, the desk is cleared — the shelf is not.' },
      { kind: 'p', html: '<b class="tm">RAM</b> (Random Access Memory) is fast temporary workspace: it empties when power goes off (<b>volatile</b>). <b class="tm">Storage</b> (SSD/HDD) is long-term: files stay (<b>non-volatile</b>). This is why "saving" is a real action: it copies your work from desk to shelf.' },
      { kind: 'steps', title: 'Opening an app', items: [
        'The app\'s files sit on <b>storage</b> (shelf).',
        'On tap, they are copied into <b>RAM</b> (desk).',
        'The <b>CPU</b> works on them from RAM — fast.',
        'When you <b>save</b>, results go back to storage.' ] },
      { kind: 'viz', id: 'mem', title: 'Power off: what survives?' },
      { kind: 'realworld', title: 'GB, TB, SSD vs HDD', html: 'Phones ship with 8–12 GB RAM and 128–512 GB storage — notice storage is ~40× bigger. <b>SSDs</b> (chips, no moving parts) replaced <b>HDDs</b> (spinning disks) and made whole computers feel instant. Engineers size RAM for multitasking and storage for how much you keep.' },
      { kind: 'pitfall', title: 'Beginner traps', html: '① "More RAM = more space for photos" — no, that\'s storage. ② Clearing RAM never deletes files. ③ Unsaved work lives only on the desk — a crash empties the desk.' },
      { kind: 'deepdive', title: 'When the desk is full', html: 'If RAM runs out, the OS borrows storage as fake RAM (<b>swap/page file</b>) — and everything slows down, because shelves are slower than desks. That lag you feel on an overloaded phone is exactly this.' },
      { kind: 'interview', title: 'Interview angle', html: '"RAM vs storage?" → volatile vs non-volatile, fast vs large, workspace vs keeping-place. One crisp sentence each, with the desk/shelf analogy as a bonus.' },
      { kind: 'summary', points: [
        'RAM = fast, volatile workspace; Storage = slow, permanent keeping-place.',
        'Opening = storage→RAM; Saving = RAM→storage.',
        'SSDs made computers instant; sizes: GB/TB.',
        'Full RAM → swap → lag.' ] }
    ]
  }
};

/* ---- Per-topic question banks (3 tiers, wrong-option explanations, hints, tags) ---- */
export const QUESTIONS = {
  'cb-computer': [
    { id: 'q-c1', tier: 'concept', tags: ['io'], q: 'A microphone capturing your voice is an example of…', options: ['Output', 'Input', 'Storage', 'Processing'], answer: 1, hint: 'Is data going IN or coming OUT?', explain: 'The mic sends data INTO the computer — input.', wrongWhy: ['Output is results given back to you.', '', 'Storage keeps data for later.', 'Processing happens inside the CPU.'] },
    { id: 'q-c2', tier: 'concept', tags: ['storage'], q: 'Which job keeps your photo safe after power goes off?', options: ['Processing', 'Output', 'Storage', 'Input'], answer: 2, hint: 'The "shelf", not the "desk".', explain: 'Storage is non-volatile — saved data survives power-off.', wrongWhy: ['Processing works on data, it doesn\'t keep it.', 'Output shows results.', '', 'Input sends data in.'] },
    { id: 'q-c3', tier: 'apply', tags: ['io'], q: 'You tap "play"; the song plays from speakers. Tap = ? Speakers = ?', options: ['Tap output, speakers input', 'Tap input, speakers output', 'Both input', 'Both output'], answer: 1, hint: 'Follow the direction of data.', explain: 'The tap goes in (input); sound comes out (output).', wrongWhy: ['Backwards — the tap goes in, sound comes out.', '', 'They face opposite directions.', 'No — the tap is received, the sound is produced.'] },
    { id: 'q-c4', tier: 'apply', tags: ['bits'], q: 'A text file grows by 8 characters (1 byte each). How much did it grow?', options: ['8 bits', '1 byte', '8 bytes', '64 bytes'], answer: 2, hint: '1 character = 1 byte here.', explain: '8 characters × 1 byte = 8 bytes (which is 64 bits).', wrongWhy: ['8 bits would be only 1 byte.', 'That\'s one character only.', '', 'That would be 64 characters.'] },
    { id: 'q-c5', tier: 'industrial', tags: ['systems'], q: 'An engineer designing a smart thermostat asks "what is the input?" — which is correct?', options: ['The screen brightness', 'Temperature sensor readings', 'The Wi-Fi password', 'The plastic case'], answer: 1, hint: 'What data does the system RECEIVE?', explain: 'Sensors feed data in — that is the system\'s input.', wrongWhy: ['Brightness is output.', '', 'A password is stored config, not the live input stream.', 'The case is hardware, not data.'] },
    { id: 'q-c6', tier: 'industrial', tags: ['systems'], q: 'Why do engineers say "the CPU is not smart"?', options: ['Because it cannot do math', 'Because it only follows instructions, very fast', 'Because it has no electricity', 'Because it forgets everything'], answer: 1, hint: 'Obedient vs intelligent.', explain: 'The CPU executes instructions blindly; intelligence lives in the software humans wrote.', wrongWhy: ['Math is exactly what it\'s great at.', '', 'It runs on electricity.', 'Memory is RAM/storage\'s job.'] }
  ],
  'cb-cpu': [
    { id: 'q-p1', tier: 'concept', tags: ['cpu'], q: 'The instruction cycle is…', options: ['Fetch → Decode → Execute', 'Input → Print → Save', 'Copy → Paste → Delete', 'Read → Write → Erase'], answer: 0, hint: 'Three verbs, in order.', explain: 'Fetch the instruction, decode its meaning, execute it — repeat.', wrongWhy: ['', 'That\'s a user workflow, not the CPU loop.', 'Not a CPU cycle.', 'Not a CPU cycle.'] },
    { id: 'q-p2', tier: 'concept', tags: ['cpu'], q: 'A "quad-core" CPU means…', options: ['Four times the clock speed', 'Four independent instruction workers', 'Four GB of RAM', 'Four storage disks'], answer: 1, hint: 'Cores = chefs.', explain: 'Each core runs its own instruction cycle — parallel workers.', wrongWhy: ['Cores and clock speed are different things.', '', 'RAM is separate.', 'Storage is separate.'] },
    { id: 'q-p3', tier: 'apply', tags: ['cpu'], q: '3 GHz clock speed is roughly…', options: ['3 million steps/sec', '3 billion steps/sec', '3 thousand steps/sec', '3 steps/sec'], answer: 1, hint: 'Giga = billion.', explain: 'Giga means billion — 3 billion cycles per second.', wrongWhy: ['That\'s MHz.', '', 'That\'s kHz.', 'That\'s… a very tired CPU.'] },
    { id: 'q-p4', tier: 'apply', tags: ['cache'], q: 'Why does the CPU keep a cache?', options: ['To store your photos', 'Because fetching from RAM is too slow for it', 'To cool down', 'To look modern'], answer: 1, hint: 'The loop hates waiting.', explain: 'Cache keeps hot data on-chip so fetch never stalls the cycle.', wrongWhy: ['Photos live in storage.', '', 'Cooling is the fan\'s job.', 'Engineering choices are about speed, not looks.'] },
    { id: 'q-p5', tier: 'industrial', tags: ['cpu'], q: 'A video server for millions of users should prefer…', options: ['One ultra-fast core', 'Many cores', 'No cache', 'A bigger screen'], answer: 1, hint: 'Parallel workloads want parallel workers.', explain: 'Serving many streams is parallel work — cores scale throughput.', wrongWhy: ['Single-core becomes a bottleneck.', '', 'Cache is essential.', 'Screens are irrelevant to servers.'] },
    { id: 'q-p6', tier: 'industrial', tags: ['cpu'], q: 'Your phone slows down when hot. Why?', options: ['The screen dims', 'The CPU throttles to protect itself', 'RAM deletes data', 'Storage fills up'], answer: 1, hint: 'Heat protection.', explain: 'Thermal throttling lowers clock speed to shed heat — fewer steps/sec.', wrongWhy: ['Dimming saves battery, not speed.', '', 'RAM doesn\'t delete on heat.', 'Unrelated to temperature.'] }
  ],
  'cb-mem': [
    { id: 'q-m1', tier: 'concept', tags: ['ram'], q: 'RAM is called "volatile" because…', options: ['It explodes', 'It empties when power goes off', 'It is slow', 'It stores photos'], answer: 1, hint: 'The desk gets cleared.', explain: 'Volatile = needs power to hold data.', wrongWhy: ['Definitely not.', '', 'RAM is the FAST memory.', 'Storage holds photos.'] },
    { id: 'q-m2', tier: 'concept', tags: ['storage'], q: 'Which is non-volatile?', options: ['RAM', 'Cache', 'SSD storage', 'CPU registers'], answer: 2, hint: 'The bookshelf.', explain: 'SSDs keep data without power.', wrongWhy: ['RAM empties on power-off.', 'Cache empties too.', '', 'Registers are the most volatile of all.'] },
    { id: 'q-m3', tier: 'apply', tags: ['ram', 'storage'], q: 'You edit a document but the power dies before saving. The edits are…', options: ['Safe on storage', 'Lost — they were only in RAM', 'In the CPU', 'In the cloud'], answer: 1, hint: 'Desk vs shelf.', explain: 'Unsaved edits live only on the desk (RAM) — the outage cleared it.', wrongWhy: ['Saving is what puts them on storage.', '', 'The CPU doesn\'t hold documents.', 'No cloud sync was mentioned.'] },
    { id: 'q-m4', tier: 'apply', tags: ['ram'], q: 'A phone lags when 20 apps are open. Most likely cause?', options: ['Storage is full', 'RAM is full → swapping to slow storage', 'CPU forgot instructions', 'Screen overload'], answer: 1, hint: 'Desk full → shelves used as desk.', explain: 'Full RAM forces swap/page file — storage pretending to be RAM, slowly.', wrongWhy: ['Full storage blocks saving, not speed.', '', 'CPUs don\'t forget.', 'Screens don\'t lag CPUs.'] },
    { id: 'q-m5', tier: 'industrial', tags: ['storage'], q: 'Why did SSDs make computers feel instant?', options: ['They spin faster than HDDs', 'No moving parts — near-zero seek time', 'They have more RAM', 'They run the OS'], answer: 1, hint: 'Chips vs spinning disks.', explain: 'No mechanical movement means reads start almost immediately.', wrongWhy: ['SSDs don\'t spin at all.', '', 'SSD ≠ RAM.', 'The OS runs on CPU/RAM.'] },
    { id: 'q-m6', tier: 'industrial', tags: ['ram', 'storage'], q: 'A database server keeps hot data in RAM and everything on SSD. Why both?', options: ['RAM is cheaper', 'Speed now + durability later', 'SSDs are volatile', 'RAM holds backups'], answer: 1, hint: 'Desk AND shelf, on purpose.', explain: 'RAM serves fast reads; SSD guarantees durability after power loss.', wrongWhy: ['RAM is far more expensive per GB.', '', 'SSDs are non-volatile.', 'Backups live on storage/remote.'] }
  ]
};

/* ---- Coding Arena: JS problems judged in a sealed Web Worker ---- */
export const ARENA = [
  { id: 'a-sum', title: 'Add Two Numbers', tier: 'concept', fn: 'add',
    prompt: 'Write a function add(a, b) that returns the sum of two numbers.',
    starter: 'function add(a, b) {\n  // your code here\n}\n',
    show: [[[2, 3], 5], [[0, 0], 0]],
    hidden: [[[-1, 1], 0], [[10, 25], 35], [[-4, -6], -10]] },
  { id: 'a-rev', title: 'Reverse a String', tier: 'apply', fn: 'reverse',
    prompt: 'Write a function reverse(s) that returns the string s backwards.',
    starter: 'function reverse(s) {\n  // hint: split, reverse, join\n}\n',
    show: [[['hello'], 'olleh'], [['a'], 'a']],
    hidden: [[['IT'], 'TI'], [['quest'], 'tseuq'], [[''], '']] },
  { id: 'a-evens', title: 'Count Even Numbers', tier: 'industrial', fn: 'countEvens',
    prompt: 'Write a function countEvens(arr) that returns how many even numbers are in the array.',
    starter: 'function countEvens(arr) {\n  // hint: % 2 === 0\n}\n',
    show: [[[1, 2, 3, 4], 2], [[], 0]],
    hidden: [[[2, 4, 6], 3], [[1, 3, 5], 0], [[7], 0]] }
];

export const ACHIEVEMENTS = [
  { id: 'first-xp',   title: 'FIRST XP',      desc: 'Earn your first XP.', icon: 'bolt' },
  { id: 'first-step', title: 'FIRST STEP',    desc: 'Complete your first deep lesson.', icon: 'flag' },
  { id: 'gate-pass',  title: 'GATEKEEPER',    desc: 'Pass a mastery gate.', icon: 'shield' },
  { id: 'arena-1',    title: 'CODE BLOODed',  desc: 'Pass your first Arena problem.', icon: 'code' },
  { id: 'deep-3',     title: 'DEEP DIVER',    desc: 'Complete 3 deep lessons.', icon: 'compass' },
  { id: 'stylist',    title: 'STYLIST',       desc: 'Customize your profile.', icon: 'star' }
];


export const ACCENTS = ['#f0561c', '#1f8a34', '#6a4dc4', '#d4a24e', '#d44d8f'];
Object.assign(LESSONS, LESSONS2); Object.assign(QUESTIONS, QUESTIONS2);
