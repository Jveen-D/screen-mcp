import type { JsonObject } from "../../types/component.js";
import { navMenuDefaultProps } from "./defaultProps.js";

function menuStyleFields(path: string, defaults: JsonObject): JsonObject[] {
  return [
    {
      path: `${path}.backgroundColor`,
      type: "color",
      defaultValue: defaults.backgroundColor,
      description: "菜单项背景颜色。",
    },
    {
      path: `${path}.color`,
      type: "color|string",
      defaultValue: defaults.color,
      description: "文字颜色，支持编辑器文字渐变字符串。",
    },
    {
      path: `${path}.iconColor`,
      type: "color",
      defaultValue: defaults.iconColor,
      description: "菜单项图标颜色。",
    },
    {
      path: `${path}.fontFamily`,
      type: "string",
      defaultValue: defaults.fontFamily,
      description: "字体族。",
    },
    {
      path: `${path}.fontSize`,
      type: "number",
      min: 8,
      max: 64,
      defaultValue: defaults.fontSize,
      description: "字号，单位 px。",
    },
    {
      path: `${path}.textAlign`,
      type: "enum",
      values: ["flex-start", "center", "flex-end"],
      defaultValue: defaults.textAlign,
      description: "菜单项内容对齐方式。",
    },
    {
      path: `${path}.fontWeight`,
      type: "enum",
      values: ["normal", "bold", "bolder"],
      defaultValue: defaults.fontWeight,
      description: "字重。",
    },
    {
      path: `${path}.fontStyle`,
      type: "enum",
      values: ["normal", "italic", "oblique"],
      defaultValue: defaults.fontStyle,
      description: "字体样式。",
    },
    {
      path: `${path}.letterSpacing`,
      type: "number",
      min: 0,
      max: 20,
      defaultValue: defaults.letterSpacing,
      description: "字间距，单位 px。",
    },
    {
      path: `${path}.lineHeight`,
      type: "number",
      min: 0.8,
      max: 3,
      defaultValue: defaults.lineHeight,
      description: "无单位行高倍数。",
    },
  ];
}

