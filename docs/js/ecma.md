---
title: ECMAScript 版本
date: 2020-04-29
---

## 重要版本经历
- ES3: 第一份完全符合标准的设计语言,标志着javascript成为一门完善的脚本编程语言,这个版本也是大部分ie能够兼容的版本
- ES5: 在ES3的基础上增加了对象的一些属性方法,增加了use strict严格模式,也是所有现代浏览器能兼容的版本
- ES6(ES2015): 是最大的一次版本特性增强更新,增加了许多面向对象的语法糖属性和新特性, 一般我们从这个版本开始需要使用babel向下兼容
- ES8(ES2017): 重点增加了解决Promise嵌套地狱方法-异步函数(Async/await)和Object对象key,value,entrance的方法

## 主流浏览器各版本最大兼容
- ie10-ie11: ES5
- Edge 12+: ES6
- Safari: ES5
- Chrome: ES6
- Firefox: ES6
- iOS Safari 9: ES5
- iOS Safari 10+: ES6
- Android Browser 4: ES5
- Android Browser 5+: ES6
- Chrome for Android: ES6

## 目前主流的浏览器ES6的兼容情况
[![rhBpB4.jpg](https://s3.ax1x.com/2020/12/26/rhBpB4.jpg)](https://imgchr.com/i/rhBpB4)

- 如果是PC端应用可以适配到ES6,这样可以有效降低代码量,尤其是当代码中充斥着Promise和class的时候
- 如果是移动端项目,看用户的机型版本号的,一般不是要求适配ios9和android4一下的都可以使用ES6