type Board = string[][];

function isValidSudoku(board: Board) {
    const cols = new Array(9).fill(0).map(item => new Array(9).fill(0));
    const vols = new Array(9).fill(0).map(item => new Array(9).fill(0));
    const subBox = new Array(3).fill(0).map(item => new Array(3).fill(0).map(item => new Array(9).fill(0)))

    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            const current = board[i][j];
            vols[i][current] += 1;
            cols[j][current] += 1;
            subBox[Math.floor(i / 3)][Math.floor(j / 3)][current] += 1;
            if (vols[i][current] > 1 || cols[j][current] > 1 || subBox[Math.floor(i / 3)][Math.floor(j / 3)][current] > 1) {
                return false;
            }
        }
    }
    return true;
}
