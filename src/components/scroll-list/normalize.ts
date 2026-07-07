import type { JsonObject, JsonValue } from "../../types/component.js";

const DEFAULT_COLUMNS: JsonObject[] = [
  { field: "region", label: "地区" },
  { field: "rate", label: "完成率" },
  { field: "status", label: "完成情况" },
];

const DEFAULT_DATA: JsonObject[] = [
  { _id: "row_1", region: "北京", rate: 87.2, status: "超预期" },
  { _id: "row_2", region: "上海", rate: 80.5, status: "达标" },
  { _id: "row_3", region: "杭州", rate: 72.3, status: "达标" },
  { _id: "row_4", region: "重庆", rate: 65.5, status: "未达标" },
  { _id: "row_5", region: "成都", rate: 58.4, status: "未达标" },
  { _id: "row_6", region: "厦门", rate: 52.5, status: "未达标" },
  { _id: "row_7", region: "云南", rate: 41.2, status: "未达标" },
  { _id: "row_8", region: "泉州", rate: 42.2, status: "未达标" },
  { _id: "row_9", region: "三亚", rate: 46.2, status: "未达标" },
  { _id: "row_10", region: "武汉", rate: 47.2, status: "未达标" },
];

const DEFAULT_ENTRY_ANIMATION: JsonObject = {
  isShow: false,
  type: "",
};

const DEFAULT_ANIMATE_PROPS: JsonObject = {
  animate: false,
  animationType: "rowScroll",
  direction: "bottom2Top",
  hoverPause: false,
  interval: 1,
  duration: 2,
  endBehavior: "continue",
  switchType: "flip",
};

const DEFAULT_SCROLLBAR_PROPS: JsonObject = {
  railThick: 4,
  railColor: "rgba(230, 247, 255, 0.2)",
  railRadius: 0,
  sliderColor: "rgba(230, 247, 255, 0.45)",
  sliderRadius: 0,
  show: false,
};

const DEFAULT_ROW_HEADER: JsonObject = {
  isShowHeader: true,
  textOverflow: "ellipsis",
  headerHeight: 35,
  headerAlign: "center",
  bgType: "color",
  headerBg: "#232630",
  headerBgImg: "",
  fontFamily:
    '-apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif',
  color: "rgba(235, 245, 255, 1)",
  letterSpacing: 1,
  fontSize: 12,
  fontStyle: "normal",
  fontWeight: "bold",
};

const DEFAULT_CUSTOM_ROW_STYLE: JsonObject = {
  bgType: "color",
  bgColor: "rgba(142, 201, 255, 0.1)",
  bgImg: "",
  offsetX: 0,
  borderColor: "#ffffff00",
  borderWidth: 1,
  radius: 0,
};

const DEFAULT_HIGHLIGHT: JsonObject = {
  open: false,
  shadowVisible: false,
  shadowColor: "rgba(0, 0, 0, 0.0)",
  offsetX: 0,
  offsetY: 0,
  blur: 0,
  spread: 0,
  bgType: "color",
  bgColor: "rgba(255, 146, 95, 0.96)",
  bgImg: "",
  selectCount: 1,
  fontFamily:
    '-apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif',
  color: "rgba(255, 255, 255, 1)",
  letterSpacing: 1,
  fontSize: 12,
  fontStyle: "normal",
  fontWeight: "bolder",
};

const DEFAULT_ORDER_COLUMN_CFG: JsonObject = {
  show: false,
  startOrder: 1,
  columnTitle: "#",
  widthType: "fixed",
  orderAlign: "center",
  orderColWidth: 60,
  colMargin: 0,
  fontFamily:
    '-apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif',
  color: "rgba(255, 255, 255, 1)",
  letterSpacing: 1,
  fontSize: 12,
  fontStyle: "normal",
  fontWeight: "normal",
};

