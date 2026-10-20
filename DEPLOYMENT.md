# iPhoneLink deployment — no token setup

Use the avatar menu > **Deploy to Vercel** > **Open ChatGPT to deploy**. The button opens ChatGPT with the complete deployment request in the composer. Press **Send**; the connected GitHub and Vercel apps carry out the deployment and verify its status.

Alternatively, in an existing ChatGPT conversation with GitHub and Vercel connected, send **Deploy iPhoneLink**. The request is to deploy the most recent GitHub commit from `izzytee1/iphonelink-crm` branch `main` to the existing Vercel project `iphonelink-crm` in production, verify it reports `READY`, and check that the production alias continues to point to the completed build.

Permanent production URL: https://iphonelink-crm-gamma.vercel.app

The shortcut is **not** a background API caller. Opening ChatGPT does not itself cause a deployment; sending the request starts the assistant workflow, which needs connected-account access. Code changed only in an unsaved or local ZIP is not committed to `main` and will not deploy. The site also already deploys automatically when `main` receives a new Git commit and the build succeeds.

The former `api/deploy.js` and unused access-key/token setup have been removed. The CRM does not store credentials, expose API tokens, or show an unusable setup warning. The existing permanent URL remains unchanged on successful production releases.
