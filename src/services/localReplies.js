import {mailAccounts} from '../data/mail.js';

// Shared local outbox writer. Provider delivery is deliberately not implied.
export function createLocalEmailThread({to,subject='',body,account=0,cc=[],bcc=[],attachments=[],track=false},now=Date.now()){
  const peer=Array.isArray(to)?to[0]:to;
  const recipients=Array.isArray(to)?to:[peer];
  return {id:'sent-'+now+'-'+Math.random().toString(36).slice(2,6),account,folder:'sent',
    msgs:[{id:'sent-message-'+now,out:true,peer,to:recipients,cc,bcc,subject,body,at:now,opens:[],tracked:track,
      by:mailAccounts[account]?.name,attachments:attachments.map(f=>({name:f.name,size:f.size,type:f.type,data:f.data||f})),status:'local'}]};
}
export function createLocalMessage(channel,number,value,files=[],now=Date.now()){
 return {id:'local-'+now+'-'+Math.random().toString(36).slice(2,6),channel,number:String(number||'').replace(/\D/g,''),dir:'out',
    text:String(value).trim(),at:now,status:'local',unread:false,files:files.map(f=>({name:f.name,size:f.size,type:f.type}))};
}
