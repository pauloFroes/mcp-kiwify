import { z } from "zod";
import { apiRequest, toolResult, toolError } from "../client.js";
export function registerFinanceTools(server) {
    server.registerTool("get_balance", {
        title: "Get Account Balance",
        description: "Get the current account balance. Returns available and pending amounts in cents (e.g. 236961 = R$2,369.61).",
        inputSchema: {},
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: true,
        },
    }, async () => {
        try {
            const data = await apiRequest("/balance");
            return toolResult(data);
        }
        catch (error) {
            return toolError(`Failed to get balance: ${error.message}`);
        }
    });
    server.registerTool("list_payouts", {
        title: "List Payouts",
        description: "List all payout (withdrawal) requests. Returns amount (in cents), status, and timestamps.",
        inputSchema: {
            legal_entity_id: z.string().uuid().optional().describe("Filter by legal entity UUID"),
            page_size: z.string().optional().describe("Number of items per page"),
            page_number: z.string().optional().describe("Page number (1-indexed)"),
        },
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: true,
        },
    }, async ({ legal_entity_id, page_size, page_number }) => {
        try {
            const data = await apiRequest("/payouts", "GET", undefined, {
                legal_entity_id,
                page_size,
                page_number,
            });
            return toolResult(data);
        }
        catch (error) {
            return toolError(`Failed to list payouts: ${error.message}`);
        }
    });
    server.registerTool("create_payout", {
        title: "Create Payout",
        description: "Request a withdrawal (payout). Amount is in cents (e.g. 5000 = R$50.00). This initiates a real financial transfer.",
        inputSchema: {
            amount: z.number().positive().describe("Withdrawal amount in cents (e.g. 5000 = R$50.00)"),
        },
        annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            openWorldHint: true,
        },
    }, async ({ amount }) => {
        try {
            const data = await apiRequest("/payouts/", "POST", { amount });
            return toolResult(data);
        }
        catch (error) {
            return toolError(`Failed to create payout: ${error.message}`);
        }
    });
}
