import {existsSync,readFileSync,readdirSync,statSync} from 'node:fs';
import {dirname,extname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const required=['src/App.jsx','src/communications/Comms.jsx','src/communications/comms.css','src/communications/sounds.js','src/shell/topbar/Topbar.jsx','src/hooks/usePhoneController.js','src/components/CrmIcons.jsx','src/pages/email/EmailClient.jsx','src/pages/leads/LeadsList.jsx','src/services/phoneService.js','src/services/mailStore.js','src/utils/leadUtils.js','FEATURES.md'];
const removed=['src/shell/dialer/TopbarDialer.jsx','src/shell/dialer/dialer.css','src/communications/panel/CommunicationPanel.jsx','src/communications/panel/DockedComms.jsx','src/communications/panel/panel.css','src/communications/panel/docked.css'];
for(const file of required)if(!existsSync(join(root,file)))throw Error('Missing: '+file);
for(const file of removed)if(existsSync(join(root,file)))throw Error('Legacy implementation remains: '+file);
const source=[];
function walk(dir){for(const name of readdirSync(dir)){const path=join(dir,name);if(statSync(path).isDirectory())walk(path);else if(['.js','.jsx'].includes(extname(path)))source.push(path);}}
walk(join(root,'src'));
const importRe=/(?:from\s+|import\s*)['"](\.[^'"]+)['"]/g;
for(const file of source){const content=readFileSync(file,'utf8');for(const match of content.matchAll(importRe)){const base=resolve(dirname(file),match[1]);const possibilities=[base,base+'.js',base+'.jsx',join(base,'index.js'),join(base,'index.jsx')];if(!possibilities.some(existsSync))throw Error('Unresolved import '+match[1]+' in '+file);}}
console.log('verify-source: PASS; '+source.length+' source files, no legacy Communications or topbar dialer');
