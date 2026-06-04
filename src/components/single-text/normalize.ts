import type { JsonObject, JsonValue } from "../../types/component.js";

function isJsonObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeLineHeight(style: JsonObject): void {
  const lineHeight = style.lineHeight;
  if (typeof lineHeight !== "number") {
    return;
  }

  if (lineHeight <= 0) {
    style.lineHeight = 1;
    return;
  }

  if (lineHeight <= 4) {
    return;
  }

  const fontSize = style.fontSize;
  const normalized =
    typeof fontSize === "number" && fontSize > 0 ? lineHeight / fontSize : 1.4;

  style.lineHeight = Math.min(Math.max(Number(normalized.toFixed(2)), 1), 2);
}

export function normalizeSingleTextProps(props: JsonObject): JsonObject {
  const style = props.style;
  if (isJsonObject(style)) {
    normalizeLineHeight(style);
  }

  const textContent = props.textContent;
  if (typeof textContent !== "string") {
    return props;
  }

  const datasource = props.datasource;
  if (!isJsonObject(datasource)) {
    return props;
  }

  const constantData = datasource.constantData;
  if (!Array.isArray(constantData)) {
    datasource.constantData = [{ text: textContent }];
    return props;
  }

  const firstRow = constantData[0];
  if (isJsonObject(firstRow)) {
    firstRow.text = textContent;
  } else {
    constantData[0] = { text: textContent };
  }

  return props;
}
