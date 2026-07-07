import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import http from "node:http";
import url from "node:url";
import { createScreenMcpServer } from "./mcp/screenServer.js";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3460;

interface Session {
  transport: SSEServerTransport;
  server: McpServer;
}

const sessions = new Map<string, Session>();

const httpServer = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url || "", true);

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, mcp-session-id");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (parsed.pathname === "/sse") {
    const transport = new SSEServerTransport("/message", res);
    const server = createScreenMcpServer({ entryFileUrl: import.meta.url });
    sessions.set(transport.sessionId, { transport, server });
    transport.onclose = () => {
      sessions.delete(transport.sessionId);
    };
    req.on("close", () => {
      sessions.delete(transport.sessionId);
    });
    await server.connect(transport);
    return;
  }

  if (parsed.pathname === "/message") {
    const sessionId = parsed.query.sessionId as string | undefined;
    if (!sessionId) {
      res.writeHead(400);
      res.end("Missing sessionId");
      return;
    }
    const session = sessions.get(sessionId);
    if (!session) {
      res.writeHead(404);
      res.end("Session not found");
      return;
    }
    await session.transport.handlePostMessage(req, res);
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

httpServer.listen(PORT, () => {
  console.log(`Screen MCP HTTP server running at http://localhost:${PORT}`);
  console.log(`SSE endpoint: http://localhost:${PORT}/sse`);
});

process.on("SIGINT", async () => {
  console.log("Shutting down Screen MCP HTTP server...");
  for (const [sessionId, session] of sessions) {
    try {
      await session.transport.close();
    } catch (error) {
      console.error(`Error closing transport for session ${sessionId}:`, error);
    }
  }
  sessions.clear();
  httpServer.close(() => {
    console.log("Server shutdown complete");
    process.exit(0);
  });
});
