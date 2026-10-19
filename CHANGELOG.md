# v07 — Compact iPhone and WhatsApp refinements

- Dark 215px keypad, balanced topbar number screen and premium phone switcher.
- Provider-ready iPhone battery state, charging icon and low-power yellow, no fake readings.
- Native Calls titlebar, call filter, working search and bottom navigation.
- Working WhatsApp chat list, search, unread filter and compose; remove unsupported video/camera/voice/attachment actions.
- Fix list row and avatar movement by removing press scaling; desktop/mobile browser regression tests.

# v06 — Compact dark call control

- Persistent dark phone banner with always-available idle number entry and 12-key drop-down.
- Drag the phone banner out of the topbar and return it to its dock; expanded call controls also drag.
- One stateful green Call / red End control, a live call timer, no idle caller avatar.
- Premium no-chevron device switcher; no false connection indicators without provider confirmation.
- SMS and clearly labeled iMessage demo threads have separate state and send colors.
- WhatsApp uses a green paper-plane send button; demo sending remains local only.
- Neutral battery symbol when connected-device telemetry is unavailable.
- Bundled licensed Share Tech Mono technical font for display digits.
- Preserved desktop canvas, Gmail, settings, Communications and shared call state.
- Chromium desktop/mobile and WebKit mobile regression coverage.

# v05
- Removed the forced mobile auto-scale, retaining a true 1440 × 900 desktop CRM canvas.
- Enabled browser-native touch panning and pinch zoom on narrow phones.
- Restored the topbar phone switcher and keypad/dialer with shared phone-controller state.
- Removed obsolete topbar clock files and moved Settings into the user avatar menu.
- Added working, persisted appearance, UI scale, row density, font and accent settings.
- Light is now the default Communications theme, not the OS-preferred dark setting.
- Added one touch-resize control with saved Communications dimensions.
- Reduced oversized Communications headings; preserved desktop Gmail layout on phones.
- Replaced v04 regression tests with v05 functional and viewport checks.

No provider-connected calling, actual messaging delivery or cross-device persistence is claimed.
