export function normalizeSingleImageProps(props) {
    const imageBase64 = typeof props.imageBase64 === "string" ? props.imageBase64.trim() : "";
    const imageSrc = typeof props.imageSrc === "string" ? props.imageSrc.trim() : "";
    return {
        ...props,
        imageUseMode: imageBase64 !== "" ? "base64" : imageSrc !== "" ? "upload" : props.imageUseMode,
    };
}
