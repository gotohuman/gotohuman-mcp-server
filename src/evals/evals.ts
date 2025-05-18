//evals.ts

import { EvalConfig } from 'mcp-evals';
import { openai } from "@ai-sdk/openai";
import { grade, EvalFunction } from "mcp-evals";

const listFormsEval: EvalFunction = {
    name: 'List Forms Tool Evaluation',
    description: 'Evaluates the list-forms tool functionality',
    run: async () => {
        const result = await grade(openai("gpt-4"), "Which review forms are available?");
        return JSON.parse(result);
    }
};

const getFormSchemaEval: EvalFunction = {
    name: 'get-form-schema Tool Evaluation',
    description: 'Evaluates the functionality of retrieving a form schema by form ID',
    run: async () => {
        const result = await grade(openai("gpt-4"), "Please retrieve the form schema for the form with ID 12345.");
        return JSON.parse(result);
    }
};

const RequestHumanReviewWithFormEval: EvalFunction = {
    name: 'request-human-review-with-form Tool Evaluation',
    description: 'Evaluates requesting a human review with a form functionality',
    run: async () => {
        const result = await grade(openai("gpt-4"), "Please request a human review using form ID myForm123 with fieldData {\"name\":\"Jane Doe\",\"reason\":\"Manual check needed\"} and metadata {\"priority\":\"urgent\"}, then assign it to user1 and user2.");
        return JSON.parse(result);
    }
};

const config: EvalConfig = {
    model: openai("gpt-4"),
    evals: [listFormsEval, getFormSchemaEval, RequestHumanReviewWithFormEval]
};
  
export default config;
  
export const evals = [listFormsEval, getFormSchemaEval, RequestHumanReviewWithFormEval];