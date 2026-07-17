import { randomUUID } from "node:crypto";
import type { IncomingHttpHeaders, IncomingMessage, ServerResponse } from "node:http";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import express, { type NextFunction, type Request, type Response } from "express";
import { createScreenMcpServer } from "./mcp/screenServer.js";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3460;
const HOST = process.env.HOST?.trim() || "127.0.0.1";
const ALLOWED_HOSTS = (process.env.MCP_ALLOWED_HOSTS ?? "")
  .split(",")
  .map((host) => host.trim())
  .filter(Boolean);
const MCP_PATH = "/mcp";
const MCP_JSON_BODY_LIMIT = "10mb";

interface Session {
  transport: StreamableHTTPServerTransport;
  server: McpServer;
}

type ParsedRequest = IncomingMessage & { body?: unknown };
type HttpParserError = Error & { status?: number; type?: string };

const sessions = new Map<string, Session>();
const mcpApp = createMcpExpressApp({
  host: HOST,
  ...(ALLOWED_HOSTS.length > 0 ? { allowedHosts: ALLOWED_HOSTS } : {}),
});

function sessionIdFrom(headers: IncomingHttpHeaders): string | undefined {
  const value = headers["mcp-session-id"];
  return Array.isArray(value) ? value[0] : value;
}

function sendJsonRpcError(
  res: ServerResponse,
  status: number,
  message: string,
): void {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify({
    jsonrpc: "2.0",
    error: { code: -32000, message },
    id: null,
  }));
}

async function handleSessionRequest(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  const sessionId = sessionIdFrom(req.headers);
  if (!sessionId) {
    sendJsonRpcError(res, 400, "Missing mcp-session-id header");
    return;
  }

  const session = sessions.get(sessionId);
  if (!session) {
    sendJsonRpcError(res, 404, "Session not found");
    return;
  }

  await session.transport.handleRequest(req, res);
}

mcpApp.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, mcp-session-id, mcp-protocol-version, last-event-id",
  );
  res.setHeader("Access-Control-Expose-Headers", "mcp-session-id");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  next();
});

mcpApp.post(MCP_PATH, async (req: ParsedRequest, res: ServerResponse) => {
  try {
    const sessionId = sessionIdFrom(req.headers);
    let session = sessionId ? sessions.get(sessionId) : undefined;

    if (!session && !sessionId && isInitializeRequest(req.body)) {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (initializedSessionId) => {
          sessions.set(initializedSessionId, { transport, server });
        },
      });
      const server = createScreenMcpServer({ entryFileUrl: import.meta.url });

      transport.onclose = () => {
        const initializedSessionId = transport.sessionId;
        if (initializedSessionId) {
          sessions.delete(initializedSessionId);
        }
      };

      await server.connect(transport);
      session = { transport, server };
    }

    if (!session) {
      sendJsonRpcError(
        res,
        sessionId ? 404 : 400,
        sessionId
          ? "Session not found"
          : "Request must be an MCP initialize request",
      );
      return;
    }

    await session.transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("Error handling MCP request:", error);
    if (!res.headersSent) {
      sendJsonRpcError(res, 500, "Internal server error");
    }
  }
});

mcpApp.get(MCP_PATH, async (req: IncomingMessage, res: ServerResponse) => {
  try {
    await handleSessionRequest(req, res);
  } catch (error) {
    console.error("Error opening MCP stream:", error);
    if (!res.headersSent) {
      sendJsonRpcError(res, 500, "Internal server error");
    }
  }
});

mcpApp.delete(MCP_PATH, async (req: IncomingMessage, res: ServerResponse) => {
  try {
    await handleSessionRequest(req, res);
  } catch (error) {
    console.error("Error closing MCP session:", error);
    if (!res.headersSent) {
      sendJsonRpcError(res, 500, "Internal server error");
    }
  }
});

const app = express();
// The SDK parser has a fixed 100kb limit; pre-parsing keeps its Host validation while raising that limit.
app.use(express.json({ limit: MCP_JSON_BODY_LIMIT }));
app.use(mcpApp);
app.use((error: HttpParserError, _req: Request, res: Response, _next: NextFunction) => {
  const isPayloadTooLarge = error.type === "entity.too.large" || error.status === 413;
  console.error("Error parsing MCP HTTP request:", error);
  sendJsonRpcError(
    res,
    isPayloadTooLarge ? 413 : 400,
    isPayloadTooLarge
      ? `MCP request body exceeds the ${MCP_JSON_BODY_LIMIT} limit`
      : "Invalid JSON request body",
  );
});

const httpServer = app.listen(PORT, HOST, () => {
  console.log(`Screen MCP HTTP server running at http://${HOST}:${PORT}`);
  console.log(`Streamable HTTP endpoint: http://${HOST}:${PORT}${MCP_PATH}`);
});

process.on("SIGINT", async () => {
  console.log("Shutting down Screen MCP HTTP server...");
  for (const [sessionId, session] of sessions) {
    try {
      await session.server.close();
    } catch (error) {
      console.error(`Error closing session ${sessionId}:`, error);
    }
  }
  sessions.clear();
  httpServer.close(() => {
    console.log("Server shutdown complete");
    process.exit(0);
  });
});
