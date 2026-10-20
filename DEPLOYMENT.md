# iPhoneLink v11: one-click production publishing

The top-right account menu contains **Deploy to Vercel**. It publishes the newest commit on GitHub `main` to the existing `iphonelink-crm` Vercel project and keeps the same production domain: https://iphonelink-crm-gamma.vercel.app.

## Required one-time owner setup

In Vercel project `iphonelink-crm` -> Settings -> Environment Variables, set BOTH keys for **Production** (encrypted):

- `IPHONELINK_DEPLOY_ADMIN_KEY`: a long, unique random owner access key; never put it in a client source file.
- `IPHONELINK_VERCEL_TOKEN`: a Vercel API access token with access to the `izzy-bb13` team and deployment permissions; create in Vercel account settings. Keep it private.

Redeploy the project after setting Production variables to make them available to its serverless function. Open the live app, click the top-right avatar, choose **Deploy to Vercel**, and sign in once on that browser with the owner key. An HTTP-only, Secure, SameSite=Strict session cookie keeps that browser authenticated for 30 days. Later clicks require only one button.

The button deploys the **latest committed GitHub main branch**, not local/uncommitted files or files on an older version branch. Commit changes to main before clicking. The backend requests a production deployment from Vercel. The UI checks the specific deployment ID every seven seconds until READY/ERROR/etc.; it never treats a queued build as success. If a deployment fails, the existing live site stays online.

Do not publish either secret in git, browser JS, or chat screenshots. The admin key is only accepted server-side. If compromised, rotate the value in Vercel and redeploy.

## Smoke test

- `npm run build` validates the source.
- `node scripts/test-deploy.mjs` validates credential handling, cookies, origin checks, call parameters, and state reporting with a simulated Vercel API (it does not assert a real external deployment).
- To confirm production publishing, verify the Vercel deployment reaches READY and the stable hostname serves its new commit. That requires both Production environment keys to be configured.
