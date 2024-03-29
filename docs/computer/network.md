---
title: 计算机网络
date: 2020-04-29
tags:
- 计算机基础
categories:
- 前端知识
---

> 从浏览器链接输入框按下回车键的时候,都发生了什么

## 网络分层模型
### 为什么要分层
网络之间传输需要对其数据做很多处理,就像处理程序的时候一样,如果一段代码很复杂,我们就会对其拆分成一个个函数来处理特定的事情,
网络分层就是将处理网络的模块化,每一层做特定的事情,各层通过协议来相互通信.

### OSI模型(学院派)
> OSI将网络模型分为7层(1-3为下三层, 4-7为上四层)

#### 自底向上的各层说明
1. 物理层: 处理网络的物理手段, 用于将数据转成比特流, 设备包括中继器、集线器、适配器.
2. 数据链路层: 处理包和比特流, 将比特流与帧进行转换(确定0与1的分组方式), 通过 __差错控制__ 提供可靠的数据链路传输, 包括**MAC物理寻址**,链路管理,数据的分装成帧,流量控制,差错控制,数据的校验重发,设备包括二层交换机,网桥.
3. 网络层: 处理帧和数据包(包括源站点和目标站点的网路地址)之间的转换,选择合适的网间路由和交换节点,确保数据及时传输,建立主机-主机之间的连接,同时引入**ip逻辑选址**,用于区分哪些主机属于同一子网中,设备包括路由器.
4. 传输层: 提供进程之间(端对端)的透明可靠的逻辑通信,屏蔽了具体的通信传输系统,具体协议有TCP,UDP,实现接口是Socket,三次握手,四次挥手就是在该层产生的
5. 会话层: 访问验证和建立,管理和终止应用之间的会话
6. 表示层: 用于传输信息的显示,解压缩和加解密
7. 应用层: 直接面向用户,为操作系统或者应用程序访问网络服务提供的接口

#### 传输过程
发送端 -> 每层加上对应的协议头 -> 物理层转成0,1二进制流 -> 光信号/电信号/电磁波信号 -> 中继交换机交换(链路层) -> 中继路由器转发(网络层) -> 接收端各层解封装 -> 应用层送达

### 数据链路层
::: tip MAC和IP
IP相当于地址,有定位功能; MAC相当于身份证,有标识功能
:::

### TCP/IP模型(实践派)
> 合并应用层,表示层,会话层统一为应用层

::: tip OSI和TCP/IP模型的各层比较
前端需要关注软件方向的2层

<img :src="$withBase('/computer/OSI_TCP_DIFF.png')" alt="OSI_TCP_DIFF">
:::

::: tip 输入链接回车过程

<img :src="$withBase('/computer/url_click_process.png')" alt="Url_process">
:::

### DNS
> 标识语言和IP之间的映射

