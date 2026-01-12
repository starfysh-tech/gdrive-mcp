# Usage Guide

[← Back to README](../README.md)

Once configured, you should be able to use the tools in your chats with Claude. See [Setup Guide](./setup.md) for configuration instructions.

---

## Working with Tabs

Google Docs now supports multi-tab documents. This MCP server provides full support for working with tabs:

**Listing Tabs:**

- "List all tabs in this document using the `listDocumentTabs` tool."
- "Show me the tab structure with content summary for this document."

**Reading from Specific Tabs:**

- "Read the content from tab `TAB_ID` in this document using the `readGoogleDoc` tool."
- "Get the markdown content from tab `TAB_ID` in this document."

**Writing to Specific Tabs:**

- "Append 'New content' to tab `TAB_ID` in this document."
- "Insert text at index 100 in tab `TAB_ID` of this document."
- "Delete content from range 50-100 in tab `TAB_ID` of this document."

**Note:** The following tools support the optional `tabId` parameter:

- `readGoogleDoc` - Read from a specific tab
- `appendToGoogleDoc` - Append to a specific tab
- `insertText` - Insert text into a specific tab
- `deleteRange` - Delete content from a specific tab

When `tabId` is not specified, operations target the first tab (or the legacy document body for older documents without tabs).

---

## Advanced Usage Examples

### Google Docs

- **Text Styling**: "Use `applyTextStyle` to make the text 'Important Section' bold and red (#FF0000) in this document."
- **Paragraph Styling**: "Use `applyParagraphStyle` to center-align the paragraph containing 'Title Here' in this document."
- **Table Creation**: "Insert a 3x4 table at index 500 in this document using the `insertTable` tool."
- **Image Insertion**: "Use `insertImageFromUrl` to insert an image from 'https://example.com/image.png' at index 100 in this document."
- **Local Image Upload**: "Use `insertLocalImage` to upload '/path/to/image.jpg' and insert it at index 200 in this document."
- **Legacy Formatting**: "Use `formatMatchingText` to find the second instance of 'Project Alpha' and make it blue (#0000FF) in this doc."

### Google Sheets

- **Read Data**: "Read range A1:B10 from this spreadsheet using `readSpreadsheet`."
- **Write Data**: "Write data [[1, 2], [3, 4]] to range A1:B2 in this spreadsheet."
- **Append Rows**: "Append rows [[5, 6], [7, 8]] to this spreadsheet starting at A1."
- **Create Spreadsheet**: "Create a new spreadsheet titled 'Sales Data' with initial data [[Name, Amount], [Product A, 100]]."
- **Get Info**: "Get information about this spreadsheet including all sheets."
- **Add Sheet**: "Add a new sheet named 'Summary' to this spreadsheet."
- **Clear Range**: "Clear the range A1:B10 in this spreadsheet."
- **List Spreadsheets**: "List all my Google Spreadsheets modified in the last 30 days."

Claude will automatically launch your server in the background when needed using the command you provided. You do **not** need to run `node ./dist/server.js` manually.

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
"Insert an image from https://example.com/logo.png at index 100 in this document"
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
"Upload and insert the image at /Users/myname/Pictures/chart.png at index 200 in this document with width 400 and height 300"
```

**Note:** The uploaded image will be made publicly readable so it can be displayed in the document. The image file will remain in your Google Drive and can be managed separately.

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

---

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
"Write [[Date, Sales, Expenses]] to range A1:C1 in this spreadsheet"

# 3. Append data rows
"Append rows [[2024-01-01, 1000, 500], [2024-01-02, 1200, 600]] to this spreadsheet starting at A2"

# 4. Read the data back
"Read range A1:C3 from this spreadsheet"

# 5. Add a new sheet for analysis
"Add a new sheet named 'Analysis' to this spreadsheet"
```
