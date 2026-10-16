// Content is visible by default; animation is a progressive enhancement.
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const targets = document.querySelectorAll('.reveal:not(.contact), .contact > *, .hero-copy h1 > span, .about > *, .timeline article, .journey > div:first-child');
let revealObserver;
function configureReveals() {
  revealObserver?.disconnect();
  targets.forEach(el => el.classList.remove('reveal-pending'));
  if (motionPreference.matches || !('IntersectionObserver' in window)) return;
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.remove('reveal-pending');
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  targets.forEach((el, index) => {
    el.classList.add('scroll-reveal');
    el.style.setProperty('--reveal-delay', (index % 3) * 85 + 'ms');
    if (!el.classList.contains('visible') && el.getBoundingClientRect().top > 0) {
      el.classList.add('reveal-pending');
      revealObserver.observe(el);
    }
  });
}
configureReveals();
motionPreference.addEventListener('change', configureReveals);
// Keyboard navigation must never land on visually hidden content.
document.addEventListener('focusin', event => {
  const target = event.target.closest('.reveal-pending');
  if (target) { target.classList.remove('reveal-pending'); target.classList.add('visible'); }
});
const progress = document.querySelector('.progress');
const siteHeader = document.querySelector('header');
const navLinks = [...document.querySelectorAll('nav a')];
let scrollQueued = false;
function updateScroll() {
  const total = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = 'scaleX(' + (total > 0 ? Math.min(1, Math.max(0, scrollY / total)) : 0) + ')';
  siteHeader.classList.toggle('is-scrolled', scrollY > 24);
  let current = '';
  navLinks.forEach(link => {
    const section = document.querySelector(link.hash);
    if (section.getBoundingClientRect().top <= innerHeight * 0.4) current = link.hash;
  });
  navLinks.forEach(link => {
    if (link.hash === current) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  scrollQueued = false;
}
window.addEventListener('scroll', () => {
  if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateScroll); }
}, { passive: true });
window.addEventListener('resize', updateScroll);
window.addEventListener('load', updateScroll);
updateScroll();
document.getElementById('year').textContent = new Date().getFullYear();
const projects = {
  churn: { label: 'CUSTOMER CHURN ANALYSIS', title: 'Finding the story behind churn', content: '<p>An analysis of a 7,043-customer telecom dataset using Python, pandas, Matplotlib and SQL.</p><ul><li>Identified the three strongest churn drivers, together accounting for 83% of cancellations.</li><li>Cleaned data with pandas and segmented customers by tenure, plan and usage in SQL.</li><li>Visualised churn patterns with Matplotlib.</li><li>Recommended a retention strategy for the highest-risk segment, where churn was 70.2%, compared with a 26.5% baseline.</li></ul><p>The recommendation targets an observed risk; it does not represent a measured reduction in churn.</p>' },
  student: { label: 'STUDENT EXAM PERFORMANCE ANALYSIS', title: 'What shapes student success?', content: '<p>Explored performance gaps across 1,000 student records using Excel and SQL.</p><ul><li>Students who completed test preparation had average scores 7.6 points (11.7%) higher in the analysed dataset.</li><li>Compared outcomes by gender, parental education and test-preparation status using Excel pivot tables.</li><li>Validated each comparison with SQL queries.</li></ul><p>These comparisons describe associations within the dataset, rather than proving causation. The card’s bars are illustrative.</p>' },
  unimate: { label: 'UNIVERSITY CAPSTONE · 2025–2026', title: 'Smart UniMate', content: '<p>A university chatbot and student engagement platform developed as a capstone project at Sabaragamuwa University of Sri Lanka.</p><ul><li>Developed a web and mobile platform to help new university students access academic, administrative and campus information.</li><li>Worked with Next.js, Laravel, Python / Flask, PostgreSQL and Azure Active Directory.</li><li>Used Git / GitHub, Figma and Postman in the development workflow.</li></ul><p>The portfolio card presents an illustrative interface, not a live product demo.</p>' }
};
const dialog = document.getElementById('project-dialog');
document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', () => {
  const project = projects[button.dataset.project];
  document.getElementById('dialog-label').textContent = project.label;
  document.getElementById('dialog-title').textContent = project.title;
  document.getElementById('dialog-content').innerHTML = project.content;
  dialog.setAttribute('aria-labelledby', 'dialog-title');
  dialog.showModal();
  document.body.style.overflow = 'hidden';
}));
function closeProject() {
  dialog.close();
  document.body.style.overflow = '';
}

document.querySelector('.close-dialog').addEventListener('click', closeProject);
dialog.addEventListener('cancel', event => {
  event.preventDefault();
  closeProject();
});
dialog.addEventListener('click', event => { if (event.target === dialog) { const box = dialog.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) closeProject(); } });
dialog.addEventListener('close', () => { document.body.style.overflow = ''; });

const tickerToggle = document.querySelector('.ticker-toggle');
tickerToggle.addEventListener('click', () => {
  const paused = tickerToggle.getAttribute('aria-pressed') !== 'true';
  tickerToggle.setAttribute('aria-pressed', String(paused));
  tickerToggle.setAttribute('aria-label', paused ? 'Resume toolkit animation' : 'Pause toolkit animation');
  tickerToggle.textContent = paused ? '▶' : 'Ⅱ';
  document.querySelector('.tool-strip').classList.toggle('is-paused', paused);
});

// Local vector animation: no video, background image, or remote media dependency.
const agentCharacter = document.querySelector('.brand-agent');
let agentPausedByUser = false;
function syncAgentMotion() {
  const paused = agentPausedByUser || motionPreference.matches;
  agentCharacter.classList.toggle('is-paused', paused);
  agentCharacter.setAttribute('aria-pressed', String(paused));
  const label = motionPreference.matches ? 'AI character animation disabled by reduced-motion preference' : (paused ? 'Play AI character animation' : 'Pause AI character animation');
  agentCharacter.setAttribute('aria-label', label);
  agentCharacter.title = label;
}
agentCharacter.addEventListener('click', () => {
  if (motionPreference.matches) return;
  agentPausedByUser = !agentPausedByUser;
  syncAgentMotion();
});
agentCharacter.addEventListener('pointermove', event => {
  if (motionPreference.matches || agentPausedByUser) return;
  const box = agentCharacter.getBoundingClientRect();
  agentCharacter.style.setProperty('--look-x', ((event.clientX - box.left) / box.width - .5) * 5 + 'px');
  agentCharacter.style.setProperty('--look-y', ((event.clientY - box.top) / box.height - .5) * 3 + 'px');
});
agentCharacter.addEventListener('pointerleave', () => {
  agentCharacter.style.setProperty('--look-x', '0px');
  agentCharacter.style.setProperty('--look-y', '0px');
});
motionPreference.addEventListener('change', syncAgentMotion);
syncAgentMotion();
