---
title: 迭代器&生成器 
date: 2019-01-12 
tags:
- JS 
categories:
- 前端知识
---

## 迭代器

> 迭代器是一种有序的、连续的、基于拉取的用于消耗数据的组织方式。

### 接口

```ts
interface IteratorResult<T> {
    done: boolean;
    value?: T;
}

interface Iterator<T> {
    next: () => IteratorResult<T>; // 取得下一个IteratorResult
    return?: () => IteratorResult<T>; // 停止迭代器并返回IteratorResult
    throw?: () => IteratorResult<T>; // 报错并返回IteratorResult
}

// 例子
const arr = [1, 2, 3];
const it = arr[Symbol.iterator]();

it.next() // {done: false, value: 1};
it.next() // {done: false, value: 2};
it.next() // {done: true, value: 3};
```

### 特点

1. 迭代停止的标识是done: true状态
2. 每个迭代器都是一次性有序遍历且互不干扰
3. 每次迭代都不是数据的快照,因此修改数据,迭代器也会发生变化

```ts
const a = [1, 2, 3];
const it = a[Symbol.iterator]();

it.next(); // done: true 状态
it.next(); // done: true 状态
a.splice(1, 0, 5);
```

### 自定义迭代器

```ts
class Counter {
    constructor(limit) {
        this.limit = limit;
    }

    [Symbol.iterator]() {
        let count = 1,
            limit = this.limit;
        return {
            next() {
                if (count <= limit) {
                    return {done: false, value: count++};
                } else {
                    return {done: true, value: undefined};
                }
            }
        };
    }
}

let counter = new Counter(3);

for (let item of counter) {
    console.log(item) // 1, 2, 3
}
```

## 生成器

```ts
function* generator() {
    yield 1;
    yield 2;
    return 0;
}

const ga = generator() // 第一次调用函数不会执行,只是初始化生成器
ga.next() // 1
ga.next() // 2
ga.next() // 3
```

### yield的作用

1. 作为函数中间返回语句使用

```ts
function* generator() {
    yield 1;
    return 0;
}

const ga = generator()
ga.next() 
```

2. 作为函数中间参数使用

```ts
function* generator(initial) {
    console.log(initial);
    console.log(yield);
    console.log(yield);
}

const ga = generator('initial');

ga.next('first') // 输出'initial', 传入的参数未使用, next是启动生成器的作用
ga.next('second') // 输出 'second', 此时'second'作为了yield的参数
ga.next('last') // 同理输出'last'
```

### yield*

1. 可以使用星号增强 yield 的行为，让它能够迭代一个可迭代对象，从而一次产出一个值

```ts
function* generatorFn() {
    yield* [1, 2, 3];
}

// 上面的内容等同于
function* generatorFn() {
    for (const x of [1, 2, 3]) {
        yield x;
    }
}

let generatorObject = generatorFn();
for (const x of generatorFn()) {
    console.log(x);
}

```

2. yield* 返回的就是迭代器返回值
```ts
function* generatorFn() {
    console.log('iter value:', yield* [1, 2, 3]);
}

for (const x of generatorFn()) {
    console.log('value:', x);
}
// value: 1 
// value: 2
// value: 3
// iter value: undefined
```

### 生成器中断
1. 生成器相比迭代器不同的是生成器对象除了next的方法,还有return方法
2. 生成器一旦中断将无法恢复
```ts
function* generator() {
    for (let i of [1,2,3]) {
        yield 1
    }
}

const ga = generator();
ga.next(); // {value: 1, done: false}
ga.return(); // {value: undefined, done: true}
ga.next(); // {value: undefined, done: true}
```

### 生成器错误处理
1. 不对错误处理会导致中断并结束
```ts
function* generator() {
    for (let i of [1,2,3]) {
        yield i;
    }
}

const ga = generator();
ga.next();
ga.throw('error');
ga.next(); // {value: undefined, done: true}
```
2. 对错误处理会导致跳过当前迭代并继续
```ts
function* generator() {
    for (let i of [1,2,3]) {
        try {
            yield i;
        } catch (e) {};
    }
}

const ga = generator();
ga.next();
ga.throw('error');
ga.next(); // {value: 3, done: true}
```
