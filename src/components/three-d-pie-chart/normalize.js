export const legendPositionOptions = [
    ["left", "top"],
    ["center", "top"],
    ["right", "top"],
    ["left", "center"],
    ["right", "center"],
    ["left", "bottom"],
    ["center", "bottom"],
    ["right", "bottom"],
];
function isJsonObject(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
function asString(value, fallback) {
    return typeof value === "string" && value.trim() !== "" ? value : fallback;
}
function asNumber(value, fallback) {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === "string" && value.trim() !== "") {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    }
    return fallback;
}
function clampNumber(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
function asPercentString(value, fallback) {
    if (typeof value === "string" && value.trim() !== "") {
        return value.trim();
    }
    if (typeof value === "number" && Number.isFinite(value)) {
        return `${value}%`;
    }
    return fallback;
}
function normalizeStringPair(value, fallback) {
    if (!Array.isArray(value)) {
        return fallback;
    }
    return [
        asPercentString(value[0], fallback[0]),
        asPercentString(value[1], fallback[1]),
    ];
}
function isValidLegendPosition(left, top) {
    if (typeof left !== "string" || typeof top !== "string") {
        return false;
    }
    return legendPositionOptions.some(([allowedLeft, allowedTop]) => left === allowedLeft && top === allowedTop);
}
function normalizeThreeDPieSeries(option) {
    const series = option.series;
    if (!Array.isArray(series)) {
        return;
    }
    for (const item of series) {
        if (isJsonObject(item)) {
            item.type = "pie";
            item.left = 0;
            item.top = 0;
            item.right = 0;
            item.bottom = 0;
            item.center = normalizeStringPair(item.center, ["50%", "48%"]);
            item.radius = normalizeStringPair(item.radius, ["72%", "96%"]);
        }
    }
}
function normalizeThreeDPieChartData(props) {
    const chartData = props.chartData;
    if (!isJsonObject(chartData)) {
        return;
    }
    const constant = chartData.constant;
    if (!isJsonObject(constant) || !Array.isArray(constant.data)) {
        chartData.sourceType = "constant";
        return;
    }
    const normalizedData = constant.data
        .filter(isJsonObject)
        .map((item, index) => ({
        name: asString(item.name, `类目${index + 1}`),
        type: asString(item.type, "系列"),
        value: asNumber(item.value, 0),
    }));
    if (normalizedData.length === 0) {
        chartData.sourceType = "constant";
        return;
    }
    chartData.sourceType = "constant";
    chartData.constant = {
        ...constant,
        data: normalizedData,
        originalData: normalizedData.map((item) => ({ ...item })),
        fieldList: [
            {
                fieldName: "name",
                fieldDisplayName: "name",
                fieldType: "LONGTEXT",
            },
            {
                fieldName: "type",
                fieldDisplayName: "type",
                fieldType: "LONGTEXT",
            },
            {
                fieldName: "value",
                fieldDisplayName: "value",
                fieldType: "DECIMAL",
            },
        ],
    };
}
function normalizeThreeDSettings(option) {
    const threeDSettings = option.threeDSettings;
    if (!isJsonObject(threeDSettings)) {
        return;
    }
    const depth = asNumber(threeDSettings.depth, 18);
    threeDSettings.depth = clampNumber(depth, 6, 180);
    const topViewAngle = asNumber(threeDSettings.topViewAngle, 63);
    threeDSettings.topViewAngle = clampNumber(topViewAngle, 0, 85);
    const liftDistance = asNumber(threeDSettings.liftDistance, 14);
    threeDSettings.liftDistance = clampNumber(liftDistance, 0, 160);
    const animationDuration = asNumber(threeDSettings.animationDuration, 2200);
    threeDSettings.animationDuration = clampNumber(animationDuration, 400, 12000);
    if (typeof threeDSettings.animationEnabled !== "boolean") {
        threeDSettings.animationEnabled = true;
    }
    if (typeof threeDSettings.centerLabelVisible !== "boolean") {
        threeDSettings.centerLabelVisible = true;
    }
    if (typeof threeDSettings.interactionTrigger !== "string") {
        threeDSettings.interactionTrigger = "hover";
    }
    if (typeof threeDSettings.projectionType !== "string") {
        threeDSettings.projectionType = "perspective";
    }
    const pixelRatio = asNumber(threeDSettings.pixelRatio, 1.5);
    threeDSettings.pixelRatio = clampNumber(pixelRatio, 0, 3);
    const cameraPosition = threeDSettings.cameraPosition;
    if (isJsonObject(cameraPosition)) {
        cameraPosition.x = asNumber(cameraPosition.x, 0);
        cameraPosition.y = asNumber(cameraPosition.y, -2);
        cameraPosition.z = clampNumber(asNumber(cameraPosition.z, 220), 120, 1800);
    }
    const cameraRotation = threeDSettings.cameraRotation;
    if (isJsonObject(cameraRotation)) {
        cameraRotation.x = clampNumber(asNumber(cameraRotation.x, -4), -90, 90);
        cameraRotation.y = clampNumber(asNumber(cameraRotation.y, 0), -180, 180);
        cameraRotation.z = clampNumber(asNumber(cameraRotation.z, 0), -180, 180);
    }
    const outerRadiusScale = asNumber(threeDSettings.outerRadiusScale, 0.82);
    threeDSettings.outerRadiusScale = clampNumber(outerRadiusScale, 0.1, 1);
    const innerRadiusScale = asNumber(threeDSettings.innerRadiusScale, 0.74);
    threeDSettings.innerRadiusScale = clampNumber(innerRadiusScale, 0.1, 1);
    const centerYRatio = asNumber(threeDSettings.centerYRatio, 0.48);
    threeDSettings.centerYRatio = clampNumber(centerYRatio, 0.1, 0.9);
    const centerYOffset = asNumber(threeDSettings.centerYOffset, 4);
    threeDSettings.centerYOffset = clampNumber(centerYOffset, -50, 50);
    const rotation = asNumber(threeDSettings.rotation, 14);
    threeDSettings.rotation = clampNumber(rotation, 0, 360);
    const tilt = asNumber(threeDSettings.tilt, 63);
    threeDSettings.tilt = clampNumber(tilt, 0, 90);
    const activeIndex = asNumber(threeDSettings.activeIndex, 0);
    threeDSettings.activeIndex = Math.max(0, Math.floor(activeIndex));
}
export function normalizeThreeDPieChartProps(props) {
    normalizeThreeDPieChartData(props);
    const option = props.option;
    if (!isJsonObject(option)) {
        return props;
    }
    normalizeThreeDPieSeries(option);
    normalizeThreeDSettings(option);
    const legend = option.legend;
    if (!isJsonObject(legend)) {
        return props;
    }
    if (isValidLegendPosition(legend.left, legend.top)) {
        legend.offsetX = asNumber(legend.offsetX, 0);
        legend.offsetY = asNumber(legend.offsetY, 0);
        return props;
    }
    legend.left = "center";
    legend.top = "bottom";
    legend.offsetX = asNumber(legend.offsetX, 0);
    legend.offsetY = asNumber(legend.offsetY, 0);
    return props;
}
