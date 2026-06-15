const UNSAFE_SVG_PATTERNS = [
    /<script\b/i,
    /<foreignObject\b/i,
    /\son[a-z]+\s*=/i,
    /javascript:/i,
    /data:text\/html/i,
    /\s(?:href|xlink:href)\s*=\s*["']https?:\/\//i,
];
const SVG_TEXT_PATTERN = /<text\b/i;
const SVG_PATH_D_ATTRIBUTE_PATTERN = /<path\b[^>]*\sd\s*=\s*["']([^"']*)["']/gi;
const SVG_ARC_COMMAND_PATTERN = /\bA\s*[-\d.]+\s+[-\d.]+/gi;
function isJsonObject(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isUnsafeSvg(svgContent) {
    return UNSAFE_SVG_PATTERNS.some((pattern) => pattern.test(svgContent));
}
function isNonDecorativeSvg(svgContent) {
    const arcCommandCount = [...svgContent.matchAll(SVG_PATH_D_ATTRIBUTE_PATTERN)]
        .reduce((count, match) => count + (match[1]?.match(SVG_ARC_COMMAND_PATTERN)?.length ?? 0), 0);
    return SVG_TEXT_PATTERN.test(svgContent) || arcCommandCount >= 2;
}
export function normalizeSvgDecorationProps(props) {
    const svgSource = props.svgSource;
    if (svgSource !== "custom") {
        return props;
    }
    const svgContent = props.svgContent;
    if (typeof svgContent !== "string" || !svgContent.trim()) {
        props.svgSource = "preset";
        return props;
    }
    if (isUnsafeSvg(svgContent) || isNonDecorativeSvg(svgContent)) {
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
