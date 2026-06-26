import assert from "node:assert/strict";
import { generateScreenModuleFromPrompt } from "../../src/core/promptModule.js";
import type { JsonObject } from "../../src/types/component.js";
import {
  findMainChart,
  getBatchChartAxisType,
  getBatchChartIndicatorName,
  getBatchChartSeries,
  hasSideSummaryContainer,
} from "./chart-prompt-helpers.js";

export function runExtendedChartPromptIntegrationTests(): void {
  // BarChart25D prompt generation
  const barChart25DPromptPanel = generateScreenModuleFromPrompt({
    prompt: "用2.5D柱状图展示各部门销售额：研发部120，市场部80，运营部60。",
    style: { left: 0, top: 0, width: 800, height: 480 },
  });
  const barChart25DPromptMain = findMainChart(barChart25DPromptPanel as unknown as JsonObject);
  assert.equal(barChart25DPromptMain.componentName, "BarChart25D", "BarChart25D prompt should infer BarChart25D");
  const barChart25DPromptSeries = getBatchChartSeries(barChart25DPromptPanel as unknown as JsonObject);
  assert.equal(barChart25DPromptSeries.type, "custom", "BarChart25D prompt series type should be custom");
  assert.equal(
    hasSideSummaryContainer(barChart25DPromptPanel as unknown as JsonObject),
    false,
    "BarChart25D prompt should not include side summary container",
  );
  const barChart25DPromptIndicatorName = getBatchChartIndicatorName(barChart25DPromptPanel as unknown as JsonObject);
  assert.ok(
    barChart25DPromptIndicatorName && barChart25DPromptIndicatorName !== "value",
    `BarChart25D prompt indicator chartDisplayName should be business semantic, got ${barChart25DPromptIndicatorName}`,
  );

  // BarProgress prompt generation
  const barProgressPromptPanel = generateScreenModuleFromPrompt({
    prompt: "用条形进度图展示各部门完成率：研发部78，市场部45，运营部92。",
    style: { left: 0, top: 0, width: 800, height: 480 },
  });
  const barProgressPromptMain = findMainChart(barProgressPromptPanel as unknown as JsonObject);
  assert.equal(barProgressPromptMain.componentName, "BarProgress", "BarProgress prompt should infer BarProgress");
  const barProgressPromptSeries = getBatchChartSeries(barProgressPromptPanel as unknown as JsonObject);
  assert.equal(barProgressPromptSeries.type, "bar", "BarProgress prompt series type should be bar");
  assert.equal(
    getBatchChartAxisType(barProgressPromptPanel as unknown as JsonObject, "xAxis"),
    "value",
    "BarProgress prompt xAxis type should be value",
  );
  assert.equal(
    getBatchChartAxisType(barProgressPromptPanel as unknown as JsonObject, "yAxis"),
    "category",
    "BarProgress prompt yAxis type should be category",
  );
  assert.equal(
    hasSideSummaryContainer(barProgressPromptPanel as unknown as JsonObject),
    false,
    "BarProgress prompt should not include side summary container",
  );
  const barProgressPromptIndicatorName = getBatchChartIndicatorName(barProgressPromptPanel as unknown as JsonObject);
  assert.ok(
    barProgressPromptIndicatorName && barProgressPromptIndicatorName !== "value",
    `BarProgress prompt indicator chartDisplayName should be business semantic, got ${barProgressPromptIndicatorName}`,
  );

  // LiquidFill prompt generation
  const liquidFillPromptPanel = generateScreenModuleFromPrompt({
    prompt: "用水球图展示整体完成率0.75。",
    style: { left: 0, top: 0, width: 800, height: 480 },
  });
  const liquidFillPromptMain = findMainChart(liquidFillPromptPanel as unknown as JsonObject);
  assert.equal(liquidFillPromptMain.componentName, "LiquidFill", "LiquidFill prompt should infer LiquidFill");
  const liquidFillPromptSeries = getBatchChartSeries(liquidFillPromptPanel as unknown as JsonObject);
  assert.equal(liquidFillPromptSeries.type, "liquidFill", "LiquidFill prompt series type should be liquidFill");
  assert.equal(
    hasSideSummaryContainer(liquidFillPromptPanel as unknown as JsonObject),
    false,
    "LiquidFill prompt should not include side summary container",
  );
  const liquidFillPromptIndicatorName = getBatchChartIndicatorName(liquidFillPromptPanel as unknown as JsonObject);
  assert.ok(
    liquidFillPromptIndicatorName && liquidFillPromptIndicatorName !== "value",
    `LiquidFill prompt indicator chartDisplayName should be business semantic, got ${liquidFillPromptIndicatorName}`,
  );

  // RoseChart prompt generation
  const roseChartPromptPanel = generateScreenModuleFromPrompt({
    prompt: "用玫瑰图展示各部门占比：研发部120，市场部80，运营部60。",
    style: { left: 0, top: 0, width: 800, height: 480 },
  });
  const roseChartPromptMain = findMainChart(roseChartPromptPanel as unknown as JsonObject);
  assert.equal(roseChartPromptMain.componentName, "RoseChart", "RoseChart prompt should infer RoseChart");
  const roseChartPromptSeries = getBatchChartSeries(roseChartPromptPanel as unknown as JsonObject);
  assert.equal(roseChartPromptSeries.type, "pie", "RoseChart prompt series type should be pie");
  assert.equal(roseChartPromptSeries.roseType, "area", "RoseChart prompt roseType should be area");
  const roseChartPromptIndicatorName = getBatchChartIndicatorName(roseChartPromptPanel as unknown as JsonObject);
  assert.ok(
    roseChartPromptIndicatorName && roseChartPromptIndicatorName !== "value",
    `RoseChart prompt indicator chartDisplayName should be business semantic, got ${roseChartPromptIndicatorName}`,
  );

  // ScatterChart prompt generation
  const scatterChartPromptPanel = generateScreenModuleFromPrompt({
    prompt: "用散点图展示广告投入与销售额关系。",
    style: { left: 0, top: 0, width: 800, height: 480 },
  });
  const scatterChartPromptMain = findMainChart(scatterChartPromptPanel as unknown as JsonObject);
  assert.equal(scatterChartPromptMain.componentName, "ScatterChart", "ScatterChart prompt should infer ScatterChart");
  const scatterChartPromptSeries = getBatchChartSeries(scatterChartPromptPanel as unknown as JsonObject);
  assert.equal(scatterChartPromptSeries.type, "scatter", "ScatterChart prompt series type should be scatter");
  assert.equal(
    getBatchChartAxisType(scatterChartPromptPanel as unknown as JsonObject, "xAxis"),
    "value",
    "ScatterChart prompt xAxis type should be value",
  );
  assert.equal(
    getBatchChartAxisType(scatterChartPromptPanel as unknown as JsonObject, "yAxis"),
    "value",
    "ScatterChart prompt yAxis type should be value",
  );
  assert.equal(
    hasSideSummaryContainer(scatterChartPromptPanel as unknown as JsonObject),
    false,
    "ScatterChart prompt should not include side summary container",
  );
}
