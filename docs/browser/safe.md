---
title: 浏览器安全
date: 2020-04-29
tags:
- 浏览器知识
categories:
- 前端知识
---

## 页面安全
### XSS攻击
#### 存储型XSS
1. 首先黑客利用站点漏洞将一段恶意 JavaScript 代码提交到网站的数据库中,(通常是通过文本框输入一段js脚本,服务端未做输入校验)
2. 然后用户向网站请求包含了恶意 JavaScript 脚本的页面
3. 当用户浏览该页面的时候，恶意脚本就会将用户的 Cookie 信息等数据上传到服务器。
#### 反射型XSS
1. 将恶意脚本作为用户输入的一部分发送给服务端
2. 服务端接受该信息并返回给用户
```js

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express',xss:req.query.xss }); // 这里接受了用户传来的未知参数,作为信息的一部分返还给用户
});

module.exports = router;
```
#### 拦截型XSS
一般通过网络劫持,在传输的过程或者用户使用的过程中修改DOM结构来执行恶意脚本
防御方法
1. 设置HttpOnly来限制脚本读取cookie
2. 对用户输入的内容进行编码过滤
3. 设置CSP来限制脚本的加载

### CSRF攻击
诱骗用户点击钓鱼链接,获取用户的cookie等状态后进行跨站请求
防御方法:
1. 设置Cookie 的 SameSite 属性
2. 验证请求来源站点属性Origin
3. 设置CSRF Token来校验站点

### 同源策略
如果两个 URL 的协议、域名和端口都相同，我们就称这两个 URL 同源

### CORS策略
> 全称跨站资源共享,是为了避开同源策略的跨域策略
1. CSP 跨站资源加载
2. CORS 跨域资源请求
3. postMessage 跨域文档通信

[comment]: <> (https://zhuanlan.zhihu.com/p/92255672)




