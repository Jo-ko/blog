class ProseStack<T> {
    protected data: Array<T>;
    constructor() {
        this.data = [];
    }

    public push(ele: T) {
        let length = this.data.length;
        while(length--) {
            const latest = this.peek();
            if (ele > latest) {
                this.data.pop();
            } else {
                this.data.push(ele);
                break;
            }
        }

        if (this.data.length === 0) {
            this.data.push(ele);
        }

    }

    public pop() {
        this.data.pop();
    }

    public peek(): T {
        return this.data[this.data.length - 1];
    }

    public read() {
        this.data.forEach(item => {
            console.log(item);
        })
    }
}


const proseStack = new ProseStack();
proseStack.push(6);
proseStack.push(10);
proseStack.push(3);
proseStack.push(7);
proseStack.push(4);
proseStack.push(12);
proseStack.read(); // 12
