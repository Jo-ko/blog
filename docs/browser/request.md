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
try {
   xhr.send();
} catch (e) {
    console.log(e)
}
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

#### 示例
```js
const xhr = new XMLHttpRequest();
xhr.open('GET', "path");
xhr.setRequestHeader('content-type', 'multipart/form-data');
xhr.send();
```

### 获取响应头

#### 示例
```js
const xhr = new XMLHttpRequest();
xhr.open('GET', "path");
xhr.onload = function () {
    const allRep = xhr.getAllResponseHeaders();
    const Rep = xhr.getResponseHeader('test-rehead')
}
xhr.send();
```

#### 限制
1. 无法获取 __Set-Cookie__、__Set-Cookie2__ 两个字段
2. 对于跨域请求,只能获取 __Simple response header__ 和 __Access-Control-Expose-Headers__
    - Simple response header: Cache-Control Content-Language Content-Type Expires Last-Modified Pragma

### 获取返回数据
|类型|默认值|空返回类型|条件|
|:---:|:---:|:---:|:---:|
|xhr.response|''|responseType为''或"text"时返回''或者responseType为其他时返回null|-|
|xhr.responseText|''|''|responseType为"text"、""|
|xhr.responseXML|null|null|responseType为'text', '', 'document'|
### 设置返回数据类型
#### XHR Level1
##### 接口
```ts
interface XMLHttpRequest {
   overrideMimeType(mime: string): void
}
```

##### 示例
```js
const xhr = new XMLHttpRequest();
xhr.open('GET', '/path/demo.jpeg', true);

xhr.overrideMimeType('text/plain; charset=x-user-defined');
xhr.onload = function() {
    if (this.status === '200') {
        const res = this.responseText;
        for (let i = 0; i < res.length; i++) {
            let blob = res.charCodeAt(i);
           blob = but & 0xff;
        }
    }
}
xhr.open()
```

#### XHR Level2

##### 接口
```ts
type responseType = 
        '' | // 默认值,表示string字符串
        'text' | // 表示string字符串
        'document' | // 表示document类型
        'json' | // 表示javascript类型
        'blob' | // Blob类型
        'arrayBuffer'; // arrayBuffer类型
interface XMLHttpRequest {
    responseType: responseType
}
```

##### 示例
```js
const xhr = new XMLHttpRequest();
xhr.open('GET', '/path/demo.png', true);

xhr.responseType = 'blob';
xhr.onload = function () { 
    if (this.status === 200) {
        // Blob类型可以使用Blob接收
        const blob = new Blob([this.response], {type: 'image/png'});
    }
}
```

### 获取XMLHttpRequest请求状态
```js
xhr.onreadystatechange = function () {
   switch (xhr.readyState) {
      case 1://OPENED
         //do something
         break;
      case 2://HEADERS_RECEIVED
         //do something
         break;
      case 3://LOADING
         //do something
         break;
      case 4://DONE
         //do something
         break;
   }
}
```
|状态|值|描述|
|:---:|:---:|:---:|
|UNSENT|0|open方法未调用|
|OPENED|1|open方法已调用, send方法未调用, 此时可以调用setRequestHeader和send方法|
|HEADERS_RECEIVED|2|send方法已调用,响应头和响应状态已返回|
|LOADING|3|响应体下载中|
|DONE|4|响应数据获取结束|

### 设置超时时间
1. 开始时间是xhr调用send方法的时候(xhr.onloadstart),结束是xhr.onloadend的时候
2. 即使timeout是在send方法后面调用,开始时间也不便
3. 当xhr是同步请求的时候,无法设置超时时间

```js
xhr.timeout = 30000;
xhr.ontimeout = function () {  }
```

### 设置同步请求
```js
xhr.open('GET', '/path/data', false)
```
#### 同步请求限制
1. 无法设置超时时间
2. withCredentials不能设置withCredentials
3. responseType必须为"";

### 获取上传/下载事件
```js
// 上传监听
xhr.upload.onprogress = progressHandle;
// 下载监听
xhr.onprogress = progressHandle

function progressHandle(event) {
   if (event.lengthComputable) {
       const completePrecent = event.loaded / event.total;
   }
}
```

### XMLHttpRequest事件
|事件名称|触发条件|
|:---:|:---:|
|onreadystatechange|贯穿请求的整个过程,xhr.readyState变化时发生|
|onloadstart|xhr.send调用时发生|
|onprogress|xhr.load.onprogress在xhr.send调用之后发生, xhr.readystate=2之前;xhr.onprogress在xhr.readystate=3时触发,两种progress的都是500ms循环触发直到该进程结束|
|onload|xhr.readystate=4时触发|
|onloadend|xhr所有事件触发结束,包括onerror,onabort,ontimeout|
|onabort|调用xhr.abort触发|
|ontimeout|xhr.timeout不等于0，由请求开始即onloadstart开始算起，当到达xhr.timeout所设置时间请求还未结束即onloadend，则触发此事件。|
|onerror|请求过程中发生传输层以下的network error时触发(如果此时还未上传结束,则先触发xhr.upload.onerror事件)|

#### 事件触发顺序




### onload和xhr.readyState === 4

[comment]: <> (https://segmentfault.com/a/1190000004322487)
