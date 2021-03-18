---
title: 浏览器架构
date: 2020-04-29
tags:
- 浏览器知识
categories:
- 前端知识
---

## 现代浏览器基本结构 
关于如何构建 Web 浏览器并没有标准规范，不同浏览器的架构可能完全不同, PC版的和移动版的也是有区别的

::: tip 
1. User Interface
    - 用户界面,提供用户与Browser Engine的交互界面接口,包括搜索栏,前进/后退按钮等
2. Browser Engine
    - 浏览器引擎, 提供用户行为和渲染引擎之间的桥梁
3. Render Engine
   - 用来可视化显示用户请求信息
4. Networking
   - 提供网络接口,与平台无关,提供底层的接口
5. JS Interpreter
   - JS代码解释器, 反映到Render Engine显示
5. UI Backend
   - 用于绘制一些基本的nativeUI,比如弹框和窗口, 与平台无关
6. Data Storage
   - 管理用户数据和浏览器数据, 包括一些书签, 设置项
   
<img :src="$withBase('/browser/browser_struct.png')" alt="browser_struct">
:::
     
## Render Engine(浏览器内核)
- Trident: IE浏览器
- Gecko: Firefox浏览器
- WebKit: Safari浏览器
- Blink: Chrome/Opera/Edge浏览器

## JS Interpreter(Js引擎)
> 早期的Js引擎是内置在浏览器内核中, 随着现代前端技术的发展,大部分的浏览器的架构都将其拆分成单独进程来保证其执行效率

### JS引擎组成部分
> 严格意义上讲JS语言是解释型语言, 但目前大部分的JS引擎会将一部分的代码编译成字节码来提升执行效率

1. 编译器: 将源代码转换成AST语法树,在一些引擎会将其转成字节码
2. 解释器: 接收字节码或者AST语法树,执行
3. JIT工具: 将字节码或AST语法树转成目标语言,直接执行,不需要解释器执行,这个也是现代JS引擎效率大大提升的原因
4. 垃圾回收工具和分析工具: 负责垃圾回收和引擎的相关数据收集

### 常用浏览器使用的JS引擎
- V8: 用于Chrome和Node
- JavaScriptCore: 用于Safari等Webkit内核浏览器
- SpiderMonkey: 用于Firefox
- Chakra(JScript): 用于IE/Edge

::: tip 渲染引擎和JS引擎
1. JS引擎提供接口供渲染引擎调用JS代码并获取结果 
2. 渲染引擎根据JS提供的桥接接口实现具体的功能,供JS引擎调用
3. 两者之间的频繁调用会导致资源浪费

<img :src="$withBase('/browser/browers-JS-Render.png')" alt="browers-JS-Render">
:::

## 进程和线程
- 把浏览器比作工厂, 进程就是车间, 线程就是流水线
- 进程之间是相互独立的,通过IPC进行通信
- 同一个进程中的线程是共用一块内存空间的,各个线程是相互协作的
- 对于linux和unix内核,没有线程一说,只有进程和弱进程之分
- 浏览器在进程和线程的处理有两种模式
   - 一个进程和多个线程协作
   - 多个进程通过一些进程通信

## Chrome多进程架构
### 进程划分
- 主进程(浏览器进程): 控制浏览器除了网页视图区域以外的应用控制,包括地址栏,书签,前景后退;同时还包括调用网络请求和文件读取服务
- 渲染进程: 控制tab标签内的站点渲染, 通常一个tab一个渲染进程
- GPU进程: 调用GPU进行图形计算,接收不同进程传递的信息并绘制到相同页面
- 插件进程: 用于浏览器插件的管理
- 实用进程: 网络服务,storage服务和一些native服务

#### 进程示意
<img :src="$withBase('/browser/browser-arch2.png')" alt="browser-arch2">

#### Chrome任务管理器示意
<img :src="$withBase('/browser/browser1.jpeg')" alt="browser1">

### 多进程的优势
1. 进程之间隔离,保证线程崩溃不会相互影响(比如一个Tab渲染出错不会影响另外Tab页渲染)
2. 更好控制线程安全和沙盒,为某些进程设置安全性沙盒

### 多进程的缺陷
1. 多进程间的通讯相比单进程的线程通讯要更费时
2. 会占用更多的内存空间,因此需要对不同的内核机型做优化

### 多进程改进
#### 1. 进程服务化
> 更细粒化的拆分浏览器功能, 以便能够更加细致的控制其拆分或者组合成同一个进程

在高性能的环境上将服务尽可能的拆分成不同的线程,来保证其稳定性
在低性能的环境上将服务尽可能的组合成单一线程,来保证减少内存的占用大小
<img :src="$withBase('/browser/servicfication.svg')" alt="servicfication">

#### 2. iframe进程隔离
> 除了为不同的tab设置不同的渲染进程的同时, 给tab下的iframe也单独设置渲染线程

<img :src="$withBase('/browser/isolation.png')" alt="isolation">

### What happens in "地址导航"?
1. 主进程的UI线程(进程)获取渲染进程的用户输入,解析并判断是搜索项还是其他统一资源定位符(URL), 通知当前tab的渲染进程渲染loading状态
2. 如果是搜索项,调用Storage线程(进程)获取配置项中的默认搜索引擎,根据规则拼接地址,交给network线程(进程)
3. 如果是其他URL,判断Schemes值(统一资源标识符),根据不同协议调用不同的线程(进程)执行操作, 下面举几个🌰
    - file:// 调用File线程(进程)读取本地文件, 交给UI线程(进程),判断安全性后交给渲染进程进行渲染
    - http:// 调用network线程(进程)
    - weixin:// 这种应用范围开头的会查看本地的URL Schemes列表,如果哪个应用注册过该Schemes,就会跳转到该应用(俗称deeplink)
    - 还有其他的,邮箱,电话啥的
