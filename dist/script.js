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
  "churn": {
    "label": "CASE STUDY 01 / CUSTOMER INTELLIGENCE",
    "title": "Finding the story behind churn",
    "repo": "https://github.com/AbishekAr64/customer-churn-analysis",
    "content": "<p class=\"case-lead\">An end-to-end investigation of telecom customer churn: from cleaning 7,043 customer records to identifying a focused retention opportunity and comparing predictive models.</p><div class=\"case-stats\"><div><strong>26.5%</strong><span>overall churn</span></div><div><strong>70.2%</strong><span>high-risk segment churn</span></div><div><strong>0.839</strong><span>logistic regression test AUC</span></div></div>\n<h3>The question</h3><p>Which customers are most likely to leave, and where should a retention team focus its attention? The analysis uses the IBM Telco Customer Churn dataset: 7,043 customers and 21 fields.</p>\n<h3>From raw data to evidence</h3><ol><li><strong>Clean and prepare.</strong> Converted TotalCharges to numeric, filled 11 blank values belonging to zero-tenure customers, standardised service categories, and created tenure bands, charge bands, a churn flag, and an add-on service count.</li><li><strong>Segment and visualise.</strong> Loaded the cleaned data into SQLite and used 10 named queries to compare contract type, tenure, internet plan, payment method, and add-on services. Seven Matplotlib charts communicate the patterns.</li><li><strong>Compare predictive models.</strong> Evaluated class-weighted logistic regression and random forest with an 80/20 stratified split and five-fold cross-validation. Test ROC-AUC was 0.839 and 0.843 respectively.</li></ol>\n<h3>What the analysis found</h3><p>The 916 customers on month-to-month fiber plans with 12 months or less of tenure had a 70.2% churn rate, versus 20.0% for everyone else. Month-to-month contracts accounted for 89% of churners. First-year churn was 47.4%, compared with 6.6% after five years.</p>\n<h3>Turning insight into action</h3><p>The report proposes contract-upgrade offers, first-year onboarding, support and security bundles, and targeted outreach. Logistic regression offers an interpretable starting point, with 77.5% churn recall and 50.8% precision on the test set.</p>\n<p class=\"case-note\">These are findings from a snapshot dataset. Retention improvements are proposed, not measured, and require controlled testing. Add-on count is an engagement proxy rather than direct usage.</p>\n<h3>Explore the work</h3><div class=\"case-resources\"><a href=\"https://github.com/AbishekAr64/customer-churn-analysis/blob/main/churn_analysis.py\" target=\"_blank\" rel=\"noopener noreferrer\">Analysis pipeline ↗</a><a href=\"https://github.com/AbishekAr64/customer-churn-analysis/blob/main/queries.sql\" target=\"_blank\" rel=\"noopener noreferrer\">SQL queries ↗</a><a href=\"https://github.com/AbishekAr64/customer-churn-analysis/blob/main/retention_strategy_report.md\" target=\"_blank\" rel=\"noopener noreferrer\">Retention report ↗</a><a href=\"https://github.com/AbishekAr64/customer-churn-analysis/blob/main/model_metrics.csv\" target=\"_blank\" rel=\"noopener noreferrer\">Model metrics ↗</a></div>"
  },
  "student": {
    "label": "CASE STUDY 02 / EDUCATION ANALYTICS",
    "title": "What shapes student success?",
    "repo": "https://github.com/AbishekAr64/student-exam-performance-analysis",
    "content": "<p class=\"case-lead\">An Excel and SQL study of 1,000 exam records, exploring how preparation and student background relate to mathematics, reading, and writing scores.</p><div class=\"case-stats\"><div><strong>1,000</strong><span>student records</span></div><div><strong>+7.6</strong><span>test-prep score gap</span></div><div><strong>89 / 89</strong><span>documented validation matches</span></div></div>\n<h3>The question</h3><p>How do exam scores vary with test preparation, parental education, and gender? The public Kaggle Students Performance in Exams dataset provides three subject scores and contextual attributes for each student.</p>\n<h3>A reproducible workflow</h3><ol><li><strong>Check data quality.</strong> The repository documents 1,000 records with no missing values or duplicates. SQL-friendly column names and a view calculate each student’s average across the three subjects.</li><li><strong>Build the workbook.</strong> Four sheets organise the work: Summary, Pivots, SQL_Validation, and Data. COUNTIFS and AVERAGEIFS power the pivot-style comparisons, with charts and findings collected in the summary.</li><li><strong>Cross-check the comparisons.</strong> SQLite queries calculate overall averages, subject-level differences, preparation gaps, and subgroup comparisons. The repository documents 89 matching Excel-to-SQL checks.</li></ol>\n<h3>What the analysis found</h3><p>The overall average was 67.8. Students who completed preparation averaged approximately 72.7 versus 65.0 for those who did not, with a 7.6-point gap calculated before rounding. The preparation gap remained positive within every parental-education group, ranging from 4.1 to 9.4 points.</p><p>Parental education showed the widest best-to-worst group gap at 10.5 points. Subject comparisons also revealed different patterns: female students scored higher in reading and writing, while male students scored higher in mathematics.</p>\n<h3>Why the validation matters</h3><p>Separating the workbook presentation from the SQL calculations makes the comparisons easier to audit and reproduce. The cleaned CSV, workbook, and query script are all available in the repository.</p>\n<p class=\"case-note\">The findings describe associations, not proof that preparation caused higher scores. Factors with more groups can show wider ranges; the card’s bars are illustrative.</p><h3>Explore the work</h3><div class=\"case-resources\"><a href=\"https://github.com/AbishekAr64/student-exam-performance-analysis/blob/main/student_exam_performance_analysis.xlsx\" target=\"_blank\" rel=\"noopener noreferrer\">Excel workbook ↗</a><a href=\"https://github.com/AbishekAr64/student-exam-performance-analysis/blob/main/student_performance_queries.sql\" target=\"_blank\" rel=\"noopener noreferrer\">Validation SQL ↗</a><a href=\"https://github.com/AbishekAr64/student-exam-performance-analysis/blob/main/students_clean.csv\" target=\"_blank\" rel=\"noopener noreferrer\">Cleaned dataset ↗</a><a href=\"https://github.com/AbishekAr64/student-exam-performance-analysis/blob/main/README%20%281%29.md\" target=\"_blank\" rel=\"noopener noreferrer\">Findings and methodology ↗</a></div>"
  },
  "unimate": {
    "label": "CASE STUDY 03 / UNIVERSITY CAPSTONE",
    "title": "Smart UniMate — a connected campus",
    "repo": "https://github.com/AbishekAr64/SmartUniMate-backend",
    "content": "<p class=\"case-lead\">A university chatbot and student engagement platform for Sabaragamuwa University of Sri Lanka, bringing campus information and everyday student tools into one experience.</p><div class=\"case-stats\"><div><strong>Laravel</strong><span>application API</span></div><div><strong>Sanctum</strong><span>role-based API access</span></div><div><strong>Next.js</strong><span>frontend source</span></div></div>\n<h3>The problem</h3><p>New students need to navigate academic information, campus updates, and daily schedules. Smart UniMate brings those needs together with conversational help and student communities.</p>\n<h3>Features in the repository</h3><ul><li><strong>Campus information:</strong> searchable news, news categories, a knowledge base, and academic module listings.</li><li><strong>Student tools:</strong> profile and avatar management, personal timetable entries, and a GPA calculator in the frontend source.</li><li><strong>Conversations:</strong> AI chat with saved history, student-to-student messaging, read status, and community posts.</li><li><strong>Administration:</strong> content management, community moderation, and report-handling endpoints.</li></ul>\n<h3>How the pieces connect</h3><p>Versioned Laravel API routes organise the backend. Sanctum authentication and role abilities distinguish student and administrator routes. The chat controller validates incoming messages, stores conversation messages, and sends the question and conversation context to a separately configured bot service. It also returns a clear error response when that service is unavailable.</p><p>The repository includes database migrations and Eloquent models for students, messages, timetables, news, communities, and reports, alongside Next.js interface source for chat, scheduling, and GPA calculation.</p>\n<h3>Development scope</h3><p>This case study highlights the implementation visible in the public backend repository. The broader capstone connects application development, information management, and student experience design.</p><p class=\"case-note\">Repository source demonstrates the implementation structure; it does not establish production deployment or usage results. The portfolio illustration is a concept view, not a live demo.</p><h3>Explore the work</h3><div class=\"case-resources\"><a href=\"https://github.com/AbishekAr64/SmartUniMate-backend/blob/main/routes/api.php\" target=\"_blank\" rel=\"noopener noreferrer\">API routes ↗</a><a href=\"https://github.com/AbishekAr64/SmartUniMate-backend/blob/main/app/Http/Controllers/Api/ChatController.php\" target=\"_blank\" rel=\"noopener noreferrer\">Chat integration ↗</a><a href=\"https://github.com/AbishekAr64/SmartUniMate-backend/blob/main/app/Http/Controllers/Api/TimetableController.php\" target=\"_blank\" rel=\"noopener noreferrer\">Timetable controller ↗</a><a href=\"https://github.com/AbishekAr64/SmartUniMate-backend/blob/main/resources/views/app/gpa/page.tsx\" target=\"_blank\" rel=\"noopener noreferrer\">GPA interface ↗</a></div>"
  }
};
const dialog = document.getElementById('project-dialog');
document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', () => {
  const project = projects[button.dataset.project];
  document.getElementById('dialog-label').textContent = project.label;
  document.getElementById('dialog-title').textContent = project.title;
  document.getElementById('dialog-content').innerHTML = project.content;
  document.getElementById('project-repository').href = project.repo;
  dialog.setAttribute('aria-labelledby', 'dialog-title');
  dialog.showModal();
  dialog.scrollTop = 0;
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
