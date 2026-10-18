# iPhoneLink React v03

- Removed obsolete Communications UI components and their CSS from source.
- Deleted the old topbar dialer component and CSS rather than hiding them.
- Built a new Communications component and stylesheet from scratch.
- Kept existing lead data, mail store and phone-provider controller.
- Added a shared Web Audio engine for DTMF and quiet button clicks.
- Kept controls visibly styled at all times, with press feedback.
- Prevented `tel:` fallback from claiming an active in-app call.
- Added new v03 static regression tests and removed outdated v02 tests.
- Incremented the visible brand version to v03.

## Limitations

Real provider-connected calling and SMS/WhatsApp transmission are not supplied by the current frontend and require integrations. The local demo never asserts messages were delivered.
