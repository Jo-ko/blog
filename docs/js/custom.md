---
title: 自己实现系列
date: 2021-04-12
tags:
- JS
categories:
- 前端知识
---

## Promise
### Promise/A+规范
[bluebird实现](https://itbilu.com/nodejs/npm/VJHw6ScNb.html)
[Promise面试题](https://juejin.cn/post/6844904077537574919)

1. Promise有三种状态: pending(等待), resolve/fulfilled(成功), reject(失败)
2. Promise的状态只能从pending到resolve或者reject, 不能逆转,不能在resolve和reject之间转换
3. Promise必须实现then方法,并且then方法返回的是Promise, 同一个Promise的then方法可以被调用多次,并且顺序是调用时的顺序

<<< @/docs/js/code/promise.js 

## 实现深拷贝
<<< @/docs/js/code/deepCopy.js

## 实现call&apply&bind
<<< @/docs/js/code/call.js

## 实现new
1. 首先创一个新的空对象。
2. 根据原型链，设置空对象的 __proto__ 为构造函数的 prototype 。
3. 构造函数的 this 指向这个对象，执行构造函数的代码（为这个新对象添加属性）。
4. 判断函数的返回值类型，如果是引用类型，就返回这个引用类型的对象。

<<< @/docs/js/code/new.js

## 实现防抖
<<< @/docs/js/code/debounce.js

## 实现节流
<<< @/docs/js/code/throttle.js

## 实现instanceof
<<< @/docs/js/code/instanceof.js

## 实现数组扁平化
<<< @/docs/js/code/flat.js

## 实现reduce
<<< @/docs/js/code/reduce.js
