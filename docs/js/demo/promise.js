function SelfPromise(callback) {
    this.thenList = [];
    this.callBack = callback;
    this.state = 'pending';
}

SelfPromise.prototype._resolve = function (value) {

}

SelfPromise.prototype.then = function (resolve, reject) {
    this.thenList.push({resolve, reject});
    return this;
}


const promise = new SelfPromise((resolve, reject) => {
    setTimeout(() => {
        resolve()
    })
})

promise.then(
    () => {console.log('success')},
    () => {console.log('fail')}
).catch()
