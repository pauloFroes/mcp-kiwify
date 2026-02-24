import { z } from "zod";
import { apiRequest, toolResult, toolError } from "../client.js";
export function registerAffiliateTools(server) {
    server.registerTool("list_affiliates", {
        title: "List Affiliates",
        description: "List all affiliates. Filter by status, product, or search by name/email. Returns affiliate name, email, product, commission (in cents), and status.",
        inputSchema: {
            status: z.string().optional().describe("Filter by affiliate status (e.g. active, blocked, refused)"),
            product_id: z.string().uuid().optional().describe("Filter by product UUID"),
            search: z.string().optional().describe("Search by affiliate name or email"),
            page_size: z.string().optional().default("100").describe("Number of items per page (max 100)"),
            page_number: z.string().optional().describe("Page number (1-indexed)"),
        },
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: true,
        },
    }, async (args) => {
        try {
            const data = await apiRequest("/affiliates", "GET", undefined, {
                status: args.status,
                product_id: args.product_id,
                search: args.search,
                page_size: args.page_size,
                page_number: args.page_number,
            });
            return toolResult(data);
        }
        catch (error) {
            return toolError(`Failed to list affiliates: ${error.message}`);
        }
    });
    server.registerTool("get_affiliate", {
        title: "Get Affiliate Details",
        description: "Get details of a specific affiliate by ID.",
        inputSchema: {
            affiliate_id: z.string().uuid().describe("Affiliate UUID"),
        },
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: true,
        },
    }, async ({ affiliate_id }) => {
        try {
            const data = await apiRequest(`/affiliates/${affiliate_id}`);
            return toolResult(data);
        }
        catch (error) {
            return toolError(`Failed to get affiliate: ${error.message}`);
        }
    });
    server.registerTool("edit_affiliate", {
        title: "Edit Affiliate",
        description: "Update an affiliate's commission or status. Commission is in cents (e.g. 4600 = R$46.00). Status can be: active, blocked, or refused.",
        inputSchema: {
            affiliate_id: z.string().uuid().describe("Affiliate UUID to edit"),
            commission: z.number().optional().describe("New commission amount in cents (e.g. 4600 = R$46.00)"),
            status: z
                .enum(["active", "blocked", "refused"])
                .optional()
                .describe("New affiliate status"),
        },
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            openWorldHint: true,
        },
    }, async ({ affiliate_id, commission, status }) => {
        try {
            const body = {};
            if (commission !== undefined)
                body.commission = commission;
            if (status !== undefined)
                body.status = status;
            const data = await apiRequest(`/affiliates/${affiliate_id}`, "PUT", body);
            return toolResult(data);
        }
        catch (error) {
            return toolError(`Failed to edit affiliate: ${error.message}`);
        }
    });
}
