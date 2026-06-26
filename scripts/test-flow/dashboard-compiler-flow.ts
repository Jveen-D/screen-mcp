import assert from "node:assert/strict";
import { generateDashboardSchema } from "../../src/core/dashboard.js";
import type { JsonObject } from "../../src/types/component.js";
import { flattenEditorNodes, hasPropName, nodeProps } from "./helpers.js";

export function runDashboardCompilerTests(dashboardSpec: JsonObject): void {
  const dashboardTree = generateDashboardSchema(dashboardSpec);
  assert.equal(dashboardTree.componentName, "__Group__");
  assert.equal(dashboardTree.title, "运营洞察大屏");
  assert.equal((dashboardTree.props.style as JsonObject).width, 1280);
  assert.equal((dashboardTree.props.style as JsonObject).height, 720);
  assert.equal(
    dashboardTree.props.theme,
    undefined,
    "DashboardSpec root props should not carry compiler-only theme",
  );
  assert.equal(
    dashboardTree.children.at(-1)?.title,
    "背景",
    "DashboardSpec root semantic background group should be last",
  );
  const dashboardNodes = flattenEditorNodes(dashboardTree as unknown as JsonObject);
  assert.ok(
    dashboardNodes.some((item) => item.componentName === "PieChart"),
    "DashboardSpec compiler should include module chart nodes",
  );
  assert.ok(
    dashboardNodes.some((item) => hasPropName(item, "AI自定义标题线")),
    "DashboardSpec compiler should preserve LLM-authored decorations",
  );
  assert.equal(
    dashboardNodes.some((item) => {
      const props = item.props;
      return typeof props === "object" &&
        props !== null &&
        !Array.isArray(props) &&
        (props as JsonObject).theme !== undefined;
    }),
    false,
    "DashboardSpec compiler should strip repeated theme objects from all output nodes",
  );
  const dashboardHeaderGroup = dashboardTree.children.find(
    (item) => item.componentName === "__Group__" && item.title === "顶部信息组",
  );
  assert.ok(dashboardHeaderGroup, "DashboardSpec should compile explicit component groups");
  assert.ok(
    Array.isArray(dashboardHeaderGroup.children),
    "DashboardSpec explicit component group should include children",
  );
  assert.ok(
    dashboardHeaderGroup.children.every((item) => item.componentName === "__Group__"),
    "DashboardSpec explicit component groups should inherit semantic grouping",
  );
  assert.equal(
    dashboardHeaderGroup.children.at(-1)?.title,
    "背景",
    "DashboardSpec explicit component group should keep background subgroup last",
  );
  assert.ok(
    flattenEditorNodes(dashboardHeaderGroup as unknown as JsonObject)
      .filter((item) => item.componentName !== "__Group__")
      .every((item) => (nodeProps(item).parentLogicalId as string | undefined) === dashboardHeaderGroup.id),
    "DashboardSpec explicit component group children should reference group id",
  );
  const dashboardChartModule = dashboardTree.children.find(
    (item) => item.componentName === "__Group__" && item.title === "状态分布分析",
  );
  assert.ok(dashboardChartModule, "DashboardSpec should include the ChartPanel module group");
  assert.ok(
    Array.isArray(dashboardChartModule.children),
    "DashboardSpec ChartPanel module should include children",
  );
  assert.ok(
    dashboardChartModule.children.every((item) => item.componentName === "__Group__"),
    "DashboardSpec grouping should be inherited by ChartPanel modules",
  );
  assert.ok(
    flattenEditorNodes(dashboardChartModule as unknown as JsonObject).some((item) =>
      hasPropName(item, "模块背景"),
    ),
    "DashboardSpec should add a module background when ChartPanel has no explicit background carrier",
  );
  const dashboardKpiModule = dashboardTree.children.find(
    (item) => item.componentName === "__Group__" && item.title === "核心指标",
  );
  assert.ok(dashboardKpiModule, "DashboardSpec should include the FreeformModule group");
  assert.ok(
    Array.isArray(dashboardKpiModule.children),
    "DashboardSpec FreeformModule should include children",
  );
  assert.ok(
    dashboardKpiModule.children.every((item) => item.componentName === "__Group__"),
    "DashboardSpec grouping should be inherited by FreeformModule modules",
  );
}
