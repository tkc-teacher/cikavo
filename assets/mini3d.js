/* Міні-3D: прості 3D-моделі з граней, обертання мишею, малювання в SVG.
   Спільний для уроків і практичних розділу «Тривимірне моделювання» (9 клас).
   Модель: m = mdl(); m.add(box(...)); m.add(деталь, граньБатька) — деталь, що прилягає до грані,
   малюється одразу після неї (так немає помилок порядку). viewer(host, m, {…}) — переглядач.
   Одиниця — 10 мм (куб Tinkercad 20 мм = 2). */

const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const unit=a=>{const l=Math.hypot(a[0],a[1],a[2])||1; return [a[0]/l,a[1]/l,a[2]/l];};
const avg=pts=>{const c=[0,0,0]; pts.forEach(p=>{c[0]+=p[0]; c[1]+=p[1]; c[2]+=p[2];}); return c.map(v=>v/pts.length);};
const LIGHT=unit([-0.45,0.75,0.6]);
const hexRgb=h=>[1,3,5].map(i=>parseInt(h.substr(i,2),16));
const tone=(hex,k)=>'rgb('+hexRgb(hex).map(v=>Math.max(0,Math.min(255,Math.round(v*k)))).join(',')+')';

// Спільні візерунки (текстури, «отвір» Tinkercad)
(function(){
  if(document.getElementById('defs3d')) return;
  const s=document.createElementNS('http://www.w3.org/2000/svg','svg');
  s.setAttribute('width','0'); s.setAttribute('height','0'); s.setAttribute('aria-hidden','true');
  s.style.position='absolute';
  s.innerHTML=`<defs id="defs3d">
    <pattern id="tx-wood" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(6)">
      <path d="M0 3.5h16M0 10q4-1.5 8 0t8 0" stroke="#7A4A1E" stroke-width="1" fill="none" opacity=".55"/></pattern>
    <pattern id="tx-tile" width="12" height="9" patternUnits="userSpaceOnUse">
      <path d="M0 8.5h12M3 0v4.5M9 4.5v4" stroke="#4A1A10" stroke-width="1" opacity=".5"/></pattern>
    <pattern id="tx-hole" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <path d="M0 0v7" stroke="#5F6878" stroke-width="2.2" opacity=".45"/></pattern>
  </defs>`;
  (document.body||document.documentElement).prepend(s);
})();

// Призма: многокутник poly [[u,v]…] видавлено вздовж осі axis ('x'|'y'|'z') від t0 до t1
function prism(poly, axis, t0, t1, color, o={}){
  let a=0; poly.forEach((p,i)=>{const q=poly[(i+1)%poly.length]; a+=p[0]*q[1]-q[0]*p[1];});
  if(a<0) poly=poly.slice().reverse();
  const M = axis==='x' ? (u,v,t)=>[t,v,u] : axis==='y' ? (u,v,t)=>[u,t,v] : (u,v,t)=>[u,v,t];
  const F=(pts,n)=>({pts, n:unit(n), c:avg(pts), color, tex:o.tex, decals:[], kids:[]});
  const cap0=F(poly.map(p=>M(p[0],p[1],t0)), M(0,0,-1));
  const cap1=F(poly.map(p=>M(p[0],p[1],t1)), M(0,0,1));
  const sides=poly.map((p,i)=>{const q=poly[(i+1)%poly.length];
    return F([M(p[0],p[1],t0),M(q[0],q[1],t0),M(q[0],q[1],t1),M(p[0],p[1],t1)], M(q[1]-p[1],-(q[0]-p[0]),0));});
  const c=avg(poly.map(p=>[p[0],p[1],0]));
  return {faces:[cap0,cap1,...sides], cap0, cap1, sides, center:M(c[0],c[1],(t0+t1)/2), under:o.under, hole:o.hole};
}
const rect=(x0,y0,x1,y1)=>[[x0,y0],[x1,y0],[x1,y1],[x0,y1]];
// Паралелепіпед із центром (cx,cy,cz) і розмірами w×h×d; грані: front back left right top bottom
function box(cx,cy,cz,w,h,d,color,o){
  const p=prism(rect(cx-w/2,cy-h/2,cx+w/2,cy+h/2),'z',cz-d/2,cz+d/2,color,o);
  Object.assign(p,{back:p.cap0, front:p.cap1, bottom:p.sides[0], right:p.sides[1], top:p.sides[2], left:p.sides[3]});
  return p;
}
const ngon=(r,n,cx=0,cy=0,rot=0)=>Array.from({length:n},(_,i)=>{const a=rot+i*2*Math.PI/n; return [cx+r*Math.cos(a), cy+r*Math.sin(a)];});
const starPts=(cx,cy,r)=>Array.from({length:10},(_,i)=>{const a=Math.PI/2+i*Math.PI/5, rr=i%2?r*0.45:r; return [cx+rr*Math.cos(a), cy+rr*Math.sin(a)];});
function dec(face, pts, color, o={}){ face.decals.push({pts, color, ...o}); }
function mdl(){ const m={parts:[]}; m.add=(p,on)=>{ if(on){ p.on=true; on.kids.push(p); } m.parts.push(p); return p; }; return m; }

