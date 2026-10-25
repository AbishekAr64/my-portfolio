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
