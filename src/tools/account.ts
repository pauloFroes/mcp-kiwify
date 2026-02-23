import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiRequest, toolResult, toolError } from "../client.js";

export function registerAccountTools(server: McpServer) {
  server.registerTool(
    "get_account_details",
    {
      title: "Get Account Details",
      description:
        "Get account details including company name, CPF, CNPJ, and legal entities with their PIX keys.",
      inputSchema: {},
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async () => {
      try {
        const data = await apiRequest("/account-details");
        return toolResult(data);
      } catch (error) {
        return toolError(`Failed to get account details: ${(error as Error).message}`);
      }
    },
  );
}
