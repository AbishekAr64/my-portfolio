(() => {
  const toggle = document.querySelector('.theme-toggle');
  function syncTheme() {
    const light = document.documentElement.dataset.theme === 'light';
    toggle.innerHTML = light ? '☾ <span>Dark mode</span>' : '☀ <span>Light mode</span>';
    toggle.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
    document.querySelector('meta[name="theme-color"]').content = light ? '#f6f3ed' : '#121116';
  }
  toggle.addEventListener('click', () => {
    const theme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('portfolio-theme', theme); } catch {}
    syncTheme();
  });
  syncTheme();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  document.querySelectorAll('.project-art, .credential-preview').forEach(card => {
    card.addEventListener('pointermove', event => {
      if (reduced.matches || !fine.matches) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--tilt-x', `${-(event.clientY-rect.top-rect.height/2)/rect.height*9}deg`);
      card.style.setProperty('--tilt-y', `${(event.clientX-rect.left-rect.width/2)/rect.width*9}deg`);
      card.classList.add('is-tilting');
    });
    card.addEventListener('pointerleave', () => card.classList.remove('is-tilting'));
    reduced.addEventListener('change', () => card.classList.remove('is-tilting'));
  });
})();
