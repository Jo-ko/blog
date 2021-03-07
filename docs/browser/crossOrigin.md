---
title: 跨域&跨域资源共享
date: 2020-04-29
tags:
- 浏览器知识
categories:
- 前端知识
---

> 跨域是由浏览器对非同源网站访问的一种安全机制

## 产生跨域的场景
1. 使用XMLHttpRequest或者Fetch发起跨源请求
2. css获取Web字体
3. WebGL贴图
4. 使用drawImage将外链图片/视频画面绘制到Canvas

## 跨域问题解决

### 1. CORS跨源请求
> protocol（协议）、domain（域名）、port（端口）三者不一致就是跨源请求

#### 使用场景
是目前主流安全的跨域解决方案

#### 简单请求
::: tip 触发条件
- 请求方法是HEAD,GET,POST
- HTTP的head属性只包含下面几种属性
  - Accept
  - Accept-Language
  - Content-Language
  - Content-Type: text/plain, multipart/form-data, application/x-www-form-urlencoded
:::
##### 校验方式
1. 客户端携带头信息Origin字段
2. 服务端校验Origin所指定的源是否在允许范围内,是的话就返回Access-Control-Allow-Origin字段
3. 客户端检查接收返回的信息头是否携带Access-Control-Allow-Origin字段,没有就抛出跨域错误

#### 非简单请求
::: tip 触发条件
- 不满足简单请求要求的请求
:::
  
##### 校验方式
1. 客户端发送预检请求OPTIONS
2. 服务端检查Origin、Access-Control-Request-Method和Access-Control-Request-Headers字段以后，确认是否允许跨源
3. 客户端接收服务端响应,检查否携带Access-Control-Allow-Origin,没有就抛出跨域错误

#### 携带cookie问题
1. 服务端设置 Access-Control-Allow-Credentials为true
2. 客户端设置
```js
const xhr = new XMLHttpRequest();
xhr.withCredentials = true;
```
**设置跨域认证信息的时候,后端的Access-Control-Allow-Origin不能为* **

### 2. JSONP
> JSONP不是新协议,只支持get方法

#### 使用场景
一些简单的GET请求方法

#### 解析流程
1. 前端定义一个方法回调,并将该方法拼接已参数形式在请求链接后面
2. 服务端返回一个以该方法为函数名包裹的数据包
2. 前端执行该函数,将服务端返回的数据作为参数传入

#### 原理
1. 利用标签src属性不存在跨域限制的漏洞
2. script标签返回的合法函数会被立即执行

#### 使用方法
```js
<script type="text/javascript">
  window.jsonpCallback = function(res) {
    console.log(res)
  };
</script>
<script
  src="http://localhost:8080/api/jsonp?msg=hello&cb=jsonpCallback"
  type="text/javascript"
></script>
```

### 3. WebSocket
> 支持客户端和服务端的双全工通信,不同于HTTP协议,是一种持久化的通讯协议

#### 使用场景
严格意义上讲WebSocket并不是用于解决跨域问题的,它的使用场景是实时通信

#### 与ajax轮询和长轮询的不同
ajax轮询和长轮询都是被动获取数据,而WebSocket是可以主动接受服务端发送的数据

#### 使用方法
```js
// 前端部分
let socket = new WebSocket("ws://localhost:8080");
socket.onopen = function() {
  socket.send("秋风的笔记");
};
socket.onmessage = function(e) {
  console.log(e.data);
};
// 后端部分
const WebSocket = require("ws");
const server = new WebSocket.Server({ port: 8080 });
server.on("connection", function(socket) {
  socket.on("message", function(data) {
    socket.send(data);
  });
});
```

### document.domain
> 在二级域名(有的人称一级域名)相同的情况下使用, 比如a.test.com和b.test.com

#### 使用场景
页面与iframe之间交互

#### 使用方法
```js
document.domain = "test.com" // 这里是两个页面共同的二级域名;
```

### window.location.hash
> 通过url携带hash ，通过一个非跨域的中间页面来传递数据

::: tip 流程示意
A页面和B页面是同源的,和C页面是不同源的,通过B页面hash, A页面与C页面进行通讯

<img :src="$withBase('/browser/hash_cros.png')" alt="hash_cros">
:::


### window.name
> window.name不随window.location改变而改变

::: tip 流程示意
- A页面和B页面是同源的,和C页面是不同源的
- C页面在window.name设置数据
- 通过B页面替换C页面,此时window.name没有变
- A获取同源B页面的数据

<img :src="$withBase('/browser/name_cros.png')" alt="name_cros">
:::

