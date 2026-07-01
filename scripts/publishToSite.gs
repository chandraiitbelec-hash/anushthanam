// Sheets-bound Apps Script: adds "Anushthanam → Publish to site" to the menu bar.
// Setup:
//   1. Open the spreadsheet → Extensions → Apps Script
//   2. Paste this file, replace DEPLOY_HOOK_URL with the hook from
//      Vercel → Project → Settings → Git → Deploy Hooks
//   3. Save, run onOpen() once manually, then reload the spreadsheet.

const DEPLOY_HOOK_URL = 'https://api.vercel.com/v1/integrations/deploy/YOUR_HOOK_ID_HERE';

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Anushthanam')
    .addItem('Publish to site', 'publishToSite')
    .addToUi();
}

function publishToSite() {
  const ui = SpreadsheetApp.getUi();

  const confirm = ui.alert(
    'Publish to site',
    'This will trigger a Vercel build and deploy the latest sheet data. Continue?',
    ui.ButtonSet.YES_NO
  );
  if (confirm !== ui.Button.YES) return;

  try {
    const response = UrlFetchApp.fetch(DEPLOY_HOOK_URL, { method: 'post' });
    const code = response.getResponseCode();
    if (code === 200 || code === 201) {
      ui.alert('Deploy triggered', 'Build started on Vercel. Changes will be live in ~2 minutes.', ui.ButtonSet.OK);
    } else {
      ui.alert('Unexpected response', 'HTTP ' + code + '. Check Vercel dashboard.', ui.ButtonSet.OK);
    }
  } catch (e) {
    ui.alert('Error', e.message, ui.ButtonSet.OK);
  }
}
