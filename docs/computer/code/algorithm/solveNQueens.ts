function solveNQueens(n) {
    const result = [];
    const queens = new Array(n).fill(-1);
    const columns = new Set<number>();
    const xs = new Set<number>();
    const ys = new Set<number>();
    makeSolution(result, queens, n, 0, columns, xs, ys);
    return result;
}

function makeSolution(result: string[][], queens: number[], n: number, row: number, columns: Set<number>, xs: Set<number>, ys: Set<number>) {
    if (row === n) {
        result.push(transform(queens, n));
        return result;
    } else {
        for (let i = 0; i < n; i++) {
            if (columns.has(i)) {
                continue
            }
            const x = row - i;
            if (xs.has(x)) {
                continue;
            }
            const y = row + i;
            if (ys.has(y)) {
                continue;
            }
            queens[row] = i;
            columns.add(i);
            xs.add(x);
            ys.add(y);
            makeSolution(result, queens, n, row + 1, columns, xs, ys);
            queens[row] = -1;
            columns.delete(i);
            xs.delete(x);
            ys.delete(y);
        }
    }
}

function transform(data: number[], n) {
    return data.map(item => {
        const arr = new Array(n).fill('.');
        arr[item] = 'Q';
        return arr.join('');
    })
}

console.log(solveNQueens(4));
