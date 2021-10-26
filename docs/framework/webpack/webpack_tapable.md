---
title: Webpack tapable使用
date: 2020-09-30
tags:
- 框架基础
categories:
- 前端知识
---

## 九种Hooks
```js
const {
  SyncHook,
  SyncBailHook,
  SyncWaterfallHook,
  SyncLoopHook,
  AsyncSeriesHook,
  AsyncSeriesBailHook,
  AsyncSeriesWaterfallHook,
  AsyncParallelHook,
  AsyncParallelBailHook,
} = require('tapable');
```
Tapable按照 __触发事件的方式__ 和 __事件回调的机制__ 分类
::: tip 触发事件的方式
1. Sync开头: 该hooks只能使用tap注册事件回调,这类事件回调会同步执行,触发方式是call
2. AsyncSeries开头: 该hooks可以能使用tap,tapAsync,tapPromise注册事件回调, 这类事件表示回调会异步依次执行, 触发方式是callAsync
3. AsyncParallel开头: 该hooks和AsyncSeries类似,不同的是该类型的事件是异步并行执行的
:::

::: tip 事件回调的机制
1. Basic: 基础类型, 不关心内部逻辑
2. Bail: 保险类型, 事件回调的返回值不是undefined的时候,停止后面的时间回调的执行
3. Waterfall: 瀑布类型, 如果一个事件回调值不是undefined, 就把该返回值作为下一个事件回调的第一个参数
4. Loop: 循环类型, 如果一个事件回调值不是undefined, 会重新从第一个注册的事件回调处执行,直到当前的事件回调没有返回值
:::


## 使用方式
### 注册事件回调
1. 有三种方式, tap, tapAsync, tapPromise
2. tapAsync, tapPromise不能在Sync开头的钩子中使用
```js
const {SyncHook} = require('tapable');
const syncHook = new SyncHook;

syncHook.tap('A', () => console.log('A'))
// 或者
syncHook.tap(
    {
        name: 'B', // 事件名称
        stage: 10, // 按照顺序执行, 顺序提前为负, 顺序延后为正
        before: 'A', // 表示在A事件回调之前执行, 不要和stage属性混用
    },
    () => console.log('B')
)
```
### 调用注册事件
对应注册的三种方式call, callAsync, promise
::: tip call
call传入参数的数量必须和钩子实例化时传入的数组数量一致
```js
const {SyncHook} = require('tapable');
const syncHook = new SyncHook(['name']);

syncHook.tap('A', (name, age) => console.log(name)) // 这里的name就是构造时的传入的name, 但是age并没有传入, 显示的是undefined
syncHook.call('syncHook demo', 'no show'); // 这里传入的与实例化的不一致, 因此只有第一个参数会被输出

/**
 * Console output:
 * 
 * 'syncHook demo' 
 */
```
:::

::: tip callAsync
1. 与call不同的是除了传入实例化时传入的数组数量一致的参数外, 还要加上一个回调函数
2. 另外注册事件中的接收的回调函数必须执行, 否则不会进入下一个注册事件
3. 注册事件回调函数如果有参数会停止整个事件
```js
const {AsyncSeriesHook} = require('tapable');
const hook = new AsyncSeriesHook(['name']);

hook.tapAsync('first name', (name, callBack) => {
    console.log('first name is :', name);
    callBack();
})

hook.tapAsync('second name', (name, callBack) => {
    console.log('second name is :', name);
    callBack('secondError');
})

hook.tapAsync('third name', (name, callBack) => {
    console.log('third name is :', name);
    callBack();
})

hook.callAsync('callAsync', (error, result) => {
    console.log('callAsync callback', error, result);
})

/**
 * first name is : callAsync
 * second name is : callAsync
 * callAsync callback secondError undefined
 */

```
:::

::: tip promise
1. promise 执行之后会返回一个Promise对象
2. tapPromise注册的事件一定要返回promise

```js
const {AsyncSeriesHook} = require('tapable');
const hook = new AsyncSeriesHook(['name']);

hook.tapPromise('promise1', (name) => {
    console.log('promise 1 is %s', name);
    return Promise.resolve('promise 1 end');
})

hook.tapPromise('promise2', (name) => {
    console.log('promise 2 is %s', name);

    return Promise.resolve('second');
});

const promise = hook.promise('promise');

promise.then(
    (res) => {
        console.log('resolve is %s', res);
    },
    (res) => {
        console.log('reject is %s', res);
    }
)

```
:::

### 拦截机制
```js
const { SyncHook } = require('tapable');
const hook = new SyncHook();

hook.intercept({
    // 在添加拦截器的配置对象中启用 context, 使得下面拦截函数的第一参数为context
    context: true,
    // 注册时执行
    register(tap) {
        console.log('register', tap);
        return tap;
    },
    // 触发事件时执行
    call(...args) {
        console.log('call', args);
    },
    // 在 call 拦截器之后执行
    loop(...args) {
        console.log('loop', args);
    },
    // 事件回调调用前执行
    tap(tap) {
        console.log('tap', tap);
    },
});
```

