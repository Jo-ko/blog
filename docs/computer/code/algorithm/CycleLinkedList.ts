import {isUndef} from "./utils";

class NodeCommon<T>
{
    next: NodeCommon<T> | null;
    prev: NodeCommon<T> | null;
    value: T;
    constructor(value: T) {
        this.value = value;
        this.next = null;
        this.prev = null;
    }
}

class CycleLinkedList<T>
{
    protected head: NodeCommon<T>;
    protected count: number = 0;

    constructor(ele: T) {
        this.head = new NodeCommon<T>(isUndef(ele) ? null : ele);
        this.head.next = this.head;
        this.head.prev = this.head;
    }

    // 获取当前链表值
    public toArray() {
        const arr = [];
        let current = this.head;
        for (let i = 0; i <= this.count; i++) {
            arr.push(current.value);
            current = current.next;
        }
        return arr;
    }

    public push(ele: T) {
        const newNode = new NodeCommon(ele);
        const firstNode = this.queryNodeAt(0);
        const lastNode = this.queryNodeAt(this.count);
        newNode.prev = lastNode;
        newNode.next = lastNode.next;
        lastNode.next = newNode;
        firstNode.prev = newNode;
        this.count++;
    }

    public insert(ele: T, index: number) {
        if (index >= 0 && index <= this.count) {
            const newNode = new NodeCommon(ele);
            if (index === 0) {
                newNode.prev = this.head.prev;
                newNode.next = this.head;
                this.head.prev = newNode;
                this.head = newNode;
            } else {
                const targetPrev = this.queryNodeAt(this.count - 1);
                const target = targetPrev.next;
                newNode.prev = targetPrev;
                newNode.next = target;
                target.prev = newNode;
                targetPrev.next = newNode;
            }
            this.count++;
            return true;
        } else {
            return false
        }
    }

    // 删除
    public remove(index: number) {
        if (index >= 0 && index <= this.count) {
            if (index === 0) {
                const targetNode = this.head.next;
                targetNode.prev = this.head.prev;
                this.head = targetNode;
            } else {
                const removeTarget = this.queryNodeAt(index);
                removeTarget.prev.next = removeTarget.next;
            }
            this.count--;
            return true;
        } else {
            return false
        }
    }

    // 找到指定位置的node
    public queryNodeAt(index: number): NodeCommon<T> | null {
        if (index >= 0 && index <= this.count) {
            let count = 0;
            let target = this.head;
            while (count !== index) {
                count++;
                target = target.next;
            }
            return target;
        } else {
            return null
        }
    }

}

const cycleLinkedList = new CycleLinkedList(0);

cycleLinkedList.push(1);
cycleLinkedList.push(2);
cycleLinkedList.insert(3, 2);
cycleLinkedList.remove(2);

console.log(cycleLinkedList.toArray()); // [ 0, 1, 2 ]
