
interface Tree {
    value: number | null,
    left?: Tree,
    right?: Tree
}

// @ts-ignore
const tree: Tree = {
    value: 1,
    left: {
        value: 2,
        left: {
            value: 4
        }
    },
    right: {
        value: 3,
        left: {
            value: 5,
            left: {
                value: 7
            },
            right: {
                value: 8,
                left: {
                    value: 9
                },
                right: {
                    value: 10
                }
            }
        },
        right: {
            value: 6
        }
    }
}

/**
 * 深度优先遍历类型
 * @param node
 */
// 先序遍历
// 递归版本
function firstRead(node: Tree) {
    if (node) {
        console.log(node.value);
        node.left && firstRead(node.left);
        node.right && firstRead(node.right);
    }
}
// 迭代版本
function firstReadByIterator(node: Tree) {
    // 栈结构
    const container = [node];
    while(container.length) {
        const node = container.pop();
        console.log(node!.value);
        if (node!.right) container.push(node!.right);
        if (node!.left) container.push(node!.left);
    }
}

// 中序遍历
// 递归版本
function midRead(node: Tree) {
    if (node) {
        node.left && midRead(node.left);
        console.log(node.value);
        node.right && midRead(node.right);
    }
}
// 迭代版本
function midReadByIterator(node: Tree) {
    const container = [];
    let current: Tree | undefined = node;
    while (container.length || current) {
        if (current) {
            container.push(current);
            current = current.left;
        } else {
            const popNode = container.pop();
            console.log(popNode!.value);
            current = popNode!.right;
        }
    }
}

// 后序遍历
// 递归版本
function afterRead(node: Tree) {
    if (node) {
        node.left && afterRead(node.left);
        node.right && afterRead(node.right);
        console.log(node.value)
    }
}
// 迭代版本
function afterReadByIterator(node: Tree) {
    if (node) {
        const containerA = [node];
        const containerB = [];
        while(containerA.length) {
            const current = containerA.pop();
            containerB.push(current);
            if (current!.left) {
                containerA.push(current!.left);
            }
            if (current!.right) {
                containerA.push(current!.right);
            }
        }
        while (containerB.length) {
           console.log(containerB.pop()?.value);
        }
    }
}


/**
 * 广度优先遍历类型
 * @param node
 */

function breadthFirstRead(node: Tree) {
    if (node) {
        const container = [node];
        const containerB = [node];
        while(container.length) {
            const current = container.shift();
            if (current!.left) {
                containerB.push(current!.left);
                container.push(current!.left);
            }

            if (current!.right) {
                containerB.push(current!.right);
                container.push(current!.right);
            }
        }
        while(containerB.length) {
            console.log(containerB.shift()?.value)
        }
    }
}

midReadByIterator({
    value: 5,
    left: {
        value: 1,
    },
    right: {
        value: 4,
        left: {
            value: 3,
        },
        right: {
            value: 6
        }
    }
});