const DEFAULT_COL_CONFIG: JsonObject = {
  __seriesType: "__default",
  colFieldName: "",
  widthType: "flex",
  colWidth: 1,
  colMargin: 0,
  showBorder: false,
  borderColor: "rgba(0, 0, 0, 1)",
  borderWidth: 1,
  borderRadius: 10,
  offsetX: 0,
  offsetY: 0,
  bgType: "color",
  colAlign: "center",
  contentType: "text",
  textOverflow: "ellipsis",
  bgImg: "",
  picWidth: 20,
  picHeight: 20,
  actualWidth: 0,
  fontFamily:
    '-apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif',
  color: "rgba(255, 255, 255, 1)",
  letterSpacing: 1,
  fontSize: 12,
  fontStyle: "normal",
  fontWeight: "normal",
};

function isJsonObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: JsonValue | undefined, fallback: string): string {
  return typeof value === "string" && value.trim() !== "" ? value : fallback;
}

function asNumber(value: JsonValue | undefined, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

function alphaFromColor(value: JsonValue | undefined): number | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const color = value.trim().toLowerCase();
  if (color === "transparent") {
    return 0;
  }

  const rgbaMatch = color.match(/^rgba\(\s*\d+(?:\.\d+)?\s*,\s*\d+(?:\.\d+)?\s*,\s*\d+(?:\.\d+)?\s*,\s*([.\d]+)\s*\)$/u);
  if (rgbaMatch) {
    const parsed = Number(rgbaMatch[1]);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  const hexMatch = color.match(/^#([0-9a-f]{8})$/u);
  if (hexMatch) {
    return Number.parseInt(hexMatch[1].slice(6, 8), 16) / 255;
  }

  return undefined;
}

function generateRowId(index: number): string {
  return `row_${index + 1}`;
}

function inferColumnType(data: JsonObject[], field: string): string {
  for (const row of data) {
    const value = row[field];
    if (value === null || value === undefined) {
      continue;
    }
    if (typeof value === "number") {
      return "number";
    }
  }
  return "string";
}

function normalizeColumns(value: JsonValue | undefined): JsonObject[] {
  if (!Array.isArray(value) || value.length === 0) {
    return DEFAULT_COLUMNS.map((item) => ({ ...item }));
  }

  const result: JsonObject[] = [];
  for (let index = 0; index < value.length; index++) {
    const item = value[index];
    if (!isJsonObject(item)) {
      continue;
    }
    const field = asString(item.field, asString(item.key, `col_${index + 1}`));
    const label = asString(item.label, field);
    result.push({ field, label });
  }
  return result;
}

function normalizeDataRows(
  value: JsonValue | undefined,
  columns: JsonObject[],
): JsonObject[] {
  if (!Array.isArray(value) || value.length === 0) {
    return [];
  }

  const result: JsonObject[] = [];
  for (let index = 0; index < value.length; index++) {
    const item = value[index];
    if (!isJsonObject(item)) {
      continue;
    }
    const row: JsonObject = {
      _id: typeof item._id === "string" && item._id.trim() !== "" ? item._id : generateRowId(index),
    };
    for (const column of columns) {
      const field = asString(column.field, "");
      const type = asString(column.type, "string");
      if (field === "") {
        continue;
      }
      if (field in item) {
        row[field] = item[field];
      } else {
        row[field] = type === "number" ? 0 : "";
      }
    }
    result.push(row);
  }
  return result;
}

function buildConstantTableColumns(
  columns: JsonObject[],
  data: JsonObject[],
): JsonObject[] {
  return columns.map((column) => {
    const field = asString(column.field, "");
    const type = asString(column.type, inferColumnType(data, field));
    return { type, key: field };
  });
}

function buildFieldMappings(columns: JsonObject[]): JsonObject[] {
  const mapFields = columns.map((column) => {
    const field = asString(column.field, "");
    const label = asString(column.label, field);
    return { path: field, deleted: false, label };
  });
  return [{ key: "columns", mapFields }];
}

function normalizeDatasource(props: JsonObject): void {
  const aiColumns = props.columns;
  const aiData = props.data;
  const hasAiInput = Array.isArray(aiColumns) && aiColumns.length > 0 && Array.isArray(aiData);

  if (hasAiInput) {
    const columns = normalizeColumns(aiColumns);
    const data = normalizeDataRows(aiData, columns);

    props.datasource = {
      sourceType: "constant",
      fieldMode: "multiple",
      constantDataType: "table",
      constantTableColumns: buildConstantTableColumns(columns, data),
      fieldMappings: buildFieldMappings(columns),
      constantData: data.map((item) => ({ ...item })),
    };

    props.data = data.map((item) => ({ ...item }));
    return;
  }

  let datasource = props.datasource;
  if (!isJsonObject(datasource)) {
    datasource = {};
    props.datasource = datasource;
  }

  datasource.sourceType = "constant";
  datasource.fieldMode = "multiple";
  datasource.constantDataType = "table";

  if (!Array.isArray(datasource.constantTableColumns) || datasource.constantTableColumns.length === 0) {
    datasource.constantTableColumns = [
      { type: "string", key: "region" },
      { type: "number", key: "rate" },
      { type: "string", key: "status" },
    ];
  }

  if (!Array.isArray(datasource.fieldMappings)) {
    datasource.fieldMappings = [
      {
        key: "columns",
        mapFields: [
          { path: "region", deleted: false, label: "地区" },
          { path: "rate", deleted: false, label: "完成率" },
          { path: "status", deleted: false, label: "完成情况" },
        ],
      },
    ];
  } else {
    const firstMapping = datasource.fieldMappings[0];
    if (isJsonObject(firstMapping)) {
      firstMapping.key = "columns";
      if (!Array.isArray(firstMapping.mapFields)) {
        firstMapping.mapFields = [
          { path: "region", deleted: false, label: "地区" },
          { path: "rate", deleted: false, label: "完成率" },
          { path: "status", deleted: false, label: "完成情况" },
        ];
      }
    } else {
      datasource.fieldMappings = [
        {
          key: "columns",
          mapFields: [
            { path: "region", deleted: false, label: "地区" },
            { path: "rate", deleted: false, label: "完成率" },
            { path: "status", deleted: false, label: "完成情况" },
          ],
        },
      ];
    }
  }

  if (!Array.isArray(datasource.constantData) || datasource.constantData.length === 0) {
    datasource.constantData = DEFAULT_DATA.map((item) => ({ ...item }));
  } else {
    datasource.constantData = datasource.constantData.map((item, index) => {
      if (!isJsonObject(item)) {
        return { _id: generateRowId(index) };
      }
      return {
        ...item,
        _id: typeof item._id === "string" && item._id.trim() !== "" ? item._id : generateRowId(index),
      };
    });
  }
}

function applyDefaults(target: JsonObject, defaults: JsonObject): void {
  for (const key of Object.keys(defaults)) {
    if (!(key in target)) {
      target[key] = defaults[key] as JsonValue;
    } else if (isJsonObject(target[key]) && isJsonObject(defaults[key])) {
      applyDefaults(target[key] as JsonObject, defaults[key] as JsonObject);
    }
  }
}

function normalizeEntryAnimation(props: JsonObject): void {
  const entryAnimiation = props.entryAnimiation;
  if (!isJsonObject(entryAnimiation)) {
    props.entryAnimiation = { ...DEFAULT_ENTRY_ANIMATION };
    return;
  }

  if (typeof entryAnimiation.isShow !== "boolean") {
    entryAnimiation.isShow = DEFAULT_ENTRY_ANIMATION.isShow;
  }
  if (typeof entryAnimiation.type !== "string") {
    entryAnimiation.type = DEFAULT_ENTRY_ANIMATION.type;
  }
}

function normalizeAnimateProps(props: JsonObject): void {
  const animateProps = props.animateProps;
  if (!isJsonObject(animateProps)) {
    props.animateProps = { ...DEFAULT_ANIMATE_PROPS };
    return;
  }

  applyDefaults(animateProps, DEFAULT_ANIMATE_PROPS);

  if (animateProps.animationType !== "pageSwitch" && animateProps.animationType !== "rowScroll") {
    animateProps.animationType = DEFAULT_ANIMATE_PROPS.animationType;
  }
  if (animateProps.direction !== "top2Bottom" && animateProps.direction !== "bottom2Top") {
    animateProps.direction = DEFAULT_ANIMATE_PROPS.direction;
  }
  if (animateProps.endBehavior !== "continue" && animateProps.endBehavior !== "restart") {
    animateProps.endBehavior = DEFAULT_ANIMATE_PROPS.endBehavior;
  }
  if (animateProps.switchType !== "page" && animateProps.switchType !== "flip") {
    animateProps.switchType = DEFAULT_ANIMATE_PROPS.switchType;
  }
}

function datasourceRowCount(props: JsonObject): number {
  const datasource = props.datasource;
  if (!isJsonObject(datasource) || !Array.isArray(datasource.constantData)) {
    return 0;
  }

  return datasource.constantData.filter(isJsonObject).length;
}

function normalizeOrderedListAnimation(props: JsonObject): void {
  const animateProps = props.animateProps;
  const orderColumnCfg = props.orderColumnCfg;
  if (!isJsonObject(animateProps) || !isJsonObject(orderColumnCfg)) {
    return;
  }

  const rowCount = asNumber(props.rowCount, 5);
  const dataCount = datasourceRowCount(props);
  if (
    orderColumnCfg.show === true &&
    animateProps.animate === true &&
    dataCount > rowCount &&
    dataCount <= rowCount + 2
  ) {
    animateProps.animate = false;
  }
}

function normalizeScrollbarProps(props: JsonObject, key: "vScrollbarProps" | "hScrollbarProps"): void {
  const raw = props[key];
  if (!isJsonObject(raw)) {
    props[key] = { ...DEFAULT_SCROLLBAR_PROPS };
    return;
  }

  applyDefaults(raw, DEFAULT_SCROLLBAR_PROPS);
}

function normalizeRowHeader(props: JsonObject): void {
  const rowHeader = props.rowHeader;
  if (!isJsonObject(rowHeader)) {
    props.rowHeader = { ...DEFAULT_ROW_HEADER };
    return;
  }

  applyDefaults(rowHeader, DEFAULT_ROW_HEADER);

  if (rowHeader.textOverflow !== "ellipsis" && rowHeader.textOverflow !== "wrap" && rowHeader.textOverflow !== "marquee") {
    rowHeader.textOverflow = DEFAULT_ROW_HEADER.textOverflow;
  }
  if (rowHeader.headerAlign !== "left" && rowHeader.headerAlign !== "center" && rowHeader.headerAlign !== "right") {
    rowHeader.headerAlign = DEFAULT_ROW_HEADER.headerAlign;
  }
  if (rowHeader.bgType !== "color" && rowHeader.bgType !== "image") {
    rowHeader.bgType = DEFAULT_ROW_HEADER.bgType;
  }

  if (rowHeader.bgType === "color") {
    const alpha = alphaFromColor(rowHeader.headerBg);
    if (alpha !== undefined && alpha < 1) {
      rowHeader.headerBg = DEFAULT_ROW_HEADER.headerBg;
    }
  }
}

function normalizeCustomRowStyles(props: JsonObject): void {
  const customRowStyles = props.customRowStyles;
  if (!Array.isArray(customRowStyles) || customRowStyles.length === 0) {
    props.customRowStyles = [
      { ...DEFAULT_CUSTOM_ROW_STYLE, bgColor: "rgba(142, 201, 255, 0.1)" },
      { ...DEFAULT_CUSTOM_ROW_STYLE, bgColor: "rgba(142, 201, 255, 0.05)" },
    ];
    return;
  }

  props.customRowStyles = customRowStyles.map((item) => {
    if (!isJsonObject(item)) {
      return { ...DEFAULT_CUSTOM_ROW_STYLE };
    }
    const merged = { ...DEFAULT_CUSTOM_ROW_STYLE, ...item };
    if (merged.bgType !== "color" && merged.bgType !== "image") {
      merged.bgType = DEFAULT_CUSTOM_ROW_STYLE.bgType;
    }
    return merged;
  });
}

function normalizeHighlight(props: JsonObject): void {
  const highlight = props.highlight;
  if (!isJsonObject(highlight)) {
    props.highlight = { ...DEFAULT_HIGHLIGHT };
    return;
  }

  applyDefaults(highlight, DEFAULT_HIGHLIGHT);

  if (highlight.bgType !== "color" && highlight.bgType !== "image") {
    highlight.bgType = DEFAULT_HIGHLIGHT.bgType;
  }
}

function normalizeMatchStyles(props: JsonObject): void {
  const matchStyles = props.matchStyles;
  if (!Array.isArray(matchStyles)) {
    props.matchStyles = [];
  }
}

function normalizeOrderColumnCfg(props: JsonObject): void {
  const orderColumnCfg = props.orderColumnCfg;
  if (!isJsonObject(orderColumnCfg)) {
    props.orderColumnCfg = { ...DEFAULT_ORDER_COLUMN_CFG };
    return;
  }

  applyDefaults(orderColumnCfg, DEFAULT_ORDER_COLUMN_CFG);

  if (orderColumnCfg.widthType !== "fixed" && orderColumnCfg.widthType !== "adaptive" && orderColumnCfg.widthType !== "flex") {
    orderColumnCfg.widthType = DEFAULT_ORDER_COLUMN_CFG.widthType;
  }
  if (orderColumnCfg.orderAlign !== "left" && orderColumnCfg.orderAlign !== "center" && orderColumnCfg.orderAlign !== "right") {
    orderColumnCfg.orderAlign = DEFAULT_ORDER_COLUMN_CFG.orderAlign;
  }
}

function normalizeOrderStyles(props: JsonObject): void {
  const orderStyles = props.orderStyles;
  if (!Array.isArray(orderStyles)) {
    props.orderStyles = [];
  }
}

function normalizeColConfigs(props: JsonObject): void {
  const colConfigs = props.colConfigs;
  if (!Array.isArray(colConfigs) || colConfigs.length === 0) {
    props.colConfigs = [{ ...DEFAULT_COL_CONFIG }];
    return;
  }

  props.colConfigs = colConfigs.map((item) => {
    if (!isJsonObject(item)) {
      return { ...DEFAULT_COL_CONFIG };
    }
    const merged = { ...DEFAULT_COL_CONFIG, ...item };
    if (merged.widthType !== "fixed" && merged.widthType !== "adaptive" && merged.widthType !== "flex") {
      merged.widthType = DEFAULT_COL_CONFIG.widthType;
    }
    if (merged.colAlign !== "left" && merged.colAlign !== "center" && merged.colAlign !== "right") {
      merged.colAlign = DEFAULT_COL_CONFIG.colAlign;
    }
    if (merged.contentType !== "text" && merged.contentType !== "image") {
      merged.contentType = DEFAULT_COL_CONFIG.contentType;
    }
    if (merged.textOverflow !== "ellipsis" && merged.textOverflow !== "wrap" && merged.textOverflow !== "marquee") {
      merged.textOverflow = DEFAULT_COL_CONFIG.textOverflow;
    }
    if (merged.bgType !== "color" && merged.bgType !== "image") {
      merged.bgType = DEFAULT_COL_CONFIG.bgType;
    }
    return merged;
  });
}

function normalizeNumericProps(props: JsonObject): void {
  props.rowCount = asNumber(props.rowCount, 5);
  props.rowMargin = asNumber(props.rowMargin, 10);
  props.rotate = asNumber(props.rotate, 0);
  props.opacity = asNumber(props.opacity, 1);
}

function normalizeEventConfigures(props: JsonObject): void {
  const eventConfigures = props.eventConfigures;
  if (!Array.isArray(eventConfigures)) {
    props.eventConfigures = [];
  }
}

export function normalizeScrollListProps(props: JsonObject): JsonObject {
  normalizeDatasource(props);
  normalizeEntryAnimation(props);
  normalizeNumericProps(props);
  normalizeAnimateProps(props);
  normalizeScrollbarProps(props, "vScrollbarProps");
  normalizeScrollbarProps(props, "hScrollbarProps");
  normalizeRowHeader(props);
  normalizeCustomRowStyles(props);
  normalizeHighlight(props);
  normalizeMatchStyles(props);
  normalizeOrderColumnCfg(props);
  normalizeOrderedListAnimation(props);
  normalizeOrderStyles(props);
  normalizeColConfigs(props);
  normalizeEventConfigures(props);

  return props;
}
