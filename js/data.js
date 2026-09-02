/* AE3301 content brain — levels, deep lessons, questions, arena, achievements */
export const XP = { lesson: 10, easy: 20, medium: 40, hard: 80, gate: 30, arena: 40 };
export const DAILY_GOAL_XP = 30;
export const PLAYER_LEVELS = [
  { level: 1, minXp: 0, title: 'Rookie', avatar: '🌱' },
  { level: 2, minXp: 100, title: 'Apprentice', avatar: '⚡' },
  { level: 3, minXp: 250, title: 'Builder', avatar: '🛠️' },
  { level: 4, minXp: 500, title: 'Engineer', avatar: '⚙️' },
  { level: 5, minXp: 1000, title: 'Architect', avatar: '🏛️' }
];
export function levelInfo(xp) {
  let cur = PLAYER_LEVELS[0];
  for (const l of PLAYER_LEVELS) if (xp >= l.minXp) cur = l;
  const i = PLAYER_LEVELS.indexOf(cur), nxt = PLAYER_LEVELS[i + 1] || null;
  const into = xp - cur.minXp, span = nxt ? nxt.minXp - cur.minXp : 0;
  return { level: cur.level, title: cur.title, avatar: cur.avatar, isMax: !nxt, into, span, need: nxt ? nxt.minXp - xp : 0, pct: nxt ? Math.min(100, Math.round(into / span * 100)) : 100, nextLevel: nxt ? nxt.level : null, nextTitle: nxt ? nxt.title : null };
}
export const LEVELS = [
  { id: 'l0', num: 0, icon: '🖥️', title: 'Computer Basics', tagline: 'Start here. Zero experience needed.', lessons: [
    { id: 'cb-computer', title: 'What Is a Computer?', minutes: 10 },
    { id: 'cb-cpu', title: 'CPU — The Thinking Machine', minutes: 12 },
    { id: 'cb-mem', title: 'RAM & Storage — Memory That Stays', minutes: 12 },
    { id: 'cb-files', title: 'Files & Folders', minutes: 12 },
    { id: 'cb-paths', title: 'Paths & Extensions', minutes: 12 },
    { id: 'cb-os', title: 'Operating Systems', minutes: 12, soon: true },
    { id: 'cb-term', title: 'Terminal & Linux Basics', minutes: 12, soon: true } ] },
  { id: 'l1', num: 1, icon: '💻', title: 'Programming', tagline: 'Think like a programmer.', soon: true, lessons: [] },
  { id: 'l2', num: 2, icon: '🐧', title: 'Linux + Git', tagline: 'Work like a real developer.', soon: true, lessons: [] },
  { id: 'l3', num: 3, icon: '🧩', title: 'DSA', tagline: 'The engine room of fast software.', soon: true, lessons: [] },
  { id: 'l4', num: 4, icon: '🗄️', title: 'Databases + SQL', tagline: 'Where data lives.', soon: true, lessons: [] },
  { id: 'l5', num: 5, icon: '🌐', title: 'Networking', tagline: 'How messages cross the world.', soon: true, lessons: [] }
];
export const LESSONS = {
  'cb-computer': { title: 'What Is a Computer?', blocks: [
    { kind: 'analogy', title: 'The Kitchen', html: 'Think of a restaurant kitchen. Order slips coming in are the <b>input</b>. The chefs cooking are the <b>processing</b>. The plated dish served to you is the <b>output</b>. The pantry and fridge — where ingredients wait for later — that is <b>storage</b>. Every computer on Earth is this kitchen, just faster.' },
    { kind: 'p', html: 'A <b class="tm">computer</b> is an electronic machine that does four jobs: it takes in information (<b>input</b>), works on it (<b>processing</b>), gives back a result (<b>output</b>), and remembers things for later (<b>storage</b>). The information itself is called <b class="tm">data</b>: numbers, text, photos, sounds, taps.' },
    { kind: 'terms', items: [ { t: 'Data', d: 'Any information a computer can work with.' }, { t: 'Hardware', d: 'The physical parts you can touch.' }, { t: 'Software', d: 'The invisible instructions telling hardware what to do.' } ] },
    { kind: 'steps', title: 'The four jobs, in order', items: [ '<b>Input</b> — a keyboard, mic, camera or touchscreen sends data in.', '<b>Processing</b> — the CPU follows instructions and calculates.', '<b>Output</b> — screen, speakers or printer give you the result.', '<b>Storage</b> — saved data survives even when power goes off.' ] },
    { kind: 'viz', id: 'pipeline', title: 'Run the machine yourself' },
    { kind: 'realworld', title: 'Industrial view', html: 'Your phone, a smart TV, an ATM, a car, a factory robot — all computers. A modern CPU performs <b>billions</b> of steps per second, yet it is never "smart": it only follows instructions extremely fast. Engineers design systems by asking: <i>what is the input, what is the output, and where is the state stored?</i> — the same four jobs at any scale.' },
    { kind: 'pitfall', title: 'Beginner traps', html: '① "Computers are smart" — no; they are fast obedient machines. ② A touchscreen is <b>both</b> input (your tap) and output (the picture). ③ If it was never <b>saved</b>, power-off kills it — storage is a deliberate step, not magic.' },
    { kind: 'deepdive', title: 'Under the hood', html: 'Deep down, all data is just <b>bits</b> — on/off switches (1/0). A photo, a song, this lesson: all of it is billions of 1s and 0s grouped into patterns. Eight bits make a <b>byte</b>, the classic unit of storage (KB, MB, GB, TB).' },
    { kind: 'interview', title: 'Interview angle', html: '"Name the four jobs of a computer and give one real example of each." You can now answer this in one breath — that is exactly what interviews test: crisp fundamentals.' },
    { kind: 'summary', points: [ 'Four jobs: input → processing → output, plus storage.', 'Data = any information: numbers, text, photos, sound.', 'The CPU processes; screens/speakers output; storage remembers.', 'Everything is bits (1/0) grouped into bytes.' ] } ] },
  'cb-cpu': { title: 'CPU — The Thinking Machine', blocks: [
    { kind: 'analogy', title: 'The Recipe Follower', html: 'A CPU is a chef who never invents: it reads one instruction ("crack egg"), does it, reads the next ("stir"), does it — billions of times per second, without ever getting tired or bored.' },
    { kind: 'p', html: 'The <b class="tm">CPU</b> (Central Processing Unit) is the chip that executes every instruction of every program. A <b class="tm">program</b> is just a long list of tiny instructions stored in memory, waiting for the CPU to pick them up.' },
    { kind: 'steps', title: 'Fetch → Decode → Execute', items: [ '<b>Fetch</b> — the CPU grabs the next instruction from memory.', '<b>Decode</b> — it figures out what the instruction means.', '<b>Execute</b> — it does it (calculate, move data, decide).', 'Then repeat. Forever. This loop is called the <b>instruction cycle</b>.' ] },
    { kind: 'viz', id: 'cpu', title: 'Watch the instruction cycle' },
    { kind: 'realworld', title: 'Cores & GHz', html: 'A <b>core</b> is one instruction-following worker; a "quad-core" CPU has four chefs in one kitchen. <b>Clock speed</b> (GHz) = how many steps per second each worker takes (3 GHz ≈ 3 billion steps/sec). Real systems balance cores vs speed: games want speed, servers want cores.' },
    { kind: 'pitfall', title: 'Beginner traps', html: '① CPU ≠ memory: the CPU <i>works</i>, RAM <i>holds</i>. ② More GHz isn\'t always faster — architecture matters. ③ The CPU gets hot doing this loop; that\'s why fans and throttling exist.' },
    { kind: 'deepdive', title: 'Cache — the CPU\'s pocket', html: 'Fetching from RAM is slow for a CPU, so it keeps a tiny super-fast memory called <b>cache</b> (L1/L2/L3) right on the chip. Keeping data close to the CPU is one of the biggest ideas in all of engineering — you\'ll meet it again in databases and web systems.' },
    { kind: 'interview', title: 'Interview angle', html: '"Explain the instruction cycle." Answer: fetch, decode, execute, repeat — then add that cache and cores exist to feed that loop faster. Instant credibility.' },
    { kind: 'summary', points: [ 'The CPU executes program instructions.', 'Instruction cycle: fetch → decode → execute → repeat.', 'Cores = parallel workers; GHz = steps per second.', 'Cache keeps data close so the loop never waits.' ] } ] },
  'cb-mem': { title: 'RAM & Storage — Memory That Stays', blocks: [
    { kind: 'analogy', title: 'Desk vs Bookshelf', html: 'RAM is your <b>desk</b>: small, fast, everything you\'re working on right now. Storage is the <b>bookshelf</b>: huge, slower, but things stay there forever. When you open a file, you carry it from the shelf to the desk. When the lights go out, the desk is cleared — the shelf is not.' },
    { kind: 'p', html: '<b class="tm">RAM</b> (Random Access Memory) is fast temporary workspace: it empties when power goes off (<b>volatile</b>). <b class="tm">Storage</b> (SSD/HDD) is long-term: files stay (<b>non-volatile</b>). This is why "saving" is a real action: it copies your work from desk to shelf.' },
    { kind: 'steps', title: 'Opening an app', items: [ 'The app\'s files sit on <b>storage</b> (shelf).', 'On tap, they are copied into <b>RAM</b> (desk).', 'The <b>CPU</b> works on them from RAM — fast.', 'When you <b>save</b>, results go back to storage.' ] },
    { kind: 'viz', id: 'mem', title: 'Power off: what survives?' },
    { kind: 'realworld', title: 'GB, TB, SSD vs HDD', html: 'Phones ship with 8–12 GB RAM and 128–512 GB storage — notice storage is ~40× bigger. <b>SSDs</b> (chips, no moving parts) replaced <b>HDDs</b> (spinning disks) and made whole computers feel instant. Engineers size RAM for multitasking and storage for how much you keep.' },
    { kind: 'pitfall', title: 'Beginner traps', html: '① "More RAM = more space for photos" — no, that\'s storage. ② Clearing RAM never deletes files. ③ Unsaved work lives only on the desk — a crash empties the desk.' },
    { kind: 'deepdive', title: 'When the desk is full', html: 'If RAM runs out, the OS borrows storage as fake RAM (<b>swap/page file</b>) — and everything slows down, because shelves are slower than desks. That lag you feel on an overloaded phone is exactly this.' },
    { kind: 'interview', title: 'Interview angle', html: '"RAM vs storage?" → volatile vs non-volatile, fast vs large, workspace vs keeping-place. One crisp sentence each, with the desk/shelf analogy as a bonus.' },
    { kind: 'summary', points: [ 'RAM = fast, volatile workspace; Storage = slow, permanent keeping-place.', 'Opening = storage→RAM; Saving = RAM→storage.', 'SSDs made computers instant; sizes: GB/TB.', 'Full RAM → swap → lag.' ] } ] }
};
