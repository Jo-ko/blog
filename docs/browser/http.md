---
title: HTTP协议
date: 2020-04-29
tags:
- 浏览器知识 
categories:
- 前端知识
---

## URL&URN&URI
- url表示资源地址
- urn表示资源名称
- uri是url和urn的超集,用于表示资源的唯一性

## 响应码
1xx: 表示请求已收到,需要进一步处理
    - 100: 上传大文件时返回, 客户端请求头中需要携带: Expect: 100-continue 
    - 101: 协议升级如升级到websocket或者http2.0
    - 102: 表示请求需要处理较多的文件
2xx: 请求处理成功
3xx: 表示重定向或者从缓存读取
    - 304: 从缓存中读取资源
4xx: 客户端请求错误
    - 401 用户未认证
    - 404 服务端不存在该资源
    - 405 请求方法错误
5xx: 服务端处理错误
    - 502 代理服务器无法得到响应
    - 504 超时, 代理服务器和源服务器连接超时

### 长连接
http1.1之后默认支持,header上会显示connection: keep-alive或者proxy-connection: keep-alive

### 上下文请求头
- User-Agent: 表示客户端类型
- Referer: 当前请求上下文域名, 用于缓存策略,防盗链
- Server: 服务端接收服务软件
- Allow: 告诉客户端该URL上的资源允许哪些方法
- Accept-Ranges: 告诉客户端服务器上该资源是否允许range请求o

### HTTP包体传输方式
1. 在头信息中添加Content-Length, 表示包体大小,这种明确表示包体大小的信息有助于接受端解析内容
2. 使用Transfer-Encoding头部指明使用Chunk传输方式,可以动态的推送内容
    - chunk body组成: chunk(chunk-size, chunk-data),last-chunk, trailer-part, CRLF

### 断点续传和多线程下载

### session, cookie, token
::: tip session是如何实现登录的
1. 客户端发送登录请求给服务端
2. 服务端接受消息与持久数据库中的数据进行比对,同时将带有过期时间的会话数据session写入内存数据库
3. 服务端将带有会话状态的sessionId以cookie的方式返回给客户端
4. 客户端在请求其他接口时会带上cookie
5. 服务端比对cookie中携带的session信息与内存数据
:::
::: tip 广告是如何追踪你的行为的
原理是利用了第三方cookie
1. 网站A请求了百度的图片(第三方域名), 第三方返回的数据中携带了cookie
2. 当你访问网站B的时候,同样请求了第三方百度的接口,此时会携带上之前的cookie
:::
::: tip session和token的区别
1. session是记录客户端和服务端会话状态的,是可以记录会话信息的; token更多指的是一种用户凭证(身份证ID), ID里面有用户的所有信息,因此是无状态的
2. session只是简单的用户信息记录是不安全的, token是有一定加密的,有唯一性,是相对安全的
:::

### 缓存
#### HTTP1.1
客户端缓存过期计算方式
```md
// true未过期,false过期
responseIsFresh = freshnessLifetime(缓存新鲜度时间) > currentAge(资源的周期时间);
```

::: tip freshnessLifetime 缓存新鲜度计算方式
freshnessLifetime: 按照下面的优先级取其响应通头值
1. 当Cache-Control存在 __s-maxage__ 值时使用该值, s-maxage指的是中间代理服务器的共享缓存
2. 当Cache-Control存在 __max-age__ 指令时使用该值；或
3. 当请求头存在 __Expires__ 响应头时，使用该值减去 Date 响应头的值作为当前缓存新鲜度
4. 没有任何显式地指定过期时间时，客户端可选地可以启用 __隐式的缓存新鲜度算法__ 计算当前响应新鲜度。

**** 隐式的缓存新鲜度算法
age响应头(浏览器获取文件的时间)的值减去Last-Modified(文件上次修改时间)中的值的10%作为新鲜度的值
```js
const freshnessLifeTime = (dateValue - lastModifiedValue) * 0.1
```
:::

::: tip currentAge
1. currentAge不是头部Age字段
2. currentAge计算涉及到头部Age字段

**Age头部字段**
响应头中的age指的是自源服务器发出资源的响应，到客户端使用这个资源缓存的时候，经过的秒数,即在代理服务器中的时间
```bash
** 例如下面age要加上代理服务器和源服务器之间的时间
客户端 -> 代理服务器A -> 代理服务器B -> 源服务器
```
**涉及到的计算名词**
age_value: 响应头部Age字段
date_value: 响应头部date字段
now: 当前时间 
request_time: 发起请求时的时间
response_time: 收到响应时的时间

**计算过程**
```md
currentAge = 收到响应时的age值 + 本地缓存中的时间
收到响应时的age值 = max(用Date字段计算Age, 逐跳计算Age) // 在1.1版本之前是没有age这个响应头属性的,所以只能通过Date字段来计算
    用Date字段计算Age = max(0, response_time - data_value);
    逐跳计算Age = age_value - (response_time - request_time);
本地缓存中的时间 = now - response_time
```
:::


### network面板中的请求列表数据含义
Queueing: 在请求队列中的时间。
Stalled: 从TCP 连接建立完成，到真正可以传输数据之间的时间差，此时间包括代理协商时间。
Proxy negotiation: 与代理服务器连接进行协商所花费的时间。
DNS Lookup: 执行DNS查找所花费的时间，页面上的每个不同的域都需要进行DNS查找。
Initial Connection / Connecting: 建立连接所花费的时间，包括TCP握手/重试和协商SSL。
SSL: 完成SSL握手所花费的时间。
Request sent: 发出网络请求所花费的时间，通常为一毫秒的时间。
Waiting(TFFB): TFFB 是发出页面请求到接收到应答数据第一个字节的时间。
Content Download: 接收响应数据所花费的时间。
