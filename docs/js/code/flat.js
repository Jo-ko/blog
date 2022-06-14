function flat(arr, depth = 1) {
    if (depth) {
        return arr.reduce((pre, cur) => {
            return pre.concat(Array.isArray(cur) ? flat(cur, depth - 1) : cur);
        }, [])
    }
    return arr.slice();
}
