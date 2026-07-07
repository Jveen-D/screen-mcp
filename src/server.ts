import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createScreenMcpServer } from "./mcp/screenServer.js";

const server = createScreenMcpServer({ entryFileUrl: import.meta.url });
const transport = new StdioServerTransport();

await server.connect(transport);