4. network线程获取URL
   - 检查service work是否有注册, 如果有的话,就会告知UI线程,UI线程会将其传给渲染进程中的工作线程执行,同时执行数据预加载(获取缓存数据或者发起网络请求)
   - 如果没有的话, network线程会[查询DNS获取ip地址](/docs/computer/network.html#dns),调用socket方法,建立[TCP连接](/docs/computer/network.html#tcp)
5. 如果返回的状态是3xx,network线程会通知UI线程进行页面重定向,然后会重新发起请求
6. 对返回的响应体,network线程会检查Content-Type类型,如果head头有缺失,会通过校验返回内容来确定类型
8. 对于可渲染的内容(比如Html), network线程会进行安全检查([safeBrowsing](https://wsygoogol.github.io/2018/07/31/Google-Safe-Browsing-Api%E4%BB%8B%E7%BB%8D/)和[CORB](https://juejin.cn/post/6844903831373889550)),然后通知UI线程, 如果是下载的内容,会调用下载管理器下载到本地
9. UI线程获取渲染数据找到对应的渲染进程,不过可能在发送请求的时候已经准备好了渲染进程(但是如果发生重定向, 此时的渲染进程就会被抛弃, 一个新的渲染进程就会启动)
10. 如果数据和渲染进程都准备好了,主进程就会向渲染进程提交本次导航,并持续传递数据流,当渲染进程通知主进程已经确认好了,会通知主进程
11. 主进程更新了地址栏的状态(安全标示和站点标示), 存储历史记录, 修改前进后退按钮状态
12. 渲染进程开始文档加载(和11是同步的)
13. 渲染进程完成文档加载后,会通知主进程,主进程会调用UI线程更新loading状态
14. 重新导航    
    - 如果当地址栏地址改变重新请求时,回到第一步重新执行,但在这之前, 主进程会通知渲染进程检查当前进程有无beforeunload事件(有的话就执行)
    - 点击事件造成重新请求时, 渲染进程会检查当前有无beforeunload事件,然后回到第一步执行
    - 如果电脑配置允许, 重新请求的渲染进程和执行卸载当前渲染进程会一并执行

### what happens in "渲染进程"
> 渲染进程的作用是将Html,js和css转换成用户可视化界面
#### 渲染进程中的线程
1. 主线程
2. 工作线程(多个)
3. 合成器线程
4. 光栅线程

#### 构造DOM
1. 主线程解析HTML文本数据,将其构建成DOM树(DOM是当前页面的结构表示,也是js可操作的数据和API)和CSSOM树
2. 遇到js会阻塞HTML解析(添加async和defer不会阻塞)
3. 通过DOM树和CSSOM树合成layout树
4. 主进程遍历layout树生成绘制记录
5. 栅格化layout树
    - 老版本只栅格化当前视图区域的内容(光栅线程)并保存下来
    - 新版本引入了合成概念(合成器线程+光栅线程)
        - 遍历layout树生成图层树
        - 合成器线程根据图层树将页面分成多个图层,每个图层划分成图块,调用光栅线程分别进行栅格化并存储在GPU内存中
            - 合成器线程会调用GPU进程处理一些合成工作
            - 合成器线程会优先栅格化可视视图中或者可视视图周围的图块
            - 合成器会生成不同清晰度的图块,来响应用户对页面的放大缩小操作
            - __此时合成线程没有涉及到主线程的计算,因此不会被样式计算和JS操作阻塞__
        - 发生滚动或者动画时,通过移动图层的方式来合成一个新的帧
6. 栅格化后,合成线程会收集DrawQuads(保存块内存地址和绘制位置信息)来构建成合成帧, 并发送给主进程的UI线程
7. UI线程把这些合成帧发送给GPU进程更新页面

#### non-fast scrollable区域
> 合成线程会将页面中注册了事件监听的区域标记为non-fast scrollable区域, 如果用户事件发生在这些区域的时候, 合成线程会将该事件发给主线程处理,这时候,主线程就可能会阻塞合成线程

1. 为了最大程度地减少对主线程的过多调用，Chrome会合并连续事件（例如wheel，mousewheel，mousemove，pointermove，touchmove），并将调度延迟到下一个requestAnimationFrame之前。而针对keydown，keyup，mouseup，mousedown，touchstart和touchend等相对不怎么频繁发生的事件都会被立即派送给主线程。
    - 对于合并的事件我们该如何获取具体的信息
```js
    window.addEventListener("pointermove", e => {
        const events = e.getCoalescedEvents();
        for(let [pageX, pageY] of events) {
            console.log(pageX, pageY)
        }    
    })
```
2. 我们通常会用下面的方法,通过冒泡来监听某个元素,结果导致整个页面都被标记为none-fast scrollable区域
```js
document.documentElement.addEventListener('touchmove', (e) => {
    if (e.target === target) e.preventDefault();
})
```
3. 通过添加passive: true来告知合成线程不需要等待主线程的回应
```js
document.documentElement.addEventListener('touchmove', (e) => {
    if (e.target === target) e.preventDefault();
}, {passive: true})

```

#### 回流和重绘
> 回流一定会触发重绘,重绘不一定触发回流,但是无论重绘或者回流,都会导致渲染进程重新栅格化layout树

[查看css属性引发的重绘和节流](https://csstriggers.com/)

[comment]: <> (https://developers.google.com/web/updates/2018/09/inside-browser-part1)

[comment]: <> (https://hacks.mozilla.org/2017/10/the-whole-web-at-maximum-fps-how-webrender-gets-rid-of-jank/)

[comment]: <> (https://segmentfault.com/a/1190000022633988)