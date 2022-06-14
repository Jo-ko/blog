function _new(context) {
    const obj = Object.create(null);
    obj.__proto__ = context.constructor;
    const result = context.apply(obj, [...arguments].slice(1));
    return typeof result === 'object' ? result : obj;
}
