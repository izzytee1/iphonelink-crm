const FONT_MIN=-2;
const FONT_MAX=5;
const FONT_STEP=.5;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export default function DisplaySettings({settings,setSettings,effectiveScale,onClose}){
 const update=(key,value)=>setSettings(current=>({...current,[key]:value}));
 const percent=Math.round(Number(settings.scale??1)*100);
 const offset=Number(settings.fontOffset||0);
 return <div className="crm-settings-overlay" onPointerDown={e=>{if(e.target===e.currentTarget)onClose()}}>
  <section id="crmDisplaySettings" className="crm-settings-panel" role="dialog" aria-modal="true" aria-label="Display settings">
   <header><strong>Display & layout</strong><button type="button" aria-label="Close settings" onClick={onClose}>×</button></header>
   <div className="crm-settings-content">
    <fieldset className="crm-theme-choice"><legend>Appearance</legend><div>{['light','dark'].map(value=><button type="button" key={value} aria-pressed={(settings.theme||'light')===value} onClick={()=>update('theme',value)}>{value==='light'?'Light':'Dark'}</button>)}</div></fieldset>
    <label className="crm-setting-field"><span>UI scale <output>{percent}%</output></span><input id="crmScreenScale" type="range" min="70" max="130" step="1" value={percent} onChange={e=>update('scale',Number(e.target.value)/100)}/><small>{Math.round(Number(effectiveScale)*100)}% effective. Phones start at 100%; native pinch zoom remains available.</small></label>
    <label className="crm-setting-field"><span>Lead row size</span><select id="crmCellDensity" value={settings.density||'comfortable'} onChange={e=>update('density',e.target.value)}><option value="compact">Compact</option><option value="comfortable">Comfortable</option><option value="roomy">Roomy</option></select></label>
    <div className="crm-setting-field"><span>Font size <output>{offset===0?'Default':(offset>0?'+':'')+offset.toFixed(1)+'px'}</output></span><div className="crm-font-stepper" role="group" aria-label="CRM font size"><button type="button" onClick={()=>update('fontOffset',clamp(offset-FONT_STEP,FONT_MIN,FONT_MAX))} aria-label="Decrease font size">−</button><span>Adjust CRM text</span><button type="button" onClick={()=>update('fontOffset',clamp(offset+FONT_STEP,FONT_MIN,FONT_MAX))} aria-label="Increase font size">+</button></div></div>
    <label className="crm-setting-field"><span>Accent color <output>{settings.accent||'#4669A8'}</output></span><input id="crmAccentColor" type="color" value={settings.accent||'#4669A8'} onChange={e=>update('accent',e.target.value)} aria-label="Choose CRM accent color"/></label>
    <button type="button" className="crm-settings-reset" onClick={()=>setSettings({scale:1,density:'comfortable',fontOffset:0,accent:'#4669A8',theme:'light'})}>Restore display defaults</button>
   </div>
  </section>
 </div>;
}
