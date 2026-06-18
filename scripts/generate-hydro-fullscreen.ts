import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function readToolJson(result: Awaited<ReturnType<Client["callTool"]>>): unknown {
  if (!Array.isArray(result.content)) {
    throw new Error("MCP tool should return content array");
  }
  const content = result.content[0];
  if (!content || content.type !== "text") {
    throw new Error("MCP tool should return text content");
  }
  return JSON.parse("text" in content ? content.text : "");
}

async function main() {
  const client = new Client({
    name: "hydro-fullscreen-generator",
    version: "0.1.0",
  });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ["node_modules/tsx/dist/cli.mjs", "src/server.ts"],
    cwd: join(__dirname, ".."),
  });

  await client.connect(transport);

  try {
    const result = await client.callTool({
      name: "generate_full_screen_from_prompt",
      arguments: {
        prompt:
          "生成一个水电站智慧运行监测大屏，科技风深色主题，1920×1080 画布。包含全屏科技风背景、顶部主标题与装饰、关键 KPI 指标、机组运行状态、发电趋势、水情监测、流域地图/3D 地球、告警滚动列表等组件，组件布局由你决定。",
        logicalId: "hydro_smart_screen_root",
        title: "水电站智慧运行监测大屏",
        theme: {
          primaryColor: "#00E5FF",
          secondaryColor: "#7C4DFF",
          accentColor: "#FFB300",
          textColor: "#DFF8FF",
          bgColor: "#030B1E",
        },
      },
    });

    const screenTree = readToolJson(result);

    const outputDir = join(__dirname, "..", "dist");
    mkdirSync(outputDir, { recursive: true });
    const outputPath = join(outputDir, "hydro-smart-screen-schema.json");
    writeFileSync(outputPath, JSON.stringify(screenTree, null, 2), "utf-8");

    console.log(`大屏 schema 已保存至：${outputPath}`);
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
