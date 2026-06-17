import type { JsonObject } from "../../types/component.js";
import {
  applyDefaults,
  asNumber,
  asString,
  buildSelectDataConfig,
  DEFAULT_ENTRY_ANIMATION,
  DEFAULT_STYLE,
  isJsonObject,
} from "../form-utils.js";

const DEFAULT_SELECTOR: JsonObject = {
  paddingLeft: 12,
  selected: {
    style: {
      color: "rgba(255,255,255,1)",
      textAlign: "left",
      fontSize: 16,
      fontWeight: "normal",
    },
  },
  placeholder: {
    style: {
      color: "rgba(170,175,183,1)",
      textAlign: "left",
      fontSize: 16,
    },
    content: "请选择",
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
    imageUrl: "group1/M00/04/CD/wKgBCWgRsTSEN2hMAAAAAKgk5vQ327.svg",
    width: 16,
    height: 16,
    rightPadding: 8,
  },
  selectedIcon: {
    imageUrl: "",
    width: 16,
    height: 16,
    leftPadding: 8,
  },
};

const DEFAULT_DROPDOWN: JsonObject = {
  direction: "bottom",
  animationDuration: 200,
  height: 200,
  offsetTop: 4,
  scrollbarWidth: "thin",
  scrollbarTrackColor: "rgba(255,255,255,0)",
  scrollbarThumbColor: "rgba(255,255,255,0.3)",
  optionHeight: 28,
  optionPadding: 8,
  optionSpacing: 4,
  defaultOption: {
    style: {
      color: "rgba(255,255,255,0.8)",
      textAlign: "left",
      fontFamily:
        '-apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif',
      fontSize: 14,
      fontWeight: "normal",
      fontStyle: "normal",
      letterSpacing: 0,
      lineHeight: 1.5,
    },
    backgroundFillType: "color",
    backgroundFillColor: "rgba(224,242,253,0)",
    backgroundFillImage: "",
  },
  selectedOption: {
    style: {
      color: "rgba(255,255,255,1)",
      textAlign: "left",
      fontFamily:
        '-apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif',
      fontSize: 14,
      fontWeight: "normal",
      fontStyle: "normal",
      letterSpacing: 0,
      lineHeight: 1.5,
    },
    backgroundFillType: "color",
    backgroundFillColor: "rgba(133,167,191,0.24)",
    backgroundFillImage: "",
  },
  hoverOption: {
    style: {
      color: "rgba(255,255,255,0.8)",
      textAlign: "left",
      fontFamily:
        '-apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif',
      fontSize: 14,
      fontWeight: "normal",
      fontStyle: "normal",
      letterSpacing: 0,
      lineHeight: 1.5,
    },
    backgroundFillType: "color",
    backgroundFillColor: "rgba(133,167,191,0.13333333333333333)",
    backgroundFillImage: "",
  },
  placement: "bottomLeft",
  backgroundColor: "rgba(24,39,55,0.8)",
};

function normalizeDataConfig(props: JsonObject): void {
  const options = props.options;
  props.dataConfig = buildSelectDataConfig(options);
  delete props.options;
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

export function normalizeSelectProps(props: JsonObject): JsonObject {
  normalizeDataConfig(props);
  normalizeStyle(props);
  normalizeSelector(props);
  normalizeDropdown(props);
  normalizeEntryAnimation(props);
  normalizeEventConfigures(props);

  props.defaultSelectedType = ["index", "value", "none"].includes(props.defaultSelectedType as string)
    ? props.defaultSelectedType
    : "index";
  props.defaultSelectedIndex = asNumber(props.defaultSelectedIndex, 1);
  props.allowClear = typeof props.allowClear === "boolean" ? props.allowClear : true;
  props.dropdownDebugFlag = typeof props.dropdownDebugFlag === "boolean" ? props.dropdownDebugFlag : false;
  props.rotate = asNumber(props.rotate, 0);
  props.opacity = asNumber(props.opacity, 1);
  props.name = asString(props.name, "下拉选择");
  props.title = asString(props.title, "下拉选择");

  return props;
}