### 终止后续事件回调的运行
> Bail类的钩子可以终止注册事件的执行,三种注册事件方式有不同的触发时机, 对应的是SyncBailHook, AsyncSeriesBailHook, AsyncParallelBailHook
```js
const {AsyncSeriesBailHook} = require('tapable');
const hooks = new AsyncSeriesBailHook(['name']);

hooks.tap('tap type', (name) => {
    console.log(name);
    // 有返回值时会终止执行
    return 0;
})

hooks.tapAsync('tapAsync type', (name, callback) => {
    console.log(name);
    // 不会终止执行
    callback(); // 或者callback(null, 'reason')
    // 当callback的第一个参数为非null时会终止执行
    callback('error');
})

hooks.tapPromise('tapPromise type', (name) => {
    // 不会终止
    var re = Promise.resolve();
    // 当返回的是Fulfilled状态,并且有参数的时候会终止
    var re = Promise.reject('reason');
    
    return re;
})
```

### 事件回调值传递
> Waterfall类型的钩子可以把上一个注册事件的值传给下一个事件作为第一个参数

```js
const {AsyncSeriesWaterfallHook} = require('tapable');
const hooks = new AsyncSeriesWaterfallHook(['name']);

hooks.tap('tap type', (name) => {
    console.log('first is ' + name);
    // 当返回不是undefined的时候
    return 'first ' + name;
})

hooks.tapAsync('tapAsync type', (name, callback) => {
    console.log('second is ' + name);
    // callback第一个参数为null, 第二个参数不为undefined
    callback(null,  'second ' + name)
})

hooks.tapPromise('tapPromise type', (name) => {
    // 返回的Promise状态为Fulfilled, 并且值不为undefined
    return Promise.resolve('third ' + name)
})
```

### 会循环执行的钩子
> Loop类钩子的注册事件返回值不是undefined的时候,会返回到第一个注册事件重新执行, 直到注册事件返回的是undefined

```js
const {SyncLoopHook} = require('tapable');
const hooks = new SyncLoopHook(['name']);
let second;
let num = 0

hooks.tap('first', (name) => {
   console.log('first %s', num, name);
})

hooks.tap('second', (name) => {
   if (!second) {
      console.log('second again', name);
      num = second = 1;
      return -1;
   } else {
      console.log('end');
   }
})

hooks.call('SyncLoopHook')
```

### 并行执行的钩子
> Parallel和ParallelBail钩子会并行执行注册事件, 因此不会因为事件reject而阻塞执行, 但是ParallelBail reject后 callAsync传入的回调函数的第二参数会是最先拥有返回值
```js
const { AsyncParallelBailHook } = require('tapable');
const hook = new AsyncParallelBailHook(['name']);

hook.tap('first', (name) => {
    console.log('first', name);
})

// 最先拥有返回值逻辑的事件回调
hook.tapAsync('second', (name, callback) => {
    setTimeout(() => {
        console.log('second', name);
        // 使用 callback 传入了不是 undefined 的返回值。
        callback(null, 'second result');
    }, 1000);
})

// 虽然这个异步的事件回调中的 Promise 对象会比第二个异步的事件回调早执行完毕，
// 但是因为第二个事件回调中已经拥有了返回值的逻辑，
// 因此这个事件回调不会执行 callAsync 传入的回调函数。
hook.tapPromise('third', (name) => {
    console.log('third', name);
    // 返回了一个 Promise 对象，并且它的状态是 Fulfilled, 值不为 undefined。
    return Promise.resolve('third result');
})

hook.callAsync('callAsync', (error, result) => {
    console.log('end', error, result);
});

```

## 源码
### 实例化
所有的hooks都是继承了Hooks类, 同时重写了tapAsync, tapPromise和compile三个实例方法
```js
const hook = new Hook(args, name);
hook.tapAsync = TAP_ASYNC;
hook.tapPromise = TAP_PROMISE;
hook.compile = COMPILE;
return hooks;
```

### 注册事件
三种形式的tap调用的是_tap的内部方法
```js
class Hooks {
   tap(options, fn) {
      this._tap("sync", options, fn);
   }

   tapAsync(options, fn) {
      this._tap("async", options, fn);
   }

   tapPromise(options, fn) {
      this._tap("promise", options, fn);
   }
   
   _tap(type, options, fn) {
      // tap做三件事情
      // 合并处理了options
      // 调用拦截器的register钩子处理option
      // 将注册的事件加入到数组中并且排序
      options = Object.assign({ type, fn }, options);
      options = this._runRegisterInterceptors(options);
      this._insert(options);
   }
   _insert(item) {
       // ...
       this.taps[i] = item;
   }
}
```

### 触发事件
三种调用方式都是通过_createCall工程函数生成的
```js
class Hook {
    constructor() {
       this._call = CALL_DELEGATE;
       this.call = CALL_DELEGATE;
       this._callAsync = CALL_ASYNC_DELEGATE;
       this.callAsync = CALL_ASYNC_DELEGATE;
       this._promise = PROMISE_DELEGATE;
       this.promise = PROMISE_DELEGATE;
    }
    
   // compile会被自雷覆盖重写
   _createCall(type) {
      return this.compile({
         taps: this.taps,
         interceptors: this.interceptors,
         args: this._args,
         type: type
      });
   }
}

// factory是继承HookCodeFactory的构造实例
// 通过create生成静态脚本,由于call是惰性函数,只会执行一次
// 动态函数的好处是可以修改参数和内部逻辑,缺点是代码的可读性和实例化的内存消耗增加
const COMPILE = function(options) {
   factory.setup(this, options);
   return factory.create(options);
};

class HookCodeFactory {
   setup(instance, options) {
      instance._x = options.taps.map(t => t.fn);
   }
   create(options) {
       new Function(/*动态脚本*/)
   }
}
```
