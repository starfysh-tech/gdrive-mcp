# gdrive-mcp

Connect Claude to your Google Workspace: Docs, Sheets, Drive, Slides, Forms, and Apps Script.

Built with FastMCP using the Model Context Protocol. Works with Claude Desktop and other MCP clients.

---

<p align="center">
  <img src="assets/google-workspace-icons/docs.png" width="40" alt="Google Docs">
  <img src="assets/google-workspace-icons/sheets.png" width="40" alt="Google Sheets">
  <img src="assets/google-workspace-icons/drive.png" width="40" alt="Google Drive">
  <img src="assets/google-workspace-icons/slides.png" width="40" alt="Google Slides">
  <img src="assets/google-workspace-icons/forms.png" width="40" alt="Google Forms">
  <img src="assets/google-workspace-icons/apps-script.png" width="40" alt="Apps Script">
</p>

---

## Features

**Documents** — Read, write, and format content. Insert tables, images, page breaks. Manage comments and replies. Support for multi-tab documents.

**Spreadsheets** — Read and write ranges using A1 notation. Append rows, clear cells, create sheets. Get metadata and manage tabs.

**Drive** — Search and list files. Create, move, copy, rename, and delete files. Manage folders and permissions. Access shared drives.

**Slides** — Read presentation metadata. Create presentations and manage slides.

**Forms** — Read form structure and responses (read-only API limitation).

**Apps Script** — Manage projects, read and update code, list versions and deployments. Execute functions via API.

**Authentication** — Secure OAuth 2.0 with support for service accounts and domain-wide delegation.

---

## Quick Start

### 1. Install

```bash
git clone https://github.com/starfysh-tech/gdrive-mcp.git
cd gdrive-mcp
npm install
npm run build
```

Or use npx (requires setup first):

```bash
npx @starfysh/gdrive-mcp
```

### 2. Setup Google Cloud Credentials

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable APIs: Docs, Sheets, Drive, Slides, Forms, Apps Script
3. Create OAuth 2.0 Desktop credentials
4. Download and save as `credentials.json` in the project directory

[→ Full setup instructions](docs/setup.md)

### 3. Authenticate

```bash
node ./dist/server.js
```

Browser opens automatically for OAuth. Sign in with your Google account. Token saves to `token.json`.

### 4. Configure Claude Desktop

Edit `claude_desktop_config.json`:
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux:** `~/.config/Claude/claude_desktop_config.json`

Add this configuration (replace `/PATH/TO` with your absolute path from `pwd`):

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

Restart Claude Desktop.

---

## Usage

Talk to Claude naturally about your Google Workspace files:

- "List all my Google Docs modified in the last 7 days"
- "Read this document and summarize the key points"
- "Create a new spreadsheet called 'Q1 Sales' with headers Date, Product, Revenue"
- "Append a new row to this spreadsheet with today's data"
- "Insert an image from this URL at the top of the document"
- "List all tabs in this document and show me the content from the Summary tab"

[→ Full usage guide with examples](docs/usage.md)

---

## Documentation

- **[Setup Guide](docs/setup.md)** — Detailed Google Cloud setup, OAuth configuration, and troubleshooting
- **[Usage Guide](docs/usage.md)** — Examples for Docs, Sheets, Drive, Slides, Forms, and Apps Script
- **[Known Limitations](docs/limitations.md)** — API limitations and workarounds
- **[Troubleshooting](docs/troubleshooting.md)** — Common issues and solutions

---

## API Reference

| API | Documentation | OAuth Scopes |
|-----|---------------|--------------|
| Google Docs | [developers.google.com/docs/api](https://developers.google.com/docs/api) | `auth/documents` |
| Google Sheets | [developers.google.com/sheets/api](https://developers.google.com/sheets/api) | `auth/spreadsheets` |
| Google Drive | [developers.google.com/drive/api](https://developers.google.com/drive/api) | `auth/drive` |
| Google Slides | [developers.google.com/slides/api](https://developers.google.com/workspace/slides/api) | `auth/presentations` |
| Google Forms | [developers.google.com/forms/api](https://developers.google.com/workspace/forms/api) | `auth/forms.body.readonly`, `auth/forms.responses.readonly` |
| Apps Script | [developers.google.com/apps-script/api](https://developers.google.com/apps-script/api) | `auth/script.projects` |

For the complete list of OAuth 2.0 scopes, see: [OAuth 2.0 Scopes for Google APIs](https://developers.google.com/identity/protocols/oauth2/scopes)

---

## Security & Token Storage

- **`.gitignore`:** Prevents accidentally committing `credentials.json` and `token.json`. Do not remove these entries.
- **Token Storage:** For production or security-sensitive environments, consider using system keychains, encrypted files, or secret management services instead of storing `token.json` in the project folder.

---

## About

Maintained by [Starfysh](https://starfysh.net) — fractional product + tech leadership for technical founders.

Originally forked from [a-bonus/google-docs-mcp](https://github.com/a-bonus/google-docs-mcp).

---

## Contributing

We welcome contributions! Please see [<img src="assets/github-icon.png" width="16" alt="GitHub"> CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
