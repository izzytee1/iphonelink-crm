# v07 Test Report

Test plan: clean npm install, production build, source regression checks, Chromium desktop/mobile and WebKit mobile, and visual screenshots for dialer, keypad, Calls, Messages, WhatsApp.

Unverified until connected: real iPhone battery telemetry, actual telephone provider calls, real iMessage and WhatsApp delivery.

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
