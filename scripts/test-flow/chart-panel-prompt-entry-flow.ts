import assert from "node:assert/strict";
import { generateScreenModuleFromPrompt } from "../../src/core/promptModule.js";
import type { JsonObject } from "../../src/types/component.js";
import { flattenEditorNodes, nodeProps } from "./helpers.js";

export function runChartPanelPromptEntryTests(): void {
  const promptGeneratedTree = generateScreenModuleFromPrompt({
    prompt: "做个风险等级分析，数据：高风险18，中风险37，低风险71。深色科技风，简洁点。",
    style: {
      left: 120,
      top: 120,
      width: 840,
      height: 520,
    },
  });
  assert.equal(promptGeneratedTree.componentName, "__Group__");
  assert.equal(promptGeneratedTree.title, "风险等级分析");
  const promptGeneratedNodes = flattenEditorNodes(promptGeneratedTree as unknown as JsonObject);
  const promptGeneratedChart = promptGeneratedNodes.find(
    (item) => item.componentName === "PieChart",
  );
  assert.ok(promptGeneratedChart, "prompt entry should generate a real PieChart");
  const promptGeneratedOption = nodeProps(promptGeneratedChart).option as JsonObject;
  const promptGeneratedLegend = promptGeneratedOption.legend as JsonObject;
  const promptGeneratedSeries = promptGeneratedOption.series as JsonObject[];
  const promptGeneratedLabel = promptGeneratedSeries[0]?.label as JsonObject;
  assert.equal(promptGeneratedLegend.show, true);
  assert.equal(promptGeneratedLegend.icon, "roundRect");
  const promptGeneratedLegendTextStyle = promptGeneratedLegend.textStyle as JsonObject;
  assert.equal(promptGeneratedLegendTextStyle.fontWeight, "normal");
  assert.equal(promptGeneratedLabel.show, true);
  assert.equal(promptGeneratedLabel.formatter, "{b}");
  assert.equal(promptGeneratedLabel.fontWeight, "normal");
  const promptGeneratedChartData = nodeProps(promptGeneratedChart).chartData as JsonObject;
  const promptGeneratedConstant = promptGeneratedChartData.constant as JsonObject;
  assert.deepEqual(promptGeneratedConstant.data, [
    { name: "高风险", type: "风险", value: 18 },
    { name: "中风险", type: "风险", value: 37 },
    { name: "低风险", type: "风险", value: 71 },
  ]);
  const promptGeneratedTexts = promptGeneratedNodes
    .filter((item) => item.componentName === "SingleText")
    .map((item) => nodeProps(item).textContent);
  assert.equal(
    promptGeneratedTexts.some((text) => typeof text === "string" && text.includes("图例")),
    false,
    "prompt entry should not call side summary a legend",
  );
}
