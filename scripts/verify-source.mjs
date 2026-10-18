import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src');
const required = [
  'src/App.jsx',
  'src/pages/leads/LeadsList.jsx',
  'src/pages/leads/LeadDetails.jsx',
  'src/communications/panel/CommunicationPanel.jsx',
  'src/shell/dialer/TopbarDialer.jsx',
  'src/components/CrmIcons.jsx',
  'src/pages/email/EmailClient.jsx',
  'src/hooks/usePhoneController.js',
  'src/utils/leadUtils.js',
  'src/pages/scanner/ScannerPage.jsx',
  'src/pages/campaign/CampaignPage.jsx',
  'src/pages/team/TeamPage.jsx',
  'src/pages/activity/ActivityLogPage.jsx',
  'src/services/phoneService.js',
  'src/services/mailStore.js',
  'src/shell/topbar/Topbar.jsx',
  'src/shell/topbar/TopNavigation.jsx',
  'src/communications/messages/MessagesView.jsx',
  'src/communications/calls/CallsView.jsx',
  'src/communications/contacts/ContactsView.jsx',
  'src/communications/whatsapp/WhatsAppThread.jsx',
  'src/pages/email/EmailComposer.jsx',
  'FEATURES.md',
];

for (const file of required) {
  if (!existsSync(join(root, file))) throw new Error(`Missing required file: ${file}`);
}

const files = [];
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (['.js', '.jsx'].includes(extname(path))) files.push(path);
  }
}
walk(src);

const importRe = /(?:from\s+|import\s*)['"](\.[^'"]+)['"]/g;
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  for (const match of text.matchAll(importRe)) {
    const base = resolve(dirname(file), match[1]);
    const candidates = [base, `${base}.js`, `${base}.jsx`, join(base, 'index.js'), join(base, 'index.jsx')];
    if (!candidates.some(existsSync)) throw new Error(`Unresolved import ${match[1]} in ${file}`);
  }
}

const phoneService = readFileSync(join(root, 'src/services/phoneService.js'), 'utf8');
if (!phoneService.includes('window.CRMPhoneProvider')) throw new Error('Phone provider hook missing');
if (!phoneService.includes('tel:${number}')) throw new Error('tel: fallback missing');

console.log('verify-source: PASS');
console.log(`source files checked: ${files.length}`);
