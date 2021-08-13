---
title: 浏览器缓存
date: 2020-04-29
tags:
- 浏览器知识
categories:
- 前端知识
---

## 整体简化流程
@flowstart
st=>start: GET /index.html
hasCache=>condition: 是否使用缓存?
hasStrongCache=>condition: 强缓存没过期?
negotiateCache=>condition: 协商缓没过期?
serverReturn=>operation: 服务器获取内容
304=>parallel: 返回304
cacheReturn=>operation: 返回本地缓存
e=>end: 返回结果 index.html

st->hasCache
hasCache(no)->serverReturn
hasCache(yes)->hasStrongCache
hasStrongCache(yes)->cacheReturn
hasStrongCache(no)->negotiateCache
negotiateCache(yes)->304
304(path1, left)->cacheReturn
negotiateCache(no)->serverReturn
cacheReturn->e
serverReturn->e
@flowend

### 强缓存
> 所谓的强缓存其实指的是判断资源直接读取本地还是向服务器获取更新的资源 

#### 判断流程
@flowstart
st=>start: GET /index.html
cacheCheck=>parallel: 校验逻辑判断
hasCC=>parallel: Cache-Control标识
hasEx=>operation: Expire标识
hasCCAuth=>condition: 没有缓存机制?
hasCCOver=>condition: 缓存没到期?
e1=>end: 返回缓存资源
e2=>end: 协商缓存校验
e3=>end: 请求服务端资源

st->cacheCheck
cacheCheck(path1, bottom)->hasCC
cacheCheck(path2, right)->hasEx
hasEx->hasCCOver
hasCC(path1, right)->hasCCAuth
hasCC(path2, bottom)->hasCCOver
hasCCAuth(yes@有缓存标识)->e1
hasCCAuth(no@没有缓存标识)->e3
hasCCOver(yes@缓存没到期)->e1
hasCCOver(no@缓存到期, left)->e2
@flowend

#### 相关header
::: tip Pragma
1. 只有一个值: no-cache
2. 效果和Cache-Control: no-cache一致
:::
   
::: tip Cache-Control
用于控制缓存行为,__优先级最高__, 弥补Expires的时间相对问题(Expires的时间是相对服务器而言的),

|字段名|描述|
|:---:|:---:|
|public|表示可以被任何对象缓存| 
|private|只允许个体客户端（如浏览器）去缓存，而不允许共享高速缓存（如CDN）去缓存。|
|no-store|不允许缓存,包括强缓存和协商缓存|
|no-cache|客户端缓存内容,但是返回之前需要服务端进行协商验证|
|max-age|设置缓存的最大周期时间,类似Expires,单位秒 但这个时间是相对于请求时间|
|s-maxage|会覆盖max-age和Expires,单位秒, 但仅适用共享缓存(CDN)|
|max-stable|表明客户端愿意接收一个已经过期的资源,设置的时间表示响应时间|
|min-fresh|告知服务器,客户端希望接收一个在小于该时间的被更新过的资源|
|must-revalidation|一旦资源过期(比如已经超过max-age),在成功向原始服务器验证之前,缓存不能用该资源,请求失败会返回504|
|proxy-revalidation|和must-revalidation类似,但只能用于共享资源|
|only-if-cached|客户端只接收已经缓存的响应,但不用向服务器验证资源是否更新|
|no-transform|不允许对资源进行格式转换|
:::

::: tip  Expires
1. 控制缓存过期时间
2. 请求头携带 __if-Last-modified__ 时,服务端响应头携带改信息和 __Last-modified__
3. HTTP 1.0产物,受制于浏览器本地时间,本地时间修改会导致资源过期
:::

####  memory-cache & disk-cache & prefetch cache
1. from memory cache
    - 从内存中读取缓存
    - 读取速度最快
    - 适合小文件 
2. from disk cache
    - 从硬盘中读取缓存
    - 读取速度相比内存较慢
    - 适合小文件
    - 由于存储在硬盘中,保存的时间长
3. prefetch cache
    - 标识preload和prefetch资源加载时,从http cache中读取
    - 使用完后存储在memory cache中

### 协商缓存
> 所谓的协商缓存是判断服务器的资源是否真的已经更新,是的就返回对应的资源,如果不是就返回304,浏览器直接读取本地缓存

#### 相关header
::: tip Last-Modified和If-Modified-Since(If-Unmodified-Since)
1. http1.0产物, 表示资源修改的时间,精确到秒
2. Last-Modified告诉浏览器当前 __资源的最后修改时间__
3. 第一次服务器传给浏览器的Last-Modified,第二次请求的时候会将该值赋值给if-Modified-Since传递给服务器
:::
   
::: tip ETag和If-None-Match(If-Match)
优先级比Last-Modified高,用于解决Last-Modified的一些问题: 
    - 修改时间只能精确到秒级
    - 对于一些文件,虽然修改时间变化了, 但内部的数据内容并没变化
    - 服务器未正确捕获文件修改时间

1. http 1.1产物, 标识资源状态
2. ETag是资源内容的 __hash字符串__,由服务器生成
3. 第一次服务器返回的Etag值,第二次请求时会将该值赋值给If-None-Match
4. 对于分布式服务器,需要保持Etag值一致
:::
