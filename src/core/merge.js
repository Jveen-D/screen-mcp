const FORBIDDEN_PATHS = [
    ["chartData"],
    ["datasource"],
    ["option", "title"],
    ["option", "dataset"],
    ["option", "series", "0", "data"],
    ["eventConfigures"],
    ["targetUrl"],
    ["openBrowser"],
];
function isPlainObject(value) {
    return (typeof value === "object" &&
        value !== null &&
        !Array.isArray(value));
}
export function cloneJson(value) {
    return structuredClone(value);
}
export function deepMerge(base, override) {
    if (Array.isArray(base) && Array.isArray(override)) {
        const maxLength = Math.max(base.length, override.length);
        const merged = [];
        for (let index = 0; index < maxLength; index += 1) {
            if (index in base && index in override) {
                merged[index] = deepMerge(base[index], override[index]);
            }
            else if (index in override) {
                merged[index] = cloneJson(override[index]);
            }
            else {
                merged[index] = cloneJson(base[index]);
            }
        }
        return merged;
    }
    if (isPlainObject(base) && isPlainObject(override)) {
        const merged = cloneJson(base);
        for (const [key, value] of Object.entries(override)) {
            merged[key] =
                key in merged ? deepMerge(merged[key], value) : cloneJson(value);
        }
        return merged;
    }
    return cloneJson(override);
}
function deletePath(target, path) {
    if (path.length === 0 || !isPlainObject(target)) {
        return;
    }
    const [head, ...rest] = path;
    if (rest.length === 0) {
        delete target[head];
        return;
    }
    const nextValue = target[head];
    if (Array.isArray(nextValue)) {
        const arrayIndex = Number(rest[0]);
        if (Number.isInteger(arrayIndex)) {
            deletePath(nextValue[arrayIndex], rest.slice(1));
        }
        return;
    }
    if (isPlainObject(nextValue)) {
        deletePath(nextValue, rest);
    }
}
function shouldKeepForbiddenPath(path, options) {
    return Boolean(options?.isChartComponent) && path[0] === "chartData";
}
export function removeAiForbiddenProps(props, options = {}) {
    const sanitized = cloneJson(props);
    for (const path of FORBIDDEN_PATHS) {
        if (shouldKeepForbiddenPath(path, options)) {
            continue;
        }
        deletePath(sanitized, path);
    }
    return sanitized;
}
