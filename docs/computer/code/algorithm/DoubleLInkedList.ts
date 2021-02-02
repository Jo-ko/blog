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

class DoubleLInkedList<T> {
    protected head: NodeCommon<T>;
    protected count: number = 0;
    constructor(ele: T) {
        this.head = new NodeCommon(isUndef(ele) ? null : ele);
    }

    // 获取当前链表值
    public toArray() {
        const arr = [this.head.value];
        let current = this.head;
        while (current.next) {
            current = current.next;
            arr.push(current.value);
        }
        return arr;
    }

    // 获取链表长度
    public getLength() {
        return this.count + 1;
    }

    // 往末尾加一个node
    public push(ele: T) {
        const newNode = new NodeCommon(ele);
        const lastNode = this.queryNodeAt(this.count);
        lastNode.next = newNode;
        newNode.prev = lastNode;
        this.count++;
        return this;
    }

    // 往指定位置加入一个node
    public insert(ele: T, index: number) {
        if (index >= 0 && index <= this.count) {
            const newNode = new NodeCommon(ele);
            if (index === 0) {
                newNode.next = this.head;
                this.head = newNode;
            } else {
                const targetNode = this.queryNodeAt(index);
                newNode.next = targetNode;
                newNode.prev = targetNode.prev;
                targetNode.prev.next = newNode;
                targetNode.prev = newNode;
            }
            this.count++;
        } else {
            return false
        }
    }

    public remove(index: number) {
        if (index >= 0 && index <= this.count) {
            if (index === 0) {
                this.head = this.head.next;
            } else {
                const targetNode = this.queryNodeAt(index);
                console.log(targetNode);
                targetNode.prev.next = targetNode.next;
            }
        } else {
            return false;
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

const doubleLinkedList = new DoubleLInkedList(0);

doubleLinkedList.push(1);
doubleLinkedList.push(2);
doubleLinkedList.insert(3, 2);
doubleLinkedList.remove(2);

console.log(doubleLinkedList.toArray()); // [0,1,3,2]
