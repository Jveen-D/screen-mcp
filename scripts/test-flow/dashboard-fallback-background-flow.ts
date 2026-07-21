import assert from "node:assert/strict";
import { generateDashboardSchema } from "../../src/core/dashboard.js";
import type { JsonObject } from "../../src/types/component.js";
import { flattenEditorNodes, hasPropName, nodeProps } from "./helpers.js";

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
  const fallbackBackgroundStyles = fallbackBackgroundNodes
    .filter((item) => hasPropName(item, "全屏背景") || hasPropName(item, "分组背景") || hasPropName(item, "模块背景"))
    .map((item) => nodeProps(item).style as JsonObject);
  assert.ok(
    fallbackBackgroundStyles.every((style) => style.zIndex === 0),
    "DashboardSpec fallback backgrounds should keep zIndex zero so renderer grouping cannot raise them above content",
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

  const suppressedPanelBackgroundTree = generateDashboardSchema({
    ...fallbackBackgroundDashboardSpec,
    logicalId: "suppressed_panel_background_dashboard",
    autoPanelBackgrounds: false,
  });
  const suppressedPanelBackgroundNodes = flattenEditorNodes(
    suppressedPanelBackgroundTree as unknown as JsonObject,
  );
  assert.ok(
    suppressedPanelBackgroundNodes.some((item) => hasPropName(item, "全屏背景")),
    "autoPanelBackgrounds=false should keep the canvas background fallback",
  );
  assert.equal(
    suppressedPanelBackgroundNodes.some((item) =>
      hasPropName(item, "分组背景") || hasPropName(item, "模块背景")
    ),
    false,
    "autoPanelBackgrounds=false should suppress group and module fallback backgrounds",
  );

  const explicitSvgBackgroundTree = generateDashboardSchema({
    logicalId: "explicit_svg_background_dashboard",
    title: "显式 SVG 背景大屏",
    canvas: { width: 1280, height: 720 },
    components: [
      {
        componentName: "SvgDecoration",
        logicalId: "explicit_fullscreen_background",
        name: "全屏背景",
        layerRole: "background",
        svgSource: "custom",
        svgContent:
          '<svg viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg"><rect width="1280" height="720" fill="#04111F"/></svg>',
        style: {
          position: "absolute",
          left: 0,
          top: 0,
          width: 1280,
          height: 720,
        },
      },
      {
        componentName: "SingleText",
        logicalId: "explicit_background_title",
        name: "主标题",
        textContent: "显式 SVG 背景大屏",
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
  } as JsonObject);
  assert.equal(
    explicitSvgBackgroundTree.children.at(-1)?.title,
    "全屏背景",
    "explicit full-screen SvgDecoration background should be moved to the bottom layer",
  );
  assert.equal(
    flattenEditorNodes(explicitSvgBackgroundTree as unknown as JsonObject)
      .filter((item) => hasPropName(item, "全屏背景"))
      .length,
    1,
    "explicit full-screen SvgDecoration background should suppress the fallback background",
  );

  const bimReservedAreaDashboardSpec = {
    logicalId: "bim_reserved_area_dashboard",
    title: "BIM 模型监控大屏",
    canvas: { width: 1280, height: 720 },
    theme: {
      background: "#04111F",
      panelBackground: "rgba(8,30,50,0.74)",
      primaryColor: "#16D9FF",
      textColor: "#EAF7FF",
    },
    reservedAreas: [
      {
        logicalId: "bim_model_area",
        purpose: "bim-model",
        style: {
          position: "absolute",
          left: 360,
          top: 120,
          width: 560,
          height: 480,
        },
      },
    ],
    groups: [
      {
        logicalId: "left_status_group",
        title: "左侧状态",
        style: {
          position: "absolute",
          left: 24,
          top: 120,
          width: 280,
          height: 480,
        },
        components: [
          {
            componentName: "SingleText",
            logicalId: "left_status_title",
            name: "状态标题",
            textContent: "设备运行总览",
            style: {
              position: "absolute",
              left: 48,
              top: 144,
              width: 180,
              height: 24,
              fontSize: 20,
              lineHeight: 1,
            },
          },
        ],
      },
    ],
  } as JsonObject;
  const bimReservedAreaTree = generateDashboardSchema(bimReservedAreaDashboardSpec);
  const bimReservedAreaNodes = flattenEditorNodes(bimReservedAreaTree as unknown as JsonObject);
  assert.ok(
    !bimReservedAreaNodes.some((item) => hasPropName(item, "全屏背景")),
    "DashboardSpec compiler should not add a full-screen background when a BIM model area is reserved",
  );
  assert.ok(
    bimReservedAreaNodes.some((item) => hasPropName(item, "分组背景")),
    "DashboardSpec compiler should still add background carriers for bare groups around the BIM model area",
  );
  assert.ok(
    !JSON.stringify(bimReservedAreaTree).includes("bim_model_area"),
    "DashboardSpec compiler should not emit reserved BIM model area metadata into final schema",
  );
}
