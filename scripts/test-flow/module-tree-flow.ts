
import assert from "node:assert/strict";
import { generateModuleTreeSchema } from "../../src/core/modules.js";
import type { JsonObject } from "../../src/types/component.js";
import { assertRandomizedId, assertUniqueIds, flattenEditorNodes } from "./helpers.js";

export function runModuleTreeFlowTests(chartPanelInput: JsonObject): void {
  const moduleTreeSchema = generateModuleTreeSchema(chartPanelInput);
  assertRandomizedId(
    moduleTreeSchema.id,
    "sales_channel_panel",
    "module tree group id",
  );
  assert.equal(moduleTreeSchema.componentName, "__Group__");
  assert.equal(moduleTreeSchema.structVersion, "0.0.0");
  assert.equal((moduleTreeSchema.props.style as JsonObject).left, 48);
  assert.equal((moduleTreeSchema.props.style as JsonObject).top, 96);
  assert.equal((moduleTreeSchema.props.style as JsonObject).width, 520);
  assert.equal((moduleTreeSchema.props.style as JsonObject).height, 360);
  assert.equal(moduleTreeSchema.title, "销售渠道占比");
  assert.equal(moduleTreeSchema.isHidden, false);
  assert.equal(moduleTreeSchema.isLocked, false);
  assert.equal(moduleTreeSchema.isGroup, true);
  assert.equal(moduleTreeSchema.children.length, 5);
  assert.deepEqual(
    moduleTreeSchema.children.map((item) => item.componentName),
    [
      "SingleText",
      "SingleText",
      "PieChart",
      "SvgDecoration",
      "SingleImage",
    ],
  );
  assertUniqueIds(
    [moduleTreeSchema.id, ...moduleTreeSchema.children.map((item) => item.id)],
    "module tree ids should be unique",
  );
  assert.ok(
    moduleTreeSchema.children.every(
      (item) => (item.props.parentLogicalId as string | undefined) === moduleTreeSchema.id,
    ),
    "module tree child parentLogicalId should reference randomized group id",
  );
  assertRandomizedId(moduleTreeSchema.children[2]?.id ?? "", "main_chart", "module tree chart id");
  assertRandomizedId(moduleTreeSchema.children[0]?.id ?? "", "title", "module tree title id");
  assert.equal(moduleTreeSchema.children[0]?.isGroup, false);
  assert.equal(moduleTreeSchema.children[0]?.structVersion, "0.0.2");
  assert.equal(
    (moduleTreeSchema.children[0]?.props as JsonObject).logicalId,
    moduleTreeSchema.children[0]?.id,
  );

  const groupedChartPanelTree = generateModuleTreeSchema({
    ...chartPanelInput,
    logicalId: "grouped_sales_channel_panel",
    grouping: {
      mode: "semantic",
      singleChildGroup: true,
    },
  } satisfies JsonObject);
  assert.ok(
    groupedChartPanelTree.children.every((item) => item.componentName === "__Group__"),
    "ChartPanel should group single semantic children when requested",
  );
  assert.deepEqual(
    groupedChartPanelTree.children.map((item) => item.title),
    ["标题", "辅助文本", "主内容", "装饰", "背景"],
  );
  const groupedChartPanelNodes = flattenEditorNodes(groupedChartPanelTree as unknown as JsonObject);
  assert.ok(
    groupedChartPanelNodes.some((item) => item.componentName === "PieChart"),
    "grouped ChartPanel tree should preserve the chart component",
  );
  assert.equal(
    groupedChartPanelTree.children.at(-1)?.title,
    "背景",
    "grouped ChartPanel tree should keep the background group last",
  );
  assert.equal(
    groupedChartPanelTree.children.find((item) => item.title === "主内容")?.isGroup,
    true,
    "grouped ChartPanel tree should keep main content grouped above decorations",
  );
  assert.equal(
    groupedChartPanelTree.children.find((item) => item.title === "装饰")?.isGroup,
    true,
    "grouped ChartPanel tree should keep decorations grouped below main content",
  );
}
