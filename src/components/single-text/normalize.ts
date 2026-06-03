import type { JsonObject, JsonValue } from "../../types/component.js";

function isJsonObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizeSingleTextProps(props: JsonObject): JsonObject {
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
