#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { GotoHuman } from "gotohuman";

const version = "0.2.0"
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

// Tool for listing available review templates
server.tool(
  "list-forms",
  "List all available review templates. NOTE: You need to fetch the schema for the template fields first using the get-form-schema tool.",
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

// Tool for fetching review template field schema
server.tool(
  "get-form-schema",
  "Get the partial schema defining the 'fields' property and the optional 'config' property needed when requesting a human review with the given review template.",
  {
    formId: z.string().describe("The review template ID to fetch the schema for")
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

const workflowSchema = z.object({
  runId: z.string().optional().describe("Unique identifier for the current workflow run. Use the same runId on every review request in the same run to link them together. If workflow is included but runId is omitted (even {}), gotoHuman creates one and returns it as workflowRunId."),
  runName: z.string().optional().describe("Optional display name for the current workflow run. Can be set or overwritten on any request in the run."),
  prevSteps: z.array(z.string()).optional().describe("Review IDs of previous gotoHuman review step(s) in this workflow. Omit for the first step."),
});

// Define the tool schema - accepting any valid JSON value for field data
const requestHumanReviewSchema = {
  formId: z.string().describe("The ID of the review template to use"),
  fieldData: z.record(z.string(), z.any()).describe("The field data to include in the review request. Note that this is a dynamic schema that you will get as the `fields` property in the response from the `get-form-schema` tool."),
  config: z.record(z.string(), z.any()).optional().describe("The configuration to include in the review request. Note that this is a dynamic schema that you might get as an optional `config` property in the response from the `get-form-schema` tool."),
  title: z.string().optional().describe("Title visible in the inbox and notifications."),
  webhookUrl: z.string().optional().describe("Webhook URL for this request. Use when the review template has no default webhook URL."),
  workflowInfo: workflowSchema.optional().describe("Links this review to a multi-step agentic workflow run."),
  metadata: z.record(z.string(), z.string()).optional().describe("Optional additional data that will be incl. in the webhook response after review submission. Incl. everything required to proceed with your workflow."),
  assignToUsers: z.array(z.string()).optional().describe("Optional list of user emails to assign the review to")
};

// Add the human review request tool
server.tool(
  "request-human-review-with-form",
  "Request a human review with a review template. NOTE: If you don't have a review template ID yet, list all available review templates using the list-forms tool first. To know what to pass for fieldData, you need to fetch the schema for the review template fields using the get-form-schema tool. For multi-step workflows, pass workflow with the same runId on each step and prevSteps listing prior reviewIds; use workflowRunId from the response when gotoHuman assigns a new runId.",
  requestHumanReviewSchema,
  async ({ formId, fieldData, config, title, webhookUrl, workflowInfo, metadata, assignToUsers }) => {
    try {
      const gotoHuman = new GotoHuman();
      const reviewRequest = gotoHuman.createReview(formId);

      reviewRequest.setReviewData(fieldData);

      if (config) {
        reviewRequest.setReviewConfig(config);
      }

      if (title) {
        reviewRequest.setTitle(title);
      }

      if (webhookUrl) {
        reviewRequest.setWebhookUrl(webhookUrl);
      }

      if (workflowInfo) {
        reviewRequest.setWorkflowInfo(workflowInfo);
      }

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
            reviewLink: response.gthLink,
            ...(response.workflowRunId != null && { workflowRunId: response.workflowRunId }),
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