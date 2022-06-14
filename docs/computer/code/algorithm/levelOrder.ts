interface Node {
    val: number;
    left: Node;
    right: Node;
}

/**
 * 利用深度优先遍历来对二叉树进行层序遍历
 * @param root
 */
function levelOrderWithDFC(root: Node) {
    const result = [];
    if (root) {
        const container = [root];
        const levelArr = [0];
        while(container.length) {
            const current = container.pop();
            let n = levelArr.pop();
            if (result[n]) {
                result[n].push(current.val);
            } else {
                result[n] = [current.val];
            }
            if (current.right || current.left) {
                n++;
                current.right && container.push(current.right) && levelArr.push(n)
                current.left && container.push(current.left) && levelArr.push(n);
            }

        }
    }
    return result;
}

/**
 * 利用广度优先遍历来对二叉树进行层序遍历
 * @param root
 */
function levelOrderWithBFC(root: Node) {
    const result = [];
    if (root) {
        const container = [root];
        while (container.length) {
            const length = container.length;
            const temp = [];
            result.push(temp);
            for (let i = 0; i < length - 1; i++) {
                const current = container.shift();
                temp.push(current.val);
                current.left && container.push(current.left);
                current.right && container.push(current.right);
            }
        }
    }
    return result;
}
