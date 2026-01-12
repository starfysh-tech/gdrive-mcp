# Setup Guide

[← Back to README](../README.md)

## Prerequisites

- Node.js 18+ and npm ([nodejs.org](https://nodejs.org/))
- Git ([git-scm.com/downloads](https://git-scm.com/downloads))
- Google Account with access to the documents you want to manage
- Claude Desktop (optional, if connecting to Claude)

---

## Step 1: Google Cloud Credentials

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

---

## Step 2: Install and Build

```bash
git clone https://github.com/starfysh-tech/gdrive-mcp.git
cd gdrive-mcp
# Place credentials.json in this directory
npm install
npm run build
```

---

## Step 3: Authenticate

Run the server once to authorize Google API access:

```bash
node ./dist/server.js
```

The server will open your browser automatically for OAuth authorization. Sign in with the Google account you added as a test user. After authorizing, the server captures the token automatically and saves it to `token.json`.

---

## Step 4: Configure Claude Desktop

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

## Enterprise: Service Account with Domain-Wide Delegation

For Google Workspace organizations using domain-wide delegation:

1. Create a service account in Google Cloud Console (APIs & Services → Credentials → Service Account)
2. Enable domain-wide delegation in Workspace Admin Console (Security → API Controls)
3. Set environment variables:
   ```bash
   export SERVICE_ACCOUNT_PATH="/path/to/service-account-key.json"
   export GOOGLE_IMPERSONATE_USER="user@yourdomain.com"
   ```

Update Claude Desktop config to include these environment variables in the `env` object.

---

## Security & Token Storage

- **`.gitignore`:** This repository includes a `.gitignore` file which should prevent you from accidentally committing your sensitive `credentials.json` and `token.json` files. **Do not remove these lines from `.gitignore`**.
- **Token Storage:** This server stores the Google authorization token (`token.json`) directly in the project folder for simplicity during setup. In production or more security-sensitive environments, consider storing this token more securely, such as using system keychains, encrypted files, or dedicated secret management services.
