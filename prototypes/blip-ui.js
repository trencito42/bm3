/* =====================================================================
   blip-ui.js — helpers for the client-area components
   depends on blip-fx.js (BlipFX). Everything here is dummy-data friendly.
   ===================================================================== */
(function(){
var F=window.BlipFX,NS='http://www.w3.org/2000/svg';
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
var sleep=F.sleep;

/* ---------- icons ---------- */
var IC={
 home:'<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
 server:'<rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01"/>',
 receipt:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
 cart:'<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.4 12h11l2-8H6"/>',
 life:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/><path d="M5.6 5.6l3.9 3.9M14.5 14.5l3.9 3.9M18.4 5.6l-3.9 3.9M9.5 14.5l-3.9 3.9"/>',
 globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
 search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
 bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 20a2 2 0 0 0 4 0"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',x:'<path d="M6 6l12 12M18 6L6 18"/>',check:'<path d="M5 12l5 5 9-10"/>',
 power:'<path d="M12 3v9"/><path d="M6.3 6.3a8 8 0 1 0 11.4 0"/>',
 refresh:'<path d="M20 11a8 8 0 0 0-14-4L4 9"/><path d="M4 4v5h5"/><path d="M4 13a8 8 0 0 0 14 4l2-2"/><path d="M20 20v-5h-5"/>',
 terminal:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9l3 3-3 3M13 15h4"/>',
 card:'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
 chev:'<path d="M9 6l6 6-6 6"/>',cpu:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
 mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
 db:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
 game:'<rect x="2" y="7" width="20" height="11" rx="4"/><path d="M7 10v5M4.5 12.5h5M16 11h.01M18 14h.01"/>',
 download:'<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',send:'<path d="M12 19V5M5 12l7-7 7 7"/>',
 globe2:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>'
};
function icon(n){return '<svg viewBox="0 0 24 24">'+(IC[n]||'')+'</svg>'}

/* ---------- dot numerals ---------- */
function dotNum(text,h,o){
  o=o||{};var s=F.dotText({text:String(text),animate:o.animate!==false,delay:o.delay||0,title:String(text)});
  s.style.height=(h||34)+'px';s.style.width='auto';return s;
}

/* ---------- ring gauge made of dots ---------- */
function gauge(pct,o){
  o=o||{};var N=o.n||44,size=o.size||112,R=42,lit=Math.round(Math.max(0,Math.min(100,pct))/100*N),hot=pct>=(o.hotAt||85);
  var box=document.createElement('div');box.className='gauge';box.style.width=box.style.height=size+'px';
  var svg=document.createElementNS(NS,'svg');svg.setAttribute('viewBox','0 0 100 100');svg.setAttribute('class','ring');
  var dots=[];
  for(var i=0;i<N;i++){var a=(-90+i*360/N)*Math.PI/180,c=document.createElementNS(NS,'circle');
    c.setAttribute('cx',50+R*Math.cos(a));c.setAttribute('cy',50+R*Math.sin(a));c.setAttribute('r',Math.min(2.4,264/N/3));c.style.transitionDelay=(i*16)+'ms';svg.appendChild(c);dots.push(c)}
  var ctr=document.createElement('div');ctr.className='c';var inner=document.createElement('div');
  inner.appendChild(dotNum(Math.round(pct)+'%',Math.max(14,size/6.2)));
  if(o.label){var sm=document.createElement('small');sm.textContent=o.label;inner.appendChild(sm)}
  ctr.appendChild(inner);box.appendChild(svg);box.appendChild(ctr);
  box.set=function(p){var l=Math.round(Math.max(0,Math.min(100,p))/100*N),h=p>=(o.hotAt||85);dots.forEach(function(d,i){d.classList.toggle('on',i<l);d.classList.toggle('hot',h&&i<l&&i>=l-4)});
    ctr.firstChild.replaceChild(dotNum(Math.round(p)+'%',Math.max(14,size/6.2)),ctr.firstChild.firstChild)};
  requestAnimationFrame(function(){requestAnimationFrame(function(){dots.forEach(function(d,i){if(i<lit)d.classList.add('on');if(hot&&i<lit&&i>=lit-4)d.classList.add('hot')})})});
  return box;
}

/* ---------- column chart made of dots ---------- */
var tip;function tipEl(){if(!tip){tip=document.createElement('div');tip.className='tip';document.body.appendChild(tip)}return tip}
function bars(values,o){
  o=o||{};var rows=o.rows||12,cols=values.length,max=Math.max.apply(null,values)*1.05,P=5;
  var svg=document.createElementNS(NS,'svg');svg.setAttribute('class','bars');svg.setAttribute('viewBox','0 0 '+(cols*P)+' '+(rows*P));
  var cs=[];
  values.forEach(function(v,c){
    var g=document.createElementNS(NS,'g'),n=Math.max(1,Math.round(v/max*rows));g.dataset.tip=(o.label?o.label(c,v):v);
    for(var r=0;r<rows;r++){var d=document.createElementNS(NS,'circle');d.setAttribute('cx',c*P+P/2);d.setAttribute('cy',(rows-1-r)*P+P/2);d.setAttribute('r',1.55);d.dataset.on=r<n?1:0;d.dataset.top=r===n-1?1:0;d.style.transitionDelay=(c*14+r*10)+'ms';g.appendChild(d);cs.push(d)}
    svg.appendChild(g);
  });
  requestAnimationFrame(function(){requestAnimationFrame(function(){cs.forEach(function(d){if(d.dataset.on==='1')d.classList.add('on');if(d.dataset.top==='1')d.classList.add('top')})})});
  svg.addEventListener('pointermove',function(e){var g=e.target.closest('g');var t=tipEl();if(!g){t.classList.remove('on');return}t.textContent=g.dataset.tip;t.style.left=e.clientX+'px';t.style.top=e.clientY+'px';t.classList.add('on')});
  svg.addEventListener('pointerleave',function(){tipEl().classList.remove('on')});
  return svg;
}

/* ---------- uptime dots ---------- */
function heat(n,incidents){
  var h=document.createElement('div');h.className='heat';h.style.gridTemplateColumns='repeat('+Math.ceil(n/2)+',1fr)';incidents=incidents||{};
  for(var i=0;i<n;i++){var d=document.createElement('i');var k=incidents[i];if(k)d.className=k;d.title='Day '+(i+1)+(k==='bad'?' · outage 14m':k==='warn'?' · degraded 3m':' · 100%');h.appendChild(d)}
  return h;
}

/* ---------- overlays ---------- */
function toast(msg,type){
  var box=$('.toasts');if(!box){box=document.createElement('div');box.className='toasts';document.body.appendChild(box)}
  var t=document.createElement('div');t.className='toast '+(type||'');t.innerHTML='<i class="d"></i><span></span>';t.lastChild.textContent=msg;box.appendChild(t);
  setTimeout(function(){t.style.transition='opacity .3s,transform .3s';t.style.opacity=0;t.style.transform='translateY(8px)';setTimeout(function(){t.remove()},300)},3200);
}
function overlay(html,kind,cls,onclose){
  var ov=document.createElement('div');ov.className='ov '+kind;
  ov.innerHTML='<div class="'+cls+'" style="position:relative">'+html+'</div>';
  document.body.appendChild(ov);
  var close=function(){if(onclose)onclose();ov.style.transition='opacity .2s';ov.style.opacity=0;setTimeout(function(){ov.remove()},200);document.removeEventListener('keydown',esc)};
  var esc=function(e){if(e.key==='Escape')close()};document.addEventListener('keydown',esc);
  ov.addEventListener('mousedown',function(e){if(e.target===ov)close()});
  $$('[data-close]',ov).forEach(function(b){b.onclick=close});
  return {el:ov,body:ov.firstChild,close:close};
}
var modal=function(html){return overlay('<button class="ibtn x" data-close aria-label="Close">'+icon('x')+'</button>'+html,'c','modal')};
var drawer=function(html){return overlay('<button class="ibtn x" data-close aria-label="Close">'+icon('x')+'</button>'+html,'r','drawer')};

/* ---------- command palette ---------- */
function cmdk(items){
  var open=null;
  function show(){
    if(open)return;var sel=0,list=items;
    var o=overlay('<div class="cmd"><input placeholder="Type a command or search…" autofocus><ul></ul></div>','k','',function(){open=null});
    o.body.removeAttribute('style');open=o;var ul=$('ul',o.el),inp=$('input',o.el);
    var origClose=o.close;
    function draw(){ul.innerHTML=list.map(function(it,i){return '<li class="'+(i===sel?'on':'')+'" data-i="'+i+'">'+icon(it.icon||'chev')+it.label+'<span>'+(it.hint||'')+'</span></li>'}).join('')||'<li>No results</li>'}
    function run(){var it=list[sel];if(it){origClose();it.run()}}
    inp.addEventListener('input',function(){var q=inp.value.toLowerCase();list=items.filter(function(i){return i.label.toLowerCase().indexOf(q)>-1});sel=0;draw()});
    inp.addEventListener('keydown',function(e){if(e.key==='ArrowDown'){sel=Math.min(list.length-1,sel+1);draw();e.preventDefault()}else if(e.key==='ArrowUp'){sel=Math.max(0,sel-1);draw();e.preventDefault()}else if(e.key==='Enter')run();else if(e.key==='Escape')origClose()});
    ul.addEventListener('click',function(e){var li=e.target.closest('li');if(li){sel=+li.dataset.i;run()}});
    draw();setTimeout(function(){inp.focus()},30);
  }
  document.addEventListener('keydown',function(e){if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();show()}});
  return show;
}

var money=function(n){return '$'+n.toFixed(2)};
window.BlipUI={icon:icon,dotNum:dotNum,gauge:gauge,bars:bars,heat:heat,toast:toast,modal:modal,drawer:drawer,cmdk:cmdk,money:money,$:$,$$:$$};
})();
