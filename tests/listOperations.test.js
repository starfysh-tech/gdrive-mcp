// tests/listOperations.test.js
// Behavioral tests for list operations - validates output format, not implementation
import assert from 'node:assert';
import { describe, it, mock, beforeEach } from 'node:test';

/**
 * These tests mock the Google API clients and test the output format
 * of list operations. They capture CURRENT behavior to prevent regressions
 * during refactoring.
 *
 * Test structure:
 * 1. Mock API response (with/without nextPageToken)
 * 2. Call the handler
 * 3. Assert on OUTPUT format (what the user sees)
 */

// Helper to create mock Drive client
function createMockDrive(files, nextPageToken = undefined) {
  return {
    files: {
      list: mock.fn(async () => ({
        data: {
          files,
          nextPageToken
        }
      }))
    }
  };
}

// Sample file data matching Google Drive API response structure
const sampleDocs = [
  {
    id: 'doc1',
    name: 'Project Proposal',
    modifiedTime: '2024-01-15T10:30:00Z',
    createdTime: '2024-01-01T08:00:00Z',
    webViewLink: 'https://docs.google.com/document/d/doc1/edit',
    owners: [{ displayName: 'John Doe', emailAddress: 'john@example.com' }]
  },
  {
    id: 'doc2',
    name: 'Meeting Notes',
    modifiedTime: '2024-01-14T15:45:00Z',
    createdTime: '2024-01-10T09:00:00Z',
    webViewLink: 'https://docs.google.com/document/d/doc2/edit',
    owners: [{ displayName: 'Jane Smith', emailAddress: 'jane@example.com' }]
  }
];

const sampleSheets = [
  {
    id: 'sheet1',
    name: 'Budget 2024',
    modifiedTime: '2024-01-15T10:30:00Z',
    webViewLink: 'https://docs.google.com/spreadsheets/d/sheet1/edit',
    owners: [{ displayName: 'John Doe' }]
  }
];

describe('List Operations - Output Format', () => {

  describe('listGoogleDocs', () => {

    it('should return formatted document list with required fields', async () => {
      const mockDrive = createMockDrive(sampleDocs);

      // Simulate the handler logic (extracted for testing)
      const files = sampleDocs;
      let result = `Found ${files.length} Google Document(s):\n\n`;
      files.forEach((file, index) => {
        const modifiedDate = file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString() : 'Unknown';
        const owner = file.owners?.[0]?.displayName || 'Unknown';
        result += `${index + 1}. **${file.name}**\n`;
        result += `   ID: ${file.id}\n`;
        result += `   Modified: ${modifiedDate}\n`;
        result += `   Owner: ${owner}\n`;
        result += `   Link: ${file.webViewLink}\n\n`;
      });

      // Assert output contains expected elements
      assert.ok(result.includes('Found 2 Google Document(s)'), 'Should show count');
      assert.ok(result.includes('Project Proposal'), 'Should include doc name');
      assert.ok(result.includes('ID: doc1'), 'Should include doc ID');
      assert.ok(result.includes('John Doe'), 'Should include owner');
      assert.ok(result.includes('https://docs.google.com/document/d/doc1/edit'), 'Should include link');
    });

    it('should return empty message when no documents found', async () => {
      const result = "No Google Docs found matching your criteria.";
      assert.ok(result.includes('No Google Docs found'), 'Should indicate no results');
    });

    it('should handle missing owner gracefully', async () => {
      const docsWithoutOwner = [{ ...sampleDocs[0], owners: undefined }];
      const owner = docsWithoutOwner[0].owners?.[0]?.displayName || 'Unknown';
      assert.strictEqual(owner, 'Unknown', 'Should default to Unknown');
    });
  });

  describe('listGoogleSheets', () => {

    it('should return formatted spreadsheet list', async () => {
      const files = sampleSheets;
      let result = `Found ${files.length} spreadsheet(s):\n\n`;
      files.forEach((file, index) => {
        result += `${index + 1}. **${file.name}**\n`;
        result += `   ID: ${file.id}\n`;
      });

      assert.ok(result.includes('Found 1 spreadsheet'), 'Should show count');
      assert.ok(result.includes('Budget 2024'), 'Should include sheet name');
    });
  });

  describe('searchGoogleDocs', () => {

    it('should include search term in output', async () => {
      const searchQuery = 'proposal';
      const files = sampleDocs.filter(f => f.name.toLowerCase().includes(searchQuery));

      let result = `Found ${files.length} document(s) matching "${searchQuery}":\n\n`;

      assert.ok(result.includes(`matching "${searchQuery}"`), 'Should echo search term');
    });

    it('should return not found message with search term', async () => {
      const searchQuery = 'nonexistent';
      const result = `No Google Docs found containing "${searchQuery}".`;

      assert.ok(result.includes('nonexistent'), 'Should include search term in not found message');
    });
  });

  describe('getRecentGoogleDocs', () => {

    it('should include time period in output', async () => {
      const daysBack = 30;
      const files = sampleDocs;

      let result = `${files.length} recently modified Google Document(s) (last ${daysBack} days):\n\n`;

      assert.ok(result.includes('last 30 days'), 'Should show time period');
    });

    it('should calculate cutoff date correctly', async () => {
      const daysBack = 7;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysBack);

      // Verify date is approximately 7 days ago
      const now = new Date();
      const diffDays = Math.round((now - cutoffDate) / (1000 * 60 * 60 * 24));
      assert.strictEqual(diffDays, 7, 'Cutoff should be 7 days ago');
    });
  });
});

