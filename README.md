# iPhoneLink React v02

Modular React/Vite frontend combining the supplied `iphonelink.01.html` Leads grid with the functional Email and Communications components of React CRM v59.

## Run locally

```bash
npm install
npm run dev
```

To build for static hosting:

```bash
npm run build
```

Upload the generated `dist/` directory to a static web server or GitHub Pages workflow. Do **not** upload JSX source directly as a GitHub Pages site; browsers require the compiled files.

## Implemented in v02

- iPhoneLink-branded topbar, with Leads and Email.
- Fourteen iPhoneLink lead columns, ten baseline mock leads, resizable headers, compact muted stats, functioning Search, Filter and locally persisted Add Lead form.
- Movable navy Comms tab docked on the bottom edge and popup Communications panel. Popup Email uses the same mailbox data as the main Email page.
- Gmail-proportioned sidebar, logo-style treatment, search, full-width message reader and Compose popup. No Star/Important row icons, Snoozed, Important folder, custom labels, Print or Schedule Send.
- Compose preserves v59's multiple From accounts, templates, Cc, Bcc, attachments and tracking toggle, and adds formatting, rich text, insert link/image, minimize, maximize, close, autosave and local Undo Send.
- Inbox actions: selection, select all, archive, delete, mark unread, move to Spam, folder moves and refresh; reply, reply all and forward.
- Existing v59 dialer, notifications, Communications messages/calls and settings source preserved.

## Storage and provider limitations

This is a **frontend demo**. Sending moves a message into the *local* Sent folder, but does not deliver it to an outside email address. Incoming real mail, backend email tracking and provider authentication are not connected. Attachments selected during a session are stored locally with the draft/sent record using IndexedDB; attachments already in the v59 seed with no actual file bytes are view-only names. Browser storage quotas may limit large files. Undo Send reverses the local operation only. Search works against messages currently loaded in the browser, not Gmail servers.

Email folders are preserved by v59's IndexedDB storage. Lead additions are preserved with localStorage. Local data is per browser/device and is not synchronized to a backend.

## Validation

`npm run verify` checks source structure and v02 regression assertions. Full Vite build requires installing React and Vite packages. The current authoring environment could not complete npm dependency installation, so a production build and interactive browser smoke test have **not** been verified here.
