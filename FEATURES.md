# iPhoneLink v07 — Features
- Full desktop canvas on phones (1440 × 900 CSS pixels), native pan and pinch zoom.
- Leads grid and Email/Gmail desktop layout preserved; Email sidebar remains full width.
- Functional, persistent display settings inside the user avatar dropdown, Light mode default.
- Compact shared-controller topbar switcher, phone display, keypad, call/end, mute, hold, speaker buttons.
- One Communications window with touch drag resizing and saved dimensions.
- Messages, new SMS, threads, Calls/Recents/Contacts/detail/keypad, WhatsApp chats/new-chat/thread, All and Email.
- Distinct SMS and WhatsApp conversations, labeled local-only drafts, dual-frequency DTMF audio.
- Tests cover desktop, mobile Chromium and mobile WebKit interactions.

### Future phone backend contract
Assign a connected phone provider at window.CRMPhoneProvider. Supply devices or synchronous getDevices() entries with matching phone ID and connected: true. For real battery status, implement getDeviceStatus(id) returning batteryPercent (0–100), charging and lowPowerMode. The optional subscribe(handler) must support multiple listeners and may send deviceId and battery state. The interface never fabricates readings when the provider is absent.
