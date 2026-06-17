import type { JsonObject } from "../../types/component.js";
import {
  applyDefaults,
  asNumber,
  asString,
  buildDatePickerDataConfig,
  DEFAULT_ENTRY_ANIMATION,
  DEFAULT_STYLE,
  isJsonObject,
} from "../form-utils.js";

const DEFAULT_DATE_FORMAT = "YYYY-MM-DD";
const DATE_FORMATS = new Set([
  "YYYY-MM-DD HH:mm:ss",
  "YYYY-MM-DD",
  "YYYY-MM",
  "YYYY-Q",
  "YYYY-WW",
  "YYYY",
]);

const DEFAULT_SELECTOR: JsonObject = {
  placeholder: {
    style: {
      color: "rgba(170,175,183,1)",
      textAlign: "left",
      fontWeight: "normal",
      fontFamily: "思源黑体",
      fontSize: 16,
      fontStyle: "normal",
      letterSpacing: 0,
    },
    content: "请选择",
  },
  defaultValue: {
    style: {
      color: "rgba(0,0,0,1)",
      fontWeight: "normal",
      fontFamily: "思源黑体",
      fontSize: 16,
      fontStyle: "normal",
    },
  },
  selected: {
    style: {
      color: "rgba(0,0,0,1)",
      textAlign: "left",
      fontWeight: "normal",
      fontFamily: "思源黑体",
      fontSize: 16,
      fontStyle: "normal",
      letterSpacing: 0,
    },
  },
  backgroundType: "color",
  backgroundColor: "rgba(224,242,253,0.09411764705882353)",
  backgroundImage: "",
  border: {
    color: "rgba(230,245,255,1)",
    show: true,
    width: 0.5,
    radius: 8,
  },
  dropdownIcon: {
    color: "#e6f5ff",
    imageUrl: "",
    width: 16,
    height: 16,
    rightPadding: 8,
  },
};

const DEFAULT_DROPDOWN: JsonObject = {
  backgroundColor: "rgba(24,39,55,0.8)",
  scrollbarThumbColor: "rgba(255,255,255,0.3)",
  optionControl: {
    style: {
      color: "rgba(0,0,0,1)",
      fontSize: 16,
      fontWeight: "normal",
      fontStyle: "normal",
      letterSpacing: 0,
      lineHeight: 3,
      textAlign: "center",
    },
    nextIcon: { imageUrl: "", width: 16, height: 16 },
    prevIcon: { imageUrl: "", width: 16, height: 16 },
    superNextIcon: { imageUrl: "", width: 16, height: 16 },
    superPrevIcon: { imageUrl: "", width: 16, height: 16 },
  },
  defaultOption: {
    style: {
      color: "rgba(0,0,0,1)",
      textAlign: "center",
      fontWeight: "normal",
      fontFamily: "思源黑体",
      fontSize: 16,
      fontStyle: "normal",
      letterSpacing: 0,
    },
  },
  selectedOption: {
    style: {
      color: "rgba(255,255,255,1)",
      textAlign: "center",
      fontWeight: "normal",
      fontFamily: "思源黑体",
      fontSize: 16,
      fontStyle: "normal",
      letterSpacing: 0,
    },
    backgroundFillType: "color",
    backgroundFillColor: "rgba(133,167,191,0.24)",
  },
  placement: "bottomLeft",
};

function normalizeDateFormat(props: JsonObject): void {
  const current = asString(props.dateFormat, DEFAULT_DATE_FORMAT);
  props.dateFormat = DATE_FORMATS.has(current) ? current : DEFAULT_DATE_FORMAT;
}

function normalizeDataConfig(props: JsonObject): void {
  props.dataConfig = buildDatePickerDataConfig(asString(props.name ?? props.title, "日期选择"));
}

function normalizeStyle(props: JsonObject): void {
  const style = props.style;
  if (!isJsonObject(style)) {
    props.style = { ...DEFAULT_STYLE };
    return;
  }
  applyDefaults(style, DEFAULT_STYLE);
}

function normalizeSelector(props: JsonObject): void {
  const selector = props.selector;
  if (!isJsonObject(selector)) {
    props.selector = { ...DEFAULT_SELECTOR };
    return;
  }
  applyDefaults(selector, DEFAULT_SELECTOR);
}

function normalizeDropdown(props: JsonObject): void {
  const dropdown = props.dropdown;
  if (!isJsonObject(dropdown)) {
    props.dropdown = { ...DEFAULT_DROPDOWN };
    return;
  }
  applyDefaults(dropdown, DEFAULT_DROPDOWN);
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

function normalizeEventConfigures(props: JsonObject): void {
  const eventConfigures = props.eventConfigures;
  if (!Array.isArray(eventConfigures)) {
    props.eventConfigures = [];
  }
}

export function normalizeDatePickerProps(props: JsonObject): JsonObject {
  normalizeDataConfig(props);
  normalizeDateFormat(props);
  normalizeStyle(props);
  normalizeSelector(props);
  normalizeDropdown(props);
  normalizeEntryAnimation(props);
  normalizeEventConfigures(props);

  props.allowClear = typeof props.allowClear === "boolean" ? props.allowClear : true;
  props.dropdownDebugFlag = typeof props.dropdownDebugFlag === "boolean" ? props.dropdownDebugFlag : false;
  props.defaultValue = asString(props.defaultValue, "");
  props.rotate = asNumber(props.rotate, 0);
  props.opacity = asNumber(props.opacity, 1);
  props.name = asString(props.name, "日期选择");
  props.title = asString(props.title, "日期选择");

  return props;
}
