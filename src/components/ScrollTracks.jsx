import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';

// Only the edge track can reveal a scrollbar, after a continuous 500ms hover.
export default function ScrollTracks(){
 const [shown,setShown]=useState(null);
 const [,repaint]=useState(0);
 const hover=useRef(null),timer=useRef(null),drag=useRef(null);
 useEffect(()=>{
  function clear(){clearTimeout(timer.current);timer.current=null;hover.current=null}
  function pointer(e){
   if(drag.current||e.target?.closest?.('[data-crm-scroll-overlay]'))return;
   let found=null;
   for(let node=e.target;node instanceof Element;node=node.parentElement){
    if(!node.closest('.crm-app'))break;
    const rect=node.getBoundingClientRect(),style=getComputedStyle(node);
    const vertical=node.scrollHeight>node.clientHeight+3&&/auto|scroll/.test(style.overflowY);
    const horizontal=node.scrollWidth>node.clientWidth+3&&/auto|scroll/.test(style.overflowX);
    const v=vertical&&e.clientX>=rect.right-12&&e.clientX<=rect.right&&e.clientY>=rect.top&&e.clientY<=rect.bottom;
    const h=horizontal&&e.clientY>=rect.bottom-12&&e.clientY<=rect.bottom&&e.clientX>=rect.left&&e.clientX<=rect.right;
    if(v||h){found={element:node,axis:v?'y':'x'};break}
   }
   const previous=hover.current;
   if(found&&previous&&previous.element===found.element&&previous.axis===found.axis)return;
   clear();
   if(!found){setShown(null);return}
   setShown(null);
   hover.current=found;
   timer.current=setTimeout(()=>setShown(found),500);
  }
  function update(){repaint(v=>v+1)}
  document.addEventListener('pointermove',pointer,{passive:true});
  document.addEventListener('scroll',update,true);
  window.addEventListener('resize',update);
  return()=>{clear();document.removeEventListener('pointermove',pointer);document.removeEventListener('scroll',update,true);window.removeEventListener('resize',update)};
 },[]);
 if(!shown||!shown.element.isConnected)return null;
 const element=shown.element,vertical=shown.axis==='y';
 const rect=element.getBoundingClientRect();
 const viewport=vertical?element.clientHeight:element.clientWidth;
 const content=vertical?element.scrollHeight:element.scrollWidth;
 const scroll=vertical?element.scrollTop:element.scrollLeft;
 const length=vertical?rect.height:rect.width;
 const thumb=Math.min(length,Math.max(28,length*viewport/content));
 const travel=Math.max(0,length-thumb);
 const offset=(scroll/Math.max(1,content-viewport))*travel;
 const trackStyle=vertical?{left:rect.right-10,top:rect.top,width:10,height:rect.height}:{left:rect.left,top:rect.bottom-10,width:rect.width,height:10};
 const thumbStyle=vertical?{top:offset,left:3,width:3,height:thumb}:{left:offset,top:3,height:3,width:thumb};
 function end(){drag.current=null}
 function down(e){
  e.preventDefault();e.stopPropagation();e.currentTarget.setPointerCapture(e.pointerId);
  const position=vertical?e.clientY-rect.top:e.clientX-rect.left;
  const onThumb=position>=offset&&position<=offset+thumb;
  if(!onThumb){const target=Math.min(content-viewport,Math.max(0,(position-thumb/2)/Math.max(1,travel)*(content-viewport)));if(vertical)element.scrollTop=target;else element.scrollLeft=target}
  drag.current={id:e.pointerId,start:vertical?e.clientY:e.clientX,scroll:vertical?element.scrollTop:element.scrollLeft};
  repaint(v=>v+1);
 }
 function move(e){if(!drag.current||drag.current.id!==e.pointerId)return;const delta=(vertical?e.clientY:e.clientX)-drag.current.start;const target=drag.current.scroll+delta*(content-viewport)/Math.max(1,travel);if(vertical)element.scrollTop=target;else element.scrollLeft=target;repaint(v=>v+1)}
 return createPortal(<div data-crm-scroll-overlay="" role="scrollbar" aria-label={vertical?'Vertical scrollbar':'Horizontal scrollbar'} aria-orientation={vertical?'vertical':'horizontal'} style={{position:'fixed',...trackStyle,zIndex:250,pointerEvents:'auto',touchAction:'none',background:'transparent'}} onPointerDown={down} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onPointerLeave={()=>{if(!drag.current){hover.current=null;setShown(null)}}}><div style={{position:'absolute',...thumbStyle,borderRadius:3,background:'#aab5c3',pointerEvents:'none'}}/></div>,document.body);
}
