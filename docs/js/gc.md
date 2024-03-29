---
title: 垃圾回收机制
date: 2019-02-29
tags:
- JS
categories:
- 前端知识
---

> 垃圾指的是内存中不再被使用的变量对像, 回收机制的原理就是在特定的时间找到不再被依赖的对象,将其内存释放 

## 常见的两种形式
> 不同的浏览器有其不同的实现的方式, 但是大致遵循下面两个原则
1. 标记清理: 标记内存中所有的变量, 查找当前上下文以及被在上下文中的变量引用的变量,将其标记去掉,剩下的就是需要清理的
2. 引用计数: 声明变量或者该变量被其他变量引用时,都会在其计数器上加1, 而如果保存对该值引用的变量被其他值给覆盖了, 计数器会减1, 当计数器为0时,该内存会被回收,__需要注意的是,由于存在循环引用,可能会导致某个内存永远都不会被释放__

## V8引擎的回收策略
> V8的回收策略有点类似Java, 这里所重点说的是堆内存中的垃圾回收, 当然,调用栈也是有垃圾回收的(直接出栈就回收了)

### 调用栈中的垃圾回收机制
1. 当函数压栈执行的时候,会有一个记录当前执行状态的指针(ESP是一个寄存器存放的栈指向地址)指向调用栈的执行上下文
2. 当函数执行完成的时候, ESP就会移到之前的执行上下文地址, 这个移动的过程就是销毁当前函数执行上下文的过程

### 堆中的垃圾回收机制
1. 常规垃圾回收机制中有一个 __代际假说__ 的术语, V8同样是遵循这种分代式垃圾回收机制
2. V8将堆分为 新生代区域 和 __老生带区域__
3. 使用两个不同垃圾回收器: __副垃圾回收器(负责新生代区域)__ 和 __主垃圾回收器(负责老生带区域)__
4. 新生代中多次运行回收机制的任存在的对象会移动到老生代中(这个过程称为晋升)
5. 由于当内存占用较大时,整个GC过程的挂起时间过长,V8在原有基础上做了优化: __增量标记__, __惰性清理__, __并发&并行策略__

::: tip 老生带区域
- 新生区：大多数对象被分配在这里。新生区是一个很小的区域，垃圾回收在这个区域非常频繁，与其他区域相独立。
- 老生指针区：这里包含大多数可能存在指向其他对象的指针的对象。大多数在新生区存活一段时间之后的对象都会被挪到这里。
- 老生数据区：这里存放只包含原始数据的对象（这些对象没有指向其他对象的指针）。字符串、封箱的数字以及未封箱的双精度数字数组，在新生区存活一段时间后会被移动到这里。
- 大对象区：这里存放体积超越其他区大小的对象, 垃圾回收器从不移动大对象。
- 代码区：代码对象，也就是包含JIT之后指令的对象，会被分配到这里。这是唯一拥有执行权限的内存区（不过如果代码对象因过大而放在大对象区，则该大对象所对应的内存也是可执行的。译注：但是大对象内存区本身不是可执行的内存区）。
- Cell区、属性Cell区、Map区(__隐藏类__)：这些区域存放Cell、属性Cell和Map，每个区域因为都是存放相同大小的元素，因此内存结构很简单。
:::

::: tip 代际假说
1. 大部分对象在内存中的时间很短
2. 如果对象在内存中存在较长一段时间, 那么可以认定是常驻变量
:::

### 主副垃圾回收器
1. 从root上标记活动对象和非活动对象(可访问性算法)
2. 对非活动对象进行清理
3. 整理内存碎片

::: tip 副垃圾回收器
1. 特点: 操作频繁, 空间小, 根据Scavenge算法将空间划分为两个半空间: From Space(活动空间) & To Space(闲置空间)
2. 清除策略: 
   1. V8引擎垃圾回收器检测到From空间即将达到上限, 会开启一次垃圾回收
   2. 标记活动对象和非活动对象: 根节点开始遍历其引用的子节点,被搜索到的对象表示可达( __对象的可达性__ ),就是活动对像,其余的就是非活动对象
   3. 复制From Space的活动对象到To Space并排序
   4. 释放From Space的非活动对象
   5. __指向From Space的指针与To Space的指针进行交换__
3. Scavenge算法的缺点: Scavenge算法是通过牺牲空间来换取时间,并且能够使用的内存较少(被划分成了两个空间,只有一个空间是活跃的)
:::

