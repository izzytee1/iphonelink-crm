# iPhoneLink React v08

React/Vite CRM with desktop-sized Leads and Gmail-style Email workspaces, plus the iPhone-shaped Communications window.

## Mobile desktop mode
On phones the CRM remains a 1440 × 900 CSS-pixel desktop workspace. Swipe horizontally/vertically to reach offscreen columns and use native two-finger browser pinch zoom. It does not collapse to a miniature mobile layout.

## Communications and calling
The Communications shell includes All, Messages, Calls, Email and independent WhatsApp conversations. Drag the bottom-right resize handle with a finger to change its size; dimensions persist in the browser. The main topbar includes a phone switcher and compact shared-controller dialer with DTMF keypad, call/end, mute, hold and speaker.

## Settings
Use the top-right **user avatar → Display settings**. Appearance defaults to Light, with Dark available. UI scale, lead row density, font size, accent color and reset all update persisted settings. The old topbar Settings icon has been removed.

## Build
```sh
npm install
npm run verify
npm run build
npm run test:ui
```
The browser suite uses Playwright Chromium and WebKit. Output goes to `dist/`.

## Integration limits
No live SMS/WhatsApp delivery provider is configured; new drafts are **saved locally, not delivered**. `window.CRMPhoneProvider` is needed for actual in-browser calls. `tel:` handoff does not confirm connection. Sample calls and phone names are examples. Gmail-style mailbox actions remain local demo behavior. Browser storage does not sync across devices.
