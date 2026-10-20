import {useCallback,useEffect,useRef,useState} from 'react';

// One shared pointer-drag implementation for phone surfaces. Null position means docked.
export default function useDraggablePosition(key, initial = null) {
  const [position,setPosition] = useState(() => {
    try {
      const saved=JSON.parse(localStorage.getItem(key));
      return saved && Number.isFinite(saved.x) && Number.isFinite(saved.y) ? saved : initial;
    } catch {return initial;}
  });
  const drag=useRef(null);
  const clamp=useCallback((x,y,width,height) => ({
    x:Math.min(Math.max(8,x),Math.max(8,window.innerWidth-width-8)),
    y:Math.min(Math.max(8,y),Math.max(8,(window.visualViewport?.height||window.innerHeight)-height-8))
  }),[]);
  const onPointerDown=useCallback(e=>{
    if(e.button!==undefined && e.button!==0)return;
    const rect=e.currentTarget.closest('[data-drag-surface]').getBoundingClientRect();
    drag.current={id:e.pointerId,startX:e.clientX,startY:e.clientY,x:rect.left,y:rect.top,width:rect.width,height:rect.height,moved:false};
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
  },[]);
  const onPointerMove=useCallback(e=>{
    const d=drag.current;if(!d||d.id!==e.pointerId)return;
    const dx=e.clientX-d.startX,dy=e.clientY-d.startY;
    if(Math.hypot(dx,dy)>4)d.moved=true;
    if(d.moved)setPosition(clamp(d.x+dx,d.y+dy,d.width,d.height));
  },[clamp]);
  const onPointerUp=useCallback(e=>{
    const d=drag.current;if(!d||d.id!==e.pointerId)return;
    drag.current=null;
    if(d.moved){
      const next=clamp(d.x+e.clientX-d.startX,d.y+e.clientY-d.startY,d.width,d.height);
      setPosition(next);
      try{localStorage.setItem(key,JSON.stringify(next));}catch{}
    }
  },[key,clamp]);
  useEffect(()=>{const keepVisible=()=>setPosition(current=>{if(!current)return current;const next=clamp(current.x,current.y,280,40);if(next.x===current.x&&next.y===current.y)return current;try{localStorage.setItem(key,JSON.stringify(next))}catch{}return next});window.addEventListener('resize',keepVisible);return()=>window.removeEventListener('resize',keepVisible)},[clamp,key]);
  const reset=useCallback(()=>{setPosition(initial);try{localStorage.removeItem(key)}catch{}},[initial,key]);
  return {position,reset,dragHandlers:{onPointerDown,onPointerMove,onPointerUp,onPointerCancel:onPointerUp}};
}
