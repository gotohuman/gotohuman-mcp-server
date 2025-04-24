#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { GotoHuman } from "gotohuman";

const version = "0.1.2"
// Create an MCP server
const server = new McpServer({
  name: "gotohuman-mcp-server",
  version: version
},
{
  capabilities: {
    tools: {},
  },
});

// Tool for listing available forms
server.tool(
  "list-forms",
  "List all available review forms. NOTE: You need to fetch the schema for the form fields first using the get-form-schema tool.",
  {},
  async () => {
    try {
      const gotoHuman = new GotoHuman({origin: "mcp-server", originV: version});
      const forms = await gotoHuman.fetchReviewForms();

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: true,
            forms: forms
          })
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error occurred"
          })
        }],
        isError: true
      };
    }
  }
);

// Tool for fetching form field schema
server.tool(
  "get-form-schema",
  "Get the schema to use for the 'fields' property when requesting a human review with a form.",
  {
    formId: z.string().describe("The form ID to fetch the schema for")
  },
  async ({ formId }) => {
    try {
      const gotoHuman = new GotoHuman();
      const formFieldsSchema = await gotoHuman.fetchSchemaForFormFields(formId);

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: true,
            formId: formId,
            fieldsSchema: formFieldsSchema,
          })
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error occurred"
          })
        }],
        isError: true
      };
    }
  }
);

// Define the tool schema - accepting any valid JSON value for field data
const requestHumanReviewSchema = {
  formId: z.string().describe("The form ID to request a human review for"),
  fieldData: z.record(z.string(), z.any()).describe("The field data to include in the review request. Note that this is a dynamic schema that you need to fetch first using the get-form-schema tool."),
  metadata: z.record(z.string(), z.string()).optional().describe("Optional additional data that will be incl. in the webhook response after form submission. Incl. everything required to proceed with your workflow."),
  assignToUsers: z.array(z.string()).optional().describe("Optional list of user emails to assign the review to")
};

// Add the human review request tool
server.tool(
  "request-human-review-with-form",
  "Request a human review with a form. NOTE: If you don't have a form ID yet, list all available forms using the list-forms tool first. To know what to pass for fieldData, you need to fetch the schema for the form fields using the get-form-schema tool.",
  requestHumanReviewSchema,
  async ({ formId, fieldData, metadata, assignToUsers }) => {
    try {
      const gotoHuman = new GotoHuman();
      const reviewRequest = gotoHuman.createReview(formId);

      // Add all field data dynamically
      Object.entries(fieldData).forEach(([key, value]) => {
        reviewRequest.addFieldData(key, value);
      });

      // Add optional metadata if provided
      if (metadata) {
        Object.entries(metadata).forEach(([key, value]) => {
          reviewRequest.addMetaData(key, value);
        });
      }

      // Assign to specific users if provided
      if (assignToUsers) {
        reviewRequest.assignToUsers(assignToUsers);
      }

      const response = await reviewRequest.sendRequest();

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: true,
            reviewId: response.reviewId,
            reviewLink: response.gthLink
          })
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error occurred"
          })
        }],
        isError: true
      };
    }
  }
);

// Start the server with stdio transport
const transport = new StdioServerTransport();
await server.connect(transport); 