---
title: Webpack热更新
date: 2020-01-29
tags:
- 框架基础
categories:
- 前端知识
---

## 文件监听
1. 在命令行后面添加--watch参数
2. 在webpack的配置文件添加watch: true参数

### 文件监听的原理
轮询判断每个文件的最后编辑时间, 当文件的编辑时间发生变化时,会先缓存,等待aggregateTimeout的时间之后再一起通知
```js
module.export = {
    watch: true,
    watchOptions: {
        ignore: /node_modules/,
        agregateTimeout: 300, // 监听到文件变化后300毫秒之后才执行
        poll: 1000, // 每秒询问1000次文件是否发生变化
    }
}
```

## HMR
### 执行原理
1. 初次构建: A->B->C->D->E
2. 文件更新: 1->2->3->4->5
<img :src="$withBase('/framework/webpack_HMR.png')" alt="webpack_HMR">

::: tip 相关名词含义
webpack-compiler: 将文件编译成bundle.js
Bundle-server: 用于输出可访问的bundle文件服务器
HRM-server: 将热更新修改的文件发送给HRM Runtime控制系统
HRM Runtime: webpack注入到代码中用于接受热更新变化文件的控制系统
bundle.js: 最后输出在宿主端的可执行文件
:::
