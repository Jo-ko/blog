//极简的实现+链式调用+延迟机制+状态
class MyPromise_v1 {
    constructor(fn) {
        this.callback = [];
        this.state = 'pending';
        this.value = undefined;
        fn(this._resolve.bind(this));
    }

    then(onFulfilled) {
        if (this.state === 'pending') {
            this.callback.push(onFulfilled);
        } else {
            onFulfilled(this.value);
        }
        return this;
    }

    _resolve(value) {
        this.state = 'fulfilled';
        this.value = value;
        setTimeout(() => {this.callback.forEach(fn => fn(value))})
    }
}

// let p1 = new MyPromise_v1(resolve => {
//     console.log('同步执行');
//     resolve('同步执行');
// }).then(tip => {
//     console.log('then1', tip);
// }).then(tip => {
//     console.log('then2', tip);
// });
//
// setTimeout(() => {
//     p1.then(tip => {
//         console.log('then3', tip);
//     })
// });

// 完整实现, 正确的链式调用
class MyPromise_v2 {
    constructor(fn) {
        this.callback = [];
        this.state = 'pending';
        this.value = null;
        fn(this._resolve.bind(this));
    }

    then(onFulfilled) {
        return new MyPromise_v2(resolve => {
            this._handle({
                fulfilled: onFulfilled || null,
                resolve,
            })
        });

    }

    _handle(callback) {
        if (this.state === 'pending') {
            this.callback.push(callback);
            return
        }

        if (!callback.fulfilled) {
            callback.resolve(this.value);
            return;
        }

        const result = callback.fulfilled(this.value);
        callback.resolve(result);
    }

    _resolve(value) {
        // 判断返回的是否是Promise
        if (value && (typeof value === 'object' || typeof value === 'function')) {
            const then = value.then;
            then.call(value, this._resolve.bind(this));
            return;
        }
        this.state = 'fulfilled';
        this.value = value;
        this.callback.forEach(callback => this._handle(callback));
    }
}

// const p2 = new MyPromise_v2((resolve) => {
//     console.log(0);
//     // resolve(1);
//     setTimeout(() => {resolve(1)}, 2000);
// }).then(res => {
//     console.log(res);
//     return 2
// }).then(res => {
//     console.log(res);
//     return 3
// }).then(res => {
//     return new MyPromise_v2((resolve) => {
//         resolve(res);
//     })
// }).then(res => {
//     console.log(res);
//     return 4
// })

// 添加错误捕获等原型方法
class MyPromise_v3 {
    constructor(fn) {
        this.callbacks = [];
        this.value = null;
        this.state = 'pending';
        fn(this._resolve.bind(this), this._reject.bind(this));
    }

    then(onFulfilled, onRejected) {
        return new MyPromise_v3((resolve, reject) => {
            this._handle({
                resolve,
                reject,
                onFulfilled,
                onRejected
            })
        })
    }

    catch(onError) {
        return this.then(null, onError);
    }

    finally(onDone) {
        if (typeof onDone !== "function") return this.then();
        let Promise = this.constructor;
        return this.then(
            value => Promise.resolve(onDone()).then(() => value),
            reason => Promise.resolve(onDone()).then(() => { throw reason })
        );
    }

    static resolve(value) {
        if (value) {
            if (value instanceof MyPromise_v3) {
                return value
            }
            if (typeof value === 'object' && typeof value.then === 'function') {
                return new MyPromise_v3((resolve) => {
                    value.then(resolve);
                })
            }
            return new MyPromise_v3((resolve) => resolve(value));
        } else {
            return new MyPromise_v3((resolve) => resolve());
        }
    }

    static reject(err) {
        if (typeof err === 'object' && typeof err.then === 'function') {
            return new MyPromise_v3((resolve, reject) => {
                err.then(reject);
            })
        } else {
            return new MyPromise_v3((resolve, reject) => {reject(err)})
        }
    }

    static all(promises) {
        return new MyPromise_v3((resolve, reject) => {
            if (Array.isArray(promises)) {
                let fulfilledIndex = 0;
                const total = promises.length;
                const res = new Array(total).fill(null);
                promises.forEach((po, i) => {
                    MyPromise_v3.resolve(po).then((result) => {
                        fulfilledIndex++;
                        // 按照promises的顺序返回
                        res[i] = result;
                        if (fulfilledIndex === total) {
                            resolve(res);
                        }
                    }, () => {})
                })
            }

        })
    }

    _handle(callback) {
        if (this.state === 'pending') {
            this.callbacks.push(callback);
            return;
        }

        const cb = this.state === 'fulfilled' ? callback.onFulfilled : callback.onRejected;
        const next = this.state === 'fulfilled' ? callback.resolve : callback.reject;

        try {
            if (!cb) {
                next(this.value);
                return
            }

            const res = cb(this.value);
            next(res);
        } catch (e) {
            callback.reject(e);
        }

    }

    _resolve(value) {

        if (value && (typeof value === 'object' || typeof value === 'function')) {
            const then = value.then;
            if (then) {
                then.call(value, this._resolve.bind(this));
                return;
            }
        }

        this.value = value;
        this.state = 'fulfilled';
        this.callbacks.forEach(callback => this._handle(callback))
    }

    _reject(err) {
        this.state = 'rejected';
        this.value = err;
        this.callbacks.forEach(callback => this._handle(callback))
    }
}

MyPromise_v3.resolve().then(() => {
    console.log(0);
    return Promise.resolve(4);
}).then((res) => {
    console.log(res)
})

MyPromise_v3.resolve().then(() => {
    console.log(1);
}).then(() => {
    console.log(2);
}).then(() => {
    console.log(3);
}).then(() => {
    console.log(5);
}).then(() =>{
    console.log(6);
})

