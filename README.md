# gotoHuman MCP Server

gotoHuman makes it easy to add **human approvals** to AI agents and agentic workflows.  
A fully-managed async human-in-the-loop workflow with a customizable approval UI.  
Enjoy built-in auth, webhooks, notifications, team features, and an evolving training dataset.

Use our MCP server to request human approvals from your AI workflows via MCP or add it to your IDE to help with integration.

## Installation

```bash
npx @gotohuman/mcp-server
```

### Use with Cursor / Claude / Windsurf

```json
{
  "mcpServers": {
    "gotoHuman": {
      "command": "npx",
      "args": ["-y", "@gotohuman/mcp-server"],
      "env": {
        "GOTOHUMAN_API_KEY": "your-api-key"
      }
    }
  }
}
```

[![Install MCP Server](https://cursor.com/deeplink/mcp-install-dark.svg)](cursor://anysphere.cursor-deeplink/mcp/install?name=gotoHuman&config=eyJjb21tYW5kIjoibnB4IC15IEBnb3RvaHVtYW4vbWNwLXNlcnZlciIsImVudiI6eyJHT1RPSFVNQU5fQVBJX0tFWSI6InlvdXItYXBpLWtleSJ9fQ==)

Get your API key and set up an approval step at [app.gotohuman.com](https://app.gotohuman.com)

## Demo

This is Cursor on the left, but this could be a background agent that also reacts to the approval webhook.

https://github.com/user-attachments/assets/380a4223-ea77-4e24-90a5-52669b77f56f

## Tools

### `list-forms`
List all available review templates.
  - __Returns__ a list of all available review templates in your account incl. high-level info about the added fields
### `get-form-schema`  
Get the schema to use when requesting a human review for a given review template.
  - __Params__
    - `formId`: The review template ID to fetch the schema for
  - __Returns__ the schema, considering the incl. fields and their configuration
### `request-human-review-with-form`  
Request a human review. Will appear in your gotoHuman inbox.
  - __Params__
    - `formId`: The ID of the review template to use
    - `fieldData`: Content (AI-output to review, context,...) and configuration for the review template's fields.  
    The schema for this needs to be fetched with `get-form-schema`
    - `config`: Configuration for the review template. Optional. The schema for this needs to be fetched with `get-form-schema`
    - `title`: Optional title shown in the inbox and notifications
    - `webhookUrl`: Optional webhook URL for this request (when the review template has no default webhook)
    - `workflow`: Optional object linking this review to a multi-step agentic workflow:
      - `runId`: Unique ID for the current workflow run. Use the same `runId` on every review in the same run. If `workflow` is sent without `runId` (even `{}`), or for manual triggers, gotoHuman creates a `runId` and returns it as `workflowRunId` for subsequent requests.
      - `runName`: Optional display name for the run (can be set or updated on any step)
      - `prevSteps`: Array of `reviewId`s from previous gotoHuman review steps (omit on the first step)
    - `metadata`: Optional additional data that will be incl. in the webhook response after review template submission
    - `assignToUsers`: Optional list of user emails to assign the review to
  - __Returns__ `reviewId`, `reviewLink`, and optionally `workflowRunId` when gotoHuman assigned a new workflow run


## Development

```bash
# Install dependencies
npm install

# Build the server
npm run build

# For testing: Run the MCP inspector
npm run inspector
```

  #### Run locally in MCP Client (e.g. Cursor / Claude / Windsurf)

  ```json
  {
  "mcpServers": {
    "gotoHuman": {
      "command": "node",
      "args": ["/<absolute-path>/build/index.js"],
      "env": {
        "GOTOHUMAN_API_KEY": "your-api-key"
      }
    }
  }
}
```
> [!NOTE]
> For Windows, the `args` path needs to be `C:\\<absolute-path>\\build\\index.js`
