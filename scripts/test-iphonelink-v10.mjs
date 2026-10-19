import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {iphoneLeadsSeed} from '../src/data/iphoneLeadsSeed.js';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const app=read('../src/App.jsx'),comm=read('../src/communications/Comms.jsx');
const css=read('../src/communications/comms.css'),native=read('../src/communications/Native.jsx');
const msg=read('../src/communications/Messages.jsx'),wa=read('../src/communications/WhatsApp.jsx');
const call=read('../src/communications/Calls.jsx'),hook=read('../src/hooks/usePhoneController.js');
const sound=read('../src/communications/sounds.js'),leads=read('../src/pages/leads/LeadsList.jsx');
const email=read('../src/pages/email/EmailClient.jsx'),brand=read('../src/shell/topbar/Brand.jsx');
let count=0;const check=(title,condition)=>{assert.ok(condition,title);count++};
check('10 leads retained',iphoneLeadsSeed.length===10);
check('Leads unchanged',leads.includes('filteredLeads')&&leads.includes('onAddLead?.('));
check('Email unchanged',email.includes('archiveCurrent')&&email.includes('replyToThread'));
check('Shared CRM state',app.includes('messages={messages}')&&app.includes('mailbox={mailbox}'));
check('One Comms shell',comm.includes('np-device')&&comm.includes('StatusBar'));
check('One root navigation',comm.includes('rootPages.map'));
check('Open threads without root tabs',comm.includes('const showNav=root'));
check('Separate Messages screen',comm.includes('<Messages page='));
check('Separate Calls screen',comm.includes('<Calls view='));
check('Separate WhatsApp screen',comm.includes('<WhatsApp page='));
check('New SMS composer',msg.includes('function NewMessage('));
check('SMS messages isolated',msg.includes("m.channel==='text'"));
check('WhatsApp picker',wa.includes('function NewChat('));
check('WhatsApp messages isolated',wa.includes("m.channel==='wa'"));
check('Recents list',call.includes('function CallsList('));
check('Contacts inside Calls',call.includes('function Contacts('));
check('Call detail',call.includes('function CallDetail('));
check('Keypad',call.includes('function Keypad('));
check('Call controls visible',call.includes('np-dial-green')&&call.includes('np-dial-red'));
check('No auto dial from rows',call.includes('onDetail(c)'));
check('Phone provider DTMF',hook.includes("providerInvoke(['sendTone']"));
check('DTMF dual frequency',sound.includes('697')&&sound.includes('1209'));
check('Unboxed call actions',css.includes('.np-call-side .np-icon-button'));
check('No old comms CSS',!css.includes('.nc-'));
check('Apple system typography',css.includes('-apple-system'));
check('iOS contact avatars',native.includes('np-avatar'));
check('Local drafts labeled not delivered',comm.includes('Saved locally · not delivered'));
check('Version 10',brand.includes('v10'));
check('No v02 source importer',!existsSync(new URL('../.github/workflows/import-v02.yml',import.meta.url)));
check('No v04 tests',!existsSync(new URL('./test-iphonelink-v04.mjs',import.meta.url)));


