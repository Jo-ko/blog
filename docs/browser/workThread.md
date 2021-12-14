---
title: 工作者线程
date: 2020-04-29
tags:
- 浏览器知识
categories:
- 前端知识
---

## 种类
1. 专用工作者线程: 只能被创建它的页面使用
2. 共享工作者线程: 可以被不同的页面使用
3. 服务工作者线程: 拦截、重定向和修改页面发出的请求

## 专用工作者线程 Worker
```ts
// 接口继承
interface DedicatedWorkerGlobalScope extends WorkerGlobalScope {
    name: string;
    postMessage: Function;
    close: Function;
    importScripts: Function
}

// main.js
// 获取资源创建
const worker = new Worker('./worker.js')
// 行内创建
const worker = new Worker(URL.createObjectURL(new Blob([`self.onmessage = ({data}) => console.log(data);`])));
// 监听消息
worker.addEventListener('message', function (data) {
    console.log(data)
})
// 监听消息传递出错
worker.addEventListener('messageerror', function(err) {
    console.error(err)
})
// 监听线程出错
worker.addEventListener('error', function (err) {
    console.error(err)
})
```

### 动态执行脚本
动态导入的脚本共享当前的作用域
```ts
importScripts('./scriptA.js');
importScripts('./scriptB.js');
// or
importScripts('./scriptA.js', './scriptB.js')
```

### 数据传输方式
1. 结构化克隆
2. 可转译对象
3. 共享数据缓冲区

### 线程池
控制多个线程的状态

## 共享工作者线程 SharedWorker
::: tip 多次调用创建一个线程的条件
1. 同源页面
2. 引入的URL地址相同,无视请求参数
3. 线程名称相同
:::

## 服务工作者线程 ServiceWorker
1. 没有全局构造函数,存在navigator.serviceWorker中
2. 通过register方法注册work
