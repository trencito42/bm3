/* =====================================================================
   blip-fx.js — shared engine for the Blipmade chat concepts
   1) dot-matrix font   2) interactive glyph grid   3) orb with eyes
   4) MOCK site builder (swap `BlipFX.plan/edit` for your real API)
   ===================================================================== */
(function(){
var NS='http://www.w3.org/2000/svg';
var sleep=function(ms){return new Promise(function(r){setTimeout(r,ms)})};
var $=function(s,r){return (r||document).querySelector(s)};

/* ---------------- 1) DOT-MATRIX FONT ---------------- */
var GLYPHS={
A:'.XXX. X...X X...X XXXXX X...X X...X X...X',B:'XXXX. X...X X...X XXXX. X...X X...X XXXX.',
C:'.XXX. X...X X.... X.... X.... X...X .XXX.',D:'XXXX. X...X X...X X...X X...X X...X XXXX.',
E:'XXXXX X.... X.... XXXX. X.... X.... XXXXX',F:'XXXXX X.... X.... XXXX. X.... X.... X....',
G:'.XXX. X...X X.... X.XXX X...X X...X .XXX.',H:'X...X X...X X...X XXXXX X...X X...X X...X',
I:'XXX .X. .X. .X. .X. .X. XXX',J:'..XXX ...X. ...X. ...X. ...X. X..X. .XX..',
K:'X...X X..X. X.X.. XX... X.X.. X..X. X...X',L:'X.... X.... X.... X.... X.... X.... XXXXX',
M:'X...X XX.XX X.X.X X.X.X X...X X...X X...X',N:'X...X XX..X X.X.X X.X.X X.X.X X..XX X...X',
O:'.XXX. X...X X...X X...X X...X X...X .XXX.',P:'XXXX. X...X X...X XXXX. X.... X.... X....',
Q:'.XXX. X...X X...X X...X X.X.X X..X. .XX.X',R:'XXXX. X...X X...X XXXX. X.X.. X..X. X...X',
S:'.XXXX X.... X.... .XXX. ....X ....X XXXX.',T:'XXXXX ..X.. ..X.. ..X.. ..X.. ..X.. ..X..',
U:'X...X X...X X...X X...X X...X X...X .XXX.',V:'X...X X...X X...X X...X X...X .X.X. ..X..',
W:'X...X X...X X...X X.X.X X.X.X X.X.X .X.X.',X:'X...X X...X .X.X. ..X.. .X.X. X...X X...X',
Y:'X...X X...X .X.X. ..X.. ..X.. ..X.. ..X..',Z:'XXXXX ....X ...X. ..X.. .X... X.... XXXXX',
0:'.XXX. X...X X..XX X.X.X XX..X X...X .XXX.',1:'..X.. .XX.. ..X.. ..X.. ..X.. ..X.. .XXX.',
2:'.XXX. X...X ....X ...X. ..X.. .X... XXXXX',3:'XXXXX ...X. ..X.. ...X. ....X X...X .XXX.',
4:'...X. ..XX. .X.X. X..X. XXXXX ...X. ...X.',5:'XXXXX X.... XXXX. ....X ....X X...X .XXX.',
6:'..XX. .X... X.... XXXX. X...X X...X .XXX.',7:'XXXXX ....X ...X. ..X.. .X... .X... .X...',
8:'.XXX. X...X X...X .XXX. X...X X...X .XXX.',9:'.XXX. X...X X...X .XXXX ....X ...X. .XX..',
$:'..X.. .XXXX X.X.. .XXX. ..X.X XXXX. ..X..','%':'XX..X XX..X ...X. ..X.. .X... X..XX X..XX','#':'.X.X. .X.X. XXXXX .X.X. XXXXX .X.X. .X.X.','@':'.XXX. X...X X.XXX X.X.X X.XXX X.... .XXXX','×':'..... X...X .X.X. ..X.. .X.X. X...X .....','✓':'..... ....X ...X. X.X.. .X... ..... .....',
'.':'. . . . . . X',',':'.. .. .. .. .. .X X.','!':'X X X X X . X','?':'.XXX. X...X ....X ...X. ..X.. ..... ..X..',
':':'. . X . . X .','-':'... ... ... XXX ... ... ...','_':'..... ..... ..... ..... ..... ..... XXXXX',
'+':'..... ..X.. ..X.. XXXXX ..X.. ..X.. .....','/':'....X ....X ...X. ..X.. .X... X.... X....',
'(':'.X X. X. X. X. X. .X',')':'X. .X .X .X .X .X X.','·':'. . . X . . .','\'':'X X . . . . .','&':'.XX.. X..X. X.X.. .X... X.X.X X..X. .XX.X'
};
var _gc={};
function glyph(ch){var k=ch.toUpperCase();if(_gc[k])return _gc[k];var g=GLYPHS[k];if(!g)return null;var rows=g.split(' ');return _gc[k]={w:rows[0].length,rows:rows}}
function layout(text){
  var dots=[],cells=[],x=0;
  for(var ch of text){
    var g=glyph(ch)||{w:3,rows:Array(7).fill('...')};
    g.rows.forEach(function(row,y){for(var i=0;i<row.length;i++)(row[i]==='X'?dots:cells).push({x:x+i,y:y})});
    x+=g.w+1;
  }
  return {dots:dots,cells:cells,width:Math.max(1,x-1)};
}
var rnd=function(e){var t=Math.sin(e*12.9898)*43758.5453;return (t-Math.floor(t))*2-1};
function dotText(o){
  var L=layout(o.text),d=o.delay||0,off=o.offset||0;
  var svg=document.createElementNS(NS,'svg');
  svg.setAttribute('viewBox','-0.5 -0.5 '+L.width+' 7');
  svg.setAttribute('class','dm'+(o.animate?(o.quick?' dm-quick':' dm-anim'):'')+(o.assemble?' dm-asm':'')+(o.className?' '+o.className:''));
  if(o.title){svg.setAttribute('role','img');svg.setAttribute('aria-label',o.title)}else svg.setAttribute('aria-hidden','true');
  var c=function(x,y,cls){var e=document.createElementNS(NS,'circle');e.setAttribute('cx',x);e.setAttribute('cy',y);e.setAttribute('r',.4);if(cls)e.setAttribute('class',cls);return e};
  if(o.ghost)L.cells.forEach(function(p){svg.appendChild(c(p.x,p.y,'dm-ghost'))});
  L.dots.forEach(function(p,i){
    var e=c(p.x,p.y);e.setAttribute('fill','currentColor');
    if(o.assemble){e.style.setProperty('--d',(d+Math.abs(rnd(i+7))*500)+'ms');e.style.setProperty('--tx',(rnd(i)*14)+'px');e.style.setProperty('--ty',(rnd(i+99)*9)+'px')}
    else if(o.animate)e.style.setProperty('--d',o.quick?((p.x*3+p.y*2)+'ms'):((d+(off+p.x)*14+p.y*6)+'ms'));
    svg.appendChild(e);
  });
  return svg;
}
/* <span data-dm="TEXT" data-h="12" data-w="420" data-ghost data-anim data-asm> */
function mountDots(root){
  (root||document).querySelectorAll('[data-dm]').forEach(function(h){
    var s=dotText({text:h.dataset.dm,title:h.dataset.dm,ghost:'ghost' in h.dataset,animate:'anim' in h.dataset,assemble:'asm' in h.dataset,delay:+h.dataset.delay||0});
    if(h.dataset.h)s.style.height=h.dataset.h+'px',s.style.width='auto';
    if(h.dataset.w)s.style.width='100%',s.style.maxWidth=h.dataset.w+'px',s.style.height='auto';
    h.replaceWith(s);
  });
}

/* ---------------- 2) INTERACTIVE GLYPH GRID ---------------- */
var HUE=[[-180,[138,77,255]],[-135,[154,107,255]],[-90,[255,90,184]],[-40,[255,106,58]],[20,[255,140,90]],[60,[36,198,255]],[135,[63,123,255]],[180,[138,77,255]]];
function hueAt(rad){var t=rad*180/Math.PI;for(var i=0;i<HUE.length-1;i++){var a=HUE[i][0],c=HUE[i][1],b=HUE[i+1][0],d=HUE[i+1][1];if(t>=a&&t<=b){var k=(t-a)/(b-a);return Math.round(c[0]+(d[0]-c[0])*k)+','+Math.round(c[1]+(d[1]-c[1])*k)+','+Math.round(c[2]+(d[2]-c[2])*k)}}return '138,77,255'}
var PICTOS=[['..x..','..x..','xxxxx','..x..','..x..'],['x...x','.x.x.','..x..','.x.x.','x...x'],['..x..','.xxx.','xxxxx','.xxx.','..x..'],['.x.x.','x...x','.....','x...x','.x.x.'],['xx.xx','xx.xx','.....','xx.xx','xx.xx'],['....x','...x.','..x..','.x...','x....']];
function dotField(canvas,o){
  o=o||{};
  var pitch=o.pitch||22,strength=o.strength==null?1:o.strength,glyphs=!!o.glyphs,radius=o.radius||190;
  var base=o.tone==='light'?[10,10,10]:[255,255,255];
  var host=o.host||canvas.closest('[data-dot-host]')||canvas.parentElement;
  var ctx=canvas.getContext('2d'),reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var OFF=-1e4,W=0,H=0,raf=0,visible=true,m={x:OFF,y:OFF,tx:OFF,ty:OFF},boost=0;
  function resize(){var dpr=Math.min(devicePixelRatio||1,2),r=canvas.getBoundingClientRect();W=r.width;H=r.height;canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)}
  function frame(){
    raf=0;ctx.clearRect(0,0,W,H);
    if(reduce||m.tx===OFF||m.x===OFF){m.x=m.tx;m.y=m.ty}else{m.x+=(m.tx-m.x)*.18;m.y+=(m.ty-m.y)*.18}
    var cols=Math.ceil(W/pitch)+1,rows=Math.ceil(H/pitch)+1,ox=(W-(cols-1)*pitch)/2,oy=(H-(rows-1)*pitch)/2;
    for(var j=0;j<rows;j++)for(var i=0;i<cols;i++){
      var x=ox+i*pitch,y=oy+j*pitch,f=Math.max(0,1-Math.hypot(x-m.x,y-m.y)/radius);
      var p=(.09+f*.55)*strength;
      if(f>.5)ctx.fillStyle='rgba('+hueAt(Math.atan2(y-m.y,x-m.x))+','+((.45+(f-.5)*1.4)*strength)+')';
      else ctx.fillStyle='rgba('+base[0]+','+base[1]+','+base[2]+','+(glyphs?Math.min(1,p*1.4):p)+')';
      ctx.beginPath();
      if(glyphs){
        var g=PICTOS[(i*7+j*13+i*j%5)%6],sc=1+f*.6,st=1.9*sc;
        for(var a=0;a<5;a++)for(var b=0;b<5;b++){if(g[a][b]!=='x')continue;var px=x+(b-2)*st,py=y+(a-2)*st;ctx.moveTo(px+.62*sc,py);ctx.arc(px,py,.62*sc,0,Math.PI*2)}
      }else ctx.arc(x,y,1.15+f*1.6,0,Math.PI*2);
      ctx.fill();
    }
    if(Math.abs(m.tx-m.x)+Math.abs(m.ty-m.y)>.5)kick();
  }
  function kick(){if(!raf&&visible)raf=requestAnimationFrame(frame)}
  var mv=function(e){var r=canvas.getBoundingClientRect();m.tx=e.clientX-r.left;m.ty=e.clientY-r.top;kick()};
  var lv=function(){m.tx=m.ty=OFF;kick()};
  resize();kick();
  var ro=new ResizeObserver(function(){resize();kick()});ro.observe(canvas);
  var io=new IntersectionObserver(function(en){visible=en[0].isIntersecting;kick()});io.observe(canvas);
  host.addEventListener('pointermove',mv);host.addEventListener('pointerleave',lv);
  return {
    /* push the "cursor" somewhere programmatically (e.g. follow the orb) */
    pulse:function(x,y){m.tx=x;m.ty=y;kick()},
    destroy:function(){cancelAnimationFrame(raf);ro.disconnect();io.disconnect();host.removeEventListener('pointermove',mv);host.removeEventListener('pointerleave',lv)}
  };
}

/* ---------------- 3) ORB WITH EYES ---------------- */
var orbs=new Set(),orbN=0,mouse={x:0,y:0},lookRaf=0,lookT;
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
function updateLook(){
  lookRaf=0;var vw=innerWidth,vh=innerHeight,u=[];
  orbs.forEach(function(o){
    if(!o.isConnected)return;var r=o.getBoundingClientRect();
    if(!r.width||r.bottom<0||r.top>vh||r.right<0||r.left>vw)return;
    var dx=mouse.x-(r.left+r.width/2),dy=mouse.y-(r.top+r.height/2),d=Math.hypot(dx,dy)||1,k=Math.min(1,d/Math.max(48,r.width*3))/d;
    u.push([o,dx*k*7,dy*k*6]);
  });
  u.forEach(function(a){a[0].style.setProperty('--lx',a[1].toFixed(2));a[0].style.setProperty('--ly',a[2].toFixed(2));a[0].dataset.look=''});
  clearTimeout(lookT);lookT=setTimeout(function(){orbs.forEach(function(o){o.style.removeProperty('--lx');o.style.removeProperty('--ly');delete o.dataset.look})},2500);
}
if(!reduce)addEventListener('pointermove',function(e){if(e.pointerType==='touch')return;mouse.x=e.clientX;mouse.y=e.clientY;if(!lookRaf)lookRaf=requestAnimationFrame(updateLook)},{passive:true});
function orb(size,state){
  var id='klf'+(orbN++),el=document.createElement('span');
  el.className='kl-face';el.dataset.state=state||'idle';el.style.setProperty('--orb',(size||28)+'px');el.setAttribute('aria-hidden','true');
  el.innerHTML='<span class="kl-face-aura">'+['g','a','b','c','e','f'].map(function(k){return '<i class="kl-face-ring kl-face-ring-'+k+'"></i>'}).join('')+'</span>'+
  '<svg viewBox="0 0 100 100"><defs><radialGradient id="'+id+'b" cx="50%" cy="50%" r="50%" fx="48%" fy="54%"><stop offset="0" stop-color="#14533f"/><stop offset=".45" stop-color="#0e3c39"/><stop offset=".8" stop-color="#0a2730"/><stop offset=".92" stop-color="#0b1d2a" stop-opacity=".8"/><stop offset="1" stop-color="#0b1d2a" stop-opacity=".35"/></radialGradient>'+
  '<radialGradient id="'+id+'e"><stop offset=".8" stop-color="#5fd4ff" stop-opacity="0"/><stop offset=".95" stop-color="#5fd4ff" stop-opacity=".55"/><stop offset="1" stop-color="#5fd4ff" stop-opacity="0"/></radialGradient>'+
  '<linearGradient id="'+id+'m" x1="0" y1="0" x2="0" y2="1"><stop offset=".35" stop-color="#000"/><stop offset="1" stop-color="#fff"/></linearGradient><mask id="'+id+'k"><rect width="100" height="100" fill="url(#'+id+'m)"/></mask></defs>'+
  '<circle class="kl-face-ball" cx="50" cy="50" r="34" fill="url(#'+id+'b)"/><circle cx="50" cy="50" r="34" fill="url(#'+id+'e)" mask="url(#'+id+'k)"/></svg>'+
  '<i class="kl-face-ring kl-face-ring-d"></i><span class="kl-face-fl"><span class="kl-face-f"><span class="kl-face-look"><span class="kl-face-eyes"><i class="kl-face-eye"></i><i class="kl-face-eye kl-face-eye-r"></i>'+
  '<svg class="kl-face-joys" viewBox="0 0 100 100"><path class="kl-face-joy" d="M35 54 Q40.5 41 46 54"/><path class="kl-face-joy kl-face-joy-r" d="M54 54 Q59.5 41 65 54"/></svg></span></span></span></span>';
  if(!reduce)orbs.add(el);
  el.setState=function(s){el.dataset.state=s;return el};
  return el;
}
function mountOrbs(root){(root||document).querySelectorAll('[data-orb]').forEach(function(h){var o=orb(+h.dataset.orb||28,h.dataset.state||'idle');if(h.className)o.className+=' '+h.className;if(h.id)o.id=h.id;h.replaceWith(o)})}

/* dot progress bar */
function dotBar(n){
  var el=document.createElement('div');el.className='dbar';
  for(var i=0;i<n;i++)el.appendChild(document.createElement('i'));
  el.set=function(f){var on=Math.round(f*n);[].forEach.call(el.children,function(d,i){d.className=i<on-1?'on':i===on-1?'hot':''})};
  return el;
}

/* ---------------- 4) MOCK SITE BUILDER ---------------- */
var KINDS=[
 {k:'food',label:'food & hospitality',re:/caf[eé]|bak|coffee|restaur|pizza|food|bistro|pastr|brunch|\bbar\b|cofet|brutar|patiser|pub\b/i,
  name:'Crumb & Co.',slug:'crumb-co',tag:'Fresh bread, slow mornings.',sub:'A neighbourhood bakery and café. Book a table, order for pickup, or just come hungry.',cta:'Reserve a table',nav:['Menu','Story','Visit'],
  pal:{b:'#fbf3e6',i:'#2b1d12',a:'#d9622b',f:'Georgia,"Times New Roman",serif'},
  feats:[['Baked at 5am','Small batches, stone-milled flour, nothing rushed.'],['Neighbourhood coffee','Single-origin beans, roasted every week.'],['Weekend brunch','Book the long table for friends and family.']],
  quote:['“Best croissant in town, and I have checked.”','Marta, regular since 2019']},
 {k:'port',label:'portfolio',re:/portfolio|photograph|fotograf|design(er)?\b|artist|illustrat|freelanc|architect|studio/i,
  name:'Nora Vale',slug:'nora-vale',tag:'Images with a quiet voice.',sub:'Independent photographer and art director. Editorial, brand and documentary work.',cta:'See selected work',nav:['Work','About','Contact'],
  pal:{b:'#0b0b0c',i:'#f3f3f1',a:'#c6ff3d',f:'"Geist Mono",ui-monospace,monospace'},
  feats:[['Editorial','Magazines, books and long-form visual stories.'],['Brand','Campaign imagery and identity systems.'],['Documentary','People and places, shot on location.']],
  quote:['“She sees the frame before it exists.”','Art director, Kinfolk Weekly']},
 {k:'shop',label:'online store',re:/shop|store|sell|merch|candle|handmade|boutique|magazin|vand|produs|e-?commerce|clothes|jewel/i,
  name:'Wick & Wild',slug:'wick-and-wild',tag:'Hand-poured, small-batch candles.',sub:'Soy wax, cotton wicks and scents that remind you of somewhere you have been.',cta:'Shop the collection',nav:['Shop','Story','Cart (0)'],
  pal:{b:'#f6f4ff',i:'#17132b',a:'#6d3ff0',f:'Inter,system-ui,sans-serif'},
  feats:[['Cedar & Smoke','45-hour burn · poured in Lisbon.'],['Fig Leaf','Green, milky, a little bit sweet.'],['Salt Marsh','Clean air, sea breeze, driftwood.']],
  quote:['“Smells like a holiday I have not taken yet.”','Verified buyer']},
 {k:'saas',label:'product landing',re:/.*/,
  name:'Tempo',slug:'tempo',tag:'Time tracking that stays out of your way.',sub:'Track work automatically, see where the week went, and invoice in one click.',cta:'Start free trial',nav:['Product','Pricing','Docs'],
  pal:{b:'#070b16',i:'#eef2ff',a:'#4f7cff',f:'Inter,system-ui,sans-serif'},
  feats:[['Automatic capture','Tempo logs your work in the background.'],['Weekly insights','See patterns before they become problems.'],['One-click invoices','Turn tracked hours into a PDF in seconds.']],
  quote:['“We got four hours a week back. Per person.”','Head of Ops, Northwind']}
];
var ORDER=['hero','feats','gallery','pricing','quote','faq','contact','cta','footer'];
var LABEL={hero:'Header & hero',feats:'Features',gallery:'Gallery',pricing:'Pricing',quote:'Social proof',faq:'FAQ',contact:'Contact',cta:'Call to action',footer:'Footer'};
function plan(prompt){
  var K=KINDS.filter(function(k){return k.re.test(prompt)})[0]||KINDS[3];
  var p={kind:K.k,label:K.label,name:K.name,slug:K.slug,tag:K.tag,sub:K.sub,cta:K.cta,nav:K.nav,feats:K.feats,quote:K.quote,pal:Object.assign({},K.pal),sections:['hero','feats','quote','cta','footer'],v:1};
  if(/pric|pre[tț]/i.test(prompt))p.sections.push('pricing');
  if(/galler|galeri|photos|poze/i.test(prompt))p.sections.push('gallery');
  if(/faq|[iî]ntreb/i.test(prompt))p.sections.push('faq');
  if(/contact|booking|rezerv/i.test(prompt))p.sections.push('contact');
  p.sections.sort(function(a,b){return ORDER.indexOf(a)-ORDER.indexOf(b)});
  return p;
}
function lum(h){var n=parseInt(h.slice(1),16),r=n>>16&255,g=n>>8&255,b=n&255;return (.299*r+.587*g+.114*b)/255}
var GEN={
 hero:function(p){return '<div class="s-nav"><b>'+p.name+'</b><span>'+p.nav.map(function(n){return '<em style="font-style:normal">'+n+'</em>'}).join('')+'</span></div><div class="s-hero"><h1>'+p.tag+'</h1><p>'+p.sub+'</p><span class="s-btn">'+p.cta+' →</span></div>'},
 feats:function(p){return '<div class="s-grid">'+p.feats.map(function(f){return '<div class="s-card"><i></i><h3>'+f[0]+'</h3><p>'+f[1]+'</p></div>'}).join('')+'</div>'},
 gallery:function(){return '<div class="s-h">Gallery</div><div class="s-gal"><i></i><i></i><i></i><i></i><i></i><i></i></div>'},
 pricing:function(){return '<div class="s-h">Simple pricing</div><div class="s-grid">'+[['Starter','$0','For trying things out.'],['Pro','$12','Everything you need, every month.'],['Team','$29','Shared workspaces and roles.']].map(function(x,i){return '<div class="s-card'+(i===1?' hot':'')+'"><h3>'+x[0]+'</h3><div class="pr">'+x[1]+'</div><p>'+x[2]+'</p></div>'}).join('')+'</div>'},
 quote:function(p){return '<div class="s-quote">'+p.quote[0]+'<small>'+p.quote[1]+'</small></div>'},
 faq:function(){return '<div class="s-h">Questions</div><div class="s-faq">'+[['How long does setup take?','Most people are live in under ten minutes.'],['Can I cancel anytime?','Yes. No contracts, no hidden fees.'],['Do you offer support?','A real human replies within a day.']].map(function(q){return '<div><b>'+q[0]+'</b><span>'+q[1]+'</span></div>'}).join('')+'</div>'},
 contact:function(){return '<div class="s-h">Get in touch</div><div class="s-contact"><i></i><i></i><i class="t"></i></div>'},
 cta:function(p){return '<div class="s-cta"><h2>Ready when you are.</h2><span>'+p.cta+'</span></div>'},
 footer:function(p){return '<div class="s-foot"><span>© 2026 '+p.name+'</span><span>Made with Blipmade</span></div>'}
};
function sections(p){return p.sections.slice().sort(function(a,b){return ORDER.indexOf(a)-ORDER.indexOf(b)}).map(function(id){return {id:id,label:LABEL[id],html:GEN[id](p)}})}
function applyTheme(el,p){
  el.style.setProperty('--b',p.pal.b);el.style.setProperty('--i',p.pal.i);el.style.setProperty('--a',p.pal.a);
  el.style.setProperty('--ac',lum(p.pal.a)>.62?'#111':'#fff');el.style.setProperty('--f',p.pal.f);
}
/* render sections into a .ms element. upTo = how many sections to show */
function renderSite(el,p,upTo){
  applyTheme(el,p);
  var S=sections(p),have={};[].forEach.call(el.children,function(c){have[c.dataset.sec]=c});
  S.slice(0,upTo==null?S.length:upTo).forEach(function(s,i){
    if(!have[s.id]){var d=document.createElement('div');d.dataset.sec=s.id;d.innerHTML=s.html;el.insertBefore(d,el.children[i]||null)}
    else{have[s.id].innerHTML=s.html}
  });
  [].slice.call(el.children).forEach(function(c){if(!S.some(function(s){return s.id===c.dataset.sec}))c.remove()});
  return S;
}
function siteSource(p){return '<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <title>'+p.name+'</title>\n  <style>:root{--bg:'+p.pal.b+';--ink:'+p.pal.i+';--accent:'+p.pal.a+'}</style>\n</head>\n<body>\n'+sections(p).map(function(s){return '  <!-- '+s.label+' -->\n  <section id="'+s.id+'">…</section>'}).join('\n')+'\n</body>\n</html>'}
var ACC=[[/blue|alb[aă]str/,'#3b6cff','blue'],[/red|ro[sș]u/,'#ff3b3b','red'],[/green|verde/,'#22c55e','green'],[/orange|portocal/,'#ff7a1a','orange'],[/pink|roz/,'#ff4fa3','pink'],[/purple|violet|mov/,'#8a4dff','violet'],[/yellow|galben/,'#ffd43b','yellow']];
function edit(p,text){
  var t=text.toLowerCase(),q=JSON.parse(JSON.stringify(p)),notes=[],rm=/remove|delete|scoate|elimin|f[aă]r[aă]/.test(t);
  ACC.forEach(function(c){if(c[0].test(t)&&!notes.length){q.pal.a=c[1];notes.push('switched the accent to '+c[2])}});
  if(/dark|negru|[iî]ntunecat|night/.test(t)){q.pal.b='#0b0b0c';q.pal.i='#f3f3f1';notes.push('went dark')}
  else if(/light|deschis|luminos|\balb\b|white/.test(t)){q.pal.b='#fbfaf7';q.pal.i='#16161a';notes.push('went light')}
  if(/serif/.test(t)&&!/sans/.test(t)){q.pal.f='Georgia,serif';notes.push('set the type in a serif')}
  else if(/mono/.test(t)){q.pal.f='"Geist Mono",ui-monospace,monospace';notes.push('set the type in mono')}
  else if(/sans|modern/.test(t)){q.pal.f='Inter,system-ui,sans-serif';notes.push('set the type in a clean sans')}
  [['pricing',/pric|pre[tț]/],['gallery',/galler|galeri|poze|photos/],['faq',/faq|[iî]ntreb/],['contact',/contact|form/]].forEach(function(s){
    if(s[1].test(t)){
      if(rm&&q.sections.indexOf(s[0])>-1){q.sections=q.sections.filter(function(x){return x!==s[0]});notes.push('removed the '+LABEL[s[0]].toLowerCase()+' section')}
      else if(!rm&&q.sections.indexOf(s[0])<0){q.sections.push(s[0]);notes.push('added a '+LABEL[s[0]].toLowerCase()+' section')}
    }
  });
  if(!notes.length)return null;
  q.sections.sort(function(a,b){return ORDER.indexOf(a)-ORDER.indexOf(b)});q.v=(p.v||1)+1;
  return {plan:q,note:notes.join(', ')};
}
function reply(p){
  var names=sections(p).map(function(s){return s.label.toLowerCase()});
  return 'Got it. I will build “'+p.name+'” as a '+p.label+' site with a '+(lum(p.pal.b)<.4?'dark':'light')+' palette and '+names.length+' sections: '+names.join(', ')+'. Building it now.';
}
var STEPS=['Reading your brief','Choosing palette and type','Writing the copy','Building the sections','Deploying a preview'];

/* ---------------- helpers ---------------- */
function stream(el,text,cps){
  return new Promise(function(res){
    var i=0;el.classList.add('caret');
    (function tick(){
      var n=1+(Math.random()<.35?1:0);i=Math.min(text.length,i+n);el.textContent=text.slice(0,i);
      if(i>=text.length){el.classList.remove('caret');return res()}
      setTimeout(tick,1000/(cps||60)+Math.random()*12);
    })();
  });
}
function fitScale(box,inner,baseW,fillH){
  function go(){var s=box.clientWidth/baseW;inner.style.transformOrigin='0 0';inner.style.transform='scale('+s+')';if(fillH)box.style.height=Math.round(inner.offsetHeight*s)+'px'}
  new ResizeObserver(go).observe(box);if(fillH)new ResizeObserver(go).observe(inner);go();
  return go;
}
function autoGrow(ta){var g=function(){ta.style.height='auto';ta.style.height=Math.min(ta.scrollHeight,180)+'px'};ta.addEventListener('input',g);g();return g}
var SEND='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';

window.BlipFX={sleep:sleep,dotText:dotText,mountDots:mountDots,dotField:dotField,orb:orb,mountOrbs:mountOrbs,dotBar:dotBar,
  plan:plan,edit:edit,reply:reply,STEPS:STEPS,sections:sections,renderSite:renderSite,applyTheme:applyTheme,siteSource:siteSource,
  stream:stream,fitScale:fitScale,autoGrow:autoGrow,SEND:SEND,LABEL:LABEL};
})();
