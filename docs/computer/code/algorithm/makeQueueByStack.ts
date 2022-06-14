const MyQueue = function () {
    this.inStack = [];
    this.outStack = [];
};

function swapAToB(arrA, arrB) {
    if (arrA.length === 0) return;
    while (arrA.length) {
        arrB.push(arrA.pop());
    }
}

MyQueue.prototype.push = function (x) {
    if (!this.inStack.length) {
        swapAToB(this.outStack, this.inStack)
    }
    this.inStack.push(x);
    return null;
};

MyQueue.prototype.pop = function () {
    swapAToB(this.inStack, this.outStack);
    return this.outStack.pop();
};

MyQueue.prototype.peek = function () {
    swapAToB(this.inStack, this.outStack);
    return this.outStack[this.outStack.length - 1];
};

MyQueue.prototype.empty = function () {
    return !this.inStack.length && !this.outStack.length;
};
