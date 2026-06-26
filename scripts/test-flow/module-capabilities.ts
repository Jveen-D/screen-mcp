
import assert from "node:assert/strict";
import { getModuleCapability, listModules } from "../../src/core/modules.js";
import type { JsonObject } from "../../src/types/component.js";

export function runModuleCapabilityTests(): void {
  const modules = listModules();
  assert.ok(
    modules.some((moduleItem) => moduleItem.moduleName === "ChartPanel"),
    "list_modules should include ChartPanel",
  );
  assert.ok(
    modules.some((moduleItem) => moduleItem.moduleName === "FreeformModule"),
    "list_modules should include FreeformModule",
  );

  const moduleCapability = getModuleCapability("ChartPanel");
  assert.ok(moduleCapability.slots, "ChartPanel capability should include slots");
  const moduleLayoutRules = moduleCapability.layoutRules as string[];
  const moduleLayoutRuleGroups = moduleCapability.layoutRuleGroups as JsonObject[];
  assert.ok(
    Array.isArray(moduleLayoutRuleGroups),
    "ChartPanel capability should include grouped layout rules",
  );
  const layoutRuleGroupCategories = moduleLayoutRuleGroups.map(
    (group) => group.category,
  );
  assert.ok(
    layoutRuleGroupCategories.includes("legend"),
    "ChartPanel grouped rules should include legend category",
  );
  assert.ok(
    layoutRuleGroupCategories.includes("schema-output-layering"),
    "ChartPanel grouped rules should include schema output layering category",
  );
  assert.ok(
    layoutRuleGroupCategories.includes("side-summary-and-data-semantics"),
    "ChartPanel grouped rules should include side summary semantics category",
  );
  assert.ok(
    layoutRuleGroupCategories.includes("svg-decoration-structure"),
    "ChartPanel grouped rules should include SVG decoration structure category",
  );
  assert.ok(
    moduleLayoutRuleGroups.every((group) =>
      ["must", "should", "niceToHave"].includes(group.priority as string),
    ),
    "ChartPanel grouped rules should use known priority values",
  );
  assert.deepEqual(
    moduleLayoutRuleGroups.flatMap((group) => group.rules as string[]),
    moduleLayoutRules,
    "ChartPanel grouped rules should flatten to layoutRules for compatibility",
  );
  const legendRuleGroup = moduleLayoutRuleGroups.find(
    (group) => group.category === "legend",
  );
  assert.ok(
    (legendRuleGroup?.rules as string[] | undefined)?.some((rule) =>
      rule.includes("legend 默认必须保留"),
    ),
    "legend grouped rules should include default retention",
  );
  assert.ok(
    (legendRuleGroup?.rules as string[] | undefined)?.some((rule) =>
      rule.includes("预判 legend 是否会换行"),
    ),
    "legend grouped rules should include wrapping forecast",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("连续的主横线")),
    "ChartPanel should guide bottom decorations as one continuous structure line",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("面板框架的一部分")),
    "ChartPanel should guide decorations as panel frame elements",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("避免大面积高亮实色标题底板")),
    "ChartPanel should guide title structure without heavy filled title slabs",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("上层需求可能很简略")),
    "ChartPanel should cover terse upstream requirements",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("MCP 不再自动生成标题承托")),
    "ChartPanel should document that structure decoration is LLM-authored",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("最终用户通常不会主动提入场动画")),
    "ChartPanel should add restrained entry animations by default",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("ChartPanel 默认动画策略")),
    "ChartPanel should document default animation strategy",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("SingleImage") && rule.includes("遮盖")),
    "ChartPanel should keep image components below visible content",
  );
  assert.ok(
    moduleLayoutRules.some(
      (rule) => rule.includes("最长 50 个字符") && rule.includes("短随机段"),
    ),
    "ChartPanel should document backend id length and random segment requirements",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("不要太花")),
    "ChartPanel should interpret simple style requests without removing structure",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("不应只输出裸标题")),
    "ChartPanel should forbid bare layouts even when concise",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("轻量线性承托")),
    "ChartPanel should prefer lightweight title support",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("亮色牌子")),
    "ChartPanel should avoid detached bright title slabs",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("填充透明度应低于 0.18")),
    "ChartPanel should constrain title support fill opacity",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("按语义选择实心饼图、环形图或细环")),
    "ChartPanel should guide semantic pie shape choices",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("不要固定套用某一张设计稿")),
    "ChartPanel should avoid fixed design comp parameters",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("中心总数") && rule.includes("排在 PieChart 之前")),
    "ChartPanel should keep center total text above PieChart",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("分工展示")),
    "ChartPanel should guide information role separation",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("至少应显式提供 1 条辅助文本")),
    "ChartPanel should require an explicit business auxiliary text layer",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("数据复读")),
    "ChartPanel should prevent side summaries from merely repeating legend data",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("MCP 规则不能按行业关键词固定短语")),
    "ChartPanel should avoid fixed industry-specific side summary phrases",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("formatter: \"{b}\"")),
    "ChartPanel should prefer lighter pie labels when summaries carry values",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("show=true")),
    "ChartPanel should keep external pie labels visible but lightweight when side summaries carry values",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("legend 默认必须保留")),
    "ChartPanel should keep PieChart legend by default",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("朴素原生小圆点列表")),
    "ChartPanel should style legend beyond native plain dots",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("视觉重量必须低于主图")),
    "ChartPanel should keep legend visually subordinate",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("右侧信息卡不是 legend")),
    "ChartPanel should prevent side summary cards from being named as legends",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("标题不能压在边框线上")),
    "ChartPanel should keep side-card heading clear of the border",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("按摘要文本行的 top")),
    "ChartPanel should align side summary row rules from text row coordinates",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("预判 legend 是否会换行")),
    "ChartPanel should forecast legend wrapping from chart size and data items",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("主图数据必须和中心摘要")),
    "ChartPanel should require main chart data to match summary cards",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("保留原始分类名")),
    "ChartPanel should preserve source category labels in side summaries",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("分类名 + 数值 + 占比")),
    "ChartPanel should define side summary two-line text structure",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("正文区域宽度不低于 180px")),
    "ChartPanel should reserve enough side summary text width",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("不应按行业关键词替换")),
    "ChartPanel should preserve category labels without keyword-based phrase replacement",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("信息分工策略")),
    "ChartPanel should treat side cards as information hierarchy, not legend crowding fix",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("连接线应短、少、淡")),
    "ChartPanel should reduce connector line noise",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("只表达区域关联")),
    "ChartPanel should treat side-card connector lines as structural only",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("落到侧边信息卡左边缘")),
    "ChartPanel should anchor connector lines to the side-card edge",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("避免穿过环形图中心")),
    "ChartPanel should keep side-card connectors out of the donut center",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("底部结论默认使用主文本色")),
    "ChartPanel should keep bottom conclusions visually subordinate",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("底部结论默认是单行 SingleText")),
    "ChartPanel should keep bottom conclusion as a single-line text box",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("AI 必须提供至少标题承托")),
    "ChartPanel should require LLM-authored lightweight structure",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("侧边摘要色标")),
    "ChartPanel should keep side summary color anchors visible",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("不同业务场景不要套用固定结论文案")),
    "ChartPanel should avoid fixed copy across business contexts",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("两行排版")),
    "ChartPanel should adapt side-card rows for longer summary text",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("legend 预估行数收缩")),
    "ChartPanel should tighten pie labels according to estimated legend line count",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("真实业务术语")),
    "ChartPanel should preserve user-provided business terms",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("装饰透明度应主动降低")),
    "ChartPanel should keep decorations below key information",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("业务文本必须使用")),
    "ChartPanel should require real text components for business text",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("禁止用 SvgDecoration")),
    "ChartPanel should forbid SVG-drawn charts and text",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("不要因为禁止 SVG")),
    "ChartPanel should require decoration structures without SVG misuse",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("不使用 SVG 装饰")),
    "ChartPanel should not confuse SVG content bans with removing decorations",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("装饰必须由 AI 设计")),
    "ChartPanel should require visible LLM-authored SVG decorations",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("MCP 不再为缺少 svgContent")),
    "ChartPanel should not silently replace missing SVG design with built-in templates",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("不同大屏之间应通过 AI 自主设计产生差异")),
    "ChartPanel should avoid MCP-owned fixed decoration templates across dashboards",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("结构原则而不是固定图形")),
    "ChartPanel should preserve design autonomy beyond fixed default SVG paths",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("信息卡外框")),
    "ChartPanel should guide side-card shells as decoration",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("裸文字和裸图表")),
    "ChartPanel should avoid bare text and bare chart outputs",
  );
  assert.ok(
    moduleLayoutRules.some((rule) => rule.includes("禁止大面积高饱和纯色背景")),
    "ChartPanel should reject bright solid panel backgrounds",
  );
  const freeformModuleCapability = getModuleCapability("FreeformModule");
  assert.ok(freeformModuleCapability.slots, "FreeformModule capability should include slots");
  assert.equal(
    (freeformModuleCapability.groupSchema as JsonObject).componentName,
    "__Group__",
  );
  const freeformLayoutRules = freeformModuleCapability.layoutRules as string[];
  assert.ok(
    freeformLayoutRules.some((rule) => rule.includes("不提供任何固定布局")),
    "FreeformModule should not introduce templates",
  );
  assert.ok(
    freeformLayoutRules.some((rule) => rule.includes("grouping.singleChildGroup=true")),
    "FreeformModule should document single-child semantic grouping",
  );
}
