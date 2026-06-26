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

  const coordinateTree = generateDashboardSchema({
    logicalId: "coordinate_dashboard",
    title: "坐标归一化大屏",
    canvas: {
      width: 800,
      height: 480,
    },
    modules: [
      {
        moduleName: "FreeformModule",
        logicalId: "local_coordinate_panel",
        title: "局部坐标面板",
        style: {
          position: "absolute",
          left: 320,
          top: 180,
          width: 260,
          height: 160,
        },
        slots: {
          children: [
            {
              componentName: "SingleText",
              logicalId: "local_coordinate_title",
              textContent: "局部坐标标题",
              style: {
                position: "absolute",
                left: 16,
                top: 12,
                width: 160,
                height: 18,
                fontSize: 18,
                lineHeight: 1,
              },
            },
            {
              componentName: "SingleText",
              logicalId: "absolute_coordinate_title",
              textContent: "画布坐标标题",
              style: {
                position: "absolute",
                left: 360,
                top: 220,
                width: 160,
                height: 18,
                fontSize: 18,
                lineHeight: 1,
              },
            },
          ],
        },
      },
    ],
  } as JsonObject);
  const coordinateNodes = flattenEditorNodes(coordinateTree as unknown as JsonObject);
  const localText = coordinateNodes.find(
    (item) => nodeProps(item).textContent === "局部坐标标题",
  );
  const localStyle = nodeProps(localText).style as JsonObject;
  assert.equal(
    localStyle.left,
    336,
    "DashboardSpec should compile clear module-local x to canvas x",
  );
  assert.equal(
    localStyle.top,
    192,
    "DashboardSpec should compile clear module-local y to canvas y",
  );

  const absoluteText = coordinateNodes.find(
    (item) => nodeProps(item).textContent === "画布坐标标题",
  );
  const absoluteStyle = nodeProps(absoluteText).style as JsonObject;
  assert.equal(
    absoluteStyle.left,
    360,
    "DashboardSpec should not offset children that already use canvas x",
  );
  assert.equal(
    absoluteStyle.top,
    220,
    "DashboardSpec should not offset children that already use canvas y",
  );
}
