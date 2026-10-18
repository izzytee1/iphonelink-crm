# iPhoneLink React v03

React/Vite CRM preserving the Leads grid and existing Email workspace.

## Communications v03

A new standalone Communications visual system replaces all previous popup and topbar dialer components. Its four views are **All, Messages, Calls, Email**. It has a movable bottom-edge launcher, local conversation drafts, an integrated Calls keypad with Web Audio DTMF tones, Recents/Contacts, and a compact inbox connected to the existing mailbox store. All CRM buttons have a subtle press animation and click tone.

## Run and test

```bash
npm install
npm run verify
npm run build
```

## Provider and storage limits

This build is a browser-based CRM. The phone provider API is `window.CRMPhoneProvider`. Without a compatible provider, the browser's `tel:` handoff is used and the app does not pretend a connected call exists. Web Audio DTMF makes correct audible pairs; transmission during a live call requires a phone provider implementing `sendTone`.

Messages composed in the new panel are stored locally and clearly marked **not delivered**; they are not sent over SMS or WhatsApp without a provider. Email sending in the main Gmail-like workspace also remains local-only. Leads, messages and mailbox storage use existing browser persistence and are not synced between devices. Sample call history is labeled accordingly.

No legacy Communications panel or topbar dialer code is retained.
