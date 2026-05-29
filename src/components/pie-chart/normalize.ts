import type { JsonObject, JsonValue } from "../../types/component.js";

export const legendPositionOptions = [
  ["left", "top"],
  ["center", "top"],
  ["right", "top"],
  ["left", "center"],
  ["right", "center"],
  ["left", "bottom"],
  ["center", "bottom"],
  ["right", "bottom"],
] as const;

function isJsonObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidLegendPosition(left: JsonValue, top: JsonValue): boolean {
  if (typeof left !== "string" || typeof top !== "string") {
    return false;
  }

  return legendPositionOptions.some(
    ([allowedLeft, allowedTop]) => left === allowedLeft && top === allowedTop,
  );
}

export function normalizePieChartProps(props: JsonObject): JsonObject {
  const option = props.option;
  if (!isJsonObject(option)) {
    return props;
  }

  const legend = option.legend;
  if (!isJsonObject(legend)) {
    return props;
  }

  if (isValidLegendPosition(legend.left, legend.top)) {
    return props;
  }

  legend.left = "center";
  legend.top = "top";

  return props;
}
