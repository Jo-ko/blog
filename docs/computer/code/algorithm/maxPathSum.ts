interface Node {
    left: Node;
    right: Node;
    val: number;
}
let res = -Number.MAX_VALUE;

function solve(node: Node) {
    if (node === null) return 0;
    const left = solve(node.left);
    const right = solve(node.right);
    res = Math.max(res, left + right + node.val);
    return Math.max(left, right) + node.val;
}

function maxPathSum(root: Node) {
    if (root === null) return 0;
    solve(root);
    return res === -Number.MAX_VALUE ? 0 : res;
}
