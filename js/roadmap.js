/**
 * ================================================================
 *  AE3301 · FULL ROADMAP (§10) — Levels 6–13
 *  Registered as locked stages; content packs unlock them one by
 *  one using the same truncation-safe drop pattern.
 * ================================================================
 */
import { LEVELS } from './data.js';

[
  { num: 6,  icon: '🧠', title: 'OS Deep Dive',         tagline: 'Processes, threads, scheduling, virtual memory.' },
  { num: 7,  icon: '🌐', title: 'Web Development',      tagline: 'HTML, CSS, JS, APIs, full-stack projects.' },
  { num: 8,  icon: '🛠️', title: 'Software Engineering', tagline: 'Clean code, testing, patterns, code review.' },
  { num: 9,  icon: '☁️', title: 'Cloud + DevOps',       tagline: 'Servers, Docker, CI/CD, deployment.' },
  { num: 10, icon: '🔐', title: 'Cybersecurity',        tagline: 'Encryption, vulnerabilities, secure coding.' },
  { num: 11, icon: '🤖', title: 'AI / Machine Learning', tagline: 'Python for AI, ML, neural nets, LLMs.' },
  { num: 12, icon: '🏗️', title: 'System Design',        tagline: 'Scale, caching, microservices, availability.' },
  { num: 13, icon: '🚀', title: 'Real-World Projects',  tagline: 'Combine everything into portfolio engineering.' }
].forEach(x => LEVELS.push(Object.assign({ id: 'l' + x.num, lessons: [], soon: true }, x)));
/* ================================================================
 * PLANNED-TOPIC PREVIEW (absorbed from old admin2.js)
 * Shows the roadmap depth inside empty future levels.
 * ================================================================ */
const PLANNED = {
  l1: ['Variables & data types', 'Operators & conditions', 'Loops', 'Functions', 'Arrays & strings', 'Objects', 'Error handling & debugging', 'Mini projects'],
  l2: ['Linux fundamentals', 'Terminal commands', 'Permissions & processes', 'Git basics', 'Branches & commits', 'Pull requests & collaboration'],
  l3: ['Arrays & two pointers', 'Linked lists', 'Stacks & queues', 'Hash tables', 'Trees & graphs', 'Sorting & searching', 'Big-O & problem solving'],
  l4: ['Tables, rows & keys', 'SQL SELECT & filters', 'CRUD', 'Joins', 'Indexes & transactions', 'Database design project'],
  l5: ['Processes & threads', 'CPU scheduling', 'Memory & virtual memory', 'File systems', 'Concurrency & deadlocks'],
  l6: ['IP & MAC', 'DNS', 'HTTP/HTTPS', 'TCP/UDP & ports', 'Routers, switches & packets', 'OSI / TCP-IP model'],
  l7: ['HTML', 'CSS', 'JavaScript & the DOM', 'APIs & authentication', 'Full-stack project'],
  l8: ['Clean code', 'Testing', 'Design patterns', 'Code review & docs', 'Agile teamwork'],
  l9: ['Cloud fundamentals', 'Containers & Docker', 'CI/CD', 'Deployment & monitoring'],
  l10: ['Encryption basics', 'AuthN vs AuthZ', 'Common vulnerabilities', 'Secure coding'],
  l11: ['Python for AI', 'ML fundamentals', 'Neural networks', 'LLMs & AI APIs', 'AI project'],
  l12: ['Caching & load balancing', 'Microservices & queues', 'High availability', 'Capstone system design'],
  l13: ['Capstone projects', 'Portfolio building', 'Interview preparation']
};
function injectPlanned() {
  const m = (location.hash || '').match(/#\/level\/(l\d+)/);
  if (!m) return;
  const lv = LEVELS.find(l => l.id === m[1]);
  if (!lv || lv.lessons.length) return;
  const list = document.querySelector('.lesson-list');
  if (!list || list.children.length) return;
  list.innerHTML = (PLANNED[m[1]] || []).map((t, i) =>
    '<div class="lesson-row upcoming"><div class="row-num">' + String(i + 1).padStart(2, '0') + '</div>' +
    '<div><h4>' + t + '</h4><div class="lr-sub">planned · ships in a future content drop</div></div><div>🔒</div></div>'
  ).join('') || '<p class="empty-note">Curriculum design in progress.</p>';
}
addEventListener('hashchange', () => setTimeout(injectPlanned, 80));
setTimeout(injectPlanned, 80);