// Кульки з градієнтом
function grad(color){
  const id='bg'+color.slice(1);
  if(!document.getElementById(id)){
    const g=document.createElementNS('http://www.w3.org/2000/svg','radialGradient');
    g.id=id; g.setAttribute('cx','.36'); g.setAttribute('cy','.32'); g.setAttribute('r','.72');
    g.innerHTML=`<stop offset="0" stop-color="${tone(color,1.3)}"/><stop offset=".55" stop-color="${color}"/><stop offset="1" stop-color="${tone(color,.62)}"/>`;
    document.getElementById('defs3d').appendChild(g);
  }
  return `url(#${id})`;
}

/* Малює модель m з поглядом v → вміст SVG (рядок).
   v: W H S yaw pitch oy dy D; mode 'wire'|'clay'|'color'|'render'; floor+ground+shadow;
   ghost — модель пунктиром; axes — значок осей;
   grid:{n, y} — робоча площина Tinkercad розміром 2n×2n з клітинками 1 (= 10 мм);
   marks:[{p:[x,y,z], kind:'handle'|'dot'|'hot'|'label'|'lift', text}] — маркери поверх моделі. */
function render3d(m, v){
  const cyw=Math.cos(v.yaw), syw=Math.sin(v.yaw), cp=Math.cos(v.pitch), sp=Math.sin(v.pitch);
  const D=v.D||9, S=v.S, CX=v.W/2, CY=v.H/2+(v.dy||0), oy=v.oy||0;
  const rd=p=>{const x1=p[0]*cyw+p[2]*syw, z1=-p[0]*syw+p[2]*cyw; return [x1, p[1]*cp-z1*sp, p[1]*sp+z1*cp];};
  const rot=p=>rd([p[0],p[1]-oy,p[2]]);
  const pr=q=>{const f=D/(D-q[2]); return [CX+q[0]*S*f, CY-q[1]*S*f, f];};
  const P=pts=>pts.map(p=>{const s=pr(rot(p)); return s[0].toFixed(1)+','+s[1].toFixed(1);}).join(' ');
  const mode=v.mode||'color', out=[];
  const isVis=f=>{const q=rot(f.pts[0]); return dot(rd(f.n),[-q[0],-q[1],D-q[2]])>0;};
  const allFaces=[]; m.parts.forEach(p=>p.faces&&!p.hole&&p.faces.forEach(f=>allFaces.push(f)));

  // Робоча площина Tinkercad
  if(v.grid){
    const n=v.grid.n, y=v.grid.y||0;
    out.push(`<polygon points="${P([[-n,y,-n],[n,y,-n],[n,y,n],[-n,y,n]])}" fill="#D9E8F8" stroke="#8FB3DE" stroke-width="1.2"/>`);
    for(let i=-n;i<=n;i+=0.5){ const major=Number.isInteger(i);
      const st=`stroke="${major?'#A9C5E8':'#C4D8F0'}" stroke-width="${major?1:.6}"`;
      out.push(`<polyline points="${P([[i,y,-n],[i,y,n]])}" ${st}/><polyline points="${P([[-n,y,i],[n,y,i]])}" ${st}/>`); }
  }
  // Підлога й тіні
  if(v.floor && v.pitch>0.02){
    const g=v.ground; out.push(`<polygon points="${P(ngon(v.floor,40).map(([x,z])=>[x,g,z]))}" fill="${mode==='render'?'#D5DFF0':'#E6ECF7'}"/>`);
  }
  if(v.shadow){
    const g=v.ground, sh=p=>[p[0]+0.45*(p[1]-g), g, p[2]+0.3*(p[1]-g)];
    out.push('<g fill="#14213D" opacity=".22">');
    allFaces.forEach(f=>out.push(`<polygon points="${P(f.pts.map(sh))}"/>`));
    out.push('</g>');
  }

  if(mode==='wire'){
    const vis=[], hid=[]; allFaces.forEach(f=>(isVis(f)?vis:hid).push(f));
    hid.forEach(f=>out.push(`<polygon points="${P(f.pts)}" fill="none" stroke="#2457C5" stroke-width="1" stroke-dasharray="3 3" opacity=".35"/>`));
    vis.forEach(f=>out.push(`<polygon points="${P(f.pts)}" fill="none" stroke="#2457C5" stroke-width="1.6" stroke-linejoin="round"/>`));
  } else {
    const shade=rn=>{const d=Math.max(0,dot(rn,LIGHT)); return mode==='render' ? 0.42+0.72*d : 0.55+0.5*d;};
    const face=(f,hole)=>{
      const rn=rd(f.n), k=shade(rn);
      if(hole){ out.push(`<polygon points="${P(f.pts)}" fill="${tone('#C3C8D2',k)}" fill-opacity=".55" stroke="#7D8696" stroke-width=".8" stroke-linejoin="round"/><polygon points="${P(f.pts)}" fill="url(#tx-hole)"/>`); return; }
      const base=mode==='clay'?'#C9CED9':f.color, fill=tone(base,k);
      const st=mode==='render'?fill:tone(base,k*0.72);
      out.push(`<polygon points="${P(f.pts)}" fill="${fill}" stroke="${st}" stroke-width="${mode==='render'?0.8:1.1}" stroke-linejoin="round"/>`);
      if(f.tex && mode!=='clay') out.push(`<polygon points="${P(f.pts)}" fill="url(#tx-${f.tex})" opacity=".6"/>`);
      f.decals.forEach(d=>{
        const col = mode==='clay' ? tone('#AEB4C2',k) : d.flat ? d.color : tone(d.color,k);
        out.push(`<polygon points="${P(d.pts)}" fill="${col}"${d.hit?` data-hit="${d.hit}" class="hit" stroke="${d.flat?tone(d.color,.7):'none'}" stroke-width="1.2" stroke-linejoin="round"`:''}/>`);
      });
    };
    const part=p=>{
      if(p.ball){ const q=rot(p.c), s=pr(q);
        out.push(`<circle cx="${s[0].toFixed(1)}" cy="${s[1].toFixed(1)}" r="${(p.r*S*s[2]).toFixed(1)}" fill="${mode==='clay'?grad('#C9CED9'):grad(p.color)}" stroke="${tone(p.color,.6)}" stroke-width=".8"/>`); return; }
      if(p.stick){ const a=pr(rot(p.a)), b=pr(rot(p.b));
        out.push(`<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="${p.color}" stroke-width="${(p.w*S*(a[2]+b[2])/2).toFixed(1)}" stroke-linecap="round"/>`); return; }
      const info=p.faces.map(f=>({f, vis:isVis(f), z:rot(f.c)[2]}));
      if(p.hole){ info.sort((a,b)=>a.z-b.z).forEach(i=>face(i.f,true)); return; }
      info.filter(i=>!i.vis).forEach(i=>i.f.kids.forEach(part));
      info.filter(i=>i.vis).sort((a,b)=>a.z-b.z).forEach(i=>{ face(i.f); i.f.kids.forEach(part); });
    };
    const depth=p=>p.ball?rot(p.c)[2]+p.r*0.5 : p.stick?rot(avg([p.a,p.b]))[2]-0.05 : rot(p.center)[2];
    const roots=m.parts.filter(p=>!p.on);
    roots.filter(p=>p.under).forEach(part);
    roots.filter(p=>!p.under&&!p.hole).map(p=>({p,z:depth(p)})).sort((a,b)=>a.z-b.z).forEach(r=>part(r.p));
    roots.filter(p=>p.hole).forEach(part);   // «отвори» Tinkercad — напівпрозорі, поверх
  }

  // Пунктирний контур-ціль
  if(v.ghost){
    v.ghost.parts.forEach(p=>p.faces.forEach(f=>{ const vis=isVis(f);
      out.push(`<polygon points="${P(f.pts)}" fill="none" stroke="#F2643D" stroke-width="${vis?2:1.2}" stroke-dasharray="6 4" opacity="${vis?1:.45}" stroke-linejoin="round"/>`); }));
  }
  // Маркери: ручки розміру, точки вирівнювання, підписи
  (v.marks||[]).forEach(mk=>{
    const s=pr(rot(mk.p)), x=s[0].toFixed(1), y=s[1].toFixed(1);
    if(mk.kind==='handle') out.push(`<rect x="${(s[0]-4).toFixed(1)}" y="${(s[1]-4).toFixed(1)}" width="8" height="8" fill="#fff" stroke="#1F2937" stroke-width="1.3"/>`);
    else if(mk.kind==='top') out.push(`<rect x="${(s[0]-4).toFixed(1)}" y="${(s[1]-4).toFixed(1)}" width="8" height="8" fill="#fff" stroke="#1F2937" stroke-width="1.3" transform="rotate(45 ${x} ${y})"/>`);
    else if(mk.kind==='lift') out.push(`<path d="M${x} ${(s[1]-14).toFixed(1)}l-5 11h10z" fill="#1F2937"/>`);
    else if(mk.kind==='dot') out.push(`<circle cx="${x}" cy="${y}" r="4" fill="#1F2937"/>`);
    else if(mk.kind==='hot') out.push(`<circle cx="${x}" cy="${y}" r="8" fill="#F2643D" opacity=".35"/><circle cx="${x}" cy="${y}" r="4.5" fill="#F2643D" stroke="#fff" stroke-width="1.5"/>`);
    else if(mk.kind==='label') out.push(`<g font-family="Roboto, sans-serif" font-size="11"><rect x="${(s[0]-17).toFixed(1)}" y="${(s[1]-8).toFixed(1)}" width="34" height="16" rx="3" fill="#fff" stroke="#9AA3B2"/><text x="${x}" y="${(s[1]+4).toFixed(1)}" text-anchor="middle" fill="#1F2937">${mk.text}</text></g>`);
  });
  // Осі: ширина, висота, глибина
  if(v.axes){
    const ox=36, oyy=v.H-34;
    [[[1,0,0],'#D63B3B','Ш'],[[0,1,0],'#1F9D63','В'],[[0,0,1],'#2F6FE0','Г']].forEach(([d,c,t])=>{
      const r=rd(d), x=ox+r[0]*24, y=oyy-r[1]*24;
      out.push(`<line x1="${ox}" y1="${oyy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${c}" stroke-width="3" stroke-linecap="round"/><text x="${(ox+r[0]*34).toFixed(1)}" y="${(oyy-r[1]*34+4).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="800" fill="${c}" font-family="Baloo 2, sans-serif">${t}</text>`);
    });
  }
  return out.join('');
}

