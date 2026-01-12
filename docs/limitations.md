# Known Limitations

[← Back to README](../README.md)

While this MCP server provides comprehensive Google Docs, Sheets, and Drive functionality, there are some limitations imposed by the Google APIs themselves:

---

## Comment Anchoring

**Programmatically Created Comments Are Not Anchored**: Comments created via the `addComment` tool appear in the "All Comments" list but are not visibly anchored to specific text in the Google Docs UI. They will show "original content deleted" instead of highlighting the intended text range. This is a limitation of the Google Drive API v3 when working with Google Docs files.

- **Workaround**: Comments created manually in the Google Docs UI are properly anchored
- **Other Operations**: Reply, delete, and list operations work correctly on all comments regardless of how they were created

---

## Comment Resolution

**Resolved Status May Not Persist**: The `resolveComment` tool attempts to mark comments as resolved, but the Drive API v3 does not fully support this operation for Google Docs files. The resolved status may not persist or be visible in the Google Docs UI.

- **Workaround**: Resolve comments manually in the Google Docs web interface

---

## Converted Documents

**Limited Support for Converted Documents**: Some Google Docs that were converted from other formats (especially Microsoft Word documents) may not support all Docs API operations. You may encounter errors like "This operation is not supported for this document" when trying to read or modify these files.

---

## Google Forms API Limitations

**Read-Only Access**: The Google Forms API only supports **reading** form structure and responses. You cannot create, update, or delete forms or questions programmatically. This is a fundamental limitation of the [Google Forms API](https://developers.google.com/workspace/forms/api/reference/rest).

- Forms can only be created and edited via the Google Forms web interface
- The API can read form structure (questions, settings) and responses
- See: [Google Forms API Documentation](https://developers.google.com/workspace/forms/api)

---

## Google Slides API Limitations

**No Batch Updates**: Unlike the Google Docs API, the Slides API does not support batch updates in the same way. Each modification requires individual API calls. See: [Google Slides API Documentation](https://developers.google.com/workspace/slides/api)

---

## Google Apps Script API Limitations

**No Project Listing**: The Apps Script API does not support listing all script projects. You must know the script ID to interact with a project. Script IDs can be found in the script editor URL: `script.google.com/d/{SCRIPT_ID}/edit`

**Script Execution Requirements**: Running Apps Script functions via the API requires specific setup:

1. The script must be deployed as an **API Executable**
2. The calling application and script must share a **common Google Cloud project**
3. The OAuth token must include **all scopes** used by the script
4. Only scripts with at least one required scope can be executed

See: [Execute Functions with the Apps Script API](https://developers.google.com/apps-script/api/how-tos/execute)

---

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
