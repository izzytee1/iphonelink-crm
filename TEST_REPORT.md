# v10 Verification Plan

- React production build and static source verification.
- Shared Gmail: folder switching, account switching, composing and replies inside Communications.
- Quick notifications: badge, dropdown, inline reply, banner entrance and timed exit.
- Native SMS/iMessage/WhatsApp local quick replies, lead details, dark mode, phone keypad and mobile browser regression.
- Actual carrier sending and connected mailbox synchronization are not implemented without external providers.

# v09 Test Report

- Source verification, production build, regression and visual checks.
- Desktop Chromium, mobile Chromium and mobile WebKit.
- Validate Back buttons, message channels, keypad label geometry, compact leads and dark colors.
- Actual phone backend and physical device status not tested without provider.

# v08 Test Report

- React production build plus source assertions and duplicate-selector audit.
- Chromium desktop and mobile/WebKit UI regression tests including drag, keypad, message and phone navigation.
- Visual screenshots of WhatsApp and iPhone Messages in light and dark with row-tap geometry checks.
- Real hardware, WhatsApp/iMessage delivery and carrier phone features still require connected backends.

# v07 Test Report

- Build and source regression tests
- Desktop Chromium and mobile Chromium/WebKit interactions
- Native status battery contract and stable list layout
- No actual device/provider or real WhatsApp/iMessage delivery verified

# v06 Test Report

Validation commands: npm run build, npm run test:ui.

- Source regression: 48 checks.
- Build: Vite React production bundle.
- Browser: Chromium desktop (1440 × 900); Chromium mobile (390 × 844); WebKit mobile (390 × 844).
- v06 coverage: 10/11-digit entry, 12-key dropdown, dark call states, draggable/dockable banner, floating call panel, SMS/iMessage and WhatsApp presentation.
- Live connected phone hardware, actual voice provider, and real telemetry are not represented by these simulated UI tests.

# v05 regression test report

The GitHub Actions `Verify React Build` workflow runs `npm run build` (source verification and v05 regression assertions) and `npm run test:ui` (desktop Chromium, mobile Chromium, mobile WebKit).

The browser test checks a >1400 CSS-pixel mobile document, horizontal browser panning, avatar settings access, Light/Dark toggling, density and font setting changes, UI scale, switcher, DTMF keypad, Gmail sidebar, Communications screen navigation and the resize handle. See the latest GitHub Actions run for the actual pass/fail result.

Real provider actions and visual pixel-by-pixel comparison require separate integration/device testing.
