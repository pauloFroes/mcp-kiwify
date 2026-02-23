#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { registerProductTools } from "./tools/products.js";
import { registerSalesTools } from "./tools/sales.js";
import { registerAffiliateTools } from "./tools/affiliates.js";
import { registerFinanceTools } from "./tools/finance.js";
import { registerWebhookTools } from "./tools/webhooks.js";
import { registerEventTools } from "./tools/events.js";
import { registerAccountTools } from "./tools/account.js";

const server = new McpServer({
  name: "mcp-kiwify",
  version: "1.0.0",
});

registerProductTools(server);
registerSalesTools(server);
registerAffiliateTools(server);
registerFinanceTools(server);
registerWebhookTools(server);
registerEventTools(server);
registerAccountTools(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("mcp-kiwify server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
