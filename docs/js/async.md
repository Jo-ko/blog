---
title: 异步编程
date: 2019-01-12
tags:
- JS
categories:
- 前端知识
---

## Promise期约
### 三种状态
状态是隔离的, 不可修改的, 不可逆的
1. pending
2. fulfilled(resolved)
3. reject

### then
Promise.prototype.then 返回的是一个新的期约实例

### catch
Promise.prototype.catch 返回的是一个新的期约实例

### finally
Promise.prototype.finally 返回的是之前期约实例

### 期约连锁
解决回调地狱,将异步任务串行化
```ts
//      A 
//    /   \ 
//   B     C 
//  / \    / \ 
//  D E   F  G
let A = new Promise((resolve, reject) => { console.log('A');
resolve();
});
let B = A.then(() => console.log('B')); 
let C = A.then(() => console.log('C'));
B.then(() => console.log('D')); 
B.then(() => console.log('E')); 
C.then(() => console.log('F'));
C.then(() => console.log('G'));
```
### 期约组合
```ts
// 接收一个可迭代对象
const p1 = Promise.all([Promise.resolve(), Promise.resolve()])
const p2 = Promise.race([1, 2])
    
// 如果至少有一个包含的期约待定，则合成的期约也会待定。如果有一个包含的期约拒绝，则合成的 期约也会拒绝
let p3 = Promise.all([new Promise(() => {})]);
p3.then(() => console.log('finish')) // 永远不会打印finish

let p4 = Promise.all([
    Promise.resolve(),
    Promise.reject(),
    Promise.resolve() ]);
p4.then(() => {console.log('fulfilled')}, () => {console.log('rejected')}) // rejected


// 如果有期约拒绝，则第一个拒绝的期约会将自己的理由作为合成期约的拒绝理由。之后再拒绝的期 约不会影响最终期约的拒绝理由
let p = Promise.all([
    Promise.reject(3),
    new Promise((resolve, reject) => setTimeout(reject, 1000))
]);
p.catch((reason) => setTimeout(console.log, 0, reason)); // 3
```

## 手写Promise

::: tip 为什么try/catch块并不能捕获reject抛出的错误
拒绝期约的错误并没有抛到执行同步代码的线程里,而是通过异步消息队列线程来处理的,try catch是无法捕获到异步消息队列线程的错误的
:::

## async&await异步函数
1. await接收一个Thenable接口的对象
2. 即使 await 后面跟着一个立即可用的值, __函数的其余部分也会被异步求值__
3. 不可用于全局环境

### 异步函数和Promise的区别
Promise相比异步函数会保留 __更完整的栈追踪__,同时也比异步函数 __占用更多的内存__
```ts
function fooPromiseExecutor(resolve, reject) {
    setTimeout(reject, 1000, 'bar');
}

function foo() {
    new Promise(fooPromiseExecutor);
}

foo()
// Uncaught (in promise) bar
// setTimeout（异步）		
// fooPromiseExecutor
// foo

// 相比异步函数

function fooPromiseExecutor(resolve, reject) {
    setTimeout(reject, 1000, 'bar');
}

async function foo() {
    await new Promise(fooPromiseExecutor);
}

foo()
// foo
// async function (async)
// foo
```
