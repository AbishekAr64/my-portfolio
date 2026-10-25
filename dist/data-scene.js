(() => {
  const canvas = document.querySelector('#data-canvas');
  const ctx = canvas?.getContext('2d');
  if (!ctx) return;
  const hero = canvas.closest('.hero');
  const button = document.querySelector('#scene-motion');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  let paused = false, visible = true, frame = 0, clock = 0, previous = 0;
  let width = 1400, height = 480, light = false;
  let targetX = 0, targetY = 0, leanX = 0, leanY = 0;
  const nodes = Array.from({length:100}, (_, i) => {
    const y = 1 - i / 99 * 2, r = Math.sqrt(1-y*y), a = i * Math.PI * (3-Math.sqrt(5));
    return {x:Math.cos(a)*r,y,z:Math.sin(a)*r};
  });
  const edges = [];
  nodes.forEach((p,i) => nodes.slice(i+1).forEach((q,j) => {
    if (Math.hypot(p.x-q.x,p.y-q.y,p.z-q.z)<.43) edges.push([i,i+j+1]);
  }));
  const torus = Array.from({length:560},(_,i)=>{
    const u = (i%56)/56*Math.PI*2, v = Math.floor(i/56)/10*Math.PI*2;
    return {x:(1+.32*Math.cos(v))*Math.cos(u),y:.32*Math.sin(v),z:(1+.32*Math.cos(v))*Math.sin(u)};
  });
  function project(p, cx, cy, size, yaw, pitch) {
    const x=p.x*Math.cos(yaw)+p.z*Math.sin(yaw), z=-p.x*Math.sin(yaw)+p.z*Math.cos(yaw);
    const y=p.y*Math.cos(pitch)-z*Math.sin(pitch), depth=p.y*Math.sin(pitch)+z*Math.cos(pitch);
    const s=4/(4-depth);
    return {x:cx+x*size*s,y:cy+y*size*s,z:depth,s};
  }
  function line(a,b,color,lineWidth=1) {
    ctx.strokeStyle=color;ctx.lineWidth=lineWidth;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
  }
  function dot(p,r,color,alpha=1) {
    ctx.globalAlpha=alpha;ctx.fillStyle=color;ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
  }
  function halo(x,y,r,color) {
    const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);
  }
  function network(x,y,r) {
    const ps=nodes.map(p=>project(p,x,y,r,clock*.17+leanX*.35,-.12+leanY*.2));
    halo(x,y,r*1.5,light?'#8f6ca518':'#c7a2ff16');
    edges.forEach(([i,j])=>{
      const alpha=.1+(ps[i].z+1)*.17;
      line(ps[i],ps[j],light?`rgba(92,62,119,${alpha})`:`rgba(207,185,249,${alpha})`);
    });
    ps.map((p,i)=>({...p,i})).sort((a,b)=>a.z-b.z).forEach(p=>{
      const color=p.i%9===0?(light?'#387e76':'#c2f3d8'):(light?'#795291':'#ddcaff');
      dot(p,Math.max(1.5,2.4*p.s),color,.45+(p.z+1)*.25);
      if(p.i%13===0 && p.z>0) dot(p,6*p.s,color,.08);
    });
    // Pulses travel along real network edges, rather than a disconnected overlay.
    edges.filter((_,i)=>i%19===0).forEach(([a,b],i)=>{
      const t=(clock*.3+i*.13)%1;
      dot({x:ps[a].x+(ps[b].x-ps[a].x)*t,y:ps[a].y+(ps[b].y-ps[a].y)*t},2.3,light?'#397f75':'#ddffe7',.9);
    });
    ctx.strokeStyle=light?'#78569030':'#c9b3ff30';ctx.lineWidth=.8;ctx.beginPath();ctx.ellipse(x,y,r*1.5,r*.35,-.35,0,Math.PI*2);ctx.stroke();
    const a=clock*.45;dot({x:x+Math.cos(a)*r*1.5,y:y+Math.sin(a)*r*.35},3,light?'#81618e':'#e1c8ff');
  }
  function columns(x,y,size) {
    const yaw=-.52+Math.sin(clock*.25)*.1+leanX*.2, pitch=.25+leanY*.12;
    const faces=[];
    for(let i=0;i<6;i++){
      const h=.4+i*.16+Math.sin(clock*1.1+i*.8)*.18;
      const xx=(i-2.5)*.34, d=.13;
      const verts=[{x:xx-d,y:.6,z:-d},{x:xx+d,y:.6,z:-d},{x:xx+d,y:.6,z:d},{x:xx-d,y:.6,z:d},{x:xx-d,y:.6-h,z:-d},{x:xx+d,y:.6-h,z:-d},{x:xx+d,y:.6-h,z:d},{x:xx-d,y:.6-h,z:d}].map(p=>project(p,x,y,size,yaw,pitch));
      [[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7],[4,5,6,7]].forEach((ids,f)=>faces.push({points:ids.map(k=>verts[k]),depth:ids.reduce((s,k)=>s+verts[k].z,0)/4,color:light?['#8f72ab','#a78dbf','#9579b1','#82629c','#d6bde7'][f]:['#8c6bb1','#b193d3','#9c7cc1','#745993','#e1c9f8'][f]}));
    }
    // Painter's algorithm keeps all visible prism faces in depth order.
    faces.sort((a,b)=>a.depth-b.depth).forEach(f=>{
      ctx.beginPath();f.points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fillStyle=f.color;ctx.fill();ctx.strokeStyle=light?'#fff5ff38':'#f4e8ff30';ctx.lineWidth=.7;ctx.stroke();
    });
    for(let i=0;i<7;i++){
      const a=project({x:-1.2+i*.4,y:.65,z:-.6},x,y,size,yaw,pitch),b=project({x:-1.2+i*.4,y:.65,z:.8},x,y,size,yaw,pitch);
      line(a,b,light?'#81618e28':'#d1b9f52b');
    }
  }
  function signal(x,y,size) {
    halo(x,y,size*1.65,light?'#44897e0d':'#abe8d21a');
    const ps=torus.map((p,i)=>({...project(p,x,y,size,clock*.22+leanX*.25,.65+Math.sin(clock*.2)*.2+leanY*.2),i}));
    ps.sort((a,b)=>a.z-b.z).forEach(p=>{
      const pulse=(Math.sin(p.i*.14-clock*1.6)+1)/2;
      dot(p,(1.1+pulse*.65)*p.s,light?(pulse>.7?'#775891':'#367f78'):(pulse>.7?'#dfc9ff':'#b2e6d6'),.25+(p.z+1.4)/2.8*.65);
    });
  }
  function draw(time=0) {
    frame=0;
    const running=visible&&!paused&&!reduce.matches&&!document.hidden;
    if(previous && running) clock+=Math.min(time-previous,50)/1000;
    previous=time;
    leanX+=(targetX-leanX)*.055;leanY+=(targetY-leanY)*.055;
    ctx.clearRect(0,0,width,height);
    const mobile=matchMedia('(max-width:650px)').matches;
    const globe=mobile?{x:width*.5,y:height*.32,r:width*.235}:{x:width*.5,y:height*.47,r:height*.31};
    const drift=Math.sin(clock*.7)*4;
    network(globe.x,globe.y+drift,globe.r);
    columns(width*(mobile?.24:.17),height*(mobile?.77:.53)-drift,width*(mobile?.17:.105));
    signal(width*(mobile?.77:.83),height*(mobile?.76:.47)+drift,width*(mobile?.14:.082));
    if(running)frame=requestAnimationFrame(draw);
  }
  function refresh(){
    hero.classList.toggle('motion-paused',paused||reduce.matches||!visible||document.hidden);
    cancelAnimationFrame(frame);previous=0;draw();
  }
  function resize(){
    const rect=canvas.getBoundingClientRect();width=rect.width;height=rect.height;
    if(!width||!height)return;
    const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);refresh();
  }
  button.addEventListener('click',()=>{
    paused=!paused;button.setAttribute('aria-pressed',String(paused));button.textContent=paused?'Resume motion ▶':'Pause motion Ⅱ';button.setAttribute('aria-label',paused?'Resume hero animations':'Pause hero animations');refresh();
  });
  canvas.addEventListener('pointermove',e=>{
    if(reduce.matches||paused||!fine.matches)return;
    const r=canvas.getBoundingClientRect();targetX=(e.clientX-r.left)/r.width*2-1;targetY=(e.clientY-r.top)/r.height*2-1;
  });
  canvas.addEventListener('pointerleave',()=>{targetX=targetY=0;});
  reduce.addEventListener('change',()=>{targetX=targetY=leanX=leanY=0;button.hidden=reduce.matches;refresh();});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;refresh();},{threshold:.02}).observe(hero);
  new ResizeObserver(resize).observe(canvas);
  function theme(){light=document.documentElement.dataset.theme==='light';refresh();}
  new MutationObserver(theme).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  document.addEventListener('visibilitychange',refresh);
  button.hidden=reduce.matches;theme();resize();
})();
