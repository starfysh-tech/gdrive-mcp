# Google Workspace MCP Server

## Architecture
- **Framework:** FastMCP with stdio transport
- **APIs:** Google Docs v1, Drive v3, Sheets v4
- **Auth:** OAuth2 via `src/auth.ts`, credentials stored in `credentials.json` / `token.json`

## Code Structure
```
src/
├── server.ts                  # MCP server entry, tool definitions
├── auth.ts                    # OAuth2 authorization flow
├── types.ts                   # Zod schemas and TypeScript types
├── googleDocsApiHelpers.ts    # Docs API operations
└── googleSheetsApiHelpers.ts  # Sheets API operations
```

## Code Style
- **TypeScript:** camelCase for functions/variables
- **Imports:** Use `.js` extensions (ESM module resolution)
- **Zod:** Use existing schema fragments from `types.ts` (e.g., `DocumentIdParameter`, `RangeParameters`)
- **Async:** All API operations are async, use try/catch with proper error translation

## Adding a New Tool

```typescript
server.addTool({
  name: 'toolNameInCamelCase',
  description: 'Clear description of what this tool does',
  parameters: DocumentIdParameter.extend({
    customParam: z.string().describe('Parameter description'),
  }),
  execute: async (args, { log }) => {
    const docs = await getDocsClient();
    log.info(`Operation: ${args.documentId}`);

    try {
      // API call here
      return 'Success message';
    } catch (error: any) {
      log.error(`Error: ${error.message}`);
      if (error instanceof UserError) throw error;
      if (error.code === 404) throw new UserError('Document not found');
      if (error.code === 403) throw new UserError('Permission denied');
      throw new UserError(`Operation failed: ${error.message}`);
    }
  }
});
```

## Error Handling Pattern
- Use `UserError` from `fastmcp` for client-facing errors (bad input, not found, permission denied)
- Use `NotImplementedError` for stub features
- Always translate Google API error codes (404, 403, 400) to `UserError`
- Log errors with `log.error()` before throwing

## Batch Updates
- Use `GDocsHelpers.executeBatchUpdate()` for document modifications
- Google API limits batch size to ~50 requests
- Build requests with helper functions: `buildUpdateTextStyleRequest()`, `buildUpdateParagraphStyleRequest()`

## Common Gotchas
- Document indices are 1-based, not 0-based
- `endIndex` is exclusive in ranges
- Text search via `findTextRange()` is simplified - doesn't handle text spanning multiple TextRuns
- Comments require Drive API scope, not Docs API

## Dev Commands
```bash
npm run build    # Compile TypeScript to dist/
npm run test     # Run tests
```
