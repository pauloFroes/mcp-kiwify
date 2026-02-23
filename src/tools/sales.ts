import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiRequest, toolResult, toolError } from "../client.js";

const saleStatus = z
  .enum([
    "approved",
    "authorized",
    "chargedback",
    "paid",
    "pending",
    "pending_refund",
    "processing",
    "refunded",
    "refund_requested",
    "refused",
    "waiting_payment",
  ])
  .optional()
  .describe("Filter by sale status");

const paymentMethod = z
  .enum(["boleto", "credit_card", "pix"])
  .optional()
  .describe("Filter by payment method");

export function registerSalesTools(server: McpServer) {
  server.registerTool(
    "list_sales",
    {
      title: "List Sales",
      description:
        "List sales within a date range (max 90 days). Filter by status, payment method, product, or affiliate. Use view_full_sale_details for payment breakdown and tracking info.",
      inputSchema: {
        start_date: z.string().describe("Start date (ISO 8601). Required. Max 90-day span."),
        end_date: z.string().describe("End date (ISO 8601). Required. Max 90-day span."),
        status: saleStatus,
        payment_method: paymentMethod,
        product_id: z.string().uuid().optional().describe("Filter by product UUID"),
        affiliate_id: z.string().uuid().optional().describe("Filter by affiliate UUID"),
        view_full_sale_details: z
          .boolean()
          .optional()
          .describe("Include payment breakdown, tracking UTM, card info, and commissions"),
        page_size: z.string().optional().describe("Number of items per page"),
        page_number: z.string().optional().describe("Page number (1-indexed)"),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const data = await apiRequest("/sales", "GET", undefined, {
          start_date: args.start_date,
          end_date: args.end_date,
          status: args.status,
          payment_method: args.payment_method,
          product_id: args.product_id,
          affiliate_id: args.affiliate_id,
          view_full_sale_details: args.view_full_sale_details?.toString(),
          page_size: args.page_size,
          page_number: args.page_number,
        });
        return toolResult(data);
      } catch (error) {
        return toolError(`Failed to list sales: ${(error as Error).message}`);
      }
    },
  );

  server.registerTool(
    "get_sale",
    {
      title: "Get Sale Details",
      description:
        "Get full details of a specific sale by ID. Returns customer info, payment breakdown, tracking, card details, and affiliate commissions.",
      inputSchema: {
        sale_id: z.string().uuid().describe("Sale UUID"),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async ({ sale_id }) => {
      try {
        const data = await apiRequest(`/sales/${sale_id}`);
        return toolResult(data);
      } catch (error) {
        return toolError(`Failed to get sale: ${(error as Error).message}`);
      }
    },
  );

  server.registerTool(
    "refund_sale",
    {
      title: "Refund Sale",
      description:
        "Refund a sale. For PIX payments, optionally provide a PIX key for the refund. This action is irreversible.",
      inputSchema: {
        sale_id: z.string().uuid().describe("Sale UUID to refund"),
        pix_key: z.string().optional().describe("PIX key for refund (for PIX payments only)"),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        openWorldHint: true,
      },
    },
    async ({ sale_id, pix_key }) => {
      try {
        const body = pix_key ? { pixKey: pix_key } : undefined;
        const data = await apiRequest(`/sales/${sale_id}/refund`, "POST", body);
        return toolResult(data);
      } catch (error) {
        return toolError(`Failed to refund sale: ${(error as Error).message}`);
      }
    },
  );

  server.registerTool(
    "get_sales_stats",
    {
      title: "Get Sales Statistics",
      description:
        "Get aggregated sales statistics: approval rate, total sales count, net amount (in cents), refund rate, chargeback rate, and boleto conversion rate. Optionally filter by product and date range.",
      inputSchema: {
        product_id: z.string().uuid().optional().describe("Filter stats by product UUID"),
        start_date: z.string().optional().describe("Start date (ISO 8601)"),
        end_date: z.string().optional().describe("End date (ISO 8601)"),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async ({ product_id, start_date, end_date }) => {
      try {
        const data = await apiRequest("/stats", "GET", undefined, {
          product_id,
          start_date,
          end_date,
        });
        return toolResult(data);
      } catch (error) {
        return toolError(`Failed to get sales stats: ${(error as Error).message}`);
      }
    },
  );
}
