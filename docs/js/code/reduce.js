Array.prototype._reduce = function (callback, init) {
    const arr = this;
    if (!Array.isArray(this)) return new Error('');
    let total = init || arr[0];
    for (let i = init ? 0 : 1; i < arr.length; i++) {
        total = callback(total, arr[i], i, arr);
    }
    return total;
}