// Переглядач: SVG у host; перетягування обертає модель (drag:false — ні), spin — автоповорот
const spinning=new Set();
let lastT=0;
function spinLoop(t){
  const dt=lastT?Math.min(0.05,(t-lastT)/1000):0; lastT=t;
  spinning.forEach(api=>{ if(api.seen && !api.dragging && api.v.spin){ api.v.yaw+=dt*api.v.spin; api.draw(); } });
  requestAnimationFrame(spinLoop);
}
requestAnimationFrame(spinLoop);
const io=new IntersectionObserver(es=>es.forEach(e=>{ e.target._api.seen=e.isIntersecting; }));

function viewer(host, model, opts){
  const v=Object.assign({W:360,H:260,S:60,yaw:0.6,pitch:0.35,mode:'color',minP:-1.45,maxP:1.45,drag:true}, opts);
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox',`0 0 ${v.W} ${v.H}`); svg.classList.add('v3d');
  host.insertBefore(svg, host.firstChild);
  const api={v, model, svg, draw(){ svg.innerHTML=render3d(typeof api.model==='function'?api.model():api.model, v); }};
  if(v.drag){
    svg.classList.add('grab');
    let d=null;
    svg.addEventListener('pointerdown',e=>{
      d={x:e.clientX, y:e.clientY, yaw:v.yaw, p:v.pitch, moved:false, hit:e.target.closest('[data-hit]')?.dataset.hit};
      api.dragging=true; svg.setPointerCapture(e.pointerId);
    });
    svg.addEventListener('pointermove',e=>{
      if(!d) return;
      const dx=e.clientX-d.x, dy=e.clientY-d.y;
      if(Math.abs(dx)+Math.abs(dy)>5 && !d.moved){ d.moved=true; host.querySelector('.hint3d')?.classList.add('gone'); }
      if(!d.moved) return;
      v.yaw=d.yaw+dx*0.012; v.pitch=Math.max(v.minP,Math.min(v.maxP,d.p+dy*0.01)); api.draw();
    });
    const up=()=>{ if(d && !d.moved && d.hit && v.onHit) v.onHit(d.hit); d=null; api.dragging=false; };
    svg.addEventListener('pointerup',up); svg.addEventListener('pointercancel',up);
    svg.addEventListener('contextmenu',e=>e.preventDefault());
  }
  svg._api=api; api.seen=false; io.observe(svg); spinning.add(api);
  api.draw();
  return api;
}
