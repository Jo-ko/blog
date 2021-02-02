---
title: 数据结构与算法
date: 2020-04-29
tags:
- 计算机基础
categories:
- 前端知识
---
> 我们经常说数据结构与算法,可想而知了解数据结构对了解算法的重要性

## 数据结构
### 链表
> 链表是一连串非线性顺序的数据结构,每一个节点都保存着相邻节点的内存地址

优点
::: tip
1. 在一些语言中能够克服数组(顺序表)固定内存大小的缺陷
2. 删除和插入的性能要高于数组
:::

缺点
:::warning
1. 占用较大的内存空间,容易造成内存碎片
2. 由于 __非连续性__ 和 __程序局部性原理__ 导致链表的查找性能要弱于数组
:::
   
**程序局部性原理概况的讲就是内存和CPU之间会有缓存机制,通过该这种机制来减少CPU读取内存,这种缓存的机制产生的条件是当某个内存被用到时,会将该内存地址周围的内存会加载到缓存中**
#### 单向链表

<<< @/docs/computer/code/algorithm/SinglyLinkedList.ts

#### 双向链表

<<< @/docs/computer/code/algorithm/DoubleLinkedList.ts

#### 循环链表(此处展示双向循环列表)
<<< @/docs/computer/code/algorithm/CycleLinkedList.ts
