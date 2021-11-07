---
title: this对象 
date: 2020-06-09
tags:
- JS
categories:
- 前端知识
---

> this是在运行时进行绑定的,并不是在编写时绑定,因此this是动态的, 但是需要明确的是 __this既不指向函数自身也不指向函数的词法作用域__

1. 在标准函数中指的是调用该函数的上下文对象, 既函数被调用的位置
2. 在箭头函数中指的是定义箭头函数的上下文对象

## this调用位置所遵循的绑定规则
### 默认绑定
当函数被独立调用, 且运行在非strict mode下,会被绑定到全局对象上
### 隐式绑定
判断调用位置是否有上下文对象
### 显式绑定
通过call,apply绑定this所指向的对象
### 硬绑定
显示绑定的变种, 通过高阶函数形式, 返回一个通过显式绑定的函数对象
### new绑定
通过new调用函数,生成一个新对象,将该对象绑定到函数中的this上

::: tip 绑定优先级
new绑定 > 硬绑定 > 显式绑定 > 隐式绑定 > 默认绑定
:::

::: tip 为什么硬绑定无法对new调用生效
1. 我们通常使用apply来对对象进行硬绑定
2. ES5内置的apply语法会先判断硬绑定函数是否是被new调用, 如果是的话就会使用新创建 的 this 替换硬绑定的 this。
:::

## 安全的this显式绑定
```js
function x(name) {
    return function (age) {
        console.log(name, age)
    }
}
const ø = Object.create(null);
// 将一个ø作为this的绑定对象,能避免用null引起的默认绑定危害
x.call(ø, 'jooker')
```

## this软绑定
> 软绑定是指当this的指向为空或者指向的是默认全局对象时, 才将其硬绑定到指定的对象 
```js
// 在<<你不知道的JavaScript>>中提到的软绑定, 个人觉得软绑定实际的应用不大,而且从代码维护的角度上来说,不确定的软绑定是难以维护的
Function.prototype.softBind = function (obj) {
    const fn = this;
    const args = [].splice.call(arguments, 1)
    const bound = function () {
        const context = !this || (this === globalThis || window || global) ? obj : this;
        return fn.apply(null, args.concat(arguments))
    }
    bound.prototype = Object.create(fn.prototype);
    return bound;
}
```
