function generateParenthesis(n: number) {
    const container = [];
    gen(0,0, n, '', container);
    return container;
}

function gen(left: number, right: number, n: number, result: string, container: string[]) {
    if (left === n && right === n) {
        container.push(result);
    }
    if (left < n) {
        gen(left + 1, right, n, result + '(', container);
    }
    if (right < n && right < left) {
        gen(left, right + 1, n, result + ')', container);
    }
}