export const navMenuCapability: JsonObject = {
  componentName: "NavMenu",
  displayName: "导航菜单",
  description:
    "基于 Ant Design Tree 的垂直导航菜单组件，支持多级嵌套、默认选中、展开、图标、长文本处理和三种状态样式。",
  aiRole:
    "AI 负责菜单层级数据、默认选中项、行布局和三种状态样式；MCP 负责把简化数据映射为 menuData、稳定重复 ID 并补齐其余 props。组件层级由最终 schema 数组顺序决定。",
  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "NavMenu",
      description: "组件类型，必须固定为 NavMenu。",
    },
    {
      path: "logicalId",
      type: "string",
      description:
        "组件唯一 ID，由 AI 生成，用于编辑器大纲树和 schema businessElementId；后端限制最长 50 个字符，必须包含短随机段以保证大屏内全局唯一。",
    },
    {
      path: "parentLogicalId",
      type: "string",
      description: "父级组件或分组 ID，由 AI 生成，用于编辑器大纲树分组关系。",
    },
    {
      path: "style",
      type: "object",
      description: "组件在大屏画布上的位置、尺寸和背景样式。",
    },
  ],
  aiWritableProps: [
    {
      path: "name",
      type: "string",
      description: "图层名称，建议和用户语义一致。",
    },
    {
      path: "menuData",
      type: "object",
      description:
        "菜单数据对象。AI 可简化为 { items: [{ id, name, icon?, children? }] } 或 { originalData: [...], tableMapData: {...} }；MCP 会统一标准化为完整结构。",
      children: [
        {
          path: "menuData.items",
          type: "array<object>",
          description:
            "简化菜单项数组，每项包含 id、name，可选 icon 和 children（支持多级嵌套）。MCP 会转换为 originalData/tableMapData，并使全树 ID 唯一。",
        },
        {
          path: "menuData.originalData",
          type: "array<object>",
          description: "原始菜单数据数组，支持 children 嵌套。",
        },
        {
          path: "menuData.tableMapData",
          type: "object",
          description: "字段映射，包含 id、name、icon、children 对应字段名。",
        },
      ],
    },
    {
      path: "defaultSelectedId",
      type: "string",
      defaultValue: "1",
      description: "默认选中菜单项 ID。无效时 MCP 回退到第一项 ID。",
    },
    {
      path: "isExpand",
      type: "boolean",
      defaultValue: false,
      description: "是否默认展开全部可展开节点。默认 false。",
    },
    {
      path: "indentSize",
      type: "number",
      min: 0,
      max: 200,
      defaultValue: 20,
      description: "每级菜单的缩进宽度，单位 px。默认 20。",
    },
    {
      path: "itemHeight",
      type: "number",
      min: 0,
      max: 200,
      defaultValue: 40,
      description: "单个菜单项的最小高度，单位 px。默认 40。",
    },
    {
      path: "itemGap",
      type: "number",
      min: 0,
      max: 200,
      defaultValue: 4,
      description: "相邻菜单项的垂直间距，单位 px。默认 4。",
    },
    {
      path: "itemBorderRadius",
      type: "number",
      min: 0,
      max: 200,
      defaultValue: 4,
      description: "菜单项背景圆角，单位 px。默认 4。",
    },
    {
      path: "showIcon",
      type: "boolean",
      defaultValue: true,
      description: "是否显示菜单图标。默认 true。",
    },
    {
      path: "iconSize",
      type: "number",
      min: 0,
      max: 200,
      defaultValue: 16,
      description: "菜单图标尺寸，单位 px。默认 16。",
    },
    {
      path: "iconSpace",
      type: "number",
      min: 0,
      max: 200,
      defaultValue: 10,
      description: "图标与文字间距，单位 px。默认 10。",
    },
    {
      path: "expandIconSize",
      type: "number",
      min: 0,
      max: 200,
      defaultValue: 12,
      description: "树展开箭头尺寸，单位 px。默认 12。",
    },
    {
      path: "expandIconColor",
      type: "color",
      defaultValue: "#94A3B8",
      description: "树展开箭头颜色。默认 #94A3B8。",
    },
    {
      path: "textOverflow",
      type: "enum",
      values: ["ellipsis", "wrap"],
      defaultValue: "ellipsis",
      description: "长文本处理：ellipsis 单行省略，wrap 自动换行。",
    },
    {
      path: "showTooltip",
      type: "boolean",
      defaultValue: true,
      description: "ellipsis 模式下是否在悬停时显示完整菜单名称。默认 true。",
    },
    {
      path: "menuDefaultStyle",
      type: "object",
      description: "默认态菜单项的背景、文字和图标样式。",
      children: menuStyleFields("menuDefaultStyle", navMenuDefaultProps.menuDefaultStyle as JsonObject),
    },
    {
      path: "menuHoverStyle",
      type: "object",
      description: "悬停态菜单项的背景、文字和图标样式。",
      children: menuStyleFields("menuHoverStyle", navMenuDefaultProps.menuHoverStyle as JsonObject),
    },
    {
      path: "menuSelectStyle",
      type: "object",
      description: "选中态菜单项的背景、文字和图标样式。",
      children: menuStyleFields("menuSelectStyle", navMenuDefaultProps.menuSelectStyle as JsonObject),
    },
    {
      path: "rotate",
      type: "number",
      min: -360,
      max: 360,
      defaultValue: 0,
      description: "组件整体旋转角度。默认 0。",
    },
    {
      path: "opacity",
      type: "number",
      min: 0,
      max: 1,
      defaultValue: 1,
      description: "组件整体不透明度。默认 1。",
    },
  ],
  aiForbiddenProps: [
    {
      path: "eventConfigures",
      reason: "交互事件暂不由 AI 生成。",
    },
  ],
  mergeRules: [
    "AI 填写 menuData.items 或 menuData.originalData 后，MCP 会归一化为 { originalData, tableMapData, originType: 'static' }。",
    "简化菜单项缺失或重复 ID 时，MCP 会按源数据顺序生成稳定且全树唯一的 ID。",
    "defaultSelectedId 无效时，MCP 会回退到第一项 ID。",
    "对象按 key 深合并。",
    "数组按下标深合并。",
    "menuDefaultStyle/menuHoverStyle/menuSelectStyle 缺失字段由 MCP 按各状态默认值补齐。",
    "布局、图标、展开和长文本字段缺失时由 MCP 补齐；数值字段限制在公开范围内。",
  ],
  visualRules: [
    "菜单项必须包含 id 和 name，id 在同一菜单树内全局唯一。",
    "children 字段支持多级嵌套，但建议层级不超过 3 层，避免导航过深。",
    "defaultSelectedId 应引用实际菜单项；默认、悬停、选中三态需保持清晰递进。",
    "itemHeight 应能容纳字号与行高，indentSize 应为最深层级保留足够文字宽度。",
    "菜单名称较长或容器较窄时使用 ellipsis；仅在容器高度允许多行时使用 wrap。",
    "showTooltip 只影响 ellipsis 模式，wrap 模式直接展示完整换行文本。",
    "导航菜单适合作为大屏页面切换或模块入口。",
  ],
  examples: [
    {
      title: "侧边导航配置示例",
      props: {
        componentName: "NavMenu",
        logicalId: "theme_nav_menu",
        parentLogicalId: "screen_group",
        name: "侧边导航",
        style: {
          position: "absolute",
          left: 80,
          top: 120,
          width: 280,
          height: 420,
          zIndex: 10,
          backgroundColor: "rgba(9,18,32,0.92)",
        },
        menuData: {
          items: [
            { id: "1", name: "总览", icon: "" },
            { id: "2", name: "安全", icon: "" },
            { id: "3", name: "质量", icon: "" },
            { id: "4", name: "进度", icon: "" },
            { id: "5", name: "劳务", icon: "" },
          ],
        },
        defaultSelectedId: "1",
        isExpand: false,
        showIcon: false,
        textOverflow: "ellipsis",
        showTooltip: true,
        menuSelectStyle: {
          color: "#FFFFFF",
          backgroundColor: "rgba(37,99,235,0.32)",
          fontWeight: "bold",
        },
      },
    },
  ],
};
