import { z } from "zod";
import { apiRequest, toolResult, toolError } from "../client.js";
export function registerEventTools(server) {
    server.registerTool("list_event_participants", {
        title: "List Event Participants",
        description: "List participants of an event product. Returns ticket summary (max, available, issued, sold, checkins) and participant details. Filter by check-in status, date ranges, batch, phone, CPF, or order.",
        inputSchema: {
            product_id: z.string().uuid().describe("Event/product UUID"),
            checked_in: z.boolean().optional().describe("Filter by check-in status"),
            page_size: z.string().optional().describe("Number of items per page"),
            page_number: z.string().optional().describe("Page number (1-indexed)"),
            created_at_start_date: z.string().optional().describe("Filter by creation start date (ISO 8601)"),
            created_at_end_date: z.string().optional().describe("Filter by creation end date (ISO 8601)"),
            batch_id: z.string().uuid().optional().describe("Filter by ticket batch UUID"),
            phone: z.string().optional().describe("Filter by phone number"),
            cpf: z.string().optional().describe("Filter by CPF number"),
            order_id: z.string().uuid().optional().describe("Filter by order UUID"),
        },
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: true,
        },
    }, async (args) => {
        try {
            const data = await apiRequest(`/events/${args.product_id}/participants`, "GET", undefined, {
                checked_in: args.checked_in?.toString(),
                page_size: args.page_size,
                page_number: args.page_number,
                created_at_start_date: args.created_at_start_date,
                created_at_end_date: args.created_at_end_date,
                batch_id: args.batch_id,
                phone: args.phone,
                cpf: args.cpf,
                order_id: args.order_id,
            });
            return toolResult(data);
        }
        catch (error) {
            return toolError(`Failed to list event participants: ${error.message}`);
        }
    });
}
