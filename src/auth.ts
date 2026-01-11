// src/auth.ts
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { JWT } from 'google-auth-library'; // ADDED: Import for Service Account client
import * as fs from 'fs/promises';
import * as path from 'path';
import * as readline from 'readline/promises';
import * as os from 'os';
import { existsSync } from 'fs';

// --- Calculate paths with fallback locations ---
const CONFIG_DIR = path.join(os.homedir(), '.config', 'gdrive-mcp');

function resolvePath(envVar: string, filename: string): string {
  // 1. Environment variable (explicit override)
  if (process.env[envVar]) {
    return process.env[envVar]!;
  }
  // 2. Current working directory
  const cwdPath = path.join(process.cwd(), filename);
  if (existsSync(cwdPath)) {
    return cwdPath;
  }
  // 3. User config directory (~/.config/gdrive-mcp/)
  const configPath = path.join(CONFIG_DIR, filename);
  if (existsSync(configPath)) {
    return configPath;
  }
  // Default to cwd (will error at read time with helpful message)
  return cwdPath;
}

const TOKEN_PATH = resolvePath('GDRIVE_MCP_TOKEN_PATH', 'token.json');
const CREDENTIALS_PATH = resolvePath('GDRIVE_MCP_CREDENTIALS_PATH', 'credentials.json');
// --- End of path calculation ---

const SCOPES = [
  // Core APIs
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/drive', // Full Drive access for listing, searching, and document discovery
  'https://www.googleapis.com/auth/spreadsheets', // Google Sheets API access
  // Slides API
  'https://www.googleapis.com/auth/presentations',
  // Forms API (read-only - API doesn't support writes)
  'https://www.googleapis.com/auth/forms.body.readonly',
  'https://www.googleapis.com/auth/forms.responses.readonly',
  // Apps Script API
  'https://www.googleapis.com/auth/script.projects',
];

// --- NEW FUNCTION: Handles Service Account Authentication ---
// This entire function is new. It is called only when the
// SERVICE_ACCOUNT_PATH environment variable is set.
// Supports domain-wide delegation via GOOGLE_IMPERSONATE_USER env var.
async function authorizeWithServiceAccount(): Promise<JWT> {
  const serviceAccountPath = process.env.SERVICE_ACCOUNT_PATH!; // We know this is set if we are in this function
  const impersonateUser = process.env.GOOGLE_IMPERSONATE_USER; // Optional: email of user to impersonate
  try {
    const keyFileContent = await fs.readFile(serviceAccountPath, 'utf8');
    const serviceAccountKey = JSON.parse(keyFileContent);

    const auth = new JWT({
      email: serviceAccountKey.client_email,
      key: serviceAccountKey.private_key,
      scopes: SCOPES,
      subject: impersonateUser, // Enables domain-wide delegation when set
    });
    await auth.authorize();
    return auth;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      throw new Error(`Service account key file not found at: ${serviceAccountPath}`);
    }
    throw new Error(`Service account auth failed: ${error.message}`);
  }
}
// --- END OF NEW FUNCTION---

async function loadSavedCredentialsIfExist(): Promise<OAuth2Client | null> {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content.toString());
    const { client_secret, client_id, redirect_uris } = await loadClientSecrets();
    const client = new google.auth.OAuth2(client_id, client_secret, redirect_uris?.[0]);
    client.setCredentials(credentials);
    return client;
  } catch (err) {
    return null;
  }
}

async function loadClientSecrets() {
  try {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content.toString());
    const key = keys.installed || keys.web;
    if (!key) throw new Error("Could not find client secrets in credentials.json.");
    return {
        client_id: key.client_id,
        client_secret: key.client_secret,
        redirect_uris: key.redirect_uris || ['http://localhost:3000/'],
        client_type: keys.web ? 'web' : 'installed'
    };
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.error(`
╔════════════════════════════════════════════════════════════════════╗
║                    SETUP REQUIRED                                  ║
╠════════════════════════════════════════════════════════════════════╣
║  credentials.json not found!                                       ║
║                                                                    ║
║  To use this MCP server, you need Google OAuth credentials:       ║
║                                                                    ║
║  1. Go to: https://console.cloud.google.com/apis/credentials      ║
║  2. Create OAuth 2.0 Client ID (Desktop app)                      ║
║  3. Download JSON and save as: credentials.json                   ║
║  4. Place in: ${process.cwd()}
║     OR: ~/.config/gdrive-mcp/credentials.json                     ║
║     OR: Set GDRIVE_MCP_CREDENTIALS_PATH env var                   ║
║                                                                    ║
║  Full guide: https://github.com/starfysh-tech/gdrive-mcp#setup    ║
╚════════════════════════════════════════════════════════════════════╝
`);
      throw new Error('Setup required: credentials.json not found. See instructions above.');
    }
    throw error;
  }
}

async function saveCredentials(client: OAuth2Client): Promise<void> {
  const { client_secret, client_id } = await loadClientSecrets();
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: client_id,
    client_secret: client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

async function authenticate(): Promise<OAuth2Client> {
  const { client_secret, client_id, redirect_uris, client_type } = await loadClientSecrets();
  const redirectUri = client_type === 'web' ? redirect_uris[0] : 'urn:ietf:wg:oauth:2.0:oob';
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirectUri);

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const authorizeUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES.join(' '),
  });

  console.error(`
┌─────────────────────────────────────────────────────────────────┐
│  Google Authorization Required                                  │
├─────────────────────────────────────────────────────────────────┤
│  1. Open this URL in your browser:                              │
│                                                                 │
│  ${authorizeUrl}
│                                                                 │
│  2. Sign in and grant access                                    │
│  3. Copy the authorization code                                 │
│  4. Paste it below                                              │
└─────────────────────────────────────────────────────────────────┘
`);
  const code = await rl.question('Paste code here: ');
  rl.close();

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    if (tokens.refresh_token) {
      await saveCredentials(oAuth2Client);
    }
    console.error('✓ Authenticated successfully!\n');
    return oAuth2Client;
  } catch (err) {
    throw new Error('Authentication failed - check that you copied the full code');
  }
}

// --- MODIFIED: The Main Exported Function ---
// This function now acts as a router. It checks for the environment
// variable and decides which authentication method to use.
export async function authorize(): Promise<OAuth2Client | JWT> {
  // Check if the Service Account environment variable is set.
  if (process.env.SERVICE_ACCOUNT_PATH) {
    return authorizeWithServiceAccount();
  } else {
    // If not, execute the original OAuth 2.0 flow exactly as it was.
    let client = await loadSavedCredentialsIfExist();
    if (client) {
      return client;
    }
    client = await authenticate();
    return client;
  }
}
// --- END OF MODIFIED: The Main Exported Function ---
