import {isUndef} from "./utils";

class NodeCommon<T>
{
    next: NodeCommon<T> | null
    value: T;
    constructor(value: T) {
        this.value = value;
        this.next = null;
    }
}

class SinglyLinkedList<T>
{
    protected head: NodeCommon<T>;
    protected count: number = 0;
    constructor(ele?: T) {
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
        const lastNode = this.queryNodeAt(this.count);
        lastNode.next = new NodeCommon(ele);
        this.count++;
    }

    // 往指定位置加入一个node
    public insert(ele: T, index: number)  {
        if (index < 0 || index > this.count) {
            return false;
        } else {
            const newNode = new NodeCommon(ele);
            if (index === 0) {
                newNode.next = this.head;
                this.head = newNode;
            } else {
                const insertNode = this.queryNodeAt(index);
                newNode.next = insertNode.next;
                insertNode.next = newNode;
            }
            this.count++;
            return true
        }
    }

    // 删除
    public remove(index: number) {
        if (index >= 0 && index <= this.count) {
            if (index === 0) {
                this.head = this.head.next;
            } else if (index === this.count) {
                const lastNodes = this.queryNodeAt(this.count - 1);
                lastNodes.next = null;
            } else {
                const lastNodes = this.queryNodeAt(index - 1);
                lastNodes.next = this.queryNodeAt(index + 1);
            }
            this.count--;
            return true;
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

const singlyLinkedList = new SinglyLinkedList<number>(0); // 0
singlyLinkedList.push(1); // 0 -> 1
singlyLinkedList.insert(2, 1); // 0 -> 1 -> 2
singlyLinkedList.push(3); // 0 -> 1 -> 2 -> 3

singlyLinkedList.remove(3); // 0 -> 1 -> 2
