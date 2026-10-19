# v11 — Communications visual correction

- Updated keypad and Contacts to a colored iOS-style design, corrected light-mode contrast.
- Restored uniform slate-lavender avatar colors and consistent avatar sizes.
- Collapsible search icon for WhatsApp, Messages, Contacts and compact Gmail (search input opens on demand).
- Aligned and enlarged message/WhatsApp composers, with visible Send and local attachment pickers.
- Compact Gmail composer enlarged, formatting toolbar hidden by default with toggle, full composer controls preserved.
- Smaller iPhone page titles; existing backend/data features retained, no false delivery indicators.
- Regression, mobile screenshots, and visual geometry checks performed.

# v10 — Instant Communications

- One shared Gmail client reused inside Communications, with folder switching, account selection, inline compose and reply.
- One local outbox helper for email, SMS, iMessage and WhatsApp; no fake provider delivery.
- Notifications stay in a bell dropdown, with direct inline quick reply for email, SMS, iMessage and WhatsApp.
- Incoming alert slides in below the topbar, remains for 5 seconds and slides out to the right; composing a reply pauses dismissal.
- Solid iOS-style user initials derived from the configured mail account.
- Retains compact lead details, native call UI and responsive CRM shell.

# v09 — Compact Communications and lead detail repairs

- Back icon on Messages root; native Back behavior on nested Communications screens.
- Simplified message previews and removed SMS/iMessage demonstration tabs; channel color remains correct and local-only delivery remains truthful.
- Consistent solid 42px list avatars, 40px thread avatars and stable row sizing.
- Corrected in-phone keypad call control positioning and gaps to prevent label overlap.
- Lead Company fields now form a compact three-column matrix, with two more sections per row on supported widths.
- Dark mode CRM brand and Gmail folder contrast repaired; lead details use theme-aware colors.
- Phone switcher matches premium navy call bar, without chevron.

# v08 — iPhone communications visual precision

- Match current iPhone-style chat typography, spacing, colors and native avatar proportions.
- WhatsApp chat list, thread header, bubbles, composer and light/dark variants updated against user screenshots.
- iOS Messages heading adjusted and duplicate Compose action removed.
- CSS implementation audited: one rule per selector; obsolete WhatsApp styles removed.
- Preserve existing functional actions, phone controller, device battery adapter, drag behavior and supported data.

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
