(() => {
  const canvas = document.querySelector('#data-canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const button = document.querySelector('#scene-motion');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false, visible = true, frame = 0, rotation = 0, previous = 0;
  const points = Array.from({length:78}, (_,i) => {
    const y = 1 - (i / 77) * 2, radius = Math.sqrt(1-y*y), angle = i * Math.PI * (3-Math.sqrt(5));
    return {x:Math.cos(angle)*radius,y,z:Math.sin(angle)*radius};
  });
  function draw(time=0) {
    frame=0;
    const w=canvas.width, h=canvas.height;
    const light=document.documentElement.dataset.theme==='light';
    if(previous && !paused && !reduce.matches) rotation += Math.min(time-previous,50)*.00014;
    previous=time;
    ctx.clearRect(0,0,w,h);
    const projected=points.map(p=>{
      const x=p.x*Math.cos(rotation)+p.z*Math.sin(rotation);
      const z=-p.x*Math.sin(rotation)+p.z*Math.cos(rotation);
      const scale=2.8/(2.8-z);
      return {x:w/2+x*w*.28*scale,y:h*.46+p.y*h*.28*scale,z,scale};
    });
    ctx.strokeStyle=light?'#7751a914':'#b9a0ff17';ctx.lineWidth=1;
    for(let i=1;i<9;i++){ctx.beginPath();ctx.moveTo(w*.08,h*.12+i*h*.08);ctx.lineTo(w*.92,h*.12+i*h*.08);ctx.stroke();}
    projected.forEach((p,i)=>{
      for(let j=i+1;j<points.length;j++){
        const a=points[i],b=points[j];
        if(Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z)>.49)continue;
        ctx.strokeStyle=light?`rgba(105,72,154,${.16+(p.z+1)*.14})`:`rgba(176,148,242,${.1+(p.z+1)*.18})`;
        ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(projected[j].x,projected[j].y);ctx.stroke();
      }
    });
    projected.sort((a,b)=>a.z-b.z).forEach((p,i)=>{
      ctx.fillStyle=i%8===0?(light?'#247b8d':'#83d2de'):(light?'#7751a9':'#c4afff');
      ctx.globalAlpha=.45+(p.z+1)*.275;
      ctx.beginPath();ctx.arc(p.x,p.y,Math.max(2,3*p.scale),0,Math.PI*2);ctx.fill();
    });
    ctx.globalAlpha=1;
    for(let i=0;i<22;i++){
      const bar=(.3+.7*(.5+.5*Math.sin(i*.6+rotation*3)))*h*.07;
      ctx.fillStyle=light?'#7751a95c':'#b9a0ff70';ctx.fillRect(w*.16+i*w*.031,h*.94-bar,w*.015,bar);
    }
    if(visible&&!paused&&!reduce.matches&&!document.hidden)frame=requestAnimationFrame(draw);
  }
  function refresh(){cancelAnimationFrame(frame);previous=0;draw();}
  button.addEventListener('click',()=>{paused=!paused;button.setAttribute('aria-pressed',String(paused));button.textContent=paused?'Resume motion ▶':'Pause motion Ⅱ';button.setAttribute('aria-label',paused?'Resume data animation':'Pause data animation');refresh();});
  function motionPreference(){button.hidden=reduce.matches;refresh();}
  reduce.addEventListener('change',motionPreference);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;refresh();},{threshold:.05}).observe(canvas);
  new MutationObserver(refresh).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  document.addEventListener('visibilitychange',refresh);
  motionPreference();
})();
