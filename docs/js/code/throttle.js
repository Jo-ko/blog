function throttle(fn, wait) {
    let preTime = 0;

    return function (...args) {
        const now = Date.now();
        if (now - preTime >= wait) {
            fn.apply(this, args);
            preTime = Date.now();
        }
    }
}
