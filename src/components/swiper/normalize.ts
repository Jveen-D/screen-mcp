import type { JsonObject } from "../../types/component.js";
import {
  applyDefaults,
  asNumber,
  asString,
  DEFAULT_ENTRY_ANIMATION,
  isJsonObject,
} from "../form-utils.js";

const DEFAULT_STYLE: JsonObject = {
  position: "absolute",
  left: 400,
  top: 400,
  width: 1000,
  height: 300,
  zIndex: 1,
  fontFamily:
    '-apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial, "Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif',
  fontSize: 18,
  color: "#fff",
  textAlign: "center",
  fontStyle: "normal",
  fontWeight: "normal",
  letterSpacing: 1,
  lineHeight: 2,
};

const DEFAULT_NAVIGATION: JsonObject = {
  isActive: false,
  position: "inner",
  size: { width: 30, height: 16, borderRadius: 0 },
  backgroundColor: "#ffffff00",
  color: "#ffffff",
  arrow: "none",
  navigation: false,
};

const DEFAULT_SWIPER_ANIMATION: JsonObject = {
  isActive: true,
  animationType: "slide",
  loop: true,
  delayTime: 3,
};

const DEFAULT_ANIMATION: JsonObject = {
  isActive: false,
  isLoop: false,
  speed: "linear",
  duration: 2,
  delay: 0,
  type: "opacity",
};

const DEFAULT_TRANSFORM_3D: JsonObject = {
  isActive: false,
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
};

const IMAGE_SHOW_TYPES = new Set(["noRepeat", "repeat", "xRepeat", "yRepeat"]);
const DIRECTIONS = new Set(["horizontal", "vertical"]);
const ANIMATION_TYPES = new Set(["slide", "fade", "cube", "flip", "cards"]);

function normalizeStyle(props: JsonObject): void {
  const style = props.style;
  if (!isJsonObject(style)) {
    props.style = { ...DEFAULT_STYLE };
    return;
  }
  applyDefaults(style, DEFAULT_STYLE);
}

function normalizeNavigation(props: JsonObject): void {
  const navigation = props.navigation;
  if (!isJsonObject(navigation)) {
    props.navigation = { ...DEFAULT_NAVIGATION };
    return;
  }
  applyDefaults(navigation, DEFAULT_NAVIGATION);
}

function normalizeSwiperAnimation(props: JsonObject): void {
  const swiperAnimation = props.swiperAnimation;
  if (!isJsonObject(swiperAnimation)) {
    props.swiperAnimation = { ...DEFAULT_SWIPER_ANIMATION };
    return;
  }
  applyDefaults(swiperAnimation, DEFAULT_SWIPER_ANIMATION);
  const animationType = String(swiperAnimation.animationType ?? "slide");
  swiperAnimation.animationType = ANIMATION_TYPES.has(animationType) ? animationType : "slide";
  swiperAnimation.loop = typeof swiperAnimation.loop === "boolean" ? swiperAnimation.loop : true;
  swiperAnimation.delayTime = asNumber(swiperAnimation.delayTime, 3);
}

function normalizeAnimation(props: JsonObject): void {
  const animation = props.animation;
  if (!isJsonObject(animation)) {
    props.animation = { ...DEFAULT_ANIMATION };
    return;
  }
  applyDefaults(animation, DEFAULT_ANIMATION);
}

function normalizeTransform3D(props: JsonObject): void {
  const transform3D = props.transform3D;
  if (!isJsonObject(transform3D)) {
    props.transform3D = { ...DEFAULT_TRANSFORM_3D };
    return;
  }
  applyDefaults(transform3D, DEFAULT_TRANSFORM_3D);
}

function normalizeImageConfig(props: JsonObject): void {
  if (!Array.isArray(props.imageSrcList)) {
    props.imageSrcList = [];
  }
  const imageShowType = String(props.imageShowType ?? "noRepeat");
  props.imageShowType = IMAGE_SHOW_TYPES.has(imageShowType) ? imageShowType : "noRepeat";
  const direction = String(props.direction ?? "horizontal");
  props.direction = DIRECTIONS.has(direction) ? direction : "horizontal";
  props.targetUrl = asString(props.targetUrl, "");
  props.openBrowser = typeof props.openBrowser === "boolean" ? props.openBrowser : false;
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

export function normalizeSwiperProps(props: JsonObject): JsonObject {
  normalizeStyle(props);
  normalizeNavigation(props);
  normalizeSwiperAnimation(props);
  normalizeAnimation(props);
  normalizeTransform3D(props);
  normalizeImageConfig(props);
  normalizeEntryAnimation(props);
  normalizeEventConfigures(props);

  props.rotate = asNumber(props.rotate, 0);
  props.opacity = asNumber(props.opacity, 1);
  props.name = asString(props.name, "轮播图");
  props.title = asString(props.title, "轮播图");

  return props;
}
