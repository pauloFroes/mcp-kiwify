import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { apiRequest, toolResult, toolError } from "../client.js";

export function registerProductTools(server: McpServer) {
  server.registerTool(
    "list_products",
    {
      title: "List Products",
      description:
        "List all products in the Kiwify account. Returns product name, type, status, price, and payment type. Use this to browse available products or find a product ID.",
      inputSchema: {
        page_size: z.string().optional().describe("Number of items per page"),
        page_number: z.string().optional().describe("Page number (1-indexed)"),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async ({ page_size, page_number }) => {
      try {
        const data = await apiRequest("/products", "GET", undefined, {
          page_size,
          page_number,
        });
        return toolResult(data);
      } catch (error) {
        return toolError(`Failed to list products: ${(error as Error).message}`);
      }
    },
  );

  server.registerTool(
    "get_product",
    {
      title: "Get Product Details",
      description:
        "Get full details of a specific product by ID. Returns extended info including links, offers, bumps, subscriptions, and revenue partners.",
      inputSchema: {
        product_id: z.string().uuid().describe("Product UUID"),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async ({ product_id }) => {
      try {
        const data = await apiRequest(`/products/${product_id}`);
        return toolResult(data);
      } catch (error) {
        return toolError(`Failed to get product: ${(error as Error).message}`);
      }
    },
  );
}
