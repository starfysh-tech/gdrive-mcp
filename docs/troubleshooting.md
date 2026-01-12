# Troubleshooting

[← Back to README](../README.md)

Common issues and solutions for gdrive-mcp setup and usage.

---

## Claude Desktop Connection Issues

**Symptom:** Claude shows "Failed" or "Could not attach"

**Solutions:**
- Double-check the absolute path in `claude_desktop_config.json`
- Ensure you ran `npm run build` successfully and the `dist` folder exists
- Try running the command from `claude_desktop_config.json` manually in your terminal: `node /PATH/TO/YOUR/CLONED/REPO/gdrive-mcp/dist/server.js`. Look for any errors printed
- Check the Claude Desktop logs (see the official MCP debugging guide)
- Make sure all `console.log` status messages in the server code were changed to `console.error`

---

## Google Authorization Errors

**Symptom:** Authentication failures or permission errors

**Solutions:**
- Ensure you enabled the correct APIs (Docs, Sheets, Drive, Slides, Forms, Apps Script)
- Make sure you added your email as a Test User on the OAuth Consent Screen
- Verify the `credentials.json` file is correctly placed in the project root or `~/.config/gdrive-mcp/`
- **If you're upgrading from an older version:** Delete your existing `token.json` file and re-authenticate to grant new scopes (Sheets, Slides, Forms, Apps Script)

---

## "Unverified app" Warning During OAuth

**Symptom:** Google shows "This app isn't verified" warning

**This is expected** when your app is in "Testing" mode.

**Solution:**
- Click "Advanced" → "Go to [Your App Name] (unsafe)" → "Continue"
- This is safe because you're authorizing your own application

---

## "This site can't be reached" Error

**Symptom:** Browser shows connection error during OAuth flow

**This is normal** during OAuth flow! Your browser tries to redirect to `http://localhost` which isn't running.

**Solution:**
- Look at the browser address bar for the URL like `http://localhost/?code=4/0Axxx...`
- Copy the code between `code=` and `&scope` and paste it into the terminal

---

## Permission Denied Errors

**Symptom:** Cannot access documents or folders

**Solutions:**
- Verify you're accessing documents that you own or have been shared with you
- Check document sharing settings in Google Drive

---

## Tab-related Errors

**Symptom:** "Tab with ID not found" or tab operations failing

**Solutions:**
- If you get "Tab with ID not found", use `listDocumentTabs` to see all available tab IDs
- Ensure you're using the correct tab ID format (typically a short alphanumeric string)
- Single-tab documents don't require `tabId` - operations work on the document body automatically
