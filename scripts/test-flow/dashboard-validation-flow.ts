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
  const emptyAuxiliaryTextValidation = validateDashboardSpec({
    logicalId: "empty_auxiliary_text_dashboard",
    modules: [
      {
        moduleName: "ChartPanel",
        logicalId: "empty_auxiliary_panel",
        title: "空辅助文本面板",
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
          auxiliaryTexts: [
            {
              componentName: "SingleText",
              props: {},
            },
          ],
        },
      },
    ],
  } as JsonObject);
  assert.equal(emptyAuxiliaryTextValidation.valid, false);
  assert.ok(
    (emptyAuxiliaryTextValidation.errors as string[]).some((error) =>
      error.includes("slots.auxiliaryTexts"),
    ),
    "DashboardSpec validation should reject auxiliary SingleText slots without real business copy",
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
  const emptyEdgePaddingValidation = validateDashboardSpec({
    logicalId: "empty_edge_padding_dashboard",
    canvas: { width: 1000, height: 600 },
    groups: [
      {
        logicalId: "center_content_group",
        title: "主体内容",
        style: {
          position: "absolute",
          left: 80,
          top: 64,
          width: 840,
          height: 436,
        },
        components: [
          {
            componentName: "SingleText",
            logicalId: "center_content_title",
            textContent: "主体内容",
            style: {
              position: "absolute",
              left: 108,
              top: 92,
              width: 160,
              height: 24,
            },
          },
        ],
      },
    ],
  } as JsonObject);
  assert.equal(emptyEdgePaddingValidation.valid, true);
  assert.ok(
    (emptyEdgePaddingValidation.warnings as string[]).some((warning) =>
      warning.includes("empty left/right/bottom edge padding"),
    ),
    "DashboardSpec validation should warn when large edge padding has no decorative accents",
  );
  const decoratedEdgePaddingValidation = validateDashboardSpec({
    logicalId: "decorated_edge_padding_dashboard",
    canvas: { width: 1000, height: 600 },
    components: [
      {
        componentName: "SvgDecoration",
        logicalId: "left_edge_rail",
        name: "左侧边缘轨道",
        svgSource: "custom",
        svgContent:
          '<svg viewBox="0 0 44 600" xmlns="http://www.w3.org/2000/svg"><path d="M22 24v552" stroke="currentColor" stroke-width="2" opacity=".6"/><path d="M12 96h20M12 180h20M12 264h20M12 348h20M12 432h20" stroke="currentColor" stroke-width="2" opacity=".8"/></svg>',
        style: {
          position: "absolute",
          left: 12,
          top: 0,
          width: 44,
          height: 600,
        },
      },
      {
        componentName: "SvgDecoration",
        logicalId: "right_edge_rail",
        name: "右侧边缘轨道",
        svgSource: "custom",
        svgContent:
          '<svg viewBox="0 0 44 600" xmlns="http://www.w3.org/2000/svg"><path d="M22 24v552" stroke="currentColor" stroke-width="2" opacity=".6"/><path d="M12 96h20M12 180h20M12 264h20M12 348h20M12 432h20" stroke="currentColor" stroke-width="2" opacity=".8"/></svg>',
        style: {
          position: "absolute",
          left: 944,
          top: 0,
          width: 44,
          height: 600,
        },
      },
      {
        componentName: "SvgDecoration",
        logicalId: "bottom_edge_structure",
        name: "底部边缘结构线",
        svgSource: "custom",
        svgContent:
          '<svg viewBox="0 0 1000 36" xmlns="http://www.w3.org/2000/svg"><path d="M24 18h260M716 18h260" stroke="currentColor" stroke-width="2" opacity=".72"/><path d="M316 18h368" stroke="currentColor" stroke-width="1" stroke-dasharray="8 10" opacity=".45"/></svg>',
        style: {
          position: "absolute",
          left: 0,
          top: 552,
          width: 1000,
          height: 36,
        },
      },
    ],
    groups: [
      {
        logicalId: "decorated_center_content_group",
        title: "主体内容",
        style: {
          position: "absolute",
          left: 80,
          top: 64,
          width: 840,
          height: 436,
        },
        components: [
          {
            componentName: "SingleText",
            logicalId: "decorated_center_content_title",
            textContent: "主体内容",
            style: {
              position: "absolute",
              left: 108,
              top: 92,
              width: 160,
              height: 24,
            },
          },
        ],
      },
    ],
  } as JsonObject);
  assert.equal(decoratedEdgePaddingValidation.valid, true);
  assert.equal(
    (decoratedEdgePaddingValidation.warnings as string[]).some((warning) =>
      warning.includes("edge padding"),
    ),
    false,
    "DashboardSpec validation should accept custom SvgDecoration accents in edge padding",
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
  const lowContrastThemeValidation = validateDashboardSpec({
    logicalId: "low_contrast_theme_dashboard",
    theme: {
      background: "#111827",
      panelBackground: "rgba(255,255,255,0.06)",
      textColor: "#3A4350",
    },
    components: [
      {
        componentName: "SingleText",
        logicalId: "low_contrast_theme_text",
        textContent: "主题文字对比度检查",
        style: {
          position: "absolute",
          left: 24,
          top: 24,
          width: 220,
          height: 18,
          fontSize: 18,
        },
      },
    ],
  } as JsonObject);
  assert.equal(lowContrastThemeValidation.valid, true);
  assert.ok(
    (lowContrastThemeValidation.warnings as string[]).some((warning) =>
      warning.includes("theme.textColor against theme.background contrast"),
    ),
    "DashboardSpec validation should warn when theme text and background colors have low contrast",
  );
  assert.ok(
    (lowContrastThemeValidation.warnings as string[]).some((warning) =>
      warning.includes("theme.textColor against theme.panelBackground contrast"),
    ),
    "DashboardSpec validation should resolve translucent panel backgrounds before checking contrast",
  );

  const readableThemeValidation = validateDashboardSpec({
    logicalId: "readable_theme_dashboard",
    theme: {
      background: "#08111F",
      panelBackground: "rgba(255,255,255,0.08)",
      textColor: "#F2F8FF",
    },
    components: [
      {
        componentName: "SingleText",
        logicalId: "readable_theme_text",
        textContent: "高对比主题文字",
        style: {
          position: "absolute",
          left: 24,
          top: 24,
          width: 180,
          height: 18,
          fontSize: 18,
        },
      },
    ],
  } as JsonObject);
  assert.equal(readableThemeValidation.valid, true);
  assert.equal(
    (readableThemeValidation.warnings as string[]).some((warning) =>
      warning.includes("contrast"),
    ),
    false,
    "DashboardSpec validation should not warn about readable theme colors",
  );

  const lowContrastSingleTextValidation = validateDashboardSpec({
    logicalId: "low_contrast_single_text_dashboard",
    components: [
      {
        componentName: "SingleText",
        logicalId: "low_contrast_single_text",
        textContent: "局部文字对比度检查",
        style: {
          position: "absolute",
          left: 24,
          top: 24,
          width: 220,
          height: 16,
          fontSize: 16,
          color: "#777777",
          backgroundColor: "#888888",
        },
      },
      {
        componentName: "SingleText",
        logicalId: "acceptable_large_text",
        textContent: "大字号文字",
        style: {
          position: "absolute",
          left: 24,
          top: 64,
          width: 180,
          height: 20,
          fontSize: 20,
          fontWeight: "bold",
          color: "#8A8A8A",
          backgroundColor: "#FFFFFF",
        },
      },
    ],
  } as JsonObject);
  assert.equal(lowContrastSingleTextValidation.valid, true);
  assert.ok(
    (lowContrastSingleTextValidation.warnings as string[]).some((warning) =>
      warning.includes("components[0] SingleText contrast"),
    ),
    "DashboardSpec validation should warn about low-contrast SingleText colors",
  );
  assert.equal(
    (lowContrastSingleTextValidation.warnings as string[]).some((warning) =>
      warning.includes("components[1] SingleText contrast"),
    ),
    false,
    "DashboardSpec validation should use the lower WCAG threshold for large text",
  );

  const crampedSingleTextValidation = validateDashboardSpec({
    logicalId: "cramped_single_text_dashboard",
    components: [
      {
        componentName: "SingleText",
        logicalId: "cramped_single_text",
        textContent: "设备综合运行状态存在异常需要立即处理",
        style: {
          position: "absolute",
          left: 24,
          top: 24,
          width: 96,
          height: 18,
          fontSize: 18,
          lineHeight: 1,
        },
      },
      {
        componentName: "SingleText",
        logicalId: "fitting_single_text",
        textContent: "运行正常",
        style: {
          position: "absolute",
          left: 24,
          top: 64,
          width: 120,
          height: 18,
          fontSize: 18,
          lineHeight: 1,
        },
      },
    ],
  } as JsonObject);
  assert.equal(crampedSingleTextValidation.valid, true);
  assert.ok(
    (crampedSingleTextValidation.warnings as string[]).some((warning) =>
      warning.includes("components[0] SingleText content needs about") &&
      warning.includes("text may overflow or be clipped"),
    ),
    "DashboardSpec validation should warn when SingleText content cannot fit its declared box",
  );
  assert.equal(
    (crampedSingleTextValidation.warnings as string[]).some((warning) =>
      warning.includes("components[1] SingleText content needs about"),
    ),
    false,
    "DashboardSpec validation should not warn when SingleText content fits its declared box",
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
