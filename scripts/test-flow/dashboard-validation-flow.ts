import assert from "node:assert/strict";
import { generateDashboardSchema, validateDashboardSpec } from "../../src/core/dashboard.js";
import type { JsonObject } from "../../src/types/component.js";

export function runDashboardValidationTests(dashboardSpec: JsonObject): void {
  const dashboardValidation = validateDashboardSpec(dashboardSpec);
  assert.equal(dashboardValidation.valid, true, "DashboardSpec should validate");
  assert.deepEqual(dashboardValidation.errors, []);
  const missingAuxiliaryTextValidation = validateDashboardSpec({
    logicalId: "missing_auxiliary_text_dashboard",
    modules: [
      {
        moduleName: "ChartPanel",
        logicalId: "missing_auxiliary_panel",
        title: "缺少辅助文本面板",
        style: {
          position: "absolute",
          left: 24,
          top: 80,
          width: 420,
          height: 280,
        },
        slots: {
          mainChart: {
            componentName: "LineChart",
            props: {
              chartData: {
                constant: {
                  data: [
                    { name: "一月", type: "销售额", value: 42 },
                    { name: "二月", type: "销售额", value: 58 },
                  ],
                },
              },
            },
          },
        },
      },
    ],
  } as JsonObject);
  assert.equal(missingAuxiliaryTextValidation.valid, false);
  assert.ok(
    (missingAuxiliaryTextValidation.errors as string[]).some((error) =>
      error.includes("slots.auxiliaryTexts"),
    ),
    "DashboardSpec validation should reject manual ChartPanel modules without auxiliary business text",
  );
  const invalidGroupingValidation = validateDashboardSpec({
    ...dashboardSpec,
    grouping: { mode: "template" },
  } as JsonObject);
  assert.equal(invalidGroupingValidation.valid, false);
  assert.ok(
    (invalidGroupingValidation.errors as string[]).includes("grouping.mode must be semantic or none"),
    "DashboardSpec validation should reject unknown grouping modes",
  );
  const flatComponentValidation = validateDashboardSpec({
    logicalId: "flat_component_dashboard",
    components: Array.from({ length: 9 }, (_, index) => ({
      componentName: "SingleText",
      logicalId: `flat_text_${index + 1}`,
      textContent: `散装组件${index + 1}`,
      style: {
        position: "absolute",
        left: index * 10,
        top: index * 10,
        width: 100,
        height: 20,
      },
    })),
  } as JsonObject);
  assert.equal(flatComponentValidation.valid, true);
  assert.ok(
    (flatComponentValidation.warnings as string[]).some((warning) =>
      warning.includes("DashboardSpec.groups or modules"),
    ),
    "DashboardSpec validation should warn when many top-level components are not grouped",
  );
  const missingGroupStyleSpec = {
    logicalId: "missing_group_style_dashboard",
    groups: [
      {
        logicalId: "floating_group",
        title: "未定位组件组",
        components: [
          {
            componentName: "SingleText",
            logicalId: "floating_group_title",
            textContent: "未定位组件组",
            style: {
              position: "absolute",
              left: 0,
              top: 0,
              width: 180,
              height: 24,
            },
          },
        ],
      },
    ],
  } as JsonObject;
  const missingGroupStyleValidation = validateDashboardSpec(missingGroupStyleSpec);
  assert.equal(missingGroupStyleValidation.valid, false);
  assert.ok(
    (missingGroupStyleValidation.errors as string[]).includes(
      "groups[0] missing complete style left/top/width/height",
    ),
    "DashboardSpec validation should reject explicit groups without complete style",
  );
  assert.throws(
    () => generateDashboardSchema(missingGroupStyleSpec),
    /groups\[0\] missing complete style left\/top\/width\/height/u,
    "DashboardSpec compiler should reject unpositioned explicit groups",
  );
  const emptyGroupSvgValidation = validateDashboardSpec({
    logicalId: "empty_group_svg_dashboard",
    groups: [
      {
        logicalId: "decorated_group",
        title: "空装饰组件组",
        style: {
          position: "absolute",
          left: 0,
          top: 0,
          width: 320,
          height: 120,
        },
        components: [
          {
            componentName: "SvgDecoration",
            logicalId: "empty_group_decoration",
            name: "空装饰",
            svgSource: "custom",
            svgContent: "",
            style: {
              position: "absolute",
              left: 0,
              top: 0,
              width: 320,
              height: 120,
            },
          },
        ],
      },
    ],
  } as JsonObject);
  assert.equal(emptyGroupSvgValidation.valid, false);
  assert.ok(
    (emptyGroupSvgValidation.errors as string[]).some((error) =>
      error.includes("groups[0].components[0] SvgDecoration must include non-empty svgContent or svgPreset"),
    ),
    "DashboardSpec validation should reject empty SvgDecoration components",
  );
  const emptyModuleSvgValidation = validateDashboardSpec({
    logicalId: "empty_module_svg_dashboard",
    modules: [
      {
        moduleName: "ChartPanel",
        logicalId: "empty_svg_chart_panel",
        title: "空装饰模块",
        style: {
          position: "absolute",
          left: 24,
          top: 80,
          width: 420,
          height: 280,
        },
        slots: {
          mainChart: {
            componentName: "PieChart",
            props: {
              chartData: {
                constant: {
                  data: [{ name: "A", type: "分类", value: 1 }],
                },
              },
            },
          },
          decorations: [
            {
              componentName: "SvgDecoration",
              props: {
                name: "空模块装饰",
                svgSource: "custom",
                svgContent: "",
              },
            },
          ],
        },
      },
    ],
  } as JsonObject);
  assert.equal(emptyModuleSvgValidation.valid, false);
  assert.ok(
    (emptyModuleSvgValidation.errors as string[]).some((error) =>
      error.includes("modules[0].slots.decorations[0] SvgDecoration must include non-empty svgContent or svgPreset"),
    ),
    "DashboardSpec validation should reject empty module decoration slots",
  );
  const placeholderTextValidation = validateDashboardSpec({
    logicalId: "placeholder_text_dashboard",
    components: [
      {
        componentName: "SingleText",
        logicalId: "placeholder_text",
        textContent: "辅助信息",
        style: {
          position: "absolute",
          left: 0,
          top: 0,
          width: 180,
          height: 18,
        },
      },
    ],
  } as JsonObject);
  assert.equal(placeholderTextValidation.valid, false);
  assert.ok(
    (placeholderTextValidation.errors as string[]).some((error) =>
      error.includes("SingleText textContent must be real business copy"),
    ),
    "DashboardSpec validation should reject visible placeholder text",
  );
  const missingChartDataValidation = validateDashboardSpec({
    logicalId: "missing_chart_data_dashboard",
    modules: [
      {
        moduleName: "ChartPanel",
        logicalId: "missing_chart_data_panel",
        title: "缺少数据图表",
        style: {
          position: "absolute",
          left: 24,
          top: 80,
          width: 420,
          height: 280,
        },
        slots: {
          mainChart: {
            componentName: "PieChart",
            props: {},
          },
        },
      },
    ],
  } as JsonObject);
  assert.equal(missingChartDataValidation.valid, false);
  assert.ok(
    (missingChartDataValidation.errors as string[]).some((error) =>
      error.includes("must include explicit chartData.constant.data"),
    ),
    "DashboardSpec validation should reject chart slots that would fall back to demo data",
  );
  const defaultDemoChartDataValidation = validateDashboardSpec({
    logicalId: "default_demo_chart_data_dashboard",
    components: [
      {
        componentName: "PieChart",
        logicalId: "default_demo_pie",
        chartData: {
          constant: {
            data: [
              { name: "类目1", type: "系列", value: 101 },
              { name: "类目2", type: "系列", value: 71 },
            ],
          },
        },
        style: {
          position: "absolute",
          left: 24,
          top: 80,
          width: 320,
          height: 240,
        },
      },
    ],
  } as JsonObject);
  assert.equal(defaultDemoChartDataValidation.valid, false);
  assert.ok(
    (defaultDemoChartDataValidation.errors as string[]).some((error) =>
      error.includes("not default 类目/系列 demo rows"),
    ),
    "DashboardSpec validation should reject default demo chart rows",
  );
}
