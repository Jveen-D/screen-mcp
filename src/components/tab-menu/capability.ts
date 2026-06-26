import type { JsonObject } from "../../types/component.js";

export const tabMenuCapability: JsonObject = {
  componentName: "TabMenu",
  displayName: "Tab列表",
  description:
    "横向或纵向的 Tab 标签菜单组件，支持默认/悬停/选中三种状态样式、图标、对齐与间距配置，用于大屏模块切换。",
  aiRole:
    "AI 负责 Tab 标签数据、方向、对齐、三种状态样式；MCP 负责把简化数据映射为 menuData 结构并补齐其余 props。组件层级由最终 schema 数组顺序决定。",
  requiredProps: [
    {
      path: "componentName",
      type: "string",
      value: "TabMenu",
      description: "组件类型，必须固定为 TabMenu。",
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
      description: "组件在大屏画布上的位置、尺寸。",
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
        "Tab 数据对象。AI 可简化为 { items: [{ id, name, icon? }] } 或 { originalData: [...], selectTabId }；MCP 会统一标准化。TabMenu 不渲染 children 嵌套。",
      children: [
        {
          path: "menuData.items",
          type: "array<object>",
          description:
            "简化 Tab 项数组，每项包含 id、name，可选 icon。MCP 会转换为 originalData/tableMapData。",
        },
        {
          path: "menuData.originalData",
          type: "array<object>",
          description: "原始 Tab 数据数组。",
        },
        {
          path: "menuData.selectTabId",
          type: "string",
          description: "默认选中项 id。缺省时为第一项 id。",
        },
      ],
    },
    {
      path: "flexDirection",
      type: "enum",
      values: ["row", "column"],
      description: "Tab 排列方向。row 横向，column 纵向。默认 row。",
    },
    {
      path: "alignType",
      type: "enum",
      values: ["start", "center", "end"],
      description: "Tab 对齐方式。默认 center。",
    },
    {
      path: "cardSpace",
      type: "number",
      description: "选项卡间距。默认 6。",
    },
    {
      path: "fillContainer",
      type: "boolean",
      description: "是否撑满容器。默认 true。",
    },
    {
      path: "showIcon",
      type: "boolean",
      description: "是否显示图标。默认 false。",
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
      path: "menuDefaultStyle",
      type: "object",
      description: "默认态 Tab 样式。包含 fontFamily、fontSize、color、textAlign、backgroundColor、borderColor、borderWidth、borderRadius、borderType、fontStyle、fontWeight、letterSpacing、lineHeight、iconColor、backgroundFillType。",
    },
    {
      path: "menuHoverStyle",
      type: "object",
      description: "悬停态 Tab 样式。字段同 menuDefaultStyle。",
    },
    {
      path: "menuSelectStyle",
      type: "object",
      description: "选中态 Tab 样式。字段同 menuDefaultStyle。",
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
    "AI 填写 menuData.items 或 menuData.originalData 后，MCP 会归一化为 { originalData, tableMapData, originType: 'static', selectTabId }。",
    "对象按 key 深合并。",
    "数组按下标深合并。",
    "menuDefaultStyle/menuHoverStyle/menuSelectStyle 缺失字段由 MCP 补齐为默认值。",
    "flexDirection/alignType/cardSpace/fillContainer/showIcon/iconSize/iconSpace 缺失时由 MCP 补齐。",
  ],
  visualRules: [
    "Tab 项必须包含 id 和 name，id 在同一 Tab 列表内全局唯一。",
    "TabMenu 不渲染 children 嵌套，所有项铺平展示。",
    "三种状态样式建议保持颜色/字重递进，确保选中态清晰可见。",
    "Tab 列表适合作为大屏顶部或侧边模块切换入口。",
  ],
  examples: [
    {
      title: "顶部 Tab 配置示例",
      props: {
        componentName: "TabMenu",
        logicalId: "theme_tab_menu",
        parentLogicalId: "screen_group",
        name: "顶部模块切换",
        style: {
          position: "absolute",
          left: 300,
          top: 80,
          width: 800,
          height: 60,
          zIndex: 10,
        },
        menuData: {
          items: [
            { id: "1", name: "总览" },
            { id: "2", name: "安全" },
            { id: "3", name: "质量" },
            { id: "4", name: "进度" },
          ],
        },
        flexDirection: "row",
        alignType: "center",
        fillContainer: false,
        menuSelectStyle: {
          color: "#00E5FF",
          backgroundColor: "rgba(0,229,255,0.12)",
          fontWeight: "bold",
        },
      },
    },
  ],
};
