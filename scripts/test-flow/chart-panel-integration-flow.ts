import assert from "node:assert/strict";
import { generateModuleSchema, generateModuleTreeSchema } from "../../src/core/modules.js";
import { generateComponentsSchema } from "../../src/core/schema.js";
import type { JsonObject } from "../../src/types/component.js";

export function runChartPanelIntegrationTests(): void {
  // ChartPanel + ThreeDPieChart integration
  const threeDPanelInput = {
    moduleName: "ChartPanel",
    layoutMode: "assisted",
    logicalId: "status_3d_panel",
    parentLogicalId: "root",
    title: "状态分布3D分析",
    style: {
      left: 48,
      top: 96,
      width: 520,
      height: 360,
      position: "absolute",
    },
    theme: {
      primaryColor: "#00E5FF",
      secondaryColor: "#7C4DFF",
      accentColor: "#FFB300",
      textColor: "#DFF8FF",
    },
    slots: {
      mainChart: {
        componentName: "ThreeDPieChart",
        props: {
          chartData: {
            constant: {
              data: [
                { name: "状态A", type: "状态", value: 12 },
                { name: "状态B", type: "状态", value: 28 },
                { name: "状态C", type: "状态", value: 56 },
              ],
            },
          },
          option: {
            threeDSettings: {
              depth: 24,
              topViewAngle: 55,
            },
          },
        },
      },
    },
  } satisfies JsonObject;

  const threeDModuleSchemas = generateModuleSchema(threeDPanelInput);
  assert.ok(
    threeDModuleSchemas.some((item) => item.componentName === "ThreeDPieChart"),
    "ChartPanel should support ThreeDPieChart as main chart",
  );
  const threeDMainChart = threeDModuleSchemas.find((item) => item.componentName === "ThreeDPieChart");
  const threeDMainChartOption = threeDMainChart?.props.option as JsonObject;
  assert.equal(threeDMainChartOption.backgroundColor, "transparent");
  assert.ok(
    threeDMainChartOption.threeDSettings !== null && typeof threeDMainChartOption.threeDSettings === "object" && !Array.isArray(threeDMainChartOption.threeDSettings),
    "ChartPanel ThreeDPieChart should have threeDSettings",
  );
  assert.equal((threeDMainChartOption.threeDSettings as JsonObject).depth, 24);
  assert.equal((threeDMainChartOption.threeDSettings as JsonObject).topViewAngle, 55);
  const threeDMainSeries = (threeDMainChartOption.series as JsonObject[])[0] as JsonObject;
  assert.equal((threeDMainSeries.label as JsonObject | undefined)?.show, false, "ChartPanel ThreeDPieChart label should default to false");
  assert.equal((threeDMainSeries.labelLine as JsonObject | undefined)?.show, false, "ChartPanel ThreeDPieChart labelLine should default to false");

  const threeDModuleTree = generateModuleTreeSchema(threeDPanelInput);
  assert.equal(threeDModuleTree.componentName, "__Group__");
  assert.ok(
    threeDModuleTree.children.some((item) => item.componentName === "ThreeDPieChart"),
    "ChartPanel tree should include ThreeDPieChart",
  );

  // Assisted mode keeps semantic helper texts/color anchors, but no fixed structure templates.
  const threeDSvgDecorations = threeDModuleSchemas.filter((item) => item.componentName === "SvgDecoration");
  assert.equal(
    threeDSvgDecorations.length,
    3,
    "ChartPanel ThreeDPieChart should include side summary color anchors only",
  );
  assert.equal(
    threeDSvgDecorations.some((d) => (d.props.name as string | undefined)?.includes("侧边摘要容器")),
    false,
    "3D panel should not synthesize side summary container decoration",
  );
  assert.equal(
    threeDSvgDecorations.some((d) => (d.props.name as string | undefined)?.includes("底部结构线")),
    false,
    "3D panel should not synthesize bottom structure line decoration",
  );
  assert.ok(
    threeDModuleSchemas.some((item) => item.componentName === "SingleText" && (item.props.name as string | undefined)?.includes("标题")),
    "3D panel should include title text",
  );
  assert.ok(
    threeDModuleSchemas.some((item) => item.componentName === "SingleText" && (item.props.name as string | undefined)?.includes("顶部结论")),
    "3D panel should include assisted conclusion text",
  );

  // ── LineChart panel assertions ───────────────────────────────
  const lineChartPanelInput = {
    moduleName: "ChartPanel",
    layoutMode: "assisted",
    logicalId: "metric_line_panel",
    parentLogicalId: "root",
    title: "季度指标趋势",
    style: {
      left: 48,
      top: 96,
      width: 520,
      height: 360,
      position: "absolute",
    },
    theme: {
      primaryColor: "#00E5FF",
      secondaryColor: "#7C4DFF",
      accentColor: "#FFB300",
      textColor: "#DFF8FF",
    },
    slots: {
      mainChart: {
        componentName: "LineChart",
        props: {
          chartData: {
            constant: {
              data: [
                { name: "Q1", value: 120 },
                { name: "Q2", value: 200 },
                { name: "Q3", value: 150 },
                { name: "Q4", value: 280 },
              ],
            },
          },
          option: {
            grid: { left: 40, top: 50, bottom: 40, right: 90 },
            tooltip: { formatter: "{b}<br/>指标值：{c}" },
            xAxis: { type: "category", data: ["Q1", "Q2", "Q3", "Q4"] },
            yAxis: { type: "value", name: "指标值", min: 0, max: 300, nameTextStyle: { color: "#BDEEFF" } },
            series: [
              {
                name: "2024",
                smooth: true,
                showSymbol: true,
                symbol: "circle",
                symbolSize: 6,
                areaStyle: { opacity: 0.2 },
                lineStyle: { width: 3, shadowBlur: 12, shadowColor: "rgba(34,211,238,0.72)" },
                itemStyle: { color: "#051024", borderColor: "#22D3EE", borderWidth: 3, shadowBlur: 8, shadowColor: "rgba(34,211,238,0.75)" },
                markPoint: { data: [{ type: "max" }, { type: "min" }] },
                markLine: { silent: true, data: [{ type: "average" }] },
              },
            ],
          },
        },
      },
    },
  } satisfies JsonObject;

  const lineModuleSchemas = generateModuleSchema(lineChartPanelInput);
  assert.ok(
    lineModuleSchemas.some((item) => item.componentName === "LineChart"),
    "ChartPanel should support LineChart as main chart",
  );
  const lineMainChart = lineModuleSchemas.find((item) => item.componentName === "LineChart");
  const lineMainChartOption = lineMainChart?.props.option as JsonObject;
  const lineMainChartStyle = lineMainChart?.props.style as JsonObject;
  assert.equal(lineMainChartOption.backgroundColor, "transparent");
  assert.equal(lineMainChartStyle.left, 48);
  assert.equal(lineMainChartStyle.top, 96);
  assert.equal(lineMainChartStyle.width, 520);
  assert.equal(
    lineMainChartStyle.height,
    360,
    "cartesian ChartPanel main chart should fill the module and use option.grid for plot safe areas",
  );
  assert.equal((lineMainChartOption.tooltip as JsonObject).trigger, "axis", "LineChart tooltip trigger should default to axis");
  assert.equal((lineMainChartOption.legend as JsonObject).show, true, "LineChart legend should default to show");
  const lineMainSeries = (lineMainChartOption.series as JsonObject[])[0] as JsonObject;
  assert.equal(lineMainSeries.type, "line", "LineChart series type should be line");
  assert.equal(lineMainSeries.smooth, true, "LineChart should preserve smooth from input");
  assert.ok(
    lineMainSeries.areaStyle !== null && typeof lineMainSeries.areaStyle === "object" && !Array.isArray(lineMainSeries.areaStyle),
    "LineChart should preserve areaStyle from input",
  );
  assert.equal((lineMainSeries.lineStyle as JsonObject).width, 3, "LineChart should preserve lineStyle width");
  assert.equal(lineMainSeries.symbol, "circle", "LineChart should preserve symbol from input");
  assert.equal(lineMainSeries.symbolSize, 6, "LineChart should preserve symbolSize from input");
  const lineXAxis = lineMainChartOption.xAxis as JsonObject;
  assert.equal(lineXAxis.type, "category", "LineChart xAxis type should default to category");
  const lineChartDataConstant = (lineMainChart?.props.chartData as JsonObject)?.constant as JsonObject | undefined;
  assert.ok(Array.isArray(lineXAxis.data) || Array.isArray(lineChartDataConstant?.data), "LineChart should have xAxis data or chartData");
  const lineYAxis = lineMainChartOption.yAxis as JsonObject;
  assert.equal(lineYAxis.type, "value", "LineChart yAxis type should default to value");
  assert.equal((lineYAxis.name as string | undefined), "指标值", "LineChart yAxis name should be preserved");
  assert.equal(lineYAxis.min, 0, "LineChart yAxis min should be preserved");
  assert.equal(lineYAxis.max, 300, "LineChart yAxis max should be preserved");
  assert.equal((lineYAxis.nameTextStyle as JsonObject)?.color, "#BDEEFF", "LineChart yAxis nameTextStyle should be preserved");
  assert.equal(lineMainSeries.showSymbol, true, "LineChart showSymbol should be preserved as boolean");
  assert.equal((lineMainSeries.itemStyle as JsonObject)?.color, "#051024", "LineChart itemStyle.color should be preserved");
  assert.equal((lineMainSeries.itemStyle as JsonObject)?.borderColor, "#22D3EE", "LineChart itemStyle.borderColor should be preserved");
  assert.equal((lineMainSeries.lineStyle as JsonObject)?.shadowBlur, 12, "LineChart lineStyle.shadowBlur should be preserved");
  assert.equal((lineMainSeries.lineStyle as JsonObject)?.shadowColor, "rgba(34,211,238,0.72)", "LineChart lineStyle.shadowColor should be preserved");
  assert.ok(
    lineMainSeries.markPoint !== null && typeof lineMainSeries.markPoint === "object" && !Array.isArray(lineMainSeries.markPoint),
    "LineChart markPoint should be preserved",
  );
  assert.ok(
    lineMainSeries.markLine !== null && typeof lineMainSeries.markLine === "object" && !Array.isArray(lineMainSeries.markLine),
    "LineChart markLine should be preserved",
  );
  assert.equal((lineMainChartOption.tooltip as JsonObject)?.formatter, "{b}<br/>指标值：{c}", "LineChart tooltip formatter should be preserved");
  const lineGrid = lineMainChartOption.grid as JsonObject;
  assert.equal(lineGrid.top, 72, "cartesian ChartPanel should use a compact title-safe grid.top");
  assert.equal(lineGrid.left, 40, "cartesian ChartPanel should preserve an explicit grid.left");
  assert.equal(lineGrid.bottom, 40, "cartesian ChartPanel should preserve an explicit grid.bottom");
  assert.equal(
    lineGrid.right,
    90,
    "cartesian ChartPanel should preserve an explicit grid.right",
  );
  const lineModuleTree = generateModuleTreeSchema(lineChartPanelInput);
  assert.equal(lineModuleTree.componentName, "__Group__");
  assert.ok(
    lineModuleTree.children.some((item) => item.componentName === "LineChart"),
    "ChartPanel tree should include LineChart",
  );

  // LineChart assisted mode should not invent structural SVG decorations.
  const lineSvgDecorations = lineModuleSchemas.filter((item) => item.componentName === "SvgDecoration");
  assert.equal(
    lineSvgDecorations.some((item) => (item.props.name as string | undefined)?.includes("侧边摘要容器")),
    false,
    "LineChart panel should not synthesize side summary container decoration",
  );
  assert.equal(
    lineSvgDecorations.some((item) => (item.props.name as string | undefined)?.includes("底部结构线")),
    false,
    "LineChart panel should not synthesize bottom structure line decoration",
  );
  assert.ok(
    lineModuleSchemas.some((item) => item.componentName === "SingleText" && (item.props.name as string | undefined)?.includes("标题")),
    "LineChart panel should include title text",
  );

  const typedLineSchema = generateComponentsSchema({
    componentName: "LineChart",
    logicalId: "typed_line_chart",
    parentLogicalId: "chart_group",
    name: "类型趋势图",
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
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 520,
      height: 320,
    },
    option: {
      series: [
        { name: "数值" },
        { name: "数值" },
      ],
    },
  } as JsonObject);
  const typedLineOption = typedLineSchema.props.option as JsonObject;
  const typedLineSeries = typedLineOption.series as JsonObject[];
  assert.deepEqual(
    typedLineSeries.map((item) => item.name),
    ["实际值", "目标值"],
    "LineChart should derive generic series names from chartData.type",
  );
  const typedLineChartData = typedLineSchema.props.chartData as JsonObject;
  const typedLineDimensions = typedLineChartData.dimension as JsonObject[];
  assert.deepEqual(
    typedLineDimensions.map((item) => item.fieldName),
    ["name", "type"],
    "LineChart should use chartData.type as a series dimension when multiple business types are present",
  );
  const typedLineIndicator = (typedLineChartData.indicator as JsonObject[])[0] as JsonObject;
  const typedLineFieldConfig = typedLineIndicator.fieldDataConfig as JsonObject;
  const typedLineFormat = typedLineFieldConfig.format as JsonObject;
  assert.equal(
    typedLineFormat.accuracy,
    0,
    "LineChart should render integer business values without redundant decimal places",
  );

  const integerBarSchema = generateComponentsSchema({
    componentName: "BarChart",
    logicalId: "integer_bar_chart",
    parentLogicalId: "chart_group",
    name: "整数柱图",
    chartData: {
      constant: {
        data: [
          { name: "区域A", type: "指标额", value: 34600 },
          { name: "区域B", type: "指标额", value: 28200 },
        ],
      },
    },
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 420,
      height: 280,
    },
    option: {
      series: [
        {
          name: "数值",
          label: {
            show: true,
            formatter: "{c}万",
          },
        },
      ],
    },
  } as JsonObject);
  const integerBarOption = integerBarSchema.props.option as JsonObject;
  const integerBarSeries = integerBarOption.series as JsonObject[];
  assert.equal(integerBarSeries[0]?.name, "指标额");
  const integerBarChartData = integerBarSchema.props.chartData as JsonObject;
  const integerBarIndicator = (integerBarChartData.indicator as JsonObject[])[0] as JsonObject;
  const integerBarFieldConfig = integerBarIndicator.fieldDataConfig as JsonObject;
  const integerBarFormat = integerBarFieldConfig.format as JsonObject;
  assert.equal(
    integerBarFormat.accuracy,
    0,
    "BarChart should render integer labels without redundant .00 decimals",
  );

  const typedBarSchema = generateComponentsSchema({
    componentName: "BarChart",
    logicalId: "typed_bar_chart",
    parentLogicalId: "chart_group",
    name: "类型柱图",
    chartData: {
      constant: {
        data: [
          { name: "区域A", type: "实际值", value: 34600 },
          { name: "区域A", type: "目标值", value: 32000 },
          { name: "区域B", type: "实际值", value: 28200 },
          { name: "区域B", type: "目标值", value: 27000 },
        ],
      },
    },
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 420,
      height: 280,
    },
    option: {
      series: [
        { name: "数值" },
        { name: "数值" },
      ],
    },
  } as JsonObject);
  const typedBarOption = typedBarSchema.props.option as JsonObject;
  const typedBarSeries = typedBarOption.series as JsonObject[];
  assert.deepEqual(
    typedBarSeries.map((item) => item.name),
    ["实际值", "目标值"],
    "BarChart should derive generic series names from chartData.type",
  );
  const typedBarChartData = typedBarSchema.props.chartData as JsonObject;
  const typedBarDimensions = typedBarChartData.dimension as JsonObject[];
  assert.deepEqual(
    typedBarDimensions.map((item) => item.fieldName),
    ["name", "type"],
    "BarChart should use chartData.type as a series dimension when multiple business types are present",
  );

  const fittedTableSchema = generateComponentsSchema({
    componentName: "BaseTable",
    logicalId: "fitted_base_table",
    parentLogicalId: "table_group",
    name: "列宽保护表格",
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 472,
      height: 260,
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
        columnWidth: 92,
      },
    },
  } as JsonObject);
  const fittedTableProps = fittedTableSchema.props as JsonObject;
  const fittedTableColumnConfig = fittedTableProps.columnConfig as JsonObject;
  const fittedTableOrdinaryCol = fittedTableColumnConfig.ordinaryCol as JsonObject;
  assert.ok(
    (fittedTableProps.columnSpace as number) <= 4,
    "BaseTable should compact column gaps when many columns fit in a narrow table",
  );
  assert.ok(
    (fittedTableOrdinaryCol.columnWidth as number) >= 100,
    "BaseTable should expand ordinary column width to use available table width",
  );
  assert.equal(fittedTableProps.emptyText, "暂无数据");
  assert.deepEqual((fittedTableProps.rowConfig as JsonObject).stripe, {
    isShow: true,
    backgroundColor: "rgba(93,124,139,0.12)",
  });
  assert.deepEqual((fittedTableProps.rowConfig as JsonObject).hover, {
    isShow: true,
    backgroundColor: "rgba(45,212,191,0.16)",
  });
  assert.equal(fittedTableOrdinaryCol.cellPadding, 12);
  assert.equal(fittedTableOrdinaryCol.showTooltip, true);
  assert.equal((fittedTableProps.headerConfig as JsonObject).fontSize, 13);
  const fittedTableSelectStyle = (fittedTableProps.rowConfig as JsonObject).selectStyle as JsonObject;
  assert.equal(fittedTableSelectStyle.fontSize, 13);
  assert.equal(fittedTableOrdinaryCol.fontSize, 13);

  const normalizedTableVisuals = generateComponentsSchema({
    componentName: "BaseTable",
    logicalId: "normalized_table_visuals",
    parentLogicalId: "table_group",
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      width: 520,
      height: 280,
    },
    columns: [{ field: "value", label: "数值", type: "number" }],
    data: [{ value: 0 }],
    columnConfig: {
      ordinaryCol: {
        cellPadding: 99,
        showTooltip: false,
      },
    },
  } as JsonObject);
  const normalizedTableProps = normalizedTableVisuals.props as JsonObject;
  const normalizedTableColumns = normalizedTableProps.columnConfig as JsonObject;
  assert.equal((normalizedTableColumns.ordinaryCol as JsonObject).cellPadding, 32);
  assert.equal((normalizedTableColumns.ordinaryCol as JsonObject).showTooltip, false);
  const normalizedTableChartData = normalizedTableProps.chartData as JsonObject;
  const normalizedTableConstant = normalizedTableChartData.constant as JsonObject;
  assert.equal((normalizedTableConstant.data as JsonObject[])[0]?.value, 0);
}