const viewport=read('../src/shell/responsive.css');
const scale=read('../src/hooks/useViewportScale.js');
const appSettings=read('../src/shell/settings/DisplaySettings.jsx');
const phoneToolbar=read('../src/shell/topbar/PhoneToolbar.jsx');
const topbar=read('../src/shell/topbar/TopbarActions.jsx');
const emailStyles=read('../src/pages/email/email.css');
const leadStyles=read('../src/pages/leads/iphone.css');
check('Mobile desktop 1440px canvas',viewport.includes('min-width:1440px')&&viewport.includes('pinch-zoom'));
check('Mobile auto fit removed',scale.includes('window.innerWidth < 768) return 1'));
check('Mobile manual UI scale supported',viewport.includes('zoom:var(--crm-scale)'));
check('Topbar phone switcher',phoneToolbar.includes('Select phone'));
check('Topbar dark call control',phoneToolbar.includes('Topbar phone number')&&phoneToolbar.includes('Start call')&&phoneToolbar.includes('End or decline call')&&phoneToolbar.includes('crm-call-surface'));
check('Topbar DTMF and popup',phoneToolbar.includes('phoneController.sendTone')&&phoneToolbar.includes('Open keypad'));
check('Settings hidden in user avatar',topbar.includes('User menu')&&topbar.includes('Display settings')&&!topbar.includes('crmDisplaySettingsOpen'));
check('Appearance switch',appSettings.includes("update('theme',value)"));
check('Scale setting writes state',appSettings.includes("update('scale'"));
check('Density setting writes state',appSettings.includes("update('density'"));
check('Font setting writes state',appSettings.includes("update('fontOffset'"));
check('Accent setting writes state',appSettings.includes("update('accent'"));
check('Light mode default and persistence',app.includes("theme: 'light'")&&app.includes("data-theme={settings.theme"));
check('Resizable Communications handle',comm.includes('resizeStart')&&comm.includes('np-resize-handle')&&comm.includes('iphonelink.comms.size'));
check('Appearance scoped to explicit preference',css.includes('data-theme="light"')&&!css.includes('prefers-color-scheme:light'));
check('Gmail retains full sidebar',emailStyles.includes('.gm-sidebar { width:245px;'));
check('Lead row density bound',leadStyles.includes('height:var(--crm-row-height)'));
check('No unused clock import',!read('../src/main.jsx').includes('clock.css'));


const floatCall=read('../src/shell/topbar/FloatingCallPanel.jsx');
const drag=read('../src/hooks/useDraggablePosition.js');
check('Draggable phone bar',phoneToolbar.includes('useDraggablePosition')&&phoneToolbar.includes('Return phone bar to topbar'));
check('Floating call panel shares controller',floatCall.includes('phoneController')&&floatCall.includes('useDraggablePosition'));
check('Shared drag hook',drag.includes('setPointerCapture')&&drag.includes('localStorage'));
check('SMS and iMessage distinct threads',msg.includes('m.channel===channel')&&msg.includes("m.channel==='imessage'"));
check('WhatsApp paper plane',wa.includes('paperplane'));

const dialCss=read('../src/shell/topbar/actions.css');
check('Matched dark keypad',dialCss.includes('width:215px')&&dialCss.includes('linear-gradient(160deg,#242d3d,#141b2a 72%)'));
check('Balanced number screen',dialCss.includes('height:29px;margin:0 10px'));
check('Backend battery adapter',read('../src/hooks/useDeviceTelemetry.js').includes('getDeviceStatus'));
check('No fake video and camera buttons',!call.includes("title:'video'")&&!msg.includes('Video call unavailable')&&!wa.includes('Video unavailable')&&!wa.includes('Camera unavailable'));
check('Stable press geometry',!css.includes('button:active{transform:scale(.97)')&&css.includes('.np-wa-list-row:active{transform:none}'));



const selectors=[...css.matchAll(/^([^{}\n]+)\{/gm)].map(m=>m[1].trim()).filter(n=>n.startsWith('.'));
check('One CSS implementation per selector',selectors.length===new Set(selectors).size);
check('iOS WhatsApp chat alignment',css.includes('.np-wa-chats .np-list-row')&&native.includes('np-avatar-solid'));
check('Message header and WhatsApp title scale',css.includes('.np-messages .np-large-title')&&css.includes('.np-wa-screen .np-large-title'));
check('Single WhatsApp compose entry',!msg.includes('np-text-action')&&msg.includes('np-compose-entry'));



check('One shared avatar with WhatsApp style',native.includes('WHATSAPP_AVATAR_COLORS')&&native.includes('np-avatar-solid')&&wa.includes('variant="whatsapp"'));


check('Compact lead 3-column company detail',read('../src/pages/leads/leads.css').includes('grid-template-columns:repeat(3,minmax(0,1fr))'));
check('Dark Gmail folder contrast',emailStyles.includes('color:var(--gm-text)'));
check('No message demo labels',!msg.includes('iMessage · DEMO')&&!msg.includes('np-channel-tabs'));
check('Back button in Messages list',msg.includes('Back to All'));
check('Dark premium phone switcher',read('../src/shell/topbar/actions.css').includes('crm-phone-choice{display:flex')&&read('../src/shell/topbar/actions.css').includes('border-radius:21px'));
console.log(count+' v10 regression checks passed');
