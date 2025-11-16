# Google Sheets Integration Setup Guide

## What's Been Set Up

Your React form now captures:
- Age group (child/teen, adult)
- Support types (multi-select)
- Name & email
- Location & format preferences

## Setup Steps

### 1. Create a Google Sheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet (or use an existing one)
3. Name the first sheet "Clients"
4. Copy the sheet ID from the URL: `https://docs.google.com/spreadsheets/d/1vQKeG_fqW8mTyzPI5BdcX85cylsyiTP9TDjDU3jkgx4/edit`

### 2. Create Google Apps Script
1. Go to [Google Apps Script](https://script.google.com)
2. Create a new project
3. Delete the default code
4. Paste the code from `AppsScript.gs` in this repo
5. Replace `"YOUR_SHEET_ID"` with your actual sheet ID
6. Click **Save**

### 3. Deploy the Script
1. Click **Deploy** → **New deployment**
2. Select **Type** → **Web app**
3. Set:
   - Execute as: Your email
   - Who has access: Anyone
4. Click **Deploy**
5. Copy the deployment URL (looks like: `https://script.google.com/macros/d/...`)

### 4. Update React App
1. Open `src/useIntakeForm.js`
2. Replace `YOUR_SCRIPT_ID` in the `SCRIPT_URL` with the deployment URL from step 3
3. Save

## Example Script URL Format
```
https://script.google.com/macros/d/1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t/usercontent?new
```

## Testing

1. Run `npm run dev`
2. Fill out the form and click "Submit"
3. Check your Google Sheet - the data should appear!

## Troubleshooting

- **No data appears**: Check that the script is deployed correctly and the URL is updated in `useIntakeForm.js`
- **CORS errors**: The `mode: "no-cors"` setting handles this for Apps Script
- **Sheet not found**: Verify the Sheet ID is correct and the sheet is named "Responses"

## Security Note

Google Apps Script web apps deployed with "Anyone" access can receive data from your frontend without authentication. For production, consider:
- Adding API key validation
- Rate limiting
- Data validation on the script side
