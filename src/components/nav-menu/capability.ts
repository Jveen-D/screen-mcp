import type { JsonObject } from "../../types/component.js";

export const navMenuCapability: JsonObject = {
  componentName: "NavMenu",
  displayName: "导航菜单",
  description:
    "基于 Ant Design Tree 的垂直导航菜单组件，支持多级嵌套、默认/悬停/选中三种状态样式、图标与展开行为。",
  aiRole:
    "AI 负责菜单层级数据、三种状态样式、展开与图标配置；MCP 负责把简化数据映射为 menuData 结构并补齐其余 props。组件层级由最终 schema 数组顺序决定。",
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
            "简化菜单项数组，每项包含 id、name，可选 icon 和 children（支持多级嵌套）。MCP 会转换为 originalData/tableMapData。",
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
      path: "isExpand",
      type: "boolean",
      description: "是否默认展开全部节点。默认 false。",
    },
    {
      path: "showIcon",
      type: "boolean",
      description: "是否显示菜单图标。默认 true。",
    },
    {
      path: "iconSize",
      type: "number",
      description: "图标尺寸。默认 16。",
    },
    {
      path: "iconSpace",
      type: "number",
      description: "图标与文字间距。默认 6。",
    },
    {
      path: "expandIconColor",
      type: "color",
      description: "树展开箭头颜色。默认 rgba(227,240,255,1)。",
    },
    {
      path: "menuDefaultStyle",
      type: "object",
      description: "默认态菜单项样式。包含 fontFamily、fontSize、color、textAlign、backgroundColor、fontStyle、fontWeight、letterSpacing、lineHeight、iconColor。",
    },
    {
      path: "menuHoverStyle",
      type: "object",
      description: "悬停态菜单项样式。字段同 menuDefaultStyle。",
    },
    {
      path: "menuSelectStyle",
      type: "object",
      description: "选中态菜单项样式。字段同 menuDefaultStyle。",
    },
    {
      path: "rotate",
      type: "number",
      range: [-360, 360],
      description: "组件整体旋转角度。默认 0。",
    },
    {
      path: "opacity",
      type: "number",
      range: [0, 1],
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
    "对象按 key 深合并。",
    "数组按下标深合并。",
    "menuDefaultStyle/menuHoverStyle/menuSelectStyle 缺失字段由 MCP 补齐为默认值。",
    "isExpand/showIcon/iconSize/iconSpace/expandIconColor 缺失时由 MCP 补齐。",
  ],
  visualRules: [
    "菜单项必须包含 id 和 name，id 在同一菜单内全局唯一。",
    "children 字段支持多级嵌套，但建议层级不超过 3 层，避免导航过深。",
    "三种状态样式建议保持颜色/字重递进，确保选中态清晰可见。",
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
          height: 800,
          zIndex: 10,
          backgroundColor: "rgba(17,61,110,0.68)",
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
        isExpand: false,
        showIcon: false,
        menuSelectStyle: {
          color: "#00E5FF",
          backgroundColor: "rgba(0,229,255,0.12)",
          fontWeight: "bold",
        },
      },
    },
  ],
};
