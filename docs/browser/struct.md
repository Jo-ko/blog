---
title: 浏览器架构
date: 2019-01-12
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
> 除了为不同的tab设置不同的渲染进程的同时, 给tab下的iframe也单独设置渲染进程

<img :src="$withBase('/browser/isolation.png')" alt="isolation">

#### 3. 渲染进程共用
当a页面打开b页面的时候, 如果两个站点为同一个站点的时候会共用一个渲染进程

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
5. 如果返回的状态是3xx,network线程会通知UI线程进行页面重定向到其他地址或者获取本地缓存
6. 对返回的响应体,network线程会检查Content-Type类型,如果head头有缺失,会通过校验返回内容来确定类型
8. 对于可渲染的内容(比如Html), network线程会进行安全检查([safeBrowsing](https://wsygoogol.github.io/2018/07/31/Google-Safe-Browsing-Api%E4%BB%8B%E7%BB%8D/)和[CORB](https://juejin.cn/post/6844903831373889550)),然后通知UI线程, 如果是下载的内容,会调用下载管理器下载到本地
9. UI线程获取渲染数据找到对应的渲染进程,不过可能在发送请求的时候已经准备好了渲染进程(但是如果发生重定向, 此时的渲染进程就会被抛弃, 一个新的渲染进程就会启动)
10. 如果数据和渲染进程都准备好了,主进程就会向渲染进程提交本次导航,并持续传递数据流,当渲染进程已经确认好了,会通知主进程
11. 主进程更新了地址栏的状态(安全标示和站点标示), 存储历史记录, 修改前进后退按钮状态
12. 渲染进程开始文档加载(和10是同步的)
13. 渲染进程完成文档加载后,会通知主进程,主进程会调用UI线程更新loading状态
14. 重新导航    
    - 如果当地址栏地址改变重新请求时,回到第一步重新执行,但在这之前, 主进程会通知渲染进程检查当前进程有无beforeunload事件(有的话就执行)
    - 点击事件造成重新请求时, 渲染进程会检查当前有无beforeunload事件,然后回到第一步执行
    - 如果电脑配置允许, 重新请求的渲染进程和执行卸载当前渲染进程会一并执行

### what happens in "渲染进程"
> 渲染进程的作用是将Html,js和css转换成用户可视化界面
#### 渲染进程中的线程
1. 主线程(GUI渲染线程,JS引擎线程, 定时器线程, 网络请求线程, 事件处理线程)
2. 工作线程(多个)
3. 合成线程
   1. 渲染进程中最先被告知垂直同步事件(操作系统告知浏览器刷新一帧的信号)
   2. 接收用户事件,会调节是否需要进入主线程
4. 光栅线程
   1. 由合成线程派生出的线程,用于处理栅格化内容
#### 渲染流程
1. 渲染进程将 HTML 内容转换为能够读懂的 DOM 树结构。
2. 渲染引擎将 CSS 样式表转化为浏览器可以理解的 styleSheets,计算出 DOM 节点的样式。
    1. 生成styleSheets
    2. 样式属性转换
    3. 计算每个节点的样式(样式继承&层叠规则)
3. 创建布局树，并计算元素的布局信息。
   1. 剔除非显示节点
   2. 计算节点的位置信息
4. 对布局树进行分层，并生成分层树。
5. 为每个图层生成绘制列表，并将其提交到合成线程。
6. 合成线程将图层分成图块，并在光栅化线程池中将图块转换成位图。
7. 合成线程发送绘制图块命令 DrawQuad 给浏览器进程。
8. 浏览器进程根据 DrawQuad 消息生成页面，并显示到显示器上。

<img :src="$withBase('/browser/render_process.png')" alt="render_process">

#### 渲染进程在一帧中的执行过程
<img :src="$withBase('/browser/what_happend_render_process.png')" alt="what_happend_render_process">

**针对主线程的详细过程**
<img :src="$withBase('/browser/what_happend_render_process_detail.png')" alt="what_happend_render_process_detail">

::: tip JS EventLoop
在上一帧结束后,触发JS的EventLoop机制,调用宏任务(包括用户的行为触发的回调事件,除了resize和scroll事件)和微任务
:::

::: tip Frame Start
开始刷新一帧
1. 显卡有一个缓冲区的地方,存放着显示器要显示的图像,显示器按照一定频率读取这块缓冲区
2. 显示器在读取下一帧时,会发出一个垂直同步信号(VSync)给操作系统,操作系统再通知浏览器刷新一帧, 合成线程是最早收到VSync事件的
:::

::: tip Event Handle
1. 合成线程收到用户的行为事件(resize, scroll, toucheMove, mousemove), [动画事件](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/animationend_event), [媒体查询事件](https://developer.mozilla.org/en-US/docs/Web/API/MediaQueryList/onchange)
2. 线程会判断是否需要进入主线程执行上面事件注册的回调,注意的是并非每一帧合成线程都会去处理这些事件的
3. 所以resize和scroll事件是自带节流的
:::

::: tip rAF
1. 执行帧动画回调,__红线表示在JS中当我们了scrollWidth、clientHeight、ComputedStyle等会触发了强制重排__
2. 执行intersectionObserver回调
:::

**下面的渲染阶段浏览器会判断是否执行渲染**
1. 浏览器判断更新渲染不会带来视觉上的改变.
2. 帧动画回调为空.

::: tip Parse HTML HTML解析
解析HTML, 如果插入/删除DOM元素,会触发该过程
:::

::: tip Recalc Styles 样式更新
重新计算样式, 当修改样式或者类名改变的时候会触发该过程
:::

::: tip Layout 布局更新
计算每个课件可见元素的几何信息, 浏览器会判断哪些改变需要重新计算
:::

::: tip Update Layer Tree 更新图层树
创建层叠上下文, 为元素的深度进行排序
:::

::: tip Paint 绘制栅格化
1. 记录要执行哪些绘画调用,对于新增的元素或者修改的元素,记录draw调用,序列化进一个叫做SkPicture的数据结构中
2. 执行这些绘画调用, 进行栅格化,执行了draw调用,填充纹理, 会将SkPicture中的操作replay出来,这里才是将这些操作真正执行:光栅化和填充进位图
:::

::: tip Composite 合成
1. 主线程里的这一步会计算出每个Graphics Layers的合成时所需要的data,包括位移（Translation）、缩放（Scale）、旋转（Rotation）、Alpha 混合等操作的参数
2. 在信息计算完成后,会通知合成线程进行处理, 这将包括 will-change、重叠元素和硬件加速的 canvas 等.
3. 合成线程会将图层分成计算好的图块
4. 这一步其实没有真正完成最后的合成,直接通知执行主线程执行requestIdleCallback
:::

::: tip Raster Schedule and Rasterize 光栅调度和栅格化
1. 一种是在CPU中执行, 合成线程派生出光栅线程,多线程并行执行SkPicture records中的绘画操作,最后commit上传到GPU绘制
2. 另一种是直接在GPU中执行SkPicture records中的绘画操作,就是我们常说的GPU渲染
:::

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


### JS为什么会影响页面渲染
Html解析器遇到js代码的时候,会暂停当前的解析,将脚本代码交给v8引擎处理,因为脚本很有可能会修改DOM结构

### CSS是如何影响页面渲染
### CSSOM
1. 为js提供操作样式表的能力
2. 为布局树的合成提供基础的样式信息

::: tip 没有JS,页面解析流程
```html
<html>
<head>
    <link href="theme.css" rel="stylesheet">
</head>
<body>
    <div>geekbang com</div>
</body>
</html>
```
<img :src="$withBase('/browser/css_render_section_one.png')" alt="css_render_section_one">
:::

::: tip 有js
这块js会阻塞DOM的生成,并且同时js解析完成要依赖CSSOM,因此css也阻塞了DOM的生成
```html
<html>
<head>
    <link href="theme.css" rel="stylesheet">
</head>
<body>
    <div>geekbang com</div>
    <script>
        console.log('time.geekbang.org')
    </script>
    <div>geekbang com</div>
</body>
</html>
```
<img :src="$withBase('/browser/css_render_section_two.png')" alt="css_render_section_two">

:::

#### 缩短白屏时间
1. 通过内联 JavaScript、内联 CSS 来移除这两种类型的文件下载，这样获取到 HTML 文件之后就可以直接开始渲染流程了。
2. 但并不是所有的场合都适合内联，那么还可以尽量减少文件大小，比如通过 webpack 等工具移除一些不必要的注释，并压缩 JavaScript 文件。
3. 还可以将一些不需要在解析 HTML 阶段使用的 JavaScript 标记上 async 或者 defer。
4. 对于大的 CSS 文件，可以通过媒体查询属性，将其拆分为多个不同用途的 CSS 文件，这样只有在特定的场景下才会加载特定的 CSS 文件。

### 分层和合成
为了提升每帧的渲染效率,将元素分解为多个图层的操作就称为分层，最后将这些图层合并到一起的操作就称为合成

#### 如何实现分层和合成机制
分层: 在布局树生成后,会生成层树,最终在渲染引擎的主线程生成对应的绘制指令
合成: 在生成绘制指令后,进行栅格化, 形成一张张图片,最后由合成线程进行合成

<img :src="$withBase('/browser/layered_composite.png')" alt="layered_composite">

### Chrome 浏览器为标签页分配渲染进程的策略
1. 如果两个标签页都位于同一个浏览上下文组，且属于同一站点，那么这两个标签页会被浏览器分配到同一个渲染进程中
2. 如果这两个条件不能同时满足，那么这两个标签页会分别使用不同的渲染进程来渲染

#### 阻止跳转链接站点成为同一个浏览上下文组
a标签添加ref="noopener noreferer"属性来断开上下文组关系
```html
<a href="https://fh.dasouch.com" target="_blank" ref="noopener noreferer"></a>
```

### 站点隔离
页面中内嵌的iframe同样遵守同一站点分配原则
<img :src="$withBase('/browser/siteIsolation.png')" alt="siteIsolation">