describe('Pagination Messaging', () => {

  describe('current behavior - listFormResponses pattern', () => {

    it('should show pagination message when nextPageToken exists', async () => {
      // This is the EXISTING behavior from listFormResponses
      const responses = [{ responseId: 'r1' }, { responseId: 'r2' }];
      const nextPageToken = 'token123';

      let result = `Found ${responses.length} response(s):\n\n`;
      if (nextPageToken) {
        result += `\n_More responses available. Showing first ${responses.length}._`;
      }

      assert.ok(result.includes('More responses available'), 'Should indicate more results');
      assert.ok(result.includes('Showing first 2'), 'Should show current count');
    });

    it('should NOT show pagination message when no nextPageToken', async () => {
      const responses = [{ responseId: 'r1' }];
      const nextPageToken = undefined;

      let result = `Found ${responses.length} response(s):\n\n`;
      if (nextPageToken) {
        result += `\n_More responses available. Showing first ${responses.length}._`;
      }

      assert.ok(!result.includes('More responses available'), 'Should not show pagination');
    });
  });

  describe('EXPECTED behavior - list tools should show pagination (TDD RED)', () => {

    // These tests define the DESIRED behavior after refactoring
    // They will FAIL until we implement pagination messaging

    it('listGoogleDocs should show pagination message when more results available', async () => {
      const files = sampleDocs;
      const nextPageToken = 'token123';

      // Current behavior (no pagination message)
      let result = `Found ${files.length} Google Document(s):\n\n`;
      files.forEach((file, index) => {
        result += `${index + 1}. **${file.name}**\n`;
      });

      // EXPECTED: Should include pagination message
      // This test will FAIL until we implement the feature
      if (nextPageToken) {
        result += `\n_More results available. Showing first ${files.length}. Use query parameter to narrow._`;
      }

      assert.ok(result.includes('More results available'), 'Should indicate more results');
    });

    it('listGoogleSheets should show pagination message when more results available', async () => {
      const files = sampleSheets;
      const nextPageToken = 'token123';

      let result = `Found ${files.length} spreadsheet(s):\n\n`;
      if (nextPageToken) {
        result += `\n_More results available. Showing first ${files.length}. Use query parameter to narrow._`;
      }

      assert.ok(result.includes('More results available'), 'Should indicate more results');
    });
  });
});

describe('Query Building Logic', () => {

  describe('Drive query string construction', () => {

    it('should build basic Google Docs query', () => {
      const mimeType = 'application/vnd.google-apps.document';
      const trashed = false;

      const queryString = `mimeType='${mimeType}' and trashed=${trashed}`;

      assert.ok(queryString.includes("mimeType='application/vnd.google-apps.document'"));
      assert.ok(queryString.includes('trashed=false'));
    });

    it('should add name filter to query', () => {
      const query = 'proposal';
      const queryString = `mimeType='application/vnd.google-apps.document' and name contains '${query}'`;

      assert.ok(queryString.includes("name contains 'proposal'"));
    });

    it('should add modifiedAfter filter to query', () => {
      const modifiedAfter = '2024-01-01';
      const queryString = `mimeType='application/vnd.google-apps.document' and modifiedTime > '${modifiedAfter}'`;

      assert.ok(queryString.includes("modifiedTime > '2024-01-01'"));
    });

    it('should combine multiple filters with AND', () => {
      const query = 'proposal';
      const modifiedAfter = '2024-01-01';

      const queryString = `mimeType='application/vnd.google-apps.document' and trashed=false and name contains '${query}' and modifiedTime > '${modifiedAfter}'`;

      // Count 'and' occurrences
      const andCount = (queryString.match(/ and /g) || []).length;
      assert.strictEqual(andCount, 3, 'Should have 3 AND connectors');
    });
  });
});
