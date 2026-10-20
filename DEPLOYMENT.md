# iPhoneLink: Deploy from inside CRM

Click **Avatar → Deploy to Vercel**. The CRM deploys the latest commit from \`izzytee1/iphonelink-crm\` branch \`main\` to the existing Vercel production project. The permanent site remains https://iphonelink-crm-gamma.vercel.app.

## One-time connection

Vercel must authorize the CRM to trigger builds. Go to https://vercel.com/izzy-bb13/iphonelink-crm/settings/git → **Deploy Hooks**. Create **one** hook for branch **main**, and copy its URL. In the CRM's deployment panel paste the URL and click **Connect & deploy**. On later visits in the **same browser**, simply press **Deploy now**.

The hook URL is a bearer secret saved only in browser local storage, not uploaded to a project file or GitHub and not saved on our backend. Treat anyone with access to this browser as able to trigger builds. You can revoke the hook in Vercel and use **Change connection** to set up a new one.

\`api/deploy.js\` checks the HTTPS hostname and exact CRM project ID before sending a POST to Vercel. The response reports \`queued\` only if Vercel supplies a real job ID. **Queued does not mean deployment is ready**. Follow **View deployment status** to watch for \`READY\` and the updated production alias. Build errors leave the existing production version live.

No token is needed. The button deploys committed GitHub content; local files not pushed to \`main\` are not included. It cannot upload a ZIP, commit file edits, or deploy uncommitted source. Moving code to \`main\` already triggers a production deployment automatically via Git integration.
