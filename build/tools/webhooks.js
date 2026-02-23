import { z } from "zod";
import { apiRequest, toolResult, toolError } from "../client.js";
const webhookTrigger = z.enum([
    "boleto_gerado",
    "pix_gerado",
    "carrinho_abandonado",
    "compra_recusada",
    "compra_aprovada",
    "compra_reembolsada",
    "chargeback",
    "subscription_canceled",
    "subscription_late",
    "subscription_renewed",
]);
export function registerWebhookTools(server) {
    server.registerTool("list_webhooks", {
        title: "List Webhooks",
        description: "List all configured webhooks. Returns webhook name, URL, triggers, target products, and verification token.",
        inputSchema: {
            product_id: z.string().uuid().optional().describe("Filter by product UUID"),
            search: z.string().optional().describe("Search by webhook name"),
            page_size: z.string().optional().describe("Number of items per page"),
            page_number: z.string().optional().describe("Page number (1-indexed)"),
        },
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: true,
        },
    }, async (args) => {
        try {
            const data = await apiRequest("/webhooks", "GET", undefined, {
                product_id: args.product_id,
                search: args.search,
                page_size: args.page_size,
                page_number: args.page_number,
            });
            return toolResult(data);
        }
        catch (error) {
            return toolError(`Failed to list webhooks: ${error.message}`);
        }
    });
    server.registerTool("create_webhook", {
        title: "Create Webhook",
        description: 'Create a new webhook to receive event notifications. Triggers: boleto_gerado, pix_gerado, carrinho_abandonado, compra_recusada, compra_aprovada, compra_reembolsada, chargeback, subscription_canceled, subscription_late, subscription_renewed. Set products to "all" or a specific product UUID.',
        inputSchema: {
            name: z.string().describe("Webhook display name"),
            url: z.string().url().describe("Destination URL for webhook delivery"),
            products: z.string().describe('Target products: "all" or a specific product UUID'),
            triggers: z
                .array(webhookTrigger)
                .min(1)
                .describe("List of event triggers to listen for"),
            token: z.string().optional().describe("Custom verification token (auto-generated if omitted)"),
        },
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            openWorldHint: true,
        },
    }, async ({ name, url, products, triggers, token }) => {
        try {
            const body = { name, url, products, triggers };
            if (token)
                body.token = token;
            const data = await apiRequest("/webhooks", "POST", body);
            return toolResult(data);
        }
        catch (error) {
            return toolError(`Failed to create webhook: ${error.message}`);
        }
    });
    server.registerTool("delete_webhook", {
        title: "Delete Webhook",
        description: "Permanently delete a webhook by ID. This action is irreversible.",
        inputSchema: {
            webhook_id: z.string().uuid().describe("Webhook UUID to delete"),
        },
        annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            openWorldHint: true,
        },
    }, async ({ webhook_id }) => {
        try {
            await apiRequest(`/webhooks/${webhook_id}`, "DELETE");
            return toolResult({ deleted: true });
        }
        catch (error) {
            return toolError(`Failed to delete webhook: ${error.message}`);
        }
    });
}
