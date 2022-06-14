function _instanceof(target, origin) {
    if (typeof target !== "object" || target === null || target === undefined) return false;
    if (typeof origin !== "function") return false;
    let proto = Object.getPrototypeOf(target);
    while (proto) {
        if (proto === origin) return true;
        proto = Object.getPrototypeOf(proto);
    }
    return false;
}
