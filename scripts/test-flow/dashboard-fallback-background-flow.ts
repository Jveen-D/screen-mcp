import assert from "node:assert/strict";
import { generateDashboardSchema } from "../../src/core/dashboard.js";
import type { JsonObject } from "../../src/types/component.js";
import { flattenEditorNodes, hasPropName } from "./helpers.js";

export function runDashboardFallbackBackgroundTests(): void {
  const fallbackBackgroundDashboardSpec = {
    logicalId: "fallback_background_dashboard",
    title: "背景补齐大屏",
    canvas: { width: 1280, height: 720 },
    grouping: {
      mode: "semantic",
      singleChildGroup: true,
    },
    theme: {
      background: "#04111F",
      panelBackground: "rgba(8,30,50,0.74)",
      primaryColor: "#16D9FF",
      textColor: "#EAF7FF",
    },
    groups: [
      {
        logicalId: "bare_header_group",
        title: "顶部区域",
        style: {
          position: "absolute",
          left: 0,
          top: 0,
          width: 1280,
          height: 88,
        },
        components: [
          {
            componentName: "SingleText",
            logicalId: "bare_header_title",
            name: "主标题",
            textContent: "背景补齐大屏",
            style: {
              position: "absolute",
              left: 420,
              top: 24,
              width: 440,
              height: 32,
              fontSize: 32,
              lineHeight: 1,
            },
          },
        ],
      },
    ],
    modules: [
      {
        moduleName: "ChartPanel",
        logicalId: "bare_chart_panel",
        title: "无显式背景面板",
        style: {
          position: "absolute",
          left: 40,
          top: 120,
          width: 520,
          height: 320,
        },
        slots: {
          title: {
            componentName: "SingleText",
            props: {
              textContent: "无显式背景面板",
            },
          },
          mainChart: {
            componentName: "LineChart",
            props: {
              chartData: {
                constant: {
                  data: [
                    { name: "一月", type: "指标值", value: 42 },
                    { name: "二月", type: "指标值", value: 58 },
                  ],
                },
              },
            },
          },
          auxiliaryTexts: [
            {
              componentName: "SingleText",
              props: {
                name: "面板结论",
                textContent: "二月指标值较一月提升 38.1%",
              },
            },
          ],
        },
      },
    ],
  } as JsonObject;
  const fallbackBackgroundTree = generateDashboardSchema(fallbackBackgroundDashboardSpec);
  const fallbackBackgroundNodes = flattenEditorNodes(fallbackBackgroundTree as unknown as JsonObject);
  assert.ok(
    fallbackBackgroundNodes.some((item) => hasPropName(item, "全屏背景")),
    "DashboardSpec compiler should add a real full-screen background component when none is provided",
  );
  assert.ok(
    fallbackBackgroundNodes.some((item) => hasPropName(item, "分组背景")),
    "DashboardSpec compiler should add a real background carrier for bare explicit groups",
  );
  assert.ok(
    fallbackBackgroundNodes.some((item) => hasPropName(item, "模块背景")),
    "DashboardSpec compiler should add a real background carrier for bare modules",
  );
  const fallbackRootBackgroundGroup = fallbackBackgroundTree.children.at(-1);
  assert.equal(
    fallbackRootBackgroundGroup?.title,
    "背景",
    "DashboardSpec fallback full-screen background should be in the bottom background group",
  );
  const fallbackBareModule = fallbackBackgroundTree.children.find(
    (item) => item.componentName === "__Group__" && item.title === "无显式背景面板",
  );
  assert.ok(fallbackBareModule, "DashboardSpec should include bare module group");
  assert.ok(Array.isArray(fallbackBareModule.children), "bare module group should include children");
  assert.equal(
    fallbackBareModule.children.at(-1)?.title,
    "背景",
    "DashboardSpec fallback module background should be in the module background group",
  );
}
