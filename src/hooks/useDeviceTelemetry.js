import {useEffect,useState} from 'react';
import {getPhoneProvider,isPhoneConnected} from '../services/phoneService.js';

// Connected provider: devices [{id,connected}], getDeviceStatus(id) and subscribe(handler).
function readBattery(data){
 if(!data||typeof data!=='object')return null;
 const percent=data.battery?.percent??data.batteryPercent;
 const level=data.battery?.level??data.batteryLevel;
 if(percent==null&&level==null)return null;
 const amount=percent!=null?Number(percent):Number(level)*100;
 if(!Number.isFinite(amount)||amount<0||amount>100)return null;
 return {percent:Math.round(amount),charging:Boolean(data.battery?.charging??data.charging),
  lowPower:Boolean(data.battery?.lowPowerMode??data.lowPowerMode)};
}
export default function useDeviceTelemetry(device){
 const [battery,setBattery]=useState(null);
 const id=device?.id;
 useEffect(()=>{
  let alive=true,currentProvider=null,unsubscribe=null;
  setBattery(null);
  const read=()=>{
   if(!alive||!id)return;
   const provider=getPhoneProvider();
   if(provider!==currentProvider){
    if(typeof unsubscribe==='function')unsubscribe();
    unsubscribe=null;currentProvider=provider;
    if(provider&&typeof provider.subscribe==='function'){
     try{unsubscribe=provider.subscribe(event=>{
      if(!alive||event?.deviceId!==id)return;
      if(event.connected===false){setBattery(null);return;}
      const updated=readBattery(event);
      if(updated)setBattery(updated);
     })}catch{unsubscribe=null}
    }
   }
   if(!provider||!isPhoneConnected({id})){setBattery(null);return;}
   const getter=provider.getDeviceStatus||provider.getBatteryStatus;
   if(typeof getter!=='function')return;
   Promise.resolve().then(()=>getter.call(provider,id))
    .then(value=>{if(alive&&provider===currentProvider)setBattery(readBattery(value))})
    .catch(()=>{if(alive)setBattery(null)});
  };
  read();
  const interval=window.setInterval(read,15000);
  return ()=>{alive=false;window.clearInterval(interval);if(typeof unsubscribe==='function')unsubscribe()};
 },[id]);
 return battery;
}
