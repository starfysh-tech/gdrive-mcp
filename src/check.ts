// src/check.ts
import { authorize, CONFIG_DIR } from './auth.js';
import { google } from 'googleapis';
import { existsSync } from 'fs';
import * as path from 'path';

export async function runHealthCheck(): Promise<void> {
  console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('  gdrive-mcp Health Check');
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let passed = 0;
  let failed = 0;

  // Check 1: credentials.json
  console.error('Configuration Files:');
  const credPaths = [
    path.join(process.cwd(), 'credentials.json'),
    path.join(CONFIG_DIR, 'credentials.json'),
  ];

  let credFound = false;
  for (const credPath of credPaths) {
    if (existsSync(credPath)) {
      console.error(`  ✓ credentials.json found at ${credPath}`);
      credFound = true;
      passed++;
      break;
    }
  }

  if (!credFound) {
    console.error('  ✗ credentials.json not found');
    console.error('    Checked: ./credentials.json and ~/.config/gdrive-mcp/credentials.json');
    failed++;
    console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error(`\nResult: ${passed} passed, ${failed} failed`);
    console.error('\nSetup required. See: https://github.com/starfysh-tech/gdrive-mcp#setup\n');
    process.exit(1);
  }

  // Check 2: token.json
  const tokenPaths = [
    path.join(process.cwd(), 'token.json'),
    path.join(CONFIG_DIR, 'token.json'),
  ];

  let tokenFound = false;
  for (const tokenPath of tokenPaths) {
    if (existsSync(tokenPath)) {
      console.error(`  ✓ token.json found at ${tokenPath}`);
      tokenFound = true;
      passed++;
      break;
    }
  }

  if (!tokenFound) {
    console.error('  ✗ token.json not found - run server once to authorize');
    failed++;
  }

  // Check 3: Authentication
  console.error('\nAuthentication:');
  try {
    const authClient = await authorize();
    console.error('  ✓ Authorization successful');
    passed++;

    // Check 4: Drive API access
    console.error('\nAPI Access:');
    try {
      const drive = google.drive({ version: 'v3', auth: authClient });
      await drive.files.list({ pageSize: 1 });
      console.error('  ✓ Google Drive API - accessible');
      passed++;
    } catch (driveError: any) {
      console.error(`  ✗ Google Drive API - ${driveError.message}`);
      failed++;
    }

    // Note: Skipping Forms/Script - they require document IDs to test
    console.error('  ℹ Forms API - skipped (requires formId to test)');
    console.error('  ℹ Apps Script API - skipped (requires scriptId to test)');

  } catch (authError: any) {
    console.error(`  ✗ Authorization failed: ${authError.message}`);
    failed++;
  }

  // Summary
  console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (failed === 0) {
    console.error(`\n✓ All checks passed! (${passed}/${passed})\n`);
    process.exit(0);
  } else {
    console.error(`\n✗ Some checks failed (${passed} passed, ${failed} failed)\n`);
    process.exit(1);
  }
}
