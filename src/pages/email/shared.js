export const validAddr = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value||'').trim());
export const lastMessage = thread => thread.msgs[thread.msgs.length-1]||{};
export const unreadThread = thread => (thread.msgs||[]).some(m=>m.unread);
export const escapeText = value => String(value??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
export const plainBody = body => String(body||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');
export function safeHtml(body) {
  const raw=String(body||'');
  if(!/<[a-z][\s\S]*>/i.test(raw)) return escapeText(raw).replace(/\n/g,'<br>');
  if(typeof document==='undefined')return escapeText(raw);
  const doc=new DOMParser().parseFromString(raw,'text/html');
  const allowed=new Set(['DIV','P','BR','B','STRONG','I','EM','U','S','UL','OL','LI','A','BLOCKQUOTE','SPAN','FONT','IMG']);
  const clean=node=>{
    if(node.nodeType===3)return document.createTextNode(node.textContent||'');
    const frag=document.createDocumentFragment();
    if(node.nodeType!==1)return frag;
    const el=allowed.has(node.tagName)?document.createElement(node.tagName.toLowerCase()):document.createElement('span');
    if(node.tagName==='IMG') {const src=node.getAttribute('src')||'';if(/^(https?:\/\/|data:image\/(?:png|jpeg|webp|gif);base64,)/i.test(src) && src.length<4500000){el.setAttribute('src',src);el.setAttribute('alt',node.getAttribute('alt')||'Inline image');el.setAttribute('style','max-width:100%;height:auto');}}
    if(node.tagName==='A') { const href=node.getAttribute('href')||''; if(/^https?:\/\//i.test(href)){el.setAttribute('href',href);el.setAttribute('target','_blank');el.setAttribute('rel','noopener noreferrer');} }
    for(const child of [...node.childNodes]) el.append(clean(child));
    return el;
  };
  const output=document.createElement('div');for(const node of [...doc.body.childNodes])output.append(clean(node));return output.innerHTML;
}
export function listDate(ts) {
  if(!ts)return '';
  const d=new Date(ts);if(Number.isNaN(+d))return '';
  return d.toDateString()===new Date().toDateString()?d.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}):d.toLocaleDateString([],{month:'short',day:'numeric'});
}
export function leadByEmail(leads,address) { const target=String(address||'').trim().toLowerCase(); return (leads||[]).find(lead=>(lead.emails||[]).some(email=>String(email).toLowerCase()===target))||null; }
