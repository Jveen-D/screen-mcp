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

  const guardedLayoutTree = generateDashboardSchema({
    logicalId: "guarded_layout_dashboard",
    title: "布局保护大屏",
    canvas: {
      width: 960,
      height: 540,
    },
    grouping: {
      mode: "semantic",
      singleChildGroup: true,
    },
    groups: [
      {
        logicalId: "guarded_trend_group",
        title: "综合趋势",
        style: {
          position: "absolute",
          left: 120,
          top: 96,
          width: 520,
          height: 320,
        },
        components: [
          {
            componentName: "SingleText",
            logicalId: "guarded_trend_title",
            name: "单行文本",
            textContent: "综合趋势",
            style: {
              position: "absolute",
              left: 144,
              top: 116,
              width: 180,
              height: 20,
              fontSize: 20,
              lineHeight: 1,
            },
          },
          {
            componentName: "BarChart",
            logicalId: "guarded_trend_chart",
            name: "综合趋势图",
            chartData: {
              constant: {
                data: [
                  { name: "阶段A", type: "指标值", value: 42 },
                  { name: "阶段B", type: "指标值", value: 58 },
                  { name: "阶段C", type: "指标值", value: 64 },
                ],
              },
            },
            style: {
              position: "absolute",
              left: 120,
              top: 96,
              width: 520,
              height: 320,
            },
            option: {
              grid: {
                left: 58,
                top: 30,
                right: 28,
                bottom: 38,
              },
              legend: {
                show: false,
              },
            },
          },
          {
            componentName: "SingleText",
            logicalId: "guarded_trend_insight",
            textContent: "当前阶段运行平稳",
            style: {
              position: "absolute",
              left: 390,
              top: 140,
              width: 210,
              height: 16,
              fontSize: 14,
              lineHeight: 1,
            },
          },
          {
            componentName: "SingleText",
            logicalId: "guarded_trend_note",
            textContent: "阶段变化保持稳定，底部说明需要独立可读。",
            style: {
              position: "absolute",
              left: 144,
              top: 380,
              width: 420,
              height: 16,
              fontSize: 14,
              lineHeight: 1,
            },
          },
        ],
      },
    ],
  } as JsonObject);
  const guardedGroup = guardedLayoutTree.children.find(
    (item) => item.componentName === "__Group__" && item.title === "综合趋势",
  );
  assert.ok(
    guardedGroup && Array.isArray(guardedGroup.children),
    "DashboardSpec should compile guarded explicit group",
  );
  const guardedGroupChildren = Array.isArray(guardedGroup?.children)
    ? guardedGroup.children
    : [];
  const guardedTitleGroup = guardedGroupChildren.find(
    (item) => item.componentName === "__Group__" && item.title === "标题",
  );
  assert.ok(
    guardedTitleGroup &&
      flattenEditorNodes(guardedTitleGroup as unknown as JsonObject).some((item) =>
        nodeProps(item).textContent === "综合趋势",
      ),
    "DashboardSpec should bucket explicit group title text by matching group title",
  );
  const guardedNodes = flattenEditorNodes(guardedLayoutTree as unknown as JsonObject);
  const guardedChart = guardedNodes.find((item) => item.componentName === "BarChart");
  const guardedChartOption = nodeProps(guardedChart).option as JsonObject;
  const guardedChartGrid = guardedChartOption.grid as JsonObject;
  assert.ok(
    typeof guardedChartGrid.top === "number" &&
      guardedChartGrid.top >= 66 &&
      guardedChartGrid.top < 90,
    `DashboardSpec should reserve only the measured top text space instead of a large fixed grid gap; received ${String(guardedChartGrid.top)}`,
  );
  assert.ok(
    typeof guardedChartGrid.bottom === "number" && guardedChartGrid.bottom >= 74,
    "DashboardSpec should reserve cartesian grid bottom space for same-group bottom text",
  );

  const visualGuardTree = generateDashboardSchema({
    logicalId: "visual_guard_dashboard",
    title: "视觉保护大屏",
    canvas: {
      width: 960,
      height: 640,
    },
    grouping: {
      mode: "semantic",
      singleChildGroup: true,
    },
    groups: [
      {
        logicalId: "circular_center_group",
        title: "结构分析",
        style: {
          position: "absolute",
          left: 80,
          top: 80,
          width: 560,
          height: 320,
        },
        components: [
          {
            componentName: "RingChart",
            logicalId: "circular_center_chart",
            name: "结构环图",
            chartData: {
              constant: {
                data: [
                  { name: "类别A", type: "分类", value: 42 },
                  { name: "类别B", type: "分类", value: 28 },
                  { name: "类别C", type: "分类", value: 18 },
                  { name: "类别D", type: "分类", value: 12 },
                ],
              },
            },
            style: {
              position: "absolute",
              left: 80,
              top: 80,
              width: 500,
              height: 300,
            },
            option: {
              legend: {
                show: true,
                top: "bottom",
                left: "center",
                offsetY: -2,
              },
              series: [
                {
                  center: ["50%", "45%"],
                  radius: ["22%", "46%"],
                },
              ],
            },
          },
          {
            componentName: "SingleText",
            logicalId: "circular_center_value",
            textContent: "12,876万",
            style: {
              position: "absolute",
              left: 246,
              top: 235,
              width: 120,
              height: 26,
              fontSize: 26,
              lineHeight: 1,
              textAlign: "center",
            },
          },
          {
            componentName: "SingleText",
            logicalId: "circular_center_label",
            textContent: "结构总量",
            style: {
              position: "absolute",
              left: 254,
              top: 264,
              width: 96,
              height: 14,
              fontSize: 14,
              lineHeight: 1,
              textAlign: "center",
            },
          },
          {
            componentName: "SingleText",
            logicalId: "circular_bottom_note",
            textContent: "结构分布保持稳定。",
            style: {
              position: "absolute",
              left: 112,
              top: 356,
              width: 220,
              height: 14,
              fontSize: 14,
              lineHeight: 1,
            },
          },
        ],
      },
      {
        logicalId: "unit_label_group",
        title: "单位标签保护",
        style: {
          position: "absolute",
          left: 80,
          top: 420,
          width: 360,
          height: 180,
        },
        components: [
          {
            componentName: "SingleText",
            logicalId: "unit_label_title",
            textContent: "单位标签保护",
            style: {
              position: "absolute",
              left: 104,
              top: 436,
              width: 180,
              height: 18,
              fontSize: 18,
              lineHeight: 1,
            },
          },
          {
            componentName: "SingleText",
            logicalId: "orphan_unit_text",
            textContent: "万",
            style: {
              position: "absolute",
              left: 104,
              top: 466,
              width: 18,
              height: 14,
              fontSize: 14,
              lineHeight: 1,
            },
          },
          {
            componentName: "SingleText",
            logicalId: "unit_copy_text",
            textContent: "指标持续提升，保持稳定。",
            style: {
              position: "absolute",
              left: 112,
              top: 466,
              width: 220,
              height: 14,
              fontSize: 14,
              lineHeight: 1,
            },
          },
          {
            componentName: "BarChart",
            logicalId: "unit_axis_chart",
            name: "单位图表",
            chartData: {
              constant: {
                data: [
                  { name: "甲", type: "指标值", value: 120 },
                  { name: "乙", type: "指标值", value: 98 },
                ],
              },
            },
            style: {
              position: "absolute",
              left: 80,
              top: 420,
              width: 360,
              height: 180,
            },
            option: {
              grid: {
                left: 48,
                top: 80,
                right: 24,
                bottom: 42,
              },
              yAxis: {
                name: "万",
              },
            },
          },
        ],
      },
      {
        logicalId: "funnel_balance_group",
        title: "漏斗分析",
        style: {
          position: "absolute",
          left: 500,
          top: 420,
          width: 380,
          height: 180,
        },
        components: [
          {
            componentName: "FunnelChart",
            logicalId: "small_funnel_chart",
            name: "过程漏斗",
            data: [
              { name: "阶段A", value: 100 },
              { name: "阶段B", value: 62 },
              { name: "阶段C", value: 28 },
            ],
            style: {
              position: "absolute",
              left: 520,
              top: 494,
              width: 120,
              height: 72,
            },
          },
          {
            componentName: "SingleText",
            logicalId: "funnel_rate_text",
            textContent: "转化率 9.8%",
            style: {
              position: "absolute",
              left: 704,
              top: 470,
              width: 88,
              height: 24,
              fontSize: 24,
              lineHeight: 1,
            },
          },
          {
            componentName: "SingleText",
            logicalId: "funnel_note_text",
            textContent: "关键节点需要继续跟进。",
            style: {
              position: "absolute",
              left: 704,
              top: 490,
              width: 150,
              height: 14,
              fontSize: 14,
              lineHeight: 1,
            },
          },
        ],
      },
    ],
  } as JsonObject);
  const visualGuardNodes = flattenEditorNodes(visualGuardTree as unknown as JsonObject);
  const circularValue = visualGuardNodes.find(
    (item) => nodeProps(item).textContent === "12,876万",
  );
  const circularValueStyle = nodeProps(circularValue).style as JsonObject;
  assert.ok(
    Math.abs(((circularValueStyle.left as number) + (circularValueStyle.width as number) / 2) - 330) <= 2,
    "DashboardSpec should center numeric SingleText on circular chart center",
  );
  assert.ok(
    Math.abs(((circularValueStyle.top as number) + (circularValueStyle.height as number) / 2) - 215) <= 18,
    "DashboardSpec should keep circular chart center metric in the donut center band",
  );
  const circularLabel = visualGuardNodes.find(
    (item) => nodeProps(item).textContent === "结构总量",
  );
  const circularLabelStyle = nodeProps(circularLabel).style as JsonObject;
  assert.ok(
    (circularLabelStyle.top as number) >=
      (circularValueStyle.top as number) + (circularValueStyle.height as number) + 8,
    "DashboardSpec should keep enough spacing inside circular chart center text stacks",
  );
  const circularChart = visualGuardNodes.find((item) => item.componentName === "RingChart");
  const circularChartOption = nodeProps(circularChart).option as JsonObject;
  const circularLegend = circularChartOption.legend as JsonObject;
  assert.ok(
    (circularLegend.offsetY as number) <= -32,
    "DashboardSpec should keep the circular bottom legend at least eight pixels above the conclusion text",
  );
  const circularSeries = (circularChartOption.series as JsonObject[])[0] as JsonObject;
  const circularRadius = circularSeries.radius as string[];
  assert.ok(
    Number(circularRadius[0].replace("%", "")) >= 45 &&
      Number(circularRadius[1].replace("%", "")) >= 54,
    "DashboardSpec should enlarge ring chart center holes when center text stacks need more readable space",
  );

  const orphanUnit = visualGuardNodes.find(
    (item) => nodeProps(item).textContent === "万",
  );
  const orphanUnitStyle = nodeProps(orphanUnit).style as JsonObject;
  assert.ok(
    (orphanUnitStyle.top as number) >= 480,
    "DashboardSpec should separate orphan unit text from top explanatory copy",
  );
  const unitAxisChart = visualGuardNodes.find((item) => item.componentName === "BarChart");
  const unitAxisOption = nodeProps(unitAxisChart).option as JsonObject;
  assert.equal(
    ((unitAxisOption.yAxis as JsonObject).name as string | undefined) ?? "",
    "",
    "DashboardSpec should remove short cartesian axis unit names that render as orphan labels",
  );

  const smallFunnel = visualGuardNodes.find((item) => item.componentName === "FunnelChart");
  const smallFunnelStyle = nodeProps(smallFunnel).style as JsonObject;
  assert.ok(
    (smallFunnelStyle.width as number) >= 140 && (smallFunnelStyle.height as number) >= 86,
    "DashboardSpec should enlarge undersized funnel charts when module space is available",
  );
  const funnelRate = visualGuardNodes.find(
    (item) => nodeProps(item).textContent === "转化率 9.8%",
  );
  const funnelRateStyle = nodeProps(funnelRate).style as JsonObject;
  assert.ok(
    (funnelRateStyle.width as number) > 88,
    "DashboardSpec should widen single-line metric text to avoid internal wrapping",
  );
  const funnelNote = visualGuardNodes.find(
    (item) => nodeProps(item).textContent === "关键节点需要继续跟进。",
  );
  const funnelNoteStyle = nodeProps(funnelNote).style as JsonObject;
  assert.ok(
    (funnelNoteStyle.top as number) >=
      (funnelRateStyle.top as number) + (funnelRateStyle.height as number) + 6,
    "DashboardSpec should separate overlapping same-column text boxes",
  );

  const fitGuardTree = generateDashboardSchema({
    logicalId: "fit_guard_dashboard",
    title: "适配保护大屏",
    canvas: {
      width: 960,
      height: 640,
    },
    grouping: {
      mode: "semantic",
      singleChildGroup: true,
    },
    groups: [
      {
        logicalId: "circular_side_annotation_group",
        title: "环图说明避让",
        style: {
          position: "absolute",
          left: 40,
          top: 60,
          width: 420,
          height: 260,
        },
        components: [
          {
            componentName: "RingChart",
            logicalId: "side_annotation_ring",
            chartData: {
              constant: {
                data: [
                  { name: "类别A", type: "结构", value: 42 },
                  { name: "类别B", type: "结构", value: 28 },
                  { name: "类别C", type: "结构", value: 18 },
                  { name: "类别D", type: "结构", value: 12 },
                ],
              },
            },
            style: {
              position: "absolute",
              left: 40,
              top: 60,
              width: 420,
              height: 260,
            },
            option: {
              legend: {
                show: true,
                top: "bottom",
                left: "center",
              },
              series: [
                {
                  center: ["50%", "38%"],
                  radius: ["18%", "42%"],
                  label: {
                    show: true,
                    position: "outside",
                  },
                  labelLine: {
                    show: true,
                  },
                },
              ],
            },
          },
          {
            componentName: "SingleText",
            logicalId: "side_annotation_center_value",
            textContent: "36.3%",
            style: {
              position: "absolute",
              left: 205,
              top: 147,
              width: 90,
              height: 24,
              fontSize: 24,
              lineHeight: 1,
              textAlign: "center",
            },
          },
          {
            componentName: "SingleText",
            logicalId: "side_annotation_center_label",
            textContent: "主类占比",
            style: {
              position: "absolute",
              left: 142,
              top: 228,
              width: 90,
              height: 14,
              fontSize: 14,
              lineHeight: 1,
              textAlign: "center",
            },
          },
          {
            componentName: "SingleText",
            logicalId: "ring_side_note",
            textContent: "主类别贡献42%，说明文本占用侧边空间",
            style: {
              position: "absolute",
              left: 286,
              top: 126,
              width: 150,
              height: 14,
              fontSize: 14,
              lineHeight: 1,
            },
          },
        ],
      },
      {
        logicalId: "top_legend_group",
        title: "顶部图例避让",
        style: {
          position: "absolute",
          left: 500,
          top: 60,
          width: 400,
          height: 260,
        },
        components: [
          {
            componentName: "SingleText",
            logicalId: "top_right_note",
            textContent: "本月指标同比提升",
            style: {
              position: "absolute",
              left: 710,
              top: 78,
              width: 170,
              height: 16,
              fontSize: 14,
              lineHeight: 1,
            },
          },
          {
            componentName: "LineChart",
            logicalId: "top_legend_line",
            chartData: {
              constant: {
                data: [
                  { name: "1月", type: "实际值", value: 120 },
                  { name: "1月", type: "目标值", value: 110 },
                  { name: "2月", type: "实际值", value: 160 },
                  { name: "2月", type: "目标值", value: 140 },
                ],
              },
            },
            style: {
              position: "absolute",
              left: 500,
              top: 60,
              width: 400,
              height: 260,
            },
            option: {
              grid: {
                left: 48,
                top: 64,
                right: 24,
                bottom: 48,
              },
              legend: {
                show: true,
                top: "top",
                left: "center",
                offsetX: 110,
                offsetY: 0,
              },
              series: [
                { name: "实际值" },
                { name: "目标值" },
              ],
            },
          },
        ],
      },
      {
        logicalId: "table_fit_group",
        title: "表格列宽保护",
        style: {
          position: "absolute",
          left: 40,
          top: 360,
          width: 420,
          height: 220,
        },
        components: [
          {
            componentName: "BaseTable",
            logicalId: "fit_base_table",
            style: {
              position: "absolute",
              left: 64,
              top: 410,
              width: 340,
              height: 130,
            },
            columns: [
              { field: "customer", label: "客户" },
              { field: "region", label: "区域" },
              { field: "amount", label: "成交额", type: "number" },
              { field: "stage", label: "状态" },
            ],
            data: [
              { customer: "星河制造集团", region: "华东", amount: 860, stage: "合同执行" },
              { customer: "云帆零售", region: "华南", amount: 720, stage: "已回款" },
            ],
            columnSpace: 8,
            columnConfig: {
              sequenceCol: {
                isShowCount: true,
                columnWidth: 44,
              },
              ordinaryCol: {
                columnWidth: 72,
              },
            },
          },
        ],
      },
      {
        logicalId: "zindex_guard_group",
        title: "层级保护",
        style: {
          position: "absolute",
          left: 500,
          top: 360,
          width: 360,
          height: 160,
        },
        components: [
          {
            componentName: "Indicator",
            logicalId: "zindex_indicator",
            textValue: 128760,
            suffix: true,
            suffixTitle: "万",
            style: {
              position: "absolute",
              left: 520,
              top: 410,
              width: 300,
              height: 64,
              zIndex: 1,
            },
          },
          {
            componentName: "SvgDecoration",
            logicalId: "zindex_decoration",
            name: "前景结构线",
            svgSource: "custom",
            svgContent:
              '<svg viewBox="0 0 360 64" xmlns="http://www.w3.org/2000/svg"><path d="M0 8H360" stroke="currentColor" stroke-width="2"/></svg>',
            style: {
              position: "absolute",
              left: 500,
              top: 400,
              width: 360,
              height: 64,
              zIndex: 503,
            },
          },
        ],
      },
    ],
  } as JsonObject);
  const fitGuardNodes = flattenEditorNodes(fitGuardTree as unknown as JsonObject);
  const guardedRing = fitGuardNodes.find((item) => item.componentName === "RingChart");
  const guardedRingOption = nodeProps(guardedRing).option as JsonObject;
  const guardedRingSeries = (guardedRingOption.series as JsonObject[])[0] as JsonObject;
  assert.equal(
    (guardedRingSeries.label as JsonObject).show,
    false,
    "DashboardSpec should hide circular outside labels when side annotation text uses the same side space",
  );
  assert.equal(
    (guardedRingSeries.labelLine as JsonObject).show,
    false,
    "DashboardSpec should hide circular label lines with suppressed outside labels",
  );
  const sideAnnotationValue = fitGuardNodes.find(
    (item) => nodeProps(item).textContent === "36.3%",
  );
  const sideAnnotationLabel = fitGuardNodes.find(
    (item) => nodeProps(item).textContent === "主类占比",
  );
  const sideAnnotationValueStyle = nodeProps(sideAnnotationValue).style as JsonObject;
  const sideAnnotationLabelStyle = nodeProps(sideAnnotationLabel).style as JsonObject;
  assert.ok(
    Math.abs(
      ((sideAnnotationValueStyle.left as number) + (sideAnnotationValueStyle.width as number) / 2) -
        ((sideAnnotationLabelStyle.left as number) + (sideAnnotationLabelStyle.width as number) / 2),
    ) <= 2,
    "DashboardSpec should align displaced circular center labels with the center metric",
  );
  assert.ok(
    (sideAnnotationLabelStyle.top as number) >=
      (sideAnnotationValueStyle.top as number) + (sideAnnotationValueStyle.height as number) + 6,
    "DashboardSpec should stack displaced circular center labels below the center metric",
  );

  const guardedLine = fitGuardNodes.find((item) => item.componentName === "LineChart");
  const guardedLineOption = nodeProps(guardedLine).option as JsonObject;
  assert.ok(
    ((guardedLineOption.legend as JsonObject).offsetY as number) >= 40,
    "DashboardSpec should move top legends below overlapping top auxiliary text",
  );
  assert.ok(
    ((guardedLineOption.grid as JsonObject).top as number) >= 74,
    "DashboardSpec should keep cartesian plot area below the shifted top legend",
  );

  const guardedTable = fitGuardNodes.find((item) => item.componentName === "BaseTable");
  const guardedTableProps = nodeProps(guardedTable);
  const guardedTableStyle = guardedTableProps.style as JsonObject;
  assert.ok(
    (guardedTableStyle.width as number) >= 380,
    "DashboardSpec should expand narrow tables to the panel safe right edge",
  );
  const guardedTableColumnConfig = guardedTableProps.columnConfig as JsonObject;
  const guardedTableOrdinaryCol = guardedTableColumnConfig.ordinaryCol as JsonObject;
  assert.ok(
    (guardedTableOrdinaryCol.columnWidth as number) >= 80,
    "DashboardSpec should recompute table ordinary column width after table expansion",
  );
  const zIndexIndicator = fitGuardNodes.find((item) => item.componentName === "Indicator");
  const zIndexDecoration = fitGuardNodes.find(
    (item) => item.componentName === "SvgDecoration" && nodeProps(item).name === "前景结构线",
  );
  const zIndexIndicatorStyle = nodeProps(zIndexIndicator).style as JsonObject;
  const zIndexDecorationStyle = nodeProps(zIndexDecoration).style as JsonObject;
  assert.ok(
    (zIndexIndicatorStyle.zIndex as number) > (zIndexDecorationStyle.zIndex as number),
    "DashboardSpec should keep main Indicator content above foreground decorations",
  );
  assert.ok(
    (zIndexDecorationStyle.zIndex as number) <= 10,
    "DashboardSpec should lower non-background decorations below main content",
  );

  const indicatorTitleTree = generateDashboardSchema({
    logicalId: "indicator_title_dashboard",
    title: "指标标题拆分大屏",
    canvas: {
      width: 640,
      height: 240,
    },
    grouping: {
      mode: "semantic",
      singleChildGroup: true,
    },
    groups: [
      {
        logicalId: "indicator_title_group",
        title: "指标标题拆分",
        style: {
          position: "absolute",
          left: 20,
          top: 20,
          width: 600,
          height: 140,
        },
        components: [
          {
            componentName: "Indicator",
            logicalId: "real_title_indicator",
            name: "累计收入",
            titleVisible: true,
            titleName: "累计收入",
            textValue: 12876,
            suffix: true,
            suffixTitle: "万",
            style: {
              position: "absolute",
              left: 48,
              top: 56,
              width: 260,
              height: 76,
            },
            titleStyle: {
              fontSize: 16,
              color: "#8BA9BC",
              lineHeight: 1,
            },
            numberStyle: {
              fontSize: 42,
              lineHeight: 1,
            },
          },
          {
            componentName: "Indicator",
            logicalId: "generic_title_indicator",
            textValue: 42,
            style: {
              position: "absolute",
              left: 340,
              top: 56,
              width: 180,
              height: 76,
            },
          },
        ],
      },
    ],
  } as JsonObject);
  const indicatorTitleNodes = flattenEditorNodes(indicatorTitleTree as unknown as JsonObject);
  const externalIndicatorTitle = indicatorTitleNodes.find(
    (item) => item.componentName === "SingleText" && nodeProps(item).textContent === "累计收入",
  );
  assert.ok(
    externalIndicatorTitle,
    "DashboardSpec should externalize real Indicator titleName as a SingleText sibling",
  );
  const externalIndicatorTitleStyle = nodeProps(externalIndicatorTitle).style as JsonObject;
  const realTitleIndicator = indicatorTitleNodes.find(
    (item) => item.componentName === "Indicator" && nodeProps(item).titleName === "累计收入",
  );
  const realTitleIndicatorProps = nodeProps(realTitleIndicator);
  const realTitleIndicatorStyle = realTitleIndicatorProps.style as JsonObject;
  assert.equal(
    realTitleIndicatorProps.titleVisible,
    false,
    "DashboardSpec should disable Indicator internal title after externalizing it",
  );
  assert.ok(
    (realTitleIndicatorStyle.top as number) >=
      (externalIndicatorTitleStyle.top as number) + (externalIndicatorTitleStyle.height as number) + 4,
    "DashboardSpec should move Indicator value area below the external title text",
  );
  assert.equal(
    indicatorTitleNodes.some(
      (item) =>
        item.componentName === "SingleText" &&
        ["翻牌器", "指标", "数值"].includes(nodeProps(item).textContent as string),
    ),
    false,
    "DashboardSpec should not externalize generic default Indicator titles",
  );
  const genericTitleIndicator = indicatorTitleNodes.find(
    (item) =>
      item.componentName === "Indicator" &&
      typeof item.id === "string" &&
      item.id.startsWith("generic_title_indicator"),
  );
  assert.equal(
    nodeProps(genericTitleIndicator).titleVisible,
    false,
    "DashboardSpec should hide generic Indicator title placeholders",
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
