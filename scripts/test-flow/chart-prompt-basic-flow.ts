import assert from "node:assert/strict";
import { generateScreenModuleFromPrompt } from "../../src/core/promptModule.js";
import type { JsonObject } from "../../src/types/component.js";
import {
  asChartObject,
  findMainChart,
  getBatchChartIndicatorName,
  getBatchChartSeries,
  hasBatchChartDimension,
  hasSideSummaryContainer,
} from "./chart-prompt-helpers.js";

export function runBasicChartPromptIntegrationTests(): void {
  // RingChart prompt generation
  const ringChartPromptPanel = generateScreenModuleFromPrompt({
    prompt: "用环形图展示各部门预算占比：研发部120，市场部80，运营部60。",
    style: { left: 0, top: 0, width: 800, height: 480 },
  });
  const ringChartPromptMain = findMainChart(ringChartPromptPanel as unknown as JsonObject);
  assert.equal(ringChartPromptMain.componentName, "RingChart", "RingChart prompt should infer RingChart");
  const ringChartPromptSeries = getBatchChartSeries(ringChartPromptPanel as unknown as JsonObject);
  assert.ok(
    Array.isArray(ringChartPromptSeries.radius) && ringChartPromptSeries.radius.length === 2,
    "RingChart prompt should keep radius array",
  );
  assert.equal(asChartObject(ringChartPromptSeries.label).show, false, "RingChart prompt should hide labels by default");
  assert.ok(
    typeof ringChartPromptSeries.name === "string" && ringChartPromptSeries.name !== "",
    `RingChart prompt series should have a semantic name, got ${ringChartPromptSeries.name}`,
  );
  const ringChartPromptIndicatorName = getBatchChartIndicatorName(ringChartPromptPanel as unknown as JsonObject);
  assert.ok(
    ringChartPromptIndicatorName && ringChartPromptIndicatorName !== "value",
    `RingChart prompt indicator chartDisplayName should be business semantic, got ${ringChartPromptIndicatorName}`,
  );

  // StackBarChart prompt generation
  const stackBarChartPromptPanel = generateScreenModuleFromPrompt({
    prompt: "用堆叠柱状图展示各季度线上线下销售额：Q1 线上120 线下80，Q2 线上150 线下90。",
    style: { left: 0, top: 0, width: 800, height: 480 },
  });
  const stackBarChartPromptMain = findMainChart(stackBarChartPromptPanel as unknown as JsonObject);
  assert.equal(stackBarChartPromptMain.componentName, "StackBarChart", "StackBarChart prompt should infer StackBarChart");
  const stackBarChartPromptSeries = getBatchChartSeries(stackBarChartPromptPanel as unknown as JsonObject);
  assert.equal(stackBarChartPromptSeries.type, "bar", "StackBarChart prompt series type should be bar");
  assert.equal(stackBarChartPromptSeries.stack, "__stackBar", "StackBarChart prompt should have fixed stack");
  assert.ok(
    typeof stackBarChartPromptSeries.name === "string" && stackBarChartPromptSeries.name !== "",
    `StackBarChart prompt series should have a semantic name, got ${stackBarChartPromptSeries.name}`,
  );
  assert.ok(
    hasBatchChartDimension(stackBarChartPromptPanel as unknown as JsonObject, "name"),
    "StackBarChart prompt dimension should include name",
  );
  assert.ok(
    hasBatchChartDimension(stackBarChartPromptPanel as unknown as JsonObject, "type"),
    "StackBarChart prompt dimension should include type",
  );
  assert.equal(
    hasSideSummaryContainer(stackBarChartPromptPanel as unknown as JsonObject),
    false,
    "StackBarChart prompt should not include side summary container",
  );
  const stackBarChartPromptIndicatorName = getBatchChartIndicatorName(stackBarChartPromptPanel as unknown as JsonObject);
  assert.ok(
    stackBarChartPromptIndicatorName && stackBarChartPromptIndicatorName !== "value",
    `StackBarChart prompt indicator chartDisplayName should be business semantic, got ${stackBarChartPromptIndicatorName}`,
  );

  // StackLineChart prompt generation
  const stackLineChartPromptPanel = generateScreenModuleFromPrompt({
    prompt: "用堆叠折线图展示上半年各品类趋势：1月 A类100 B类80，2月 A类120 B类90。",
    style: { left: 0, top: 0, width: 800, height: 480 },
  });
  const stackLineChartPromptMain = findMainChart(stackLineChartPromptPanel as unknown as JsonObject);
  assert.equal(stackLineChartPromptMain.componentName, "StackLineChart", "StackLineChart prompt should infer StackLineChart");
  const stackLineChartPromptSeries = getBatchChartSeries(stackLineChartPromptPanel as unknown as JsonObject);
  assert.equal(stackLineChartPromptSeries.type, "line", "StackLineChart prompt series type should be line");
  assert.equal(stackLineChartPromptSeries.stack, "__stackLine", "StackLineChart prompt should have fixed stack");
  assert.deepEqual(
    stackLineChartPromptSeries.showSymbol,
    { show: false },
    "StackLineChart prompt should hide symbols by default",
  );
  assert.ok(
    typeof stackLineChartPromptSeries.name === "string" && stackLineChartPromptSeries.name !== "",
    `StackLineChart prompt series should have a semantic name, got ${stackLineChartPromptSeries.name}`,
  );
  assert.ok(
    hasBatchChartDimension(stackLineChartPromptPanel as unknown as JsonObject, "name"),
    "StackLineChart prompt dimension should include name",
  );
  assert.ok(
    hasBatchChartDimension(stackLineChartPromptPanel as unknown as JsonObject, "type"),
    "StackLineChart prompt dimension should include type",
  );
  assert.equal(
    hasSideSummaryContainer(stackLineChartPromptPanel as unknown as JsonObject),
    false,
    "StackLineChart prompt should not include side summary container",
  );
  const stackLineChartPromptIndicatorName = getBatchChartIndicatorName(stackLineChartPromptPanel as unknown as JsonObject);
  assert.ok(
    stackLineChartPromptIndicatorName && stackLineChartPromptIndicatorName !== "value",
    `StackLineChart prompt indicator chartDisplayName should be business semantic, got ${stackLineChartPromptIndicatorName}`,
  );
}
