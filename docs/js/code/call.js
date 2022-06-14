
Function.prototype._call = function(context = global) {

    if (typeof this !== 'function') {
        throw new Error('type error')
    }

    const args = [...arguments].slice(1);
    const temp = context._fn;
    context._fn = this;
    const result = context._fn(...args);
    delete context._fn;
    if (temp) context._fn = temp;
    return result;
}

Function.prototype._apply = function (context = global) {
    if (typeof this !== 'function') {
        throw new Error('type error')
    }

    const arg = arguments[1];
    if (arg && !Array.isArray(arg)) {
        throw new Error('apply args need array');
    }
    const temp = context._fn;
    context._fn = this;
    const result = arg ? context._fn(...arg) :context._fn();
    delete context._fn;
    if (temp) context._fn = temp;
    return result;
}

Function.prototype._bind = function (context) {
    if (typeof this !== 'function') {
        throw new Error('type error')
    }
    const args = [...arguments].slice(1);
    const fn = this;
    return function Fn() {
        return fn._apply(this instanceof Fn ? this : context || fn, args.concat(...arguments))
    }
}
