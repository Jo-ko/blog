---
title: 构建工具
date: 2020-04-29
tags:
- 工程化体系
categories:
- 前端知识
---

## bundler
> 将多个模块根据依赖关系打包成一个或者多个文件

## 模块类型
::: tip CJS(CMD)
1. cjs是动态同步的,意味着你可以在其中使用变量
2. cjs导入的是一个副本, 修改其中的变量不会导致源文件被修改

**代表**
Node

**示例**
```js
//importing 
const doSomething = require('./doSomething.js'); 

//exporting
module.exports = function doSomething(n) {
  // do something
}
```
:::

::: tip AMD
示例
```js

```
:::

<!-- https://juejin.cn/post/6940218189921910797#heading-1 -->
<!-- https://juejin.cn/post/6935973925004247077 -->