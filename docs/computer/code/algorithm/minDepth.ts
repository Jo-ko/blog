interface Node {
    left: Node;
    right: Node;
    val: number;
}

/**
 * 递归写法
 * @param root
 */
function minDepth(root: Node) {
    if (!root) return 0;
    if (!root.left) return minDepth(root.right) + 1;
    if (!root.right) return minDepth(root.left) + 1;
    return Math.min(minDepth(root.left), minDepth(root.right)) + 1
}

/**
 * 迭代写法
 * @param root
 */
function minDepthByIterator(root: Node) {
    let level = 0;
    if (root) {
        level = Infinity;
        const container = [{node: root, level: 1}]
        while (container.length) {
            const len = container.length;
            for (let i = 0; i < len; i++) {
                const {node, level: nodeLevel} = container.shift();
                if (!node.left && !node.right) {
                    level = Math.min(level, nodeLevel)
                }
                node.left && container.push({node: node.left, level: nodeLevel + 1});
                node.right && container.push({node: node.right, level: nodeLevel + 1});
            }
        }
    }
    return level;
}
