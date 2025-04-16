# gotoHuman MCP Server

[![smithery badge](https://smithery.ai/badge/@gotohuman/gotohuman-mcp-server)](https://smithery.ai/server/@gotohuman/gotohuman-mcp)

Let your **AI agents ask for human reviews** in gotoHuman via MCP.  
Review AI-generated content, approve critical actions or provide input.  
An async webhook-based workflow for autonomous agents and AI automations.

## Demo

This is Cursor on the left, but this could be a background agent that also reacts to the approval webhook to add an item to your list of newsletter ideas.

https://github.com/user-attachments/assets/380a4223-ea77-4e24-90a5-52669b77f56f

## Setup

### Installing via Smithery

To install this MCP server for Cursor or Claude Desktop automatically via [Smithery](https://smithery.ai/server/@gotohuman/gotohuman-mcp):

```bash
npx -y @smithery/cli install @gotohuman/gotohuman-mcp --client claude
```

Get your API key and set up your review forms at [app.gotohuman.com](https://app.gotohuman.com)

```bash
# Install dependencies
npm install

# Build the server
npm run build

# For testing: Run the MCP inspector
npm run inspector
```

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

  ## Use in MCP client

  ### Cursor or Claude

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
