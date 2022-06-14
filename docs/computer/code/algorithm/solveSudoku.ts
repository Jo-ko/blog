function solveSudoku(board: Board) {
    if (board === null || board.length) return;
    solve(board);
}

function solve(board: Board) {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board.length; j++) {
            if (board[i][j] === '.') {
                for (let k = 1; k <= 9; k++) {
                    if (isValidate(board, i, j, k + '')) {
                        board[i][j] = k + '';
                        if (solve(board)) {
                            return true;
                        } else {
                            board[i][j] = '.';
                        }
                    }
                }
                return false;
            }
        }
    }
    return true;
}

function isValidate(board: Board, x: number, y: number, k: string): boolean {
    for (let i = 0; i < board.length; i++) {
        if (board[x][i] !== '.' && board[x][i] === k) return false;
        if (board[i][y] !== '.' && board[i][y] === k) return false;
        const boxBoard = board[Math.floor(x / 3) * 3 + Math.floor(i / 3)][Math.floor(y / 3) * 3 + i % 3];
        if (boxBoard !== '.' && boxBoard === k) return false;
    }
    return true;
}
