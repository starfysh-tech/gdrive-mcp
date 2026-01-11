# gdrive-mcp

Connect Claude to your Google Workspace: Docs, Sheets, Drive, Slides, Forms, and Apps Script.

Built with FastMCP using the Model Context Protocol. Works with Claude Desktop and other MCP clients.

## Features

**Documents** — Read, write, and format content. Insert tables, images, page breaks. Manage comments and replies. Support for multi-tab documents.

**Spreadsheets** — Read and write ranges using A1 notation. Append rows, clear cells, create sheets. Get metadata and manage tabs.

**Drive** — Search and list files. Create, move, copy, rename, and delete files. Manage folders and permissions. Access shared drives.

**Slides** — Read presentation metadata. Create presentations and manage slides.

**Forms** — Read form structure and responses (read-only API limitation).

**Apps Script** — Manage projects, read and update code, list versions and deployments. Execute functions via API.

**Authentication** — Secure OAuth 2.0 with support for service accounts and domain-wide delegation.

---

## Prerequisites

- Node.js 18+ and npm ([nodejs.org](https://nodejs.org/))
- Git ([git-scm.com/downloads](https://git-scm.com/downloads))
- Google Account with access to the documents you want to manage
- Claude Desktop (optional, if connecting to Claude)

---

## Setup

### Step 1: Google Cloud Credentials

Create OAuth credentials to authenticate with Google APIs.

1. **Open [Google Cloud Console](https://console.cloud.google.com/)** and create or select a project

2. **Enable APIs** (APIs & Services → Library):
   - Google Docs API
   - Google Sheets API
   - Google Drive API
   - Google Slides API
   - Google Forms API
   - Apps Script API

3. **Configure OAuth Consent Screen** (APIs & Services → OAuth consent screen):
   - User Type: External
   - App name: Choose any name (e.g., "gdrive-mcp")
   - User support email + Developer contact: Your email
   - Scopes: Add all 7 scopes listed above (`auth/documents`, `auth/spreadsheets`, `auth/drive`, `auth/presentations`, `auth/forms.body.readonly`, `auth/forms.responses.readonly`, `auth/script.projects`)
   - Test Users: Add your Google email

4. **Create OAuth Credentials** (APIs & Services → Credentials):
   - Create Credentials → OAuth client ID
   - Application type: Desktop app
   - Download the JSON file and rename it to `credentials.json`

**Security Note:** Keep `credentials.json` and `token.json` private. Never commit them to version control (`.gitignore` includes them).

### Step 2: Install and Build

```bash
git clone https://github.com/starfysh-tech/gdrive-mcp.git
cd gdrive-mcp
# Place credentials.json in this directory
npm install
npm run build
```

### Step 3: Authenticate

Run the server once to authorize Google API access:

```bash
node ./dist/server.js
```

The server will open your browser automatically for OAuth authorization. Sign in with the Google account you added as a test user. After authorizing, the server captures the token automatically and saves it to `token.json`.

<details>
<summary><strong>Enterprise: Service Account with Domain-Wide Delegation</strong></summary>

For Google Workspace organizations using domain-wide delegation:

1. Create a service account in Google Cloud Console (APIs & Services → Credentials → Service Account)
2. Enable domain-wide delegation in Workspace Admin Console (Security → API Controls)
3. Set environment variables:
   ```bash
   export SERVICE_ACCOUNT_PATH="/path/to/service-account-key.json"
   export GOOGLE_IMPERSONATE_USER="user@yourdomain.com"
   ```

Update Claude Desktop config to include these environment variables in the `env` object.

</details>

### Step 4: Configure Claude Desktop

Edit `claude_desktop_config.json`:
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux:** `~/.config/Claude/claude_desktop_config.json`

Add to `mcpServers` (replace `/PATH/TO` with your absolute path from `pwd`):

```json
{
  "mcpServers": {
    "gdrive-mcp": {
      "command": "node",
      "args": ["/PATH/TO/gdrive-mcp/dist/server.js"],
      "env": {}
    }
  }
}
```

Restart Claude Desktop to load the server.

---

## Usage with Claude Desktop

Once configured, you should be able to use the tools in your chats with Claude:

- "Use the `gdrive-mcp` server to read the document with ID `YOUR_GOOGLE_DOC_ID`."
- "Can you get the content of Google Doc `YOUR_GOOGLE_DOC_ID`?"
- "Append 'This was added by Claude!' to document `YOUR_GOOGLE_DOC_ID` using the `gdrive-mcp` tool."

### Working with Tabs

Google Docs now supports multi-tab documents. This MCP server provides full support for working with tabs:

**Listing Tabs:**

- "List all tabs in document `YOUR_GOOGLE_DOC_ID` using the `listDocumentTabs` tool."
- "Show me the tab structure with content summary for document `YOUR_GOOGLE_DOC_ID`."

**Reading from Specific Tabs:**

- "Read the content from tab `TAB_ID` in document `YOUR_GOOGLE_DOC_ID` using the `readGoogleDoc` tool."
- "Get the markdown content from tab `TAB_ID` in document `YOUR_GOOGLE_DOC_ID`."

**Writing to Specific Tabs:**

- "Append 'New content' to tab `TAB_ID` in document `YOUR_GOOGLE_DOC_ID`."
- "Insert text at index 100 in tab `TAB_ID` of document `YOUR_GOOGLE_DOC_ID`."
- "Delete content from range 50-100 in tab `TAB_ID` of document `YOUR_GOOGLE_DOC_ID`."

**Note:** The following tools support the optional `tabId` parameter:

- `readGoogleDoc` - Read from a specific tab
- `appendToGoogleDoc` - Append to a specific tab
- `insertText` - Insert text into a specific tab
- `deleteRange` - Delete content from a specific tab

When `tabId` is not specified, operations target the first tab (or the legacy document body for older documents without tabs).

### Advanced Usage Examples:

**Google Docs:**
- **Text Styling**: "Use `applyTextStyle` to make the text 'Important Section' bold and red (#FF0000) in document `YOUR_GOOGLE_DOC_ID`."
- **Paragraph Styling**: "Use `applyParagraphStyle` to center-align the paragraph containing 'Title Here' in document `YOUR_GOOGLE_DOC_ID`."
- **Table Creation**: "Insert a 3x4 table at index 500 in document `YOUR_GOOGLE_DOC_ID` using the `insertTable` tool."
- **Image Insertion**: "Use `insertImageFromUrl` to insert an image from 'https://example.com/image.png' at index 100 in document `YOUR_GOOGLE_DOC_ID`."
- **Local Image Upload**: "Use `insertLocalImage` to upload '/path/to/image.jpg' and insert it at index 200 in document `YOUR_GOOGLE_DOC_ID`."
- **Legacy Formatting**: "Use `formatMatchingText` to find the second instance of 'Project Alpha' and make it blue (#0000FF) in doc `YOUR_GOOGLE_DOC_ID`."

**Google Sheets:**
- **Read Data**: "Read range A1:B10 from spreadsheet `YOUR_SPREADSHEET_ID` using `readSpreadsheet`."
- **Write Data**: "Write data [[1, 2], [3, 4]] to range A1:B2 in spreadsheet `YOUR_SPREADSHEET_ID`."
- **Append Rows**: "Append rows [[5, 6], [7, 8]] to spreadsheet `YOUR_SPREADSHEET_ID` starting at A1."
- **Create Spreadsheet**: "Create a new spreadsheet titled 'Sales Data' with initial data [[Name, Amount], [Product A, 100]]."
- **Get Info**: "Get information about spreadsheet `YOUR_SPREADSHEET_ID` including all sheets."
- **Add Sheet**: "Add a new sheet named 'Summary' to spreadsheet `YOUR_SPREADSHEET_ID`."
- **Clear Range**: "Clear the range A1:B10 in spreadsheet `YOUR_SPREADSHEET_ID`."
- **List Spreadsheets**: "List all my Google Spreadsheets modified in the last 30 days."

Remember to replace:
- `YOUR_GOOGLE_DOC_ID` with the actual ID from a Google Doc's URL (the long string between `/d/` and `/edit`)
- `YOUR_SPREADSHEET_ID` with the actual ID from a Google Sheet's URL (the long string between `/d/` and `/edit`)

Claude will automatically launch your server in the background when needed using the command you provided. You do **not** need to run `node ./dist/server.js` manually anymore.

---

## Image Insertion

This server provides two ways to insert images into Google Documents:

### 1. Insert from Public URL (`insertImageFromUrl`)

Inserts an image directly from a publicly accessible URL. The image URL must be accessible without authentication.

**Parameters:**

- `documentId`: The Google Document ID
- `imageUrl`: Publicly accessible URL (http:// or https://)
- `index`: Position in the document (1-based indexing)
- `width` (optional): Image width in points
- `height` (optional): Image height in points

**Example:**

```
"Insert an image from https://example.com/logo.png at index 100 in document YOUR_DOC_ID"
```

### 2. Upload Local Image (`insertLocalImage`)

Uploads a local image file to Google Drive and inserts it into the document. This is a two-step process that:

1. Uploads the image to Google Drive (by default to the same folder as the document)
2. Makes the image publicly readable
3. Inserts the image into the document using its Drive URL

**Parameters:**

- `documentId`: The Google Document ID
- `localImagePath`: Absolute path to the local image file
- `index`: Position in the document (1-based indexing)
- `width` (optional): Image width in points
- `height` (optional): Image height in points
- `uploadToSameFolder` (optional, default: true): If true, uploads to the document's folder; if false, uploads to Drive root

**Supported formats:** .jpg, .jpeg, .png, .gif, .bmp, .webp, .svg

**Example:**

```
"Upload and insert the image at /Users/myname/Pictures/chart.png at index 200 in document YOUR_DOC_ID with width 400 and height 300"
```

**Note:** The uploaded image will be made publicly readable so it can be displayed in the document. The image file will remain in your Google Drive and can be managed separately.

---

## Security & Token Storage

- **`.gitignore`:** This repository includes a `.gitignore` file which should prevent you from accidentally committing your sensitive `credentials.json` and `token.json` files. **Do not remove these lines from `.gitignore`**.
- **Token Storage:** This server stores the Google authorization token (`token.json`) directly in the project folder for simplicity during setup. In production or more security-sensitive environments, consider storing this token more securely, such as using system keychains, encrypted files, or dedicated secret management services.

---

## Testing

The multi-tab support features have been thoroughly tested and verified:

✅ **Tested Features:**

- `listDocumentTabs` - Lists all tabs with IDs, titles, positions, and content summaries
- `readGoogleDoc` with `tabId` - Reads specific tabs; backward compatible without `tabId`
- `appendToGoogleDoc` with `tabId` - Appends to specific tabs without affecting others
- `insertText` with `tabId` - Inserts text at specific positions in specific tabs
- `deleteRange` with `tabId` - Deletes content from specific tabs in isolation
- Multi-tab operations - Sequential operations on different tabs work independently
- Error handling - Invalid tab IDs return clear, helpful error messages
- Backward compatibility - Operations without `tabId` default to first tab (legacy documents supported)

All tab-related features have been validated with real Google Docs containing multiple tabs, confirming:

- Tab isolation (operations on one tab don't affect others)
- Proper tab ID validation and error messages
- Correct content retrieval and manipulation per tab
- Full backward compatibility with single-tab and legacy documents

## Google Sheets Usage

### A1 Notation

Google Sheets uses A1 notation to specify ranges. Examples:
- `A1` - Single cell
- `A1:B10` - Range from A1 to B10
- `Sheet1!A1:B10` - Range on a specific sheet named "Sheet1"
- `A:A` - Entire column A
- `1:1` - Entire row 1

### Value Input Options

When writing data to spreadsheets, you can choose how values are interpreted:
- **USER_ENTERED** (default): Values are parsed as if typed by a user (formulas work, dates are recognized, etc.)
- **RAW**: Values are stored exactly as provided (no parsing)

### Example Workflow

```bash
# 1. Create a new spreadsheet
"Create a spreadsheet titled 'Monthly Report'"

# 2. Write headers
"Write [[Date, Sales, Expenses]] to range A1:C1 in spreadsheet YOUR_SPREADSHEET_ID"

# 3. Append data rows
"Append rows [[2024-01-01, 1000, 500], [2024-01-02, 1200, 600]] to spreadsheet YOUR_SPREADSHEET_ID starting at A2"

# 4. Read the data back
"Read range A1:C3 from spreadsheet YOUR_SPREADSHEET_ID"

# 5. Add a new sheet for analysis
"Add a new sheet named 'Analysis' to spreadsheet YOUR_SPREADSHEET_ID"
```

## Known Limitations

While this MCP server provides comprehensive Google Docs, Sheets, and Drive functionality, there are some limitations imposed by the Google APIs themselves:

### Comment Anchoring

**Programmatically Created Comments Are Not Anchored**: Comments created via the `addComment` tool appear in the "All Comments" list but are not visibly anchored to specific text in the Google Docs UI. They will show "original content deleted" instead of highlighting the intended text range. This is a limitation of the Google Drive API v3 when working with Google Docs files.

- **Workaround**: Comments created manually in the Google Docs UI are properly anchored
- **Other Operations**: Reply, delete, and list operations work correctly on all comments regardless of how they were created

### Comment Resolution

**Resolved Status May Not Persist**: The `resolveComment` tool attempts to mark comments as resolved, but the Drive API v3 does not fully support this operation for Google Docs files. The resolved status may not persist or be visible in the Google Docs UI.

- **Workaround**: Resolve comments manually in the Google Docs web interface

### Converted Documents

**Limited Support for Converted Documents**: Some Google Docs that were converted from other formats (especially Microsoft Word documents) may not support all Docs API operations. You may encounter errors like "This operation is not supported for this document" when trying to read or modify these files.

### Google Forms API Limitations

**Read-Only Access**: The Google Forms API only supports **reading** form structure and responses. You cannot create, update, or delete forms or questions programmatically. This is a fundamental limitation of the [Google Forms API](https://developers.google.com/workspace/forms/api/reference/rest).

- Forms can only be created and edited via the Google Forms web interface
- The API can read form structure (questions, settings) and responses
- See: [Google Forms API Documentation](https://developers.google.com/workspace/forms/api)

### Google Slides API Limitations

**No Batch Updates**: Unlike the Google Docs API, the Slides API does not support batch updates in the same way. Each modification requires individual API calls. See: [Google Slides API Documentation](https://developers.google.com/workspace/slides/api)

### Google Apps Script API Limitations

**No Project Listing**: The Apps Script API does not support listing all script projects. You must know the script ID to interact with a project. Script IDs can be found in the script editor URL: `script.google.com/d/{SCRIPT_ID}/edit`

**Script Execution Requirements**: Running Apps Script functions via the API requires specific setup:

1. The script must be deployed as an **API Executable**
2. The calling application and script must share a **common Google Cloud project**
3. The OAuth token must include **all scopes** used by the script
4. Only scripts with at least one required scope can be executed

See: [Execute Functions with the Apps Script API](https://developers.google.com/apps-script/api/how-tos/execute)

## API Documentation References

| API | Documentation | OAuth Scopes Reference |
|-----|---------------|----------------------|
| Google Docs | [developers.google.com/docs/api](https://developers.google.com/docs/api) | `auth/documents` |
| Google Sheets | [developers.google.com/sheets/api](https://developers.google.com/sheets/api) | `auth/spreadsheets` |
| Google Drive | [developers.google.com/drive/api](https://developers.google.com/drive/api) | `auth/drive` |
| Google Slides | [developers.google.com/slides/api](https://developers.google.com/workspace/slides/api) | `auth/presentations` |
| Google Forms | [developers.google.com/forms/api](https://developers.google.com/workspace/forms/api) | `auth/forms.body.readonly`, `auth/forms.responses.readonly` |
| Apps Script | [developers.google.com/apps-script/api](https://developers.google.com/apps-script/api) | `auth/script.projects` |

For the complete list of OAuth 2.0 scopes, see: [OAuth 2.0 Scopes for Google APIs](https://developers.google.com/identity/protocols/oauth2/scopes)

## Troubleshooting

- **Claude shows "Failed" or "Could not attach":**
  - Double-check the absolute path in `mcp_config.json`.
  - Ensure you ran `npm run build` successfully and the `dist` folder exists.
  - Try running the command from `mcp_config.json` manually in your terminal: `node /PATH/TO/YOUR/CLONED/REPO/gdrive-mcp/dist/server.js`. Look for any errors printed.
  - Check the Claude Desktop logs (see the official MCP debugging guide).
  - Make sure all `console.log` status messages in the server code were changed to `console.error`.
- **Google Authorization Errors:**
  - Ensure you enabled the correct APIs (Docs, Sheets, Drive, Slides, Forms, Apps Script).
  - Make sure you added your email as a Test User on the OAuth Consent Screen.
  - Verify the `credentials.json` file is correctly placed in the project root or `~/.config/gdrive-mcp/`.
  - **If you're upgrading from an older version:** Delete your existing `token.json` file and re-authenticate to grant new scopes (Sheets, Slides, Forms, Apps Script).
- **"Unverified app" Warning During OAuth:**
  - **This is expected** when your app is in "Testing" mode.
  - Click "Advanced" → "Go to [Your App Name] (unsafe)" → "Continue"
  - This is safe because you're authorizing your own application.
- **"This site can't be reached" Error:**
  - **This is normal** during OAuth flow! Your browser tries to redirect to `http://localhost` which isn't running.
  - Look at the browser address bar for the URL like `http://localhost/?code=4/0Axxx...`
  - Copy the code between `code=` and `&scope` and paste it into the terminal.
- **Permission Denied Errors:**
  - Verify you're accessing documents that you own or have been shared with you.
  - Check document sharing settings in Google Drive.
- **Tab-related Errors:**
  - If you get "Tab with ID not found", use `listDocumentTabs` to see all available tab IDs
  - Ensure you're using the correct tab ID format (typically a short alphanumeric string)
  - Single-tab documents don't require `tabId` - operations work on the document body automatically

---

## About

Maintained by [Starfysh](https://starfysh.net) — fractional product + tech leadership for technical founders.

Originally forked from [a-bonus/google-docs-mcp](https://github.com/a-bonus/google-docs-mcp).

---

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.
