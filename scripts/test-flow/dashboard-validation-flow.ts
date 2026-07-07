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
                    { name: "一月", type: "指标值", value: 42 },
                    { name: "二月", type: "指标值", value: 58 },
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
  const reservedAreaOverlapValidation = validateDashboardSpec({
    logicalId: "reserved_area_overlap_dashboard",
    canvas: { width: 1280, height: 720 },
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
        logicalId: "center_overlap_group",
        title: "误占模型区域",
        style: {
          position: "absolute",
          left: 320,
          top: 160,
          width: 320,
          height: 240,
        },
        components: [
          {
            componentName: "SingleText",
            logicalId: "center_overlap_text",
            textContent: "误占模型区域",
            style: {
              position: "absolute",
              left: 340,
              top: 184,
              width: 180,
              height: 24,
            },
          },
        ],
      },
    ],
  } as JsonObject);
  assert.equal(reservedAreaOverlapValidation.valid, true);
  assert.ok(
    (reservedAreaOverlapValidation.warnings as string[]).some((warning) =>
      warning.includes("center_overlap_group overlaps reserved BIM model area bim_model_area"),
    ),
    "DashboardSpec validation should warn when top-level regions overlap reserved BIM model areas",
  );
  const missingReservedAreaStyleValidation = validateDashboardSpec({
    logicalId: "missing_reserved_area_style_dashboard",
    reservedAreas: [
      {
        logicalId: "bim_model_area",
        purpose: "bim-model",
      },
    ],
    components: [
      {
        componentName: "SingleText",
        logicalId: "status_text",
        textContent: "设备在线率 99.2%",
        style: {
          position: "absolute",
          left: 24,
          top: 24,
          width: 220,
          height: 24,
        },
      },
    ],
  } as JsonObject);
  assert.equal(missingReservedAreaStyleValidation.valid, false);
  assert.ok(
    (missingReservedAreaStyleValidation.errors as string[]).includes(
      "reservedAreas[0] missing complete style left/top/width/height",
    ),
    "DashboardSpec validation should reject BIM reserved areas without complete style",
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
  const gaugeTextMismatchValidation = validateDashboardSpec({
    logicalId: "gauge_text_mismatch_dashboard",
    groups: [
      {
        logicalId: "gauge_text_group",
        title: "进度面板",
        style: {
          position: "absolute",
          left: 24,
          top: 80,
          width: 420,
          height: 280,
        },
        components: [
          {
            componentName: "Gauge",
            logicalId: "progress_gauge",
            chartData: {
              constant: {
                data: [
                  { name: "当前完成率", value: 94.6 },
                ],
              },
            },
            value: 94.6,
            indicatorConfig: {
              maxValue: 120,
              suffix: "%",
            },
            style: {
              position: "absolute",
              left: 80,
              top: 110,
              width: 260,
              height: 180,
            },
          },
          {
            componentName: "SingleText",
            logicalId: "progress_note",
            textContent: "预计月底完成 101.8%",
            style: {
              position: "absolute",
              left: 72,
              top: 320,
              width: 260,
              height: 14,
            },
          },
        ],
      },
    ],
  } as JsonObject);
  assert.equal(gaugeTextMismatchValidation.valid, true);
  assert.ok(
    (gaugeTextMismatchValidation.warnings as string[]).some((warning) =>
      warning.includes("Gauge value 94.6% differs from nearby SingleText percentage 101.8%"),
    ),
    "DashboardSpec validation should warn about inconsistent gauge and text percentages",
  );

  const crowdedRingValidation = validateDashboardSpec({
    logicalId: "crowded_ring_dashboard",
    groups: [
      {
        logicalId: "crowded_ring_group",
        title: "环图拥挤面板",
        style: {
          position: "absolute",
          left: 504,
          top: 728,
          width: 446,
          height: 328,
        },
        components: [
          {
            componentName: "RingChart",
            logicalId: "crowded_ring",
            chartData: {
              constant: {
                data: [
                  { name: "分类A", type: "分类", value: 42 },
                  { name: "分类B", type: "分类", value: 28 },
                  { name: "分类C", type: "分类", value: 18 },
                  { name: "分类D", type: "分类", value: 12 },
                  { name: "分类E", type: "分类", value: 8 },
                ],
              },
            },
            style: {
              position: "absolute",
              left: 504,
              top: 728,
              width: 446,
              height: 328,
            },
            option: {
              legend: {
                show: true,
                top: "bottom",
                left: "center",
              },
              series: [
                {
                  center: ["50%", "43%"],
                  radius: ["15%", "20%"],
                },
              ],
            },
          },
          {
            componentName: "SingleText",
            logicalId: "crowded_ring_value",
            textContent: "35.9%",
            style: {
              position: "absolute",
              left: 683,
              top: 847,
              width: 88,
              height: 24,
              fontSize: 24,
            },
          },
          {
            componentName: "SingleText",
            logicalId: "crowded_ring_label",
            textContent: "标准产品占比",
            style: {
              position: "absolute",
              left: 663,
              top: 879,
              width: 128,
              height: 13,
              fontSize: 13,
            },
          },
          {
            componentName: "SingleText",
            logicalId: "crowded_ring_note",
            textContent: "结构变化保持稳定。",
            style: {
              position: "absolute",
              left: 534,
              top: 1010,
              width: 300,
              height: 14,
              fontSize: 14,
            },
          },
        ],
      },
    ],
  } as JsonObject);
  assert.equal(crowdedRingValidation.valid, true);
  assert.ok(
    (crowdedRingValidation.warnings as string[]).some((warning) =>
      warning.includes("outer radius is too small"),
    ),
    "DashboardSpec validation should warn when a multi-item ring chart collapses to an unreadable small radius",
  );
  assert.ok(
    (crowdedRingValidation.warnings as string[]).some((warning) =>
      warning.includes("center text is larger than the donut hole"),
    ),
    "DashboardSpec validation should warn when ring center text cannot fit inside the donut hole",
  );
  assert.ok(
    (crowdedRingValidation.warnings as string[]).some((warning) =>
      warning.includes("bottom legend and bottom text"),
    ),
    "DashboardSpec validation should warn when circular bottom legends compete with bottom conclusion text",
  );

  const genericSeriesNameValidation = validateDashboardSpec({
    logicalId: "generic_series_name_dashboard",
    components: [
      {
        componentName: "LineChart",
        logicalId: "generic_series_line",
        chartData: {
          constant: {
            data: [
              { name: "1月", type: "实际值", value: 120 },
              { name: "2月", type: "实际值", value: 160 },
              { name: "1月", type: "目标值", value: 100 },
              { name: "2月", type: "目标值", value: 150 },
            ],
          },
        },
        option: {
          series: [
            { name: "数值" },
            { name: "数值" },
          ],
        },
        style: {
          position: "absolute",
          left: 24,
          top: 80,
          width: 420,
          height: 280,
        },
      },
    ],
  } as JsonObject);
  assert.equal(genericSeriesNameValidation.valid, true);
  assert.ok(
    (genericSeriesNameValidation.warnings as string[]).some((warning) =>
      warning.includes("generic series names"),
    ),
    "DashboardSpec validation should warn when business typed chart data uses generic series names",
  );
}
