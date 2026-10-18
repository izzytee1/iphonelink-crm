# iPhoneLink React v04

Vite + React frontend with preserved Leads and Gmail-style Email workspaces.

## Communications
One iPhone-shaped Communications shell. Root sections are All, Messages, Calls, and Email. Full-screen native-style Messages list, New Message and thread views; separate WhatsApp Chats, new-chat picker and thread. Calls includes Recents, Contacts, detail and keypad, using one shared call controller.

## Run
```sh
npm install
npm run verify
npm run build
```
Output: `dist/`. CI verifies the production build.

## Provider and storage limits
Phone provider: `window.CRMPhoneProvider`. A browser `tel:` handoff does not confirm an active browser call. Sample calls, sample phones and mock messages are not real provider records. DTMF audio does not reach the network unless an attached provider implements `sendTone`.

New SMS and WhatsApp messages remain in local browser storage, visibly marked **not delivered**. Email sending is local only. Data does not sync across browsers. The mobile shell resembles iOS but is not a native iPhone application.
