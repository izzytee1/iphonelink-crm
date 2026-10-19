import {useEffect,useState} from 'react';
import {getPhoneProvider,isPhoneConnected} from '../services/phoneService.js';
// Optional backend contract: {batteryPercent:0..100,charging:boolean,lowPowerMode:boolean}
// or {battery:{level:0..1,charging:boolean,lowPowerMode:boolean}}.
function parse(data){
 if(!data || typeof data!=='object')return null;
 const percent=data.batteryPercent??data.battery?.percent;
 const level=data.batteryLevel??data.battery?.level;
 if(percent==null&&level==null)return null;
 const value=Number(percent==null?Number(level)*100:percent);
 if(!Number.isFinite(value)||value<0||value>100)return null;
 return {percent:Math.round(value),charging:Boolean(data.battery?.charging??data.charging),
   lowPower:Boolean(data.battery?.lowPowerMode??data.lowPowerMode)};
}
export default function useDeviceTelemetry(device){
 const [state,setState]=useState(null),id=device?.id;
 useEffect(()=>{
  let active=true;
  setState(null);
  const provider=getPhoneProvider();
  if(!provider||!isPhoneConnected(device))return;
  const check=()=>{
   if(!active)return;
   if(!isPhoneConnected(device)){setState(null);return;}
   const getter=provider.getDeviceStatus||provider.getBatteryStatus;
   if(typeof getter!=='function')return;
   Promise.resolve().then(()=>getter.call(provider,id)).then(v=>{if(active)setState(parse(v))}).catch(()=>{if(active)setState(null)});
  };
  check();
  let unsubscribe;
  try{
   if(typeof provider.subscribe==='function')unsubscribe=provider.subscribe(event=>{
    if(!active||event?.deviceId!==id)return;
    if(event.connected===false){setState(null);return;}
    const parsed=parse(event);if(parsed)setState(parsed);
   });
  }catch{}
  const poll=window.setInterval(check,15000);
  return ()=>{active=false;window.clearInterval(poll);if(typeof unsubscribe==='function')unsubscribe()};
 },[device,id]);
 return state;
}
