import type { JsonObject, JsonValue } from "../../types/component.js";

const UNSAFE_SVG_PATTERNS = [
  /<script\b/i,
  /<foreignObject\b/i,
  /\son[a-z]+\s*=/i,
  /javascript:/i,
  /data:text\/html/i,
  /\s(?:href|xlink:href)\s*=\s*["']https?:\/\//i,
];

function isJsonObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isUnsafeSvg(svgContent: string): boolean {
  return UNSAFE_SVG_PATTERNS.some((pattern) => pattern.test(svgContent));
}

export function normalizeSvgDecorationProps(props: JsonObject): JsonObject {
  const svgSource = props.svgSource;
  if (svgSource !== "custom") {
    return props;
  }

  const svgContent = props.svgContent;
  if (typeof svgContent !== "string" || !svgContent.trim()) {
    props.svgSource = "preset";
    return props;
  }

  if (isUnsafeSvg(svgContent)) {
    props.svgSource = "preset";
    const defaultPreset = "icon-Frame3";
    props.svgPreset = typeof props.svgPreset === "string" ? props.svgPreset : defaultPreset;
    return props;
  }

  const glow = props.glow;
  if (isJsonObject(glow) && typeof glow.blur === "number" && glow.blur < 0) {
    glow.blur = 0;
  }

  return props;
}
