const enum Side {
    left,
    right
}

class TreeNode<T> {
    value: T = null;
    leftNode: TreeNode<T> | null = null;
    rightNode: TreeNode<T> | null = null;
    parentNode: TreeNode<T> | null = null;
    side: Side; // 标识当前的节点的挂载位置
    constructor(value: T) {
        this.value = value;
    }
}

class BinaryTree<T> {
    root: TreeNode<T>
    // 查找
    public find(key: T): TreeNode<T> | null {
        let current = this.root;
        let target = current.value === key ? current : null;
        while(current !== null) {
            if (current.value > key) {
                current = current.leftNode
            } else if (current.value < key) {
                current = current.rightNode;
            } else {
                return target = current;
            }
        }
        return target;
    }

    // 插入
    public insert(key: T): boolean {
        const newNode = new TreeNode(key);
        if (this.root) {
            let current = this.root;
            let parentNode = current;
            // 对比key和节点的大小,小的挂载左边,大的挂载右边
            do {
                if (current.value > key) {
                    current = current.leftNode;
                    if (current === null) {
                        parentNode.leftNode = newNode;
                        newNode.parentNode = parentNode;
                        newNode.side = Side.left;
                    }
                } else {
                    current = current.rightNode;
                    if (current === null) {
                        parentNode.rightNode = newNode;
                        newNode.parentNode = parentNode;
                        newNode.side = Side.right;
                    }
                }
                parentNode = current;
            } while (current)
        } else {
            this.root = newNode;
            return true
        }
        return false;
    }

    /**
     * @description 删除(比较复杂)
     * 需要判断该节点状态
     * 1. 节点是叶节点
     * 2. 节点有一个子节点
     * 3. 节点有两个子节点
     * @param key
     */
    public remove(key: T): boolean {
        const target = this.find(key);
        // 目标节点没有子节点
        if (target.rightNode === null && target.leftNode === null) {
            // 判断目标节点是不是根节点
            if (target.parentNode) {
                if (target.side === Side.right) {
                    target.parentNode.rightNode = null;
                } else {
                    target.parentNode.leftNode = null;
                }
            } else {
                this.root = null;
            }
        } else if (target.rightNode === null && target.leftNode !== null) { // 目标节点有且仅有左子节点
            if (target.parentNode) {
                if (target.side === Side.right) {
                    target.parentNode.rightNode = target.leftNode;
                } else {
                    target.parentNode.leftNode = target.leftNode;
                }
            } else {
                this.root = target.leftNode;
            }
        } else if (target.leftNode === null && target.rightNode !== null) { // 目标节点有且仅有右子节点
            if (target.parentNode) {
                if (target.side === Side.right) {
                    target.parentNode.rightNode = target.rightNode;
                } else {
                    target.parentNode.leftNode = target.rightNode;
                }
            } else {
                this.root = target.rightNode;
            }
        } else { // 目标节点有两个子节点
            // 找到该节点的后继节点
            // 该后继节点要大于该节点的左子节点,小于该节点的右子节点
            // 因此我们需要找到该节点的右子节点的最左子节点
            let nextInheritNode = target.rightNode;
            while(nextInheritNode && nextInheritNode.leftNode) {
                nextInheritNode = nextInheritNode.leftNode
            }

            if (nextInheritNode.side === Side.right) {
                // 表明这是删除节点的右子节点
                nextInheritNode.leftNode = target.leftNode;
                nextInheritNode.leftNode.parentNode = nextInheritNode;
                nextInheritNode.parentNode = target.parentNode;
            } else {
                // 表明这是最左子节点
                target.leftNode && (target.leftNode.parentNode = nextInheritNode);
                target.rightNode && (target.rightNode.parentNode = nextInheritNode);
                nextInheritNode.parentNode.leftNode = nextInheritNode.rightNode;
                nextInheritNode.rightNode = target.rightNode;
                nextInheritNode.leftNode = target.leftNode;
                nextInheritNode.parentNode = target.parentNode;
            }


            // 判断是否是根节点
            if (target.parentNode) {
                if (target.side === Side.left) {
                    target.parentNode.leftNode = nextInheritNode;
                } else {
                    target.parentNode.rightNode = nextInheritNode;
                }
            } else {
                this.root = nextInheritNode;
            }

        }
        return false;
    }

    // 遍历(中序遍历)
    public static infixOrder(node: TreeNode<any>) {
        if (node !== null) {
            BinaryTree.infixOrder(node.leftNode);
            console.log(node.value);
            BinaryTree.infixOrder(node.rightNode);
        }
    }
}

const binaryTree = new BinaryTree();
binaryTree.insert(12);
binaryTree.insert(6);
binaryTree.insert(16);
binaryTree.insert(4);
binaryTree.insert(14);
binaryTree.insert(15);
binaryTree.insert(17);
binaryTree.insert(18);

binaryTree.remove(16);

BinaryTree.infixOrder(binaryTree.root);

