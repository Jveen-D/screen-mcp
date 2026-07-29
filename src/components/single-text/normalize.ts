import type { JsonObject, JsonValue } from "../../types/component.js";

function isJsonObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeEnum(
  value: JsonValue | undefined,
  allowed: string[],
  fallback: string,
): string {
  return typeof value === "string" && allowed.includes(value) ? value : fallback;
}

function normalizeLineHeight(style: JsonObject): void {
  const lineHeight = style.lineHeight;
  if (typeof lineHeight !== "number") {
    style.lineHeight = 1.35;
    return;
  }

  if (lineHeight <= 0) {
    style.lineHeight = 1.35;
    return;
  }

  if (lineHeight <= 4) {
    return;
  }

  const fontSize = style.fontSize;
  const normalized =
    typeof fontSize === "number" && fontSize > 0 ? lineHeight / fontSize : 1.35;

  style.lineHeight = Math.min(Math.max(Number(normalized.toFixed(2)), 1), 2);
}

export function normalizeSingleTextProps(props: JsonObject): JsonObject {
  props.textOverflow = normalizeEnum(
    props.textOverflow,
    ["ellipsis", "clip", "visible"],
    "ellipsis",
  );
  props.verticalAlign = normalizeEnum(
    props.verticalAlign,
    ["top", "center", "bottom"],
    "center",
  );

  const style = props.style;
  if (isJsonObject(style)) {
    normalizeLineHeight(style);
    if (typeof style.height !== "number") {
      const fontSize = style.fontSize;
      const lineHeight = typeof style.lineHeight === "number" ? style.lineHeight : 1.35;
      style.height = typeof fontSize === "number" && fontSize > 0 ? Math.ceil(fontSize * lineHeight) : 25;
    }

    const textContent = props.textContent;
    const fontSize = style.fontSize;
    if (
      typeof textContent === "string" &&
      !textContent.includes("\n") &&
      style.lineHeight === 1 &&
      typeof fontSize === "number" &&
      fontSize > 0
    ) {
      style.height = fontSize;
    }
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
