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
