---
title: Tcp协议
date: 2020-04-29
tags:
- Http 
categories:
- 前端知识
---

[甘老师](https://www.yuque.com/docs/share/a775d1b9-98bc-4a39-b117-7da3dc79740b?#（密码：ldy8)

### 浏览器从输入地址到页面显示的过程
### 浏览器缓存策略

Queueing: 在请求队列中的时间。
Stalled: 从TCP 连接建立完成，到真正可以传输数据之间的时间差，此时间包括代理协商时间。
Proxy negotiation: 与代理服务器连接进行协商所花费的时间。
DNS Lookup: 执行DNS查找所花费的时间，页面上的每个不同的域都需要进行DNS查找。
Initial Connection / Connecting: 建立连接所花费的时间，包括TCP握手/重试和协商SSL。
SSL: 完成SSL握手所花费的时间。
Request sent: 发出网络请求所花费的时间，通常为一毫秒的时间。
Waiting(TFFB): TFFB 是发出页面请求到接收到应答数据第一个字节的时间。
Content Download: 接收响应数据所花费的时间。
