
// Real dual-tone multi-frequency (DTMF) pairs; audio is separate from provider signaling.
const pairs={'1':[697,1209],'2':[697,1336],'3':[697,1477],'4':[770,1209],'5':[770,1336],'6':[770,1477],'7':[852,1209],'8':[852,1336],'9':[852,1477],'*':[941,1209],'0':[941,1336],'#':[941,1477]};
let ctx;
function play(freqs,duration,volume){
 const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
 try{ctx ||=new Audio();if(ctx.state==='suspended')ctx.resume().catch(()=>{});
  const at=ctx.currentTime;const gain=ctx.createGain();gain.gain.setValueAtTime(.001,at);gain.gain.exponentialRampToValueAtTime(volume,at+.008);gain.gain.setValueAtTime(volume,at+duration-.014);gain.gain.exponentialRampToValueAtTime(.001,at+duration);gain.connect(ctx.destination);
  freqs.forEach(freq=>{const osc=ctx.createOscillator();osc.type='sine';osc.frequency.value=freq;osc.connect(gain);osc.start(at);osc.stop(at+duration+.003);});
 }catch(error){console.warn('Audio unavailable',error);}
}
export function playDtmf(key){if(pairs[key])play(pairs[key],.14,.04);}
export function playClick(){play([910],.025,.006);}
