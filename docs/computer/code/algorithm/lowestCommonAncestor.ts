interface Tree {
    value: number | null,
    left?: Tree,
    right?: Tree
}

// 递归方式
function lowestCommonAncestor(root: Tree, p: Tree, q: Tree) {
    if (root === null || root.value === p.value || root.value === q.value) {
        return root;
    }

    const left = lowestCommonAncestor(root.left, p, q);
    const right = lowestCommonAncestor(root.right, p, q);

    return left ? right ? root : left : right;
}

// 迭代方式
function lowestCommonAncestorIterator(root: Tree, p: Tree, q: Tree): any {
    const container = [];
    let containerP: any = [];
    let containerQ: any = [];
    let current: Tree | undefined = root;
    while(container.length || current) {
        if (current) {
            container.push(current);
            if (current.value === p.value) {
                containerP = container.slice();
            }
            if (current.value === q.value) {
                containerQ = container.slice();
            }
            if (containerQ.length && containerP.length) {
                break;
            }
            current = current?.left
        } else {
            current = container.pop()?.right;
        }
    }
    if (containerP[1] && containerQ[1] && (containerP[1]?.value === containerQ[1]?.value)) {
        return containerP[1]
    } else if (containerQ[0] && containerP[0] && (containerQ[0]?.value === containerP[0]?.value)) {
        return containerP[0]
    } else {
        return root
    }
}


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

const p = {
    value: 3
};
const q = {
    value: 9
}
lowestCommonAncestorIterator(tree, p, q);
