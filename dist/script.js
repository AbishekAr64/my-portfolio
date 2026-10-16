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

// Original AI Agent animation by Fraser Davidson / Cub Studio:
// https://dribbble.com/shots/27812511-AI-Agent
// Remove only pale background pixels connected to the frame edges.
// This preserves enclosed white details within the original character.
const agentCharacter = document.querySelector('.brand-agent');
const agentSource = document.getElementById('agent-source');
const agentCanvas = document.getElementById('agent-canvas');
const agentContext = agentCanvas.getContext('2d', { willReadFrequently: true });
const frameWidth = agentCanvas.width;
const frameHeight = agentCanvas.height;
const visited = new Uint8Array(frameWidth * frameHeight);
const queue = new Int32Array(frameWidth * frameHeight);
let agentPausedByUser = false;
let agentFrameRequest = null;
function drawAgentFrame() {
  if (agentSource.readyState < 2) return;
  agentContext.clearRect(0, 0, frameWidth, frameHeight);
  const scale = Math.min(frameWidth / agentSource.videoWidth, frameHeight / agentSource.videoHeight);
  const width = agentSource.videoWidth * scale;
  const height = agentSource.videoHeight * scale;
  agentContext.drawImage(agentSource, (frameWidth - width) / 2, (frameHeight - height) / 2, width, height);
  try {
    const frame = agentContext.getImageData(0, 0, frameWidth, frameHeight);
    const pixels = frame.data;
    visited.fill(0);
    let head = 0, tail = 0;
    function enqueue(index) {
      if (visited[index]) return;
      visited[index] = 1;
      const offset = index * 4;
      const low = Math.min(pixels[offset], pixels[offset + 1], pixels[offset + 2]);
      const high = Math.max(pixels[offset], pixels[offset + 1], pixels[offset + 2]);
      if (pixels[offset + 3] === 0 || (low > 218 && high - low < 22)) queue[tail++] = index;
    }
    for (let x = 0; x < frameWidth; x++) { enqueue(x); enqueue((frameHeight - 1) * frameWidth + x); }
    for (let y = 0; y < frameHeight; y++) { enqueue(y * frameWidth); enqueue(y * frameWidth + frameWidth - 1); }
    while (head < tail) {
      const index = queue[head++];
      pixels[index * 4 + 3] = 0;
      const x = index % frameWidth;
      if (x > 0) enqueue(index - 1);
      if (x < frameWidth - 1) enqueue(index + 1);
      if (index >= frameWidth) enqueue(index - frameWidth);
      if (index < frameWidth * (frameHeight - 1)) enqueue(index + frameWidth);
    }
    agentContext.putImageData(frame, 0, 0);
  } catch {
    // Never display the opaque frame if the remote host stops allowing canvas access.
    agentContext.clearRect(0, 0, frameWidth, frameHeight);
    agentSource.pause();
    agentCharacter.title = 'Animation unavailable';
  }
}
function stopAgentFrames() {
  if (agentFrameRequest !== null) cancelAnimationFrame(agentFrameRequest);
  agentFrameRequest = null;
}
let lastAgentFrame = -1;
function renderAgentFrames() {
  agentFrameRequest = null;
  if (agentSource.currentTime !== lastAgentFrame) {
    drawAgentFrame();
    lastAgentFrame = agentSource.currentTime;
  }
  if (!agentSource.paused && !document.hidden) agentFrameRequest = requestAnimationFrame(renderAgentFrames);
}
function syncAgentControl() {
  const paused = agentSource.paused;
  const label = paused ? 'Play AI character animation' : 'Pause AI character animation';
  agentCharacter.setAttribute('aria-label', label);
  agentCharacter.setAttribute('aria-pressed', String(paused));
  agentCharacter.title = label + ' — Fraser Davidson / Cub Studio';
}
function applyAgentMotion() {
  if (agentPausedByUser || motionPreference.matches || document.hidden) agentSource.pause();
  else agentSource.play().catch(syncAgentControl);
  syncAgentControl();
}
agentCharacter.addEventListener('click', () => {
  if (motionPreference.matches) return;
  agentPausedByUser = !agentSource.paused;
  applyAgentMotion();
});
agentSource.addEventListener('loadeddata', drawAgentFrame);
agentSource.addEventListener('seeked', drawAgentFrame);
agentSource.addEventListener('play', () => { stopAgentFrames(); renderAgentFrames(); syncAgentControl(); });
agentSource.addEventListener('pause', () => { stopAgentFrames(); syncAgentControl(); });
motionPreference.addEventListener('change', applyAgentMotion);
document.addEventListener('visibilitychange', applyAgentMotion);
applyAgentMotion();
