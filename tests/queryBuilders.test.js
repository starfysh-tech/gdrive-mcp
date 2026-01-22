// tests/queryBuilders.test.js
import assert from 'node:assert';
import { describe, it } from 'node:test';
import {
  buildDriveQuery,
  buildSearchClause,
  formatPaginationMessage,
  MIME_TYPES
} from '../dist/queryBuilders.js';

describe('Query Builders', () => {

  describe('buildDriveQuery', () => {

    it('should build query with mimeType only', () => {
      const query = buildDriveQuery({ mimeType: MIME_TYPES.DOCUMENT });
      assert.strictEqual(query, "mimeType='application/vnd.google-apps.document'");
    });

    it('should build query with mimeType and trashed', () => {
      const query = buildDriveQuery({
        mimeType: MIME_TYPES.DOCUMENT,
        trashed: false
      });
      assert.strictEqual(
        query,
        "mimeType='application/vnd.google-apps.document' and trashed=false"
      );
    });

    it('should build query with name filter', () => {
      const query = buildDriveQuery({
        mimeType: MIME_TYPES.DOCUMENT,
        trashed: false,
        nameContains: 'proposal'
      });
      assert.ok(query.includes("name contains 'proposal'"));
    });

    it('should build query with fullText filter', () => {
      const query = buildDriveQuery({
        mimeType: MIME_TYPES.DOCUMENT,
        fullTextContains: 'budget'
      });
      assert.ok(query.includes("fullText contains 'budget'"));
    });

    it('should build query with modifiedAfter filter', () => {
      const query = buildDriveQuery({
        mimeType: MIME_TYPES.DOCUMENT,
        modifiedAfter: '2024-01-01T00:00:00Z'
      });
      assert.ok(query.includes("modifiedTime > '2024-01-01T00:00:00Z'"));
    });

    it('should build query with parentFolderId', () => {
      const query = buildDriveQuery({
        parentFolderId: 'folder123'
      });
      assert.strictEqual(query, "'folder123' in parents");
    });

    it('should combine all filters with AND', () => {
      const query = buildDriveQuery({
        mimeType: MIME_TYPES.DOCUMENT,
        trashed: false,
        nameContains: 'report',
        modifiedAfter: '2024-01-01'
      });

      assert.ok(query.includes(' and '));
      assert.ok(query.includes("mimeType='application/vnd.google-apps.document'"));
      assert.ok(query.includes('trashed=false'));
      assert.ok(query.includes("name contains 'report'"));
      assert.ok(query.includes("modifiedTime > '2024-01-01'"));
    });

    it('should return empty string when no options provided', () => {
      const query = buildDriveQuery({});
      assert.strictEqual(query, '');
    });

    it('should escape single quotes in user input to prevent injection', () => {
      const query = buildDriveQuery({
        mimeType: MIME_TYPES.DOCUMENT,
        nameContains: "test' or '1'='1"
      });
      // Single quotes should be escaped
      assert.ok(query.includes("name contains 'test\\' or \\'1\\'=\\'1'"));
      assert.ok(!query.includes("or '1'='1'")); // Injection pattern should not be present
    });
  });

  describe('buildSearchClause', () => {

    it('should build name-only search clause', () => {
      const clause = buildSearchClause('proposal', 'name');
      assert.strictEqual(clause, "name contains 'proposal'");
    });

    it('should build content-only search clause', () => {
      const clause = buildSearchClause('budget', 'content');
      assert.strictEqual(clause, "fullText contains 'budget'");
    });

    it('should build combined name OR content search clause', () => {
      const clause = buildSearchClause('report', 'both');
      assert.strictEqual(
        clause,
        "(name contains 'report' or fullText contains 'report')"
      );
    });

    it('should escape single quotes in search query', () => {
      const clause = buildSearchClause("O'Brien", 'name');
      assert.strictEqual(clause, "name contains 'O\\'Brien'");
    });
  });

  describe('formatPaginationMessage', () => {

    it('should return empty string when no more results', () => {
      const message = formatPaginationMessage(false, 10);
      assert.strictEqual(message, '');
    });

    it('should return pagination message when more results available', () => {
      const message = formatPaginationMessage(true, 20);
      assert.strictEqual(message, '\n_More results available. Showing first 20._');
    });

    it('should include hint when provided', () => {
      const message = formatPaginationMessage(true, 20, 'Use query parameter to narrow.');
      assert.strictEqual(
        message,
        '\n_More results available. Showing first 20. Use query parameter to narrow._'
      );
    });
  });

  describe('MIME_TYPES', () => {

    it('should have correct document MIME type', () => {
      assert.strictEqual(MIME_TYPES.DOCUMENT, 'application/vnd.google-apps.document');
    });

    it('should have correct spreadsheet MIME type', () => {
      assert.strictEqual(MIME_TYPES.SPREADSHEET, 'application/vnd.google-apps.spreadsheet');
    });

    it('should have correct folder MIME type', () => {
      assert.strictEqual(MIME_TYPES.FOLDER, 'application/vnd.google-apps.folder');
    });
  });
});