::: tip 主垃圾回收器
1. 特点: 操作不频繁, 空间大, 对象存活的时间长
2. 清除策略:
   1. 过程分为两个部分: Mark-Sweep(标记清除) & Mark-Compact(标记压缩)
   2. Mark-Sweep算法分为两个阶段
      1. --标记阶段: 从老生代根集合开始第一次扫描, 标记可达的活动对象
      2. --清理阶段: 从堆开始第二次扫描, 将未标记的对象(非活动对象)清除, 同时将标记的活动对象设置为非活动对象
   3. 在经历Mark-Sweep阶段后,老生代内存中就会存在很多内存碎片,因此会在原有的基础上增加碎片整理过程, 就是Mark-Compact算法
      1. --碎片整理阶段: 仍然存活的对象会往前一端移动, 移动完成后直接清理掉边界外的内存
3. Mark-Sweep算法的缺点: a.会产生内存碎片化; b.会明显占用线程
4. Mark-Compact算法的缺点: 内存清理导致占用线程的时间更长
:::


::: tip 对象的可达性
:::

### V8在垃圾回收上的优化
在老版本中,为了保证垃圾回收和代码逻辑的一致性,会暂停JS线程,专门去遍历,标记,清除非活跃的内存对象,这个过程叫做全停顿(stop the word)

#### 增量标记&惰性清理
1. 将一次性的标记和清理任务分成一个个任务穿插在JS执行逻辑之中
2. 允许标记引起的停顿在5-10毫秒, 只有堆内存到一定阈值的时候开始标记
3. 整个过程可以暂停和重启,如果暂停期间标记的数据被修改,重启时需要做对应的策略(__三色标记法&写屏障机制__)

#### 并发垃圾回收
允许辅助线程在垃圾回收的同时不需要将主线程挂起, 两者可以同时进行,这样就不会阻塞js的运行 但是这个有两个问题
- 主线程执行js过程中,很有可能会造成辅助线程的GC工作实效
- 主线程和辅助线程会同时去修改一个数据,需要为数据添加锁机制

#### 并行垃圾回收
允许辅助线程和主线程同时执行GC工作(之前主线程是不进行GC工作的),从而减少GC的时间

## 内存管理
1. 及时将变量置空,解除闭包,释放引用的上下问环境,避免引发的内存溢出
2. 优先使用let/const, 因为let和const是基于块作用域的, 能更早地让垃圾回收程序介入, 释放内存
3. 隐藏类优化,减少动态对对象属性的增删
4. 静态分配和对象池, 当我们需要频繁创建对象并且对象存在的时间比较短的时候,需要考虑使用内存池保存对象,防止对象频繁初始化导致加快浏览器的GC

::: tip 三色标记法
- 黑色: 表示该节点被GC root引用到,而且该节点的子节点都已经标记完成了
- 灰色: 表示该节点被GC root引用到, 但是该节点的子节点未被处理
- 白色: 表示该节点未被GC root引用到,会被清理

GC会根据是否有灰色节点来判断是执行清理操作还是继续标记节点的工作
:::

::: tip 读写屏障
```js
window.a = Object()
window.a.b = Object()
window.a.b.c= Object() 
```
**此时的节点连接关系**
<img :src="$withBase('/js/v8_readingWritingBarrier_before.png')" alt="v8_readingWritingBarrier_before">

window.a.b = Object();
**此时的节点连接关系**
<img :src="$withBase('/js/v8_readingWritingBarrier_after.png')" alt="v8_readingWritingBarrier_after">

- 此时由于白色节点挂在了黑色节点上,因此GC是永远都不会处理这个节点的
- 因此v8GC规定白色节点不允许挂在黑色节点上,当出现这个情况的时候,白色节点会变成成灰色节点
:::

## 参考文章
[深入理解Chrome V8垃圾回收机制](https://segmentfault.com/a/1190000025129635)
[垃圾回收](http://kmanong.top/kmn/qxw/form/article?id=83995&cate=51)
[V8 之旅： 垃圾回收器](http://newhtml.net/v8-garbage-collection/)
[隐藏类](https://segmentfault.com/a/1190000039247203)


```javascript
(function () {
    var name = 'jooker';
    function clickHandle() {
        console.log(name);
    }
    document.addEventListener('click', clickHandle)
})()
```
