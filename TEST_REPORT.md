# v05 regression test report

The GitHub Actions `Verify React Build` workflow runs `npm run build` (source verification and v05 regression assertions) and `npm run test:ui` (desktop Chromium, mobile Chromium, mobile WebKit).

The browser test checks a >1400 CSS-pixel mobile document, horizontal browser panning, avatar settings access, Light/Dark toggling, density and font setting changes, UI scale, switcher, DTMF keypad, Gmail sidebar, Communications screen navigation and the resize handle. See the latest GitHub Actions run for the actual pass/fail result.

Real provider actions and visual pixel-by-pixel comparison require separate integration/device testing.
