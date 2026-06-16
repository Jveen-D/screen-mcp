import type { JsonObject, JsonValue } from "../../types/component.js";

function isJsonObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeLineHeight(style: JsonObject): void {
  const lineHeight = style.lineHeight;
  if (typeof lineHeight !== "number") {
    style.lineHeight = 1.5;
    return;
  }

  if (lineHeight <= 0) {
    style.lineHeight = 1.5;
    return;
  }

  if (lineHeight <= 4) {
    return;
  }

  const fontSize = style.fontSize;
  const normalized =
    typeof fontSize === "number" && fontSize > 0 ? lineHeight / fontSize : 1.5;

  style.lineHeight = Math.min(Math.max(Number(normalized.toFixed(2)), 1), 2);
}

export function normalizeMultiTextProps(props: JsonObject): JsonObject {
  const style = props.style;
  if (isJsonObject(style)) {
    normalizeLineHeight(style);
    if (typeof style.height !== "number") {
      const fontSize = style.fontSize;
      const baseFontSize = typeof fontSize === "number" && fontSize > 0 ? fontSize : 14;
      const lineHeight = typeof style.lineHeight === "number" ? style.lineHeight : 1.5;
      const textContent = typeof props.textContent === "string" ? props.textContent : "";
      const lines = Math.max(1, textContent.split("\n").length);
      style.height = Math.round(baseFontSize * lineHeight * lines);
    }
  }

  return props;
}
