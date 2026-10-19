import React from 'react';

const art={
 back:<path d="m15 4-8 8 8 8"/>, close:<path d="M5 5 19 19M19 5 5 19"/>,
 compose:<><path d="M13 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-8"/><path d="m11 13 2-.4L21 4a2 2 0 0 0-3-3l-8 9-.5 3"/></>,
 search:<><circle cx="10.7" cy="10.7" r="6.4"/><path d="m15.5 15.5 5 5"/></>,
 filter:<><path d="M4 6h16M7 12h10M10 18h4"/></>,
 phone:<path d="M6 3c-.7-.3-1.5 0-1.8.7L2.9 6.8c-.4 1.1-.2 2.1.2 3.3a22 22 0 0 0 10.8 10.8c1.2.4 2.2.6 3.3.2l3.1-1.3c.7-.3 1-1.1.7-1.8l-1.4-3.3a1.5 1.5 0 0 0-1.9-.9l-3.2 1a1.5 1.5 0 0 0-.9 1.8l.2.5A16.7 16.7 0 0 1 7.4 10l.5-.2a1.5 1.5 0 0 0 1-1.8l-1-3.2a1.5 1.5 0 0 0-.9-.9Z"/>,
 end:<path d="M3 16.2v-3.5C4.2 10 8 9 12 9s7.8 1 9 3.7v3.5l-4.2.5-1.5-3.3a20 20 0 0 0-6.6 0l-1.5 3.3Z"/>,
 video:<><rect x="2" y="5" width="14.5" height="14" rx="3"/><path d="m17 10 5-3v10l-5-3"/></>,
 message:<path d="M20 11.6A8.2 8.2 0 0 1 11.6 20a9.3 9.3 0 0 1-4.2-.9L3 20l1.1-4.4A8.1 8.1 0 0 1 3 11.6a8.5 8.5 0 0 1 17 0Z"/>,
 paperplane:<><path d="m21 3-8.6 18-2.6-7.6L3 10.7 21 3Z"/><path d="m9.8 13.4L21 3"/></>,
 send:<><path d="M12 20V4m-6 6 6-6 6 6"/></>, plus:<path d="M12 4v16M4 12h16"/>,
 mic:<><rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4m-4 0h8"/></>,
 camera:<><path d="M4 7h4l1.5-2h5L16 7h4v12H4z"/><circle cx="12" cy="13" r="3.2"/></>,
 chevron:<path d="m9 5 7 7-7 7"/>, resize:<path d="m10 19 9-9m-5 9h5v-5M6 19 19 6"/>,
 more:<><circle cx="5" cy="12" r="1.25"/><circle cx="12" cy="12" r="1.25"/><circle cx="19" cy="12" r="1.25"/></>,
 user:<><circle cx="12" cy="8" r="4"/><path d="M4.5 21c0-5 3-7.5 7.5-7.5s7.5 2.5 7.5 7.5"/></>,
 keypad:<>{[5,12,19].flatMap(x=>[5,12,19].map(y=><circle key={x+'-'+y} cx={x} cy={y} r="1.5" fill="currentColor" stroke="none"/>))}</>,
 all:<><rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/></>,
 email:<><rect x="2" y="5" width="20" height="14" rx="3"/><path d="m3.5 7 8.5 6 8.5-6"/></>,
 whatsapp:<><path d="M21 11.5a9 9 0 0 1-13.2 8L3 21l1.5-4.8a9 9 0 1 1 16.5-4.7Z"/><path d="M8.5 7.4c-.4 3.2 3.8 7.3 7.4 7.7l1.3-1.5-2.4-1.3-.9.8c-1.2-.5-2.1-1.4-2.7-2.6l.8-.9-1.3-2.4Z"/></>,
 mute:<><path d="M8 3v9c0 5 8 5 8 0V3"/><path d="m3 3 18 18M5 10v2c0 4 3 7 7 7s7-3 7-7v-2M12 19v3"/></>,
 speaker:<><path d="M4 9h4l5-5v16l-5-5H4zM17 8c2 2 2 6 0 8m3-11c4 4 4 10 0 14"/></>,
 hold:<path d="M8 4v16M16 4v16"/>, delete:<><path d="m10 5-7 7 7 7h11V5z"/><path d="m14 9 4 6m0-6-4 6"/></>,
 list:<><path d="M9 6h12M9 12h12M9 18h12M3 6h2M3 12h2M3 18h2"/></>,
};
export function NativeIcon({name,size=21,className='',strokeWidth=1.8}){return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{art[name]||art.more}</svg>}
export function Avatar({name='',size=48,initial=false}){const n=String(name||'').trim();const letter=n&&!/^\+?[\d(\s-]+$/.test(n)?n[0]?.toUpperCase():'';return <span className={'np-avatar'+(initial&&letter?' np-initial':'')} style={{width:size,height:size,fontSize:Math.round(size*.46)}} aria-hidden="true">{initial&&letter?letter:<svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true"><circle cx="32" cy="24" r="11" fill="#fff"/><path d="M6 57c2-12 11-18 26-18s24 6 26 18a31 31 0 0 1-52 0" fill="#fff"/></svg>}</span>}
export function NativeButton({name,label,onClick,kind='',size=21}){return <button className={'np-icon-button '+kind} type="button" onClick={onClick} aria-label={label} title={label}><NativeIcon name={name} size={size}/></button>}
export function StatusBar(){const [now,setNow]=React.useState(()=>new Date());React.useEffect(()=>{const id=setInterval(()=>setNow(new Date()),30000);return()=>clearInterval(id)},[]);return <div className="np-status" aria-label="Phone-style status graphics"><span>{now.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',hour12:true}).replace(/\s?(AM|PM)$/,'')}</span><div className="np-status-glyphs" aria-label="Battery status unavailable"><svg width="26" height="14" viewBox="0 0 26 14" role="img" aria-label="Battery data unavailable"><rect x="1" y="1" width="21" height="12" rx="4" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M23 5v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></div></div>}
export function formatStamp(value){if(!value)return '';const d=new Date(value);if(Number.isNaN(+d))return '';const today=new Date();return d.toDateString()===today.toDateString()?d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}):d.toLocaleDateString('en-US',{month:'short',day:'numeric'})}
export function digits(value){return String(value||'').replace(/\D/g,'').slice(-10)}
