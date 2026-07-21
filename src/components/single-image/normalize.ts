import type { JsonObject } from "../../types/component.js";

export function normalizeSingleImageProps(props: JsonObject): JsonObject {
  const imageBase64 =
    typeof props.imageBase64 === "string" ? props.imageBase64.trim() : "";
  const imageSrc = typeof props.imageSrc === "string" ? props.imageSrc.trim() : "";
  const layerRole = props.layerRole === "content" || props.layerRole === "background"
    ? props.layerRole
    : props.imageLayerRole === "content" || props.imageLayerRole === "background"
    ? props.imageLayerRole
    : "background";

  return {
    ...props,
    layerRole,
    imageLayerRole: layerRole,
    imageUseMode: imageBase64 !== "" ? "base64" : imageSrc !== "" ? "upload" : props.imageUseMode,
  };
}
