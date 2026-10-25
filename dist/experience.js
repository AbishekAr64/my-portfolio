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
  document.querySelectorAll('.project-art, .credential-preview, .about-portrait').forEach(card => {
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

// A travelling nav highlight and restrained magnetic response for the contact CTA.
(() => {
  const nav=document.querySelector('header nav');
  const links=[...nav.querySelectorAll('a')];
  const indicator=document.createElement('span');
  indicator.className='nav-indicator';indicator.setAttribute('aria-hidden','true');nav.prepend(indicator);
  let hovered=null;
  function position(){
    const target=hovered||links.find(a=>a===document.activeElement)||links.find(a=>a.hasAttribute('aria-current'));
    nav.classList.toggle('has-indicator',Boolean(target));
    if(!target)return;
    nav.style.setProperty('--nav-x',`${target.offsetLeft}px`);nav.style.setProperty('--nav-w',`${target.offsetWidth}px`);
  }
  links.forEach(link=>{link.addEventListener('pointerenter',()=>{hovered=link;position();});link.addEventListener('focus',position);});
  nav.addEventListener('pointerleave',()=>{hovered=null;position();});
  nav.addEventListener('focusout',()=>requestAnimationFrame(position));
  new MutationObserver(position).observe(nav,{subtree:true,attributes:true,attributeFilter:['aria-current']});
  new ResizeObserver(position).observe(nav);
  document.fonts.ready.then(position);
  const contact=document.querySelector('.nav-contact');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const fine=matchMedia('(hover: hover) and (pointer: fine)');
  function reset(){['--mag-x','--mag-y','--shine-x','--shine-y'].forEach(p=>contact.style.removeProperty(p));}
  contact.addEventListener('pointermove',e=>{
    if(reduce.matches||!fine.matches)return;
    const r=contact.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
    contact.style.setProperty('--mag-x',`${(x-.5)*8}px`);contact.style.setProperty('--mag-y',`${(y-.5)*6}px`);
    contact.style.setProperty('--shine-x',`${x*100}%`);contact.style.setProperty('--shine-y',`${y*100}%`);
  });
  contact.addEventListener('pointerleave',reset);contact.addEventListener('blur',reset);reduce.addEventListener('change',reset);
})();

// The journey line fills with reading progress; no animation loop while idle.
(() => {
  const trail = document.querySelector('.learning-trail');
  if (!trail) return;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let scheduled = false;
  function updateTrail() {
    scheduled = false;
    const rect = trail.getBoundingClientRect();
    const progress = preference.matches ? 1 : Math.max(0, Math.min(1, (innerHeight * .65 - rect.top) / Math.max(1, rect.height - 45)));
    trail.style.setProperty('--trail-progress', progress.toFixed(3));
  }
  function schedule() {
    if (!scheduled) { scheduled = true; requestAnimationFrame(updateTrail); }
  }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  preference.addEventListener('change', schedule);
  new ResizeObserver(schedule).observe(trail);
  updateTrail();
})();

// Load the YouTube player only when requested, and stop playback on close.
(() => {
  const dialog = document.querySelector('#video-cv-dialog');
  if (!dialog) return;
  const player = dialog.querySelector('.video-cv-player');
  let opener;
  document.querySelectorAll('[data-video-cv]').forEach(button => {
    button.addEventListener('click', () => {
      opener = button;
      const frame = document.createElement('iframe');
      frame.src = 'https://www.youtube-nocookie.com/embed/gftYGYSTJ_A?rel=0';
      frame.title = 'Rajenthirakumar Abishek — Portfolio Video CV';
      frame.allow = 'accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      frame.allowFullscreen = true;
      frame.referrerPolicy = 'strict-origin-when-cross-origin';
      player.replaceChildren(frame);
      dialog.showModal();
    });
  });
  dialog.querySelector('.video-cv-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const r = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    player.replaceChildren();
    opener?.focus({ preventScroll: true });
  });
})();

// Fine-pointer parallax; one paint per frame and a still version for reduced motion.
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  document.querySelectorAll('.contact-card').forEach(card => {
    let frame = 0;
    function reset() {
      cancelAnimationFrame(frame);
      frame = 0;
      ['--contact-rx','--contact-ry','--contact-x','--contact-y'].forEach(name => card.style.removeProperty(name));
    }
    card.addEventListener('pointermove', event => {
      if (reduced.matches || !fine.matches) return;
      const bounds = card.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (event.clientX-bounds.left)/bounds.width));
      const y = Math.max(0, Math.min(1, (event.clientY-bounds.top)/bounds.height));
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        card.style.setProperty('--contact-rx', ((.5-y)*9)+'deg');
        card.style.setProperty('--contact-ry', ((x-.5)*11)+'deg');
        card.style.setProperty('--contact-x', (x*100)+'%');
        card.style.setProperty('--contact-y', (y*100)+'%');
      });
    });
    card.addEventListener('pointerleave', reset);
    card.addEventListener('pointercancel', reset);
    reduced.addEventListener('change', reset);
    fine.addEventListener('change', reset);
  });
})();


// Small sculptural movement within each contact row; links remain native.
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  document.querySelectorAll('.contact-route').forEach(row => {
    let frame;
    function reset() {
      cancelAnimationFrame(frame);
      row.style.removeProperty('--sculpt-x');
      row.style.removeProperty('--sculpt-y');
    }
    row.addEventListener('pointermove', event => {
      if(reduced.matches || !fine.matches) return;
      const r=row.getBoundingClientRect();
      const x=Math.max(-1,Math.min(1,(event.clientX-r.left)/r.width*2-1));
      const y=Math.max(-1,Math.min(1,(event.clientY-r.top)/r.height*2-1));
      cancelAnimationFrame(frame);
      frame=requestAnimationFrame(()=>{
        row.style.setProperty('--sculpt-x', x*7+'px');
        row.style.setProperty('--sculpt-y', y*8+'px');
      });
    });
    row.addEventListener('pointerleave',reset);
    row.addEventListener('pointercancel',reset);
    reduced.addEventListener('change',reset);
    fine.addEventListener('change',reset);
  });
})();

// Section atmosphere responds to native scrolling; no wheel interception or snapping.
(() => {
  if (!('IntersectionObserver' in window)) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const sections = [...document.querySelectorAll('main > section[id]:not(#home)')];
  const active = new Set();
  let frame = 0;
  sections.forEach(section => {
    section.classList.add('section-flow');
    const light = document.createElement('div');
    light.className = 'section-flow-light';
    light.setAttribute('aria-hidden','true');
    section.append(light);
  });
  function paint() {
    frame = 0;
    if (reduced.matches) return;
    active.forEach(section => {
      const top = section.getBoundingClientRect().top;
      section.style.setProperty('--flow-offset', Math.max(-30,Math.min(30,top*.045))+'px');
    });
  }
  function schedule() {
    if (!frame && !reduced.matches) frame = requestAnimationFrame(paint);
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        active.add(entry.target);
        entry.target.classList.add('flow-in-view');
      } else {
        active.delete(entry.target);
        entry.target.classList.remove('flow-in-view');
      }
    });
    schedule();
  }, {rootMargin:'0px 0px -10% 0px',threshold:0});
  sections.forEach(section => observer.observe(section));
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule);
  reduced.addEventListener('change',()=>{
    cancelAnimationFrame(frame);frame=0;
    sections.forEach(section=>section.style.removeProperty('--flow-offset'));
    schedule();
  });
})();
