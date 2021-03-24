---
title: 小程序
date: 2020-04-29
tags:
- 小程序
categories:
- 前端知识
---

## 基本架构图
<img :src="$withBase('/native/miniProgram-整体架构.png')" alt="miniProgram-整体架构">

## 同层渲染
> 原生组件和webview视图不在一个画布上,并且原生组件的层级高于webview视图组件,导致在视图渲染的一些层级问题

### 原理
#### ios端
> ios端的渲染层内核是Webkit,基于WKChildScrollView这个原生组件,当一个原生组件挂载时,会将其转移到预先建好的WKChildScrollView容器中

::: tip 步骤
1. 创建一个DOM,设置属性overflow: scroll且-webkit-overflow-scrolling: touch
2. 查找该DOM节点对应的WKChildScrollView
3. 将原生组件挂载到该容器下作为子节点
<img :src="$withBase('/native/miniProgram-同层渲染-ios.png')" alt="miniProgram-同层渲染-ios">
:::
   
#### Android端
> 安卓端的渲染成内核是Blink, 利用WebPlugin机制和embed标签

::: tip 步骤
1. webview创建一个embed标签,并制定type类型
2. Blink内核会创建一个WebPlugin实例,并且生成一个RenderLayer
3. 客户端创建一个原生组件实例
4. 客户端将该实例绘制到RenderLayer所绑定的surfaceTexture
5. 通知Blink内核渲染RenderLayer
<img :src="$withBase('/native/miniProgram-同层渲染-andorid.png')" alt="miniProgram-同层渲染-andorid">
:::

## 优化方案
1. 将一些静态的展示页面,比如说明页,隐私政策或者一些临时性很强的,比如活动页,放到webview中


[comment]: <> (https://zhaomenghuan.js.org/blog/wechat-miniprogram-principle-analysis.html#%E5%89%8D%E8%A8%80)
