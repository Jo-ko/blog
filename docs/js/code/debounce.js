function debounce(fn, wait, immediate) {
    let timeout = null;
    return function (...args) {
        timeout && clearTimeout(timeout);
        timeout = null;
        if (immediate) {
            fn.apply(this, args);
        } else {
            timeout = setTimeout(() => {
                fn.apply(this, args);
            }, wait)
        }
    }
}
