import { randomBytes } from "node:crypto";
import { cloneJson, deepMerge, removeAiForbiddenProps } from "./merge.js";
import { getComponentDefinition } from "./registry.js";
export const MAX_SCHEMA_ID_LENGTH = 50;
const DEFAULT_RANDOM_ID_LENGTH = 8;
function assertRequiredString(props, key) {
    const value = props[key];
    if (typeof value !== "string" || value.trim() === "") {
        throw new Error(`missing required prop: ${key}`);
    }
    return value;
}
export function toSchemaId(value, suffix = "") {
    const normalized = value
        .trim()
        .replace(/[^A-Za-z0-9_-]+/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_+|_+$/g, "");
    const fallback = normalized === "" ? "component" : normalized;
    if (suffix === "") {
        return fallback.slice(0, MAX_SCHEMA_ID_LENGTH);
    }
    const suffixWithSeparator = suffix.startsWith("_") ? suffix : `_${suffix}`;
    const maxBaseLength = MAX_SCHEMA_ID_LENGTH - suffixWithSeparator.length;
    if (maxBaseLength <= 0) {
        return suffixWithSeparator.slice(0, MAX_SCHEMA_ID_LENGTH);
    }
    return `${fallback.slice(0, maxBaseLength)}${suffixWithSeparator}`;
}
function randomIdSegment(length = DEFAULT_RANDOM_ID_LENGTH) {
    return randomBytes(Math.ceil(length / 2)).toString("hex").slice(0, length);
}
export function uniqueSchemaId(value, suffix = "") {
    const uniqueSuffix = suffix === ""
        ? randomIdSegment()
        : `${suffix}_${randomIdSegment()}`;
    return toSchemaId(value, uniqueSuffix);
}
function hasRandomIdSegment(value) {
    return /_[0-9a-f]{8}$/u.test(value);
}
function isJsonObject(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
function getPieChartDataRows(props) {
    const chartData = props.chartData;
    if (!isJsonObject(chartData)) {
        return undefined;
    }
    const constant = chartData.constant;
    if (!isJsonObject(constant) || !Array.isArray(constant.data)) {
        return undefined;
    }
    return cloneJson(constant.data);
}
function removeChartData(props) {
    const nextProps = cloneJson(props);
    delete nextProps.chartData;
    return nextProps;
}
function applySingleTextLineBoxDefaults(props) {
    if (props.componentName !== "SingleText") {
        return props;
    }
    const nextProps = cloneJson(props);
    const style = nextProps.style;
    if (!isJsonObject(style)) {
        return nextProps;
    }
    if (style.lineHeight === undefined) {
        style.lineHeight = 1.35;
    }
    if (style.height === undefined && typeof style.fontSize === "number" && style.fontSize > 0) {
        style.height = Math.ceil(style.fontSize * 1.35);
    }
    return nextProps;
}
function applyPieChartDataRows(props, rows) {
    props.chartData = cloneJson(getComponentDefinition("PieChart").defaultProps.chartData);
    if (!rows) {
        return;
    }
    const chartData = props.chartData;
    if (!isJsonObject(chartData)) {
        return;
    }
    const constant = chartData.constant;
    if (isJsonObject(constant)) {
        constant.data = rows;
    }
}
export function generateComponentProps(aiProps) {
    const componentName = assertRequiredString(aiProps, "componentName");
    const logicalId = assertRequiredString(aiProps, "logicalId");
    const parentLogicalId = assertRequiredString(aiProps, "parentLogicalId");
    const definition = getComponentDefinition(componentName);
    const sanitizedAiProps = applySingleTextLineBoxDefaults(removeAiForbiddenProps({
        ...aiProps,
        logicalId: hasRandomIdSegment(logicalId)
            ? toSchemaId(logicalId)
            : uniqueSchemaId(logicalId),
        parentLogicalId: toSchemaId(parentLogicalId),
    }, { componentName }));
    const pieChartDataRows = componentName === "PieChart" ? getPieChartDataRows(sanitizedAiProps) : undefined;
    const mergeableAiProps = componentName === "PieChart" ? removeChartData(sanitizedAiProps) : sanitizedAiProps;
    const mergedProps = deepMerge(definition.defaultProps, mergeableAiProps);
    if (componentName === "PieChart") {
        applyPieChartDataRows(mergedProps, pieChartDataRows);
    }
    else {
        mergedProps.chartData = cloneJson(definition.defaultProps.chartData);
    }
    return definition.normalizeProps?.(mergedProps) ?? mergedProps;
}
export function generateComponentsSchema(aiProps) {
    const props = generateComponentProps(aiProps);
    const definition = getComponentDefinition(props.componentName);
    return {
        businessElementId: props.logicalId,
        parentBusinessElementId: props.parentLogicalId,
        businessType: definition.businessType,
        componentName: props.componentName,
        indexNum: 1,
        structVersion: "0.0.2",
        rootFlag: false,
        props,
        displayName: definition.displayName,
        hiddenFlag: {
            type: "literal",
            value: false,
        },
        lockedFlag: false,
        groupFlag: false,
    };
}
export function generateComponentsSchemas(componentsProps) {
    const orderedProps = [...componentsProps].sort((left, right) => {
        const leftIsImage = left.componentName === "SingleImage";
        const rightIsImage = right.componentName === "SingleImage";
        return Number(leftIsImage) - Number(rightIsImage);
    });
    return orderedProps.map((props, index) => ({
        ...generateComponentsSchema(props),
        indexNum: index + 1,
    }));
}
export function componentSchemaToEditorNode(schema) {
    return {
        id: schema.businessElementId,
        componentName: schema.componentName,
        structVersion: schema.structVersion,
        props: schema.props,
        title: typeof schema.props.name === "string" && schema.props.name.trim() !== ""
            ? schema.props.name
            : schema.displayName,
        isHidden: schema.hiddenFlag.value,
        isLocked: schema.lockedFlag,
        isGroup: false,
    };
}
