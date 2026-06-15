function isJsonObject(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
function normalizeLineHeight(style) {
    const lineHeight = style.lineHeight;
    if (typeof lineHeight !== "number") {
        style.lineHeight = 1;
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
    const normalized = typeof fontSize === "number" && fontSize > 0 ? lineHeight / fontSize : 1;
    style.lineHeight = Math.min(Math.max(Number(normalized.toFixed(2)), 1), 2);
}
export function normalizeSingleTextProps(props) {
    const style = props.style;
    if (isJsonObject(style)) {
        normalizeLineHeight(style);
        if (typeof style.height !== "number") {
            const fontSize = style.fontSize;
            style.height = typeof fontSize === "number" && fontSize > 0 ? fontSize : 18;
        }
        const textContent = props.textContent;
        const fontSize = style.fontSize;
        if (typeof textContent === "string" &&
            !textContent.includes("\n") &&
            style.lineHeight === 1 &&
            typeof fontSize === "number" &&
            fontSize > 0) {
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
    }
    else {
        constantData[0] = { text: textContent };
    }
    return props;
}
