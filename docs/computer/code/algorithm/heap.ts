// 二叉堆
// 用数组实现
abstract class Heap<T> {
    heapContainer: T[];

    constructor(initial?: T[]) {
        this.heapContainer = initial || [];
    }

    // 获取父节点
    getParentIndex(childIndex: number) {
        if (childIndex < 0) throw new Error('childIndex must bigger then 0');
        return Math.floor((childIndex - 1) / 2)
    }

    // 获取左边子节点
    getLeftChildIndex(parentIndex: number) {
        if (parentIndex < 0) throw new Error('parentIndex must bigger then 0');
        return parentIndex * 2 + 1;
    }

    // 获取右边子节点
    getRightChildIndex(parentIndex: number) {
        if (parentIndex < 0) throw new Error('parentIndex must bigger then 0');
        return parentIndex * 2 + 2;
    }

    // 判断是否有父节点
    hasParent(childIndex: number) {
        return this.getParentIndex(childIndex) >= 0;
    }

    // 获取父节点
    getParent(childIndex: number) {
        return this.heapContainer[this.getParentIndex(childIndex)];
    }

    // 判断是否有左子节点
    hasLeftChild(parentIndex: number) {
        return this.getLeftChildIndex(parentIndex) < this.heapContainer.length;
    }

    // 获取左子节点
    getLeftChild(parentIndex: number) {
        return this.heapContainer[this.getLeftChildIndex(parentIndex)];
    }

    // 获取右子节点
    getRightChild(parentIndex: number) {
        return this.heapContainer[this.getRightChildIndex(parentIndex)];
    }

    // 判断是否有右子节点
    hasRightChild(parentIndex: number) {
        return this.getRightChildIndex(parentIndex) < this.heapContainer.length;
    }

    // 获取heap长度
    getSize() {
        return this.heapContainer.length;
    }

    // 获取root节点
    getRoot() {
        return this.heapContainer[0];
    }

    // 增加节点
    add(value: T) {
       this.heapContainer.push(value);
       this.heapifyUp();
    }

    // 移除root节点
    poll() {
        if (this.heapContainer.length === 0) return null;
        if (this.heapContainer.length === 1) return this.heapContainer.pop();

        const item = this.heapContainer[0];
        const last = this.heapContainer.pop() as T;
        if (this.getSize() !== 0) {
           this.heapContainer[0] = last;
            this.heapifyDown(0);
        }
        return item;
    }

    // 序列化
    toString() {
        return this.heapContainer.toString();
    }

    // 交换节点
    swapNode(firstIndex: number, secondIndex: number) {
        const mid = this.heapContainer[firstIndex];
        this.heapContainer[firstIndex] = this.heapContainer[secondIndex];
        this.heapContainer[secondIndex] = mid;
    }

    // 节点从节点向上上浮排序
    heapifyUp(startIndex: number = this.heapContainer.length - 1) {
        let currentIndex = startIndex;
        while (
            this.hasParent(currentIndex) &&
            !this.pairIsInCorrectOrder(this.getParent(currentIndex), this.heapContainer[currentIndex])
            ) {
            this.swapNode(currentIndex, this.getParentIndex(currentIndex));
            currentIndex = this.getParentIndex(currentIndex);
        }
    }

    // 节点从节点向下捕获排序
    heapifyDown(startIndex: number = 0) {
        let currenIndex = startIndex;
        let nextIndex = null;
        while(this.hasLeftChild(currenIndex)) {
            // - 判断获取需要交换位置的左右节点
            //  - 比较左右节点的最大(最小)值, 这个值取决于pairIsInCorrectOrder父子节点比较规则
            // - 交换当前节点和需要交换的子节点
            if (
                this.hasRightChild(currenIndex) &&
                this.pairIsInCorrectOrder(this.getLeftChild(currenIndex), this.getRightChild(currenIndex))
            ) {
                nextIndex = this.getLeftChildIndex(currenIndex);
            } else {
                nextIndex = this.getRightChildIndex(currenIndex);
            }

            if (this.pairIsInCorrectOrder(this.heapContainer[currenIndex], this.heapContainer[nextIndex])) {
                break;
            }
            this.swapNode(currenIndex, nextIndex);
            currenIndex = nextIndex;
        }
    }

    // 比较父子节点规则
    abstract pairIsInCorrectOrder(targetNode: T, compareNode: T): boolean
}


export class MaxHeap<T> extends Heap<T> {
    pairIsInCorrectOrder(targetNode: T, compareNode: T) {
        return targetNode >= compareNode;
    }
}

export class MinHeap<T> extends Heap<T> {
    pairIsInCorrectOrder(targetNode: T, compareNode: T) {
        return targetNode <= compareNode;
    }
}

// const maxHeap = new MinHeap<number>();
// maxHeap.add(4);
// maxHeap.add(5);
// maxHeap.add(8);
// maxHeap.add(2);
// console.log(maxHeap.toString());
