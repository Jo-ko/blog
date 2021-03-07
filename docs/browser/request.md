---
title: Ajax/Fetch
date: 2020-04-29
tags:
- 浏览器知识
categories:
- 前端知识
---

## Ajax
> Ajax指一种借助html,css,js和浏览器 __XMLHttpRequest__ 来解决web交互问题的方案

### XMLHttpRequest

#### XHR基本创建使用
```js
// 创建实例
const xhr = new XMLHttpRequest();
// 创建发送数据
const formData = new FormData();
formData.append()
// 发起请求
xhr.open('GET', '/path/to/query');
xhr.send();
// 监听响应
// 写法一
xhr.onreadystatechange = function () { 
    if (xhr.readyState === 4) {
        // 响应, 比较this.status
    }
}
// 写法二
xhr.onload = function () { 
    // 响应, 比较this.status
}
```

### 设置请求头
1. 参数名首字母大小写不敏感, 'Content-type' = 'content-type'
2. content-type的默认值和和具体发送的数据有关
3. setRequest必须在open方法之后,send方法之前
4. setRequest可以多次调用,数据会以逗号的方式连接

```js
const xhr = new XMLHttpRequest();
xhr.open('GET', "path");
xhr.setRequestHeader('content-type', 'multipart/form-data');
xhr.send();
```

### 获取响应头
```js
const xhr = new XMLHttpRequest();
xhr.open('GET', "path");
xhr.onload = function () {
    const allRep = xhr.getAllResponseHeaders();
    const Rep = xhr.getResponseHeader('test-rehead')
}
xhr.send();
```

[comment]: <> (https://segmentfault.com/a/1190000004322487)
