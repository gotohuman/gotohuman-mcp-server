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
Get your API key and set up an approval step at [app.gotohuman.com](https://app.gotohuman.com)

## Tools

### `list-forms`
List all available review forms.
  - __Returns__ a list of all available forms in your account incl. high-level info about the added fields
### `get-form-schema`  
Get the schema to use when requesting a human review for a given form.
  - __Params__
    - `formId`: The form ID to fetch the schema for
  - __Returns__ the schema, considering the incl. fields and their configuration
### `request-human-review-with-form`  
Request a human review. Will appear in your gotoHuman inbox.
  - __Params__
    - `formId`: The form ID for the review
    - `fieldData`: Content (AI-output to review, context,...) and configuration for the form's fields.  
    The schema for this needs to be fetched with `get-form-schema`
    - `metadata`: Optional additional data that will be incl. in the webhook response after form submission
    - `assignToUsers`: Optional list of user emails to assign the review to
  - __Returns__ a link to the review in gotoHuman


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
