/**
 * Shared query building utilities for Google Drive API
 *
 * Extracts common query construction logic used across list operations
 * to reduce duplication and ensure consistent query formatting.
 */

/**
 * Escapes single quotes in strings for use in Drive API query syntax.
 * Single quotes in user input could break query parsing or enable injection.
 */
function escapeQueryValue(value: string): string {
  return value.replace(/'/g, "\\'");
}

export interface DriveQueryOptions {
  mimeType?: string;
  nameContains?: string;
  fullTextContains?: string;
  modifiedAfter?: string;
  createdAfter?: string;
  trashed?: boolean;
  parentFolderId?: string;
}

/**
 * Builds a Google Drive API query string from options.
 *
 * Returns an empty string when no options are provided, which is intentional
 * for composable query building. The Drive API treats empty queries as valid
 * and returns all files.
 *
 * @example
 * buildDriveQuery({
 *   mimeType: 'application/vnd.google-apps.document',
 *   nameContains: 'proposal',
 *   trashed: false
 * })
 * // => "mimeType='application/vnd.google-apps.document' and name contains 'proposal' and trashed=false"
 */
export function buildDriveQuery(options: DriveQueryOptions): string {
  const clauses: string[] = [];

  if (options.mimeType) {
    clauses.push(`mimeType='${escapeQueryValue(options.mimeType)}'`);
  }

  if (options.trashed !== undefined) {
    clauses.push(`trashed=${options.trashed}`);
  }

  if (options.parentFolderId) {
    // Folder IDs are system-generated, but escape for safety
    clauses.push(`'${escapeQueryValue(options.parentFolderId)}' in parents`);
  }

  if (options.nameContains) {
    clauses.push(`name contains '${escapeQueryValue(options.nameContains)}'`);
  }

  if (options.fullTextContains) {
    clauses.push(`fullText contains '${escapeQueryValue(options.fullTextContains)}'`);
  }

  if (options.modifiedAfter) {
    // ISO dates don't contain quotes, but escape for safety
    clauses.push(`modifiedTime > '${escapeQueryValue(options.modifiedAfter)}'`);
  }

  if (options.createdAfter) {
    clauses.push(`createdTime > '${escapeQueryValue(options.createdAfter)}'`);
  }

  return clauses.join(' and ');
}

/**
 * Builds a combined name OR content search clause.
 * Used when searchIn='both' for document searches.
 */
export function buildSearchClause(
  searchQuery: string,
  searchIn: 'name' | 'content' | 'both'
): string {
  const escaped = escapeQueryValue(searchQuery);
  if (searchIn === 'name') {
    return `name contains '${escaped}'`;
  } else if (searchIn === 'content') {
    return `fullText contains '${escaped}'`;
  } else {
    return `(name contains '${escaped}' or fullText contains '${escaped}')`;
  }
}

/**
 * Google Drive MIME types for workspace documents
 */
export const MIME_TYPES = {
  DOCUMENT: 'application/vnd.google-apps.document',
  SPREADSHEET: 'application/vnd.google-apps.spreadsheet',
  PRESENTATION: 'application/vnd.google-apps.presentation',
  FOLDER: 'application/vnd.google-apps.folder',
  FORM: 'application/vnd.google-apps.form',
} as const;

/**
 * Formats pagination info message for list results.
 * Returns empty string if no more results available.
 *
 * @param hasMore - Whether more results exist (nextPageToken present)
 * @param currentCount - Number of results returned in current page
 * @param hint - Optional hint for narrowing results
 */
export function formatPaginationMessage(
  hasMore: boolean,
  currentCount: number,
  hint?: string
): string {
  if (!hasMore) {
    return '';
  }

  const baseMessage = `\n_More results available. Showing first ${currentCount}.`;

  if (hint) {
    return `${baseMessage} ${hint}_`;
  }

  return `${baseMessage}_`;
}