#### DNS查询的过程
1. 如果网页添加 \<link rel="dns-prefetch" href="www.you.url">, 浏览器会进行预请求,并在需要的时候返回
2. 读取浏览器DNS缓存(chrome://net-internals/#dns 查看浏览器缓存),浏览器的缓存时间较短, 在10s-1分钟
3. 查找hosts文件中的对应关系,如果没有找到, 则查找本地操作系统内存中的DNS缓存
4. 路由器DNS缓存
5. ISP DNS缓存(网络提供商的服务器查询)
6. 根域名查询,若无对应记录,13台根域名服务器查询到其顶级域名服务器ip返回给本机
7. 顶级域名查询,若无对应记录,返回主域名器ip(权威域名)返回给本机
8. 主域名查询,若无对应记录,则进入下级域名查询,一直重复该动作直到查询到正确记录
9. 缓存查询记录

#### DNS传输层使用的协议
目的端口为53的UDP明文协议,不会验证来源,所以是有隐患的,比如DNS欺骗

### UDP
> UDP是面向报文的无连接,不可靠连接,但是传输的效率高

#### UDP的应用场景
1. 数据小,对丢包不敏感
2. 不需要一对一的,而是广播的应用
3. 效率高,低延时,可接受一定的丢包的应用

### TCP
> TCP是一种面向连接,可靠的,基于字节流的,双全工传输层协议, 通过三次握手建立连接,通过四次挥手来断开连接

#### TCP协议特点
1. 面向连接: 通过序列号和确认应答保证了传输的有序完整,通过校验机制保证数据的正确
2. 数据流处理: TCP可以一个一个字节的接收数据,再把接收到的数据组合成长度不同的段,传递到网络层
3. 超时重传: 如果对方在规定的时间没有发送ACK确认应答报文,会重新发送该数据
4. 重新排序: 如果数据的接收顺序错误,TCP能够对数据进行重新排序来回复数据
5. 流量控制: 通过 __滑动窗口__ 来确保 __数据的发送大小__ 传输不会超过接收方的接收能力
6. 拥塞控制: 通过 __拥塞窗口__ 来调节发送 __数据的发送速率__

#### TCP报文结构
<img :src="$withBase('/computer/TCP_struct.png')" alt="TCP_struct">

##### 字段说明
- 源端口号: 发送方端口号
- 目标端口号: 接收方端口号
- 序列号(seq): 本报文段发送数据的第一个字节的编号,是一个32位无符号数,SYN不为1时,是当前数据分段的第一个字母的序列号,SYN为1时,就是ISN
  - TCP报文可以一次发多个包,而网络延迟等一些原因会导致包抵达接收方的时候顺序混乱的情况,因此需要 __序列号进行重排序__
- 初始序列值(ISN): 一串随机加密密文,用于保证安全性
- 确认号(ack): 表示接收方希望收到下个数据的Seq,等于接收方当前接收的Seq + 报文大小 + 1
- 数据偏移: 数据偏离TCP首部的距离,也就是选项的数据大小值
- 保留位: TCP将来发展的预留位置
- 标志位字段
    - CWR: 拥塞窗口减少的标志, 表明收到了接收方设置的ECE标志, 此时发送方会通过减小发送窗口来降低发送速率
    - ECE: 当ECE设置为11时,标识当前网路线路拥堵
    - URG: 标识报文中是否包含紧急数据, 不按照原本的排队顺序发送, URG=1表示有,该标识下的紧急指针字段才有效
    - __ACK__: 表示ack字段是否有效,ACK=1时表示有效,TCP规定,连接建立后,ACK必须为1
    - PSH: 表示接受方接受到该报文,立即传递到应用层,而不是放入缓冲区
    - RST: 表示需要重新连接,发送该标识时,接收方直接丢弃缓冲区数据,而不必等到发送发方发送ack确认
    - __SYN__: 建立连接时用于同步序号, SYN=1,ACK=0, 表示正在请求建立连接, SYN=1, ACK=1, 表示建立连接成功,只有在请求建立连接和连接建立成功的时候SYN才等于1
    - __FIN__: 表示数据是否发送完毕, FIN=1的时候表示发送完毕,可以断开连接
- 紧急指针: 数据中分为紧急数据和普通数据,紧急指针指向紧急数据的末尾
- 滑动窗口: TCP流量控制方法,该机制允许发送方在停止并等待确认前连续发送多个分组，而不必每发送一个分组就停下来等待确认，从而增加数据传输的速率提高应用的吞吐量

#### 三次握手
三次握手的目的是双方建立有效连接, 所以需要a->b的连接成功和b->a的连接成功,因此需要一次开始请求, 两次应答请求
::: tip 
__A. 三次握手过程__

<img :src="$withBase('/computer/TCP_connect.png')" alt="TCP_connect">

__B. 三次握手的作用__
1. 确认双方的接受能力和发送能力正常
2. 生成自己的初始化序列号,同步连接双方的序列号和确认号, 交换TCP窗口大小信息等
3. 防止已经失效的历史请求连接(一次握手)和过多的连接造成的资源浪费(两次握手)

__C. 三次握手可以携带数据吗__
前两次是不能携带数据的,因为这个时候还未建立有效安全的连接,第三次是可以的,因为这个时候两端的接收发送能力都是正常的

__D. 序列号为什么不从1开始__
序号不从1而且要从时间计数器的原因是，为了防止有效时间内包的序号重复。发生拼接包的错误。

:::


#### 四次挥手
四次挥手的目的是要双方都关闭连接,因此需要1次开始请求,1次确认开始请求,两次确认状态请求
::: tip
__四次挥手过程__
1. 客户端发送FIN报文,携带序列号seq=u, 等待服务器确认, 并停止发送数据, 进入FIN_WAIT_1状态
2. 服务器接收到FIN请求后,会发送ACK确认报文,携带确认号ack=u+1,表示已经收到断开连接请求,服务器进入CLOSE_WAIT状态,客户端进入FIN_WAIT_2状态
3. 如果服务器准备好断开连接,也会再次发送一个FIN报文,携带自己的ack序列号,并进入LAST_ACK状态
4. 客户端接收到了服务端的FIN报文,会发送一个ACK确认报文,并进入TIME_WAIT状态,等待一定时间后进入CLOSED状态, 服务端接收到了该报文,就会直接进入CLOSED状态

<img :src="$withBase('/computer/unlock_connect.png')" alt="unlock_connect">

__四次挥手的作用__

保证双方在数据完全发送完毕后再断开连接

__为什么客户端会有TIME_WAIT状态__

1. 保证客户端最后一次的ACK确认报文能够送达,如果ACK丢失就能重新发送一次
2. 保证该次TCP连接的历史请求不会出现在下次TCP连接. 比如应用A直接跑路,而服务端不知道,仍在发包,这样就会造成监听该端口的应用B收到报文
:::



#### 重传机制
##### A. 超时重传
> 超时重传相对简单,在发送数据时,设定一个定时器(RTO),当超过指定的时间后,没有收到对方的 ack 确认应答报文,就会重发该数据

- 超时重传会在 __数据包丢失__ 和 __确认包丢失__ 的情况下产生
- RTO不能过长或者过短
  - 过长会造成重发时间较长,效率低下
  - 过短会造成由于包往返时间(RTT)较长产生的假性丢包而导致非必要的重发,进而造成网络传输堵塞
  - RTO的时间计算是采集RTT的时间数据,通过既定公式算出来, __如果第一次发生超时重传,RTO=T, 那么第二次RTO=2T__, 依次类推

##### B. 快速重传
> 目的是解决超时重传时间问题, 快速重传不是已时间为驱动, 而是以数据为驱动

- 当接收方发送三个相同ack标识的沉余报文的时候,发送端就会在RTO的时间内(大部分是立即)重传丢失的包
- 由于确认包的ack标识相同,接收端无法识别需要重发哪些包
- 通过SACK方法(选择性确认)来解决重传包标识的问题
  - 在TCP报文的选项中添加SACK属性,标识已经缓存的数据
- 通过D-SACK(SACK标识ack之前数据包范围),来告知发送端哪些包是重复的

#### 流量控制 - 滑动窗口

::: theorem 名词解释
1. MSS: 最大报文段长度, TCP通讯传递的单位报文的数据(不包括文段头)的最大字节, ipv4一般为536字节, ipv6为1220字节,只在SYN=1的状态下使用
2. TCP包状态: 1.已发送未确认包, 2.已发送已确认包, 3.未发送可以发送包, 4.未发送禁止发送的包 
3. Win: 窗口可接收总大小,包括swnd(发送窗口)和rwnd(接收窗口),这两个窗口近似相同
4. Len: 当前报文数据大小
:::

<img :src="$withBase('/computer/window_size.png')" alt="window_size">   

**注意: 接收方确认的时机可以是对每一个包进行确认,或者当对方传了(Win/MSS)的包数时才进行确认**

::: tip 确认滑动窗口
- 三次握手期间建立连接,确认各自窗口大小(取最小的窗口大小作为发送方发包大小)

<img :src="$withBase('/computer/window_size_1.png')" alt="window_size_1">
:::

::: tip 窗口传输
- 当前单位报文长度是5,窗口大小是15,因此可以连续发三次包,这里假设在发出的包未全部确认的时候,不会继续发包(实际有些设备会对每一个发送方的包都发一个确认包)

<img :src="$withBase('/computer/window_size_2.png')" alt="window_size_2">
:::

::: tip 包丢失
- 这里指的是数据包丢失的情况,接收方会在下一个确认包中请求丢包数据,发送方就会知道丢包情况,并发送对应的包
- 如果丢的是确认包,只要后面的确认包送达,就能说明之前的包已经确认
- 因此引入窗口的概念后，被发送的数据不能立刻丢弃，需要缓存起来以备将来需要重发。

<img :src="$withBase('/computer/window_size_3.png')" alt="window_size_3">
:::

#### 拥塞控制 - 拥塞窗口
> 流量控制是避免发送方的数据包填满接收方的缓存区,是发送方基于接收方环境的调度,拥塞控制是避免发送方的的数据堵塞网络,是发送方基于网络环境的调度

- 当触发重传机制时, 就会触发拥塞控制
- 拥塞窗口(cwnd)等于发送方窗口与接收方窗口的最小值
- 慢启动: TCP发包数量不是一成不变的,一开始会发一个包,并逐次增加
  - 当发送方每收到一个ACK确认包，cwnd的大小就会加1
  - 慢启动有一个ssthresh(慢启动门限), 大小一般为65535字节
  - 当cwnd小于ssthresh时,会开启慢启动算法
- 拥塞避免算法: 当cwnd大于ssthresh的时候会启动拥塞避免算法
  - 每当收到一个ACK时，cwnd += 1/cwnd
- 拥塞发生算法:
  - 触发重传机制的时候会触发拥塞发生算法
  - 针对重传机制的不同不同,有不同的策略
    - 在超时重传的情况下:
      - ssthresh = cwnd / 2
      - cwnd = 初始值
    - 在快速重传的情况下:
      - cwnd = cwnd / 2
      - ssthresh = cwnd
      - 进入快速恢复算法:
        - cwnd = ssthresh + 3 (接收端会发三次ack包来通知丢包情况)
        - 重发丢失的包
        - 如果再次收到重复的ack,cwnd++;
        - 如果收到新的ack, ssthresh = cwnd, 此时进入拥塞避免状态

::: tip 拥塞控制-超时重传
这种方式会使数据包传输断崖式减少,造成网络卡顿

<img :src="$withBase('/computer/cwnd_timeout.png')" alt="cwnd_timeout">

:::

::: tip 拥塞控制-快速重传

<img :src="$withBase('/computer/cwnd_fast.png')" alt="cwnd_fast">

:::

## http的发展历史
### http0.9
早期的0.9版本的目的是为了传输一些文本文件,因此整体的体量不大
1. 只有一个请求行,没有请求头和请求体
2. 响应的只有返回信息,没有响应头
3. 传输的格式是以ASCII字符流传递的
<img :src="$withBase('/computer/http_0.9_process.png')" alt="http_0.9_process">

### http1.0
1. 增加请求头和响应头来增加多类型文件传输
2. 增加请求状态码
3. 增加cache机制
4. 增加用户代理(user-agent)
<img :src="$withBase('/computer/http_1.0_process.png')" alt="http_1.0_process">

### http1.1
1. 增加长连接机制, 对于同一个域名,默认允许同时建立 6 个 TCP 持久连接
2. 支持虚拟主机,浏览器为每个域名最多同时维护 6 个 TCP 持久连接；
3. 安全机制

::: tip http1.1的问题
关键是对带宽的利用率较低,造成的原因如下:
1. Tcp慢启动,该机制是为了防止资源过大而造成网络阻塞
2. 多个Tcp连接竞争带宽, 多个tcp连接在带宽不足的情况下会减慢接受的速度
3. 对头阻塞,在长连接的过程中,当前一个请求因为某些原因造成阻塞的时候,后面的资源请求只能排队等候
:::

### http2.0
1. 增加多路复用机制来解决http1.1的应用层的对头阻塞问题(对头阻塞问题并未完全解决,因为Http2.0依旧依赖的是tcp, tcp的应答是严格有序的)
2. 增加请求优先级设置
3. 服务器推送
4. 请求头和响应头压缩

::: tip 多路复用
1. 一个域名只使用一个连接
2. 资源可以并行请求
<img :src="$withBase('/computer/multiplexing.png')" alt="multiplexing">

实现方式: 增加二进制分帧层 
1. 在二进制分帧层将每个请求的数据转换成带有id编号的帧
2. 服务端会将相同的id编号的帧合并成一个完整的信息
3. 同样服务端处理完后也是将数据以一个个id的帧的形式经过协议栈传递给浏览器
4. 浏览器将相同的id的帧组合成一个提交给对应的请求
:::

## 前端相关问题
### Http状态码
- 1xx(信息响应)
  - 100: 表示当前连接正常,可以继续发送请求或者忽略这个响应
- 2xx(成功响应)
  - 200: 请求成功
  - 204: 请求成功,但响应报文不包含实体的主体部分
  - 206: 部分请求成功,经常出现断点传输和一些大文件
- 3xx(重定向)
  - 301: 永久重定向
  - 302: 临时重定向
  - 303: 临时重定向,将post请求方法转到get方法请求
  - 304: 临时重定向,指向到客户端本地缓存
  - 307: 临时重定向,不会将post请求转到get方法请求
- 4xx(客户端错误)
  - 400: 请求报文语法错误
  - 401: 携带认证信息请求失败
  - 403: 请求拒绝
  - 404: 请求资源不存在
- 5xx(服务器错误)
  - 500: 服务器请求处理过程错误
  - 503: 服务器无法处理请求, 如负荷超载或者停机
    
### get和post的区别
1. 首先,我们要清楚get和post是HTTP给TCP请求披上了不同的两种请求,但其实本质是一样的(底层都是TCP请求)
    - GET和POST是HTTP两种发送请求的方式,处于TCP/IP分层模型的应用层
    - HTTP的底层实现是TCP协议,所以GET和POST的底层也是TCP
2. 其次,是由于HTTP的规定和浏览器/服务器的限制，导致他们在应用过程中体现出一些不同, 这是为了保证在不同场景做出最优传输
    - 从功能表达上: GET是用于获取数据的, POST是用于更新数据的
    - 从携带参数上: GET是通过链接携带参数, POST是放在报文中的请求体Request Body中,由于URL的长度限制,因此POST能携带更多的参数
    - 从安全性上: 由于GET是明文传输,POST安全性要更高些
3. get和post还是有一些区别: GET只花费一次RTT时间，而POST有两次RTT时间消费(先发一次head,再发body)

### Http的长连接和短链接
1. Http的长短连接准确的说应该是TCP的长连接和短连接, Http只是位于应用层上的一种协议
2. HTTP/1.0和HTTP/1.1都可以实现长连接,只是1.1是默认开启,HTTP/1.0需要添加keep-alive来手动开启
3. 短连接在每次数据发送完成的时候都会四次挥手断开连接,需要连接的时候再次执行三次握手
4. 长连接分别在网络层和应用层上做了处理
   - 传输层上: 在每次连接后服务端会维持一个保活状态,在两个小时的间隔,服务器会向客户端发一个探测报文段
      - 客户端TCP响应正常,并接收到报文,会通知服务器将保活定时器复位
      - 客户端崩溃了,关闭,重启过程中,或者报文未被正常响应,服务器会间隔75秒,发10个探测报文,如果仍未被响应,就会关闭连接
   - 应用层上: 当连接发生问题时,不仅仅是网络层面出现了问题,也有有可能是应用层面上的问题,因此应用层采用心跳机制来保活
      - 客户端在数据发送完成后不会发送FIN包,而是定时发送一些心跳报文,如果服务器对心跳报文没有做响应,客户端则认为连接不可用,主动断开连接
5. 短连接适用于并发量大没有频繁操作的场景,长连接适用连接数不多,交互较多的场景

### HTTP1.0 & 1.1 & 2.0
- HTTP1.1的变化
1. 默认开启长连接
2. 增加响应状态码
3. 支持head和body分开传输,节省带宽
4. 增加更多的缓存控制策略

- HTTP2.0的变化
1. 多路复用,允许通过单一的HTTP连接发送多重请求,
   - 在应用层上添加一层二进制分帧层
   - 二进制分帧层通过将数据包拆分成帧,同时携带序号,根据序号在服务端重组
   - 由于在一个连接上传输数据,能更好的使用TCP慢启动机制
2. 支持服务端推送数据
3. 头部压缩,减少包体大小
4. 对HTTPS有更好的支持

### HTTP 和 HTTPS 的区别
1. 安全性: HTTP的连接是无状态,HTTPS由于添加SSL/TLS变得是有状态
2. 端口不同: HTTP是80,HTTPS是443
3. 资源消耗: HTTP是明文传输,HTTPS是加密传输,需要消耗更多CPU和内存

### 如何优化HTTP请求
1. 编码效率
  - brotli压缩代替gzip压缩
  - 减少请求报文大小
    - 使用HTTP2.0的HPACK头部压缩技术,减少head大小
    - 减少使用cookie
  - 减少响应报文大小
    - 响应体压缩
2. 信道利用率
  - 使用HTTP2.0的多路复用(HTTP1.1最多同一域名建立6个连接)
  - 使用CDN,在最快的路径传输
  - 升级服务器内存,提升拥塞控制能力,最大限度利用网络的吞吐量
3. 传输路径
  - 设置过期缓存
  - 增大拥塞窗口大小,来提升TCP慢启动的起始速度
4. 信息安全
  - 更新最新的TLS
  - 选择使用HTTP/HTTPS

### HTTPS
在TCP和HTTP增加了一层安全层SSL/TLS

#### 第一版
使用对称加密(加密和解密都使用相同密匙)
<img :src="$withBase('/computer/https_v1.png')" alt="https_v1">
1. 浏览器发送加密套件列表(加密方法列表)和随机数client-random给服务端
2. 服务端接受到加密套件后选择一种加密套件并生成一个随机数service-random, 将加密套件和随机数返还给客户端
3. 双方确认信息,根据client-random和service-random生成密匙

存在的问题: 由于随机数是公开的,可以通过随机生成算法合成密匙

#### 第二版
使用非对称加密(密匙加密的需要使用公匙解密,公匙加密的需要使用密匙解密)
<img :src="$withBase('/computer/https_v2.png')" alt="https_v2">

1. 浏览器发送加密套件列表给服务端
2. 服务端选择一个加密套件并将生成的公钥返给客户端
3. 双方确认信息,客户端发送使用公钥加密的数据给服务端,服务端发送使用密钥加密的数据给客户端

存在问题: 
1. 消除了客户端发送数据给服务端的泄露问题,但是服务端发送数据给客户端的问题依然存在(因为公匙是公开的)
2. 非对称加密的效率太低

#### 第三版
对称加密和非对称加密的组合使用(传输数据依旧使用对称加密, 但是对称加密的密匙采用非对称加密方式来传递)
<img :src="$withBase('/computer/https_v3.png')" alt="https_v3">


1. 客户端发送加密套件列表, 非对称加密列表和随机数client-random给服务端
2. 服务端收到后选择加密套件,同时生成随机数service-random和公钥,将这些发送给客户端
3. 客户端收到后生成pre-master,并利用服务端的公钥加密,发送给服务端
4. 服务端利用密钥解密获取到pre-master, 至此,客户端和服务端都拥有相同的client-random、service-random 和 pre-master, 并利用这个三个随机数生成对称密匙

存在的问题: 当DNS被劫持时,客户端会对恶意服务端进行连接交换密匙

#### 第四版
添加数字证书校验
<img :src="$withBase('/computer/https_v4.png')" alt="https_v4">
1. 服务器没有直接返回公钥给浏览器，而是返回了数字证书，而公钥正是包含在数字证书中的
2. 在浏览器端多了一个证书验证的操作，验证了证书之后，才继续后续流程。

#### TLS握手
Https在原有的三次握手之后会有一个会话层的TLS握手过程,就是上述第三,四版的密钥交换验证过程(上面的是RSA握手过程),下面是ECDHE握手过程
::: tip ECDHE握手过程
1. 客户端 将TLS版本,加密套件,随机数C给 服务端
2. 服务端 将本地的TLS版本,选择的加密算法,和随机数B给 客户端
3. 服务端 将数字证书发送给 客户端 
4. 客户端验证数字信息确定服务端的身份信息
5. 服务端 将加密算法生成的公钥server-params(和签名认证)给 客户端
6. 客户端 按照服务端返回的加密算法要求生成一个公钥client-params给 服务端
7. 客户端和服务端通过server-params,client-params和 __ECDHE 算法__ 生成第三个随机数Pre-master
8. 客户端和服务端再通过随机数C,随机数B, 随机数Pre-Master生成 __Master-Secret__作为对称加密使用的密钥
:::

::: tip 为什么server-params和client-params都可以被截获,但是黑客利用这个两个公钥生成相同的Pre-master
上述的第7步骤生成的Pre-master是简述的过程,真实的过程:
1. 服务器随机生成随机值Rb，计算server-params(x,y) = Rb * Q(x, y)。Q(x, y)为全世界公认的某个椭圆曲线算法的基点。将server-params(x, y)发送至客户端。
2. 客户端随机生成随机值Ra，计算client-params(x, y) = Ra * Q(x, y)，将client-params(x, y)发送至服务器。
3. 客户端计算Sa(x, y) = Ra * server-params(x, y)；服务器计算Sb(x, y) = Rb * client-params(x, y)
4. ECDHE算法保证了Sa = Sb = S, S就是Pre-master。

也就是说Pre-master是该端内存的随机数和对端传递的公钥生成, 说的通俗点就是:
「客户端和服务器用Client Params、Server Params一通算，算出pre master」这句话本身就是错的，应该是「客户端用自己内存中的随机数Ra（不是发送出去的那个client random）和Server Params里的pubkey算出pre master，而服务器用自己内存中的随机数Rb和Client Params里的pubkey能也计算出pre master」
:::
