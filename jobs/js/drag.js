// Pointer capture, preserved grab offset, filtered targets and cancellable animation.
let cancelDrag=()=>{};
function wireDrag(el,accept,allowed=null){
 el.addEventListener('pointerdown',e=>{
 if(e.button!==0||!e.isPrimary||locked)return;e.preventDefault();cancelDrag();
 const r=el.getBoundingClientRect(),ghost=el.cloneNode(true),id=e.pointerId;
 ghost.removeAttribute('id');ghost.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));ghost.classList.add('ghost','lifted');
 Object.assign(ghost.style,{width:r.width+'px',height:r.height+'px',left:r.left+'px',top:r.top+'px',margin:'0'});
 document.body.append(ghost);el.classList.add('held');el.setPointerCapture(id);playJobSound('lift');
 const dx=e.clientX-r.left,dy=e.clientY-r.top;let zone=null,lastX=e.clientX,animation=null,closed=false;
 const targets=[...document.querySelectorAll('#task [data-drop]')].filter(z=>!allowed||allowed.includes(z.dataset.drop));
 function move(v){if(v.pointerId!==id)return;ghost.style.left=v.clientX-dx+'px';ghost.style.top=v.clientY-dy+'px';ghost.style.setProperty('--tilt',Math.max(-8,Math.min(8,(v.clientX-lastX)*.3))+'deg');lastX=v.clientX;let best=null,dist=Infinity;for(const z of targets){const b=z.getBoundingClientRect(),x=v.clientX,y=v.clientY;if(x>=b.left-12&&x<=b.right+12&&y>=b.top-12&&y<=b.bottom+12){let d=Math.hypot(x-(b.left+b.right)/2,y-(b.top+b.bottom)/2);if(d<dist){best=z;dist=d;}}}if(zone!==best){zone?.classList.remove('over');zone=best;zone?.classList.add('over');}}
 function detach(){el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',clean);el.removeEventListener('lostpointercapture',clean);if(el.hasPointerCapture(id))el.releasePointerCapture(id);}
 function clean(){if(closed)return;closed=true;detach();animation?.cancel();ghost.remove();el.classList.remove('held');zone?.classList.remove('over');cancelDrag=()=>{};}
 function up(v){if(v.pointerId!==id)return;move(v);const target=zone,code=target?.dataset.drop;detach();const b=target?.getBoundingClientRect()||r;const stamping=el.classList.contains('stamp')&&target;const endX=target?b.left+b.width/2-r.width/2:r.left,endY=target?b.top+b.height/2-r.height/2:r.top;const startX=parseFloat(ghost.style.left),startY=parseFloat(ghost.style.top);animation=ghost.animate([{transform:'translate(0,0) rotate(var(--tilt,0deg)) scale(1.04)',opacity:1},{transform:`translate(${endX-startX}px,${endY-startY}px) scale(${target?(stamping?.82:.38):1})`,opacity:target&&!stamping?0:1}],{duration:target?170:200,easing:'cubic-bezier(.2,.75,.3,1)',fill:'forwards'});animation.onfinish=()=>{clean();if(target&&!locked&&mode&&parent.jobCanCommit(mode)){playJobSound(stamping?'stamp':'drop');accept(code);}else playJobSound('drop');};}
 cancelDrag=clean;el.addEventListener('pointermove',move);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',clean);el.addEventListener('lostpointercapture',clean);
 });
}
