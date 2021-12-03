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

### 重要的请求头类型
#### Content-type
> MIME的数据格式标签, 使用Content-Type来表示请求和响应中的媒体类型信息

#### cache-control
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
::: tip 请求成功
1. xhr.onreadystatechange触发,xhr.readystate=0
2. xhr.onloadstart触发 xhr.readystate=1
3. 如果有上传阶段 
   - xhr.upload.onloadstart
   - xhr.upload.onprogress
   - xhr.upload.onload
   - xhr.upload.onloadend; xhr.readystate=2
4. xhr.onprogress; xhr.readystate=3
5. xhr.onload; xhr.readystate=4
6. xhr.onloadend
:::
   
::: tip 请求中断(abort/timeout/net error)
1. 发生abort/timeout/error事件后, 立即终止当前请求
2. 触发xhr.onreadystatechange事件 xhr.readystate=4
3. 上传阶段未结束
   - xhr.upload.onprogress
   - xhr.upload[onabort/ontimeout/onerror]
   - xhr.upload.onloadend
4. xhr.onprogress
5. xhr[onabort/ontimeout/onerror]
6. xhr.onloadend
:::

### 选择onload还是onreadystatechange的status===4
- 在上面的请求过程中我们知道onreadystatechange无法区分abort/timeout/error的事件(readystatus都是4)
- 所以当我们需要针对abort/timeout/error做事件监听的时候,请使用onload

### OPTIONS预检请求
预检请求会携带三个信息
- origin
- Access-Control-Request-Method
- Access-control-Request-Headers

## Fetch
> 升级版XMLHttpRequest

### 与XMLHttpRequest的区别
1. fetch使用Promise写法,XHR使用回调函数的写法
2. fetch采用模块化的结构, api在不同的模块上
3. fetch通过数据流的方式处理数据,支持分块读取,XHR必须等到数据完全返回才能读取

### 基本使用
```js
const option: Option = {};
fetch('https://localhost:8080/api/name', option)
    .then((response: Response) => response.json())
    .then(json => console.log(json))
    .catch(err => console.error('Request error %s', err))
```

### Response对象
```ts
enum ResponseType {
   basic, // 同源请求
   cors, // 跨域请求
   error, // 传输层网络层错误
   opaque, // 
   opaqueredirect,
}

interface Response {
    ok: boolean; // true表示对应的Http状态码是200-299, false表示其他状态码
    status: number; // Http状态码
    statusText: string; // Http返回的状态信息
    url: string; // 请求的url, 如果是重定向就是重定向后的页面
    type: ResponseType;
    redirected: boolean; // 表示是否发生重定向
    headers: Headers; // HTTP响应的head头
    // 读取内容的方法, 注意下面方法只能执行一次, 通过clone方法解决
    text: () => Promise<string>; // 得到文本字符串
    json: () => Promise<JSON>; // 得到JSON对象
    blob: () => Promise<Blob>; // 得到二进制Blob对象
    formData: () => Promise<FormData>; // 得到FormData表单
    clone: () => Response; // 克隆当前Response对象
    body: ReadableStream; // 底层接口,当前返回的Response数据块
}
```

### Option对象
> option对象用于订制Http请求

```ts
interface Option {
    method: string; // 方法
    headers: Object; // 头信息
    body: any; // 数据包体
    referrer: string; // referrer标头 
    referrerPolicy: string; // 发送referrer规则
    mode: string; // 模式,跨域or同域
    credentials: string; // 发送带凭证请求
    cache: string; // 缓存策略
    redirect: string; // HTTP跳转处理方式
    integrity: string; // 指定哈希值,用于检查HTTP传回的数据是否等于这预先设定的哈希值
    keepalive: boolean; // 当页面关闭的时候,或者处于静默状态,高速浏览器在后台保持连接
    signal: AbortSignal; // AbortSignal实例,用于取消请求
}
```

#### cache
1. default: 默认值, 现在缓存里面寻找匹配的请求
2. no-store: 直接请求远程服务器,并且不更新缓存
3. reload: 直接请求远程服务器,并且更新缓存
4. no-cache: 将服务器更本地缓存进行比较,有新的才使用服务器资源,否则使用缓存
5. force-cache: 缓存优先,只有不存在缓存的情况下,才会请求远程服务器
6. only-if-cached: 只检查缓存,如果缓存不存在,将返回504错误

#### mode
1. cors: 默认值, 允许跨源请求
2. same-origin: 只允许同源请求
3. no-cors: 请求方法只能使用GET, POST和HEAD,不能添加复杂的头信息

#### credentials
1. same-origin: 默认值同源请求发送cookie,跨域请求不发送
2. include; 一律发送Cookie
3, omit: 一律不发送
   
#### signal
用于取消fetch请求

```js
const controller = new AbortController();
const signal = controller.signal;

fetch(url, {
    signal: signal
})

signal.addEventListener('abort', () => {
    console.log('abort')
})

controller.abort(); // 发出取消信号

console.log(signal.aborted) // true
```

#### redirect
> 重定向规则
1. follow: 默认值,自动跳转
2. error: 如果发生跳转,fetch就报错

::: tip Post请求
我们需要手动设置content-type的值,由于数据类型是字符,所以默认的content-type是text/plain
```ts
const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            body: 'name=jooker&age=12'
        }
)
```
:::

::: tip JSON数据
我们需要手动设置content-type的值,由于数据类型是字符,所以默认的content-type是text/plain
```js
const user =  { name:  'John', surname:  'Smith'  };
const response = await fetch('/article/fetch/post/user', {
  method: 'POST',
  headers: {
   'Content-Type': 'application/json;charset=utf-8'
  }, 
  body: JSON.stringify(user) 
});
```
:::

::: tip 提交表单
不需要手动设置content-type
```js
const formData = new FormData();
const response = await fetch('/users', {
    method: 'POST',
    body: formData
})
```
:::

## WebSocket
```ts
// 创建连接
// ws可以无视同源策略,连接任何地址
const ws = new WebSocket('ws://localhost:8080');
// 客户端发送数据
ws.send();
// 客户端接收数据
ws.onmessage = function(event) { 
    let data = event.data;
    // 对数据执行某些操作
};
// 其他监听事件
ws.onopen = function () {
    // 连接成功事件
}
ws.onclose = function() {
    // 连接关闭事件
}
ws.onerror = function(event) {
    // 是否关闭干净, 错误码, 错误原因
    const {wasClean, code, reason} = event;
}
```


[comment]: <> (https://segmentfault.com/a/1190000004322487)
