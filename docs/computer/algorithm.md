---
title: 数据结构与算法
date: 2020-04-29
tags:
- 计算机基础
categories:
- 前端知识
---

# 数据结构
## 1. 链表
> 链表是一连串非线性顺序的数据结构,每一个节点都保存着相邻节点的内存地址

优点
::: tip
1. 在一些语言中能够克服数组(顺序表)固定内存大小的缺陷
2. 删除和插入的性能要高于数组
:::

缺点
::: warning
1. 占用较大的内存空间,容易造成内存碎片
2. 由于 __非连续性__ 和 __程序局部性原理__ 导致链表的查找性能要弱于数组
:::
   
**程序局部性原理概况的讲就是内存和CPU之间会有缓存机制,通过该这种机制来减少CPU读取内存,这种缓存的机制产生的条件是当某个内存被用到时,会将该内存地址周围的内存会加载到缓存中**
### 单向链表

<<< @/docs/computer/code/algorithm/SinglyLinkedList.ts

### 双向链表

<<< @/docs/computer/code/algorithm/DoubleLinkedList.ts

### 循环链表(此处展示双向循环列表)
<<< @/docs/computer/code/algorithm/CycleLinkedList.ts

## 2. 栈
> 这里说的栈是数据结构中的栈, 是一种先进后出的数据结构

优点
::: tip
能够快速访问最新的数据
:::

缺点
::: warning
访问非最新数据时,要从最新数据开始获取
:::

### 基础栈
<<< @/docs/computer/code/algorithm/Stack.ts

### 最值栈
<<< @/docs/computer/code/algorithm/MinStack.ts

### 单调栈(递增栈)
<<< @/docs/computer/code/algorithm/ProseStack.ts

## 3. 集合
> 集合是由一堆无序的、相关联的，且不重复的元素组成的组合

作用
::: tip
集合常用于比较两个数据集之间的异同,常用的方法有并集,交集,差集和子集
:::

**我们使用set作为集合的容器**

### 并集
<<< @/docs/computer/code/algorithm/UnionSet.ts

### 差集
<<< @/docs/computer/code/algorithm/DifferenceSet.ts

### 交集
<<< @/docs/computer/code/algorithm/Intersection.ts

### 子集
<<< @/docs/computer/code/algorithm/IsChild.ts

## 4. 哈希hash表
> 哈希表是一种根据关键字直接访问对应内存地址数据的一种数据结构, 而建立关键字和对应的数据的这种关系的函数就是hash函数

优点
::: tip
数据的存储和查找时间大大减少
:::

缺点
::: warning
会占用较多的内存
:::

### 哈希算法

> 1. 相同的输入得到相同的输出
> 2. 不同的输入大概率得到不同的输出

#### 直接定址法
通过线性函数直接获取hash值
工程式: h(k) = ak + c;

#### 除留余数法
通过数据的关键数值和某个参数(常为hash容器的大小)的余数为hash地址
工程式: h(k) = k mod c; c为素数时效率最高

#### 平方求和法
计算关键字的unicode之和,取其平均值,根据哈希表容器的大小取其中几位

### 哈希冲突算法
#### 1. 开放定址法
> 关键字得到的哈希地址冲突时,通过探测法寻找下一个空的哈希地址

##### 线性探测法
Hi=(Hash(key)+di) mod m ( 1 ≤ i < m )

::: details 标识解释
- Hash(key)为哈希函数
- m 为哈希表长度
- di 为增量序列1，2，……，m-1，且di=i
:::

###### 流程图
@flowstart
st=>start: 计算Hash(3)哈希值
process1=>operation: 初始化di=0 m=11;
process2=>operation: 计算di++
process3=>operation: 计算(Hash(3)+di) mod m 
e=>end: 存入对应地址
cond=>condition: 哈希地址上冲突?

st->process1->cond
cond(no)->e
cond(yes)->process2->process3(left)->cond
@flowend

##### 二次探测法
Hi=(Hash(key)±di) mod m

::: details 标识解释
- Hash(key)为哈希函数
- m 为哈希表长度，m 要求是某个4k+3 的质数(k 是整数)
- di 为增量序列12，-12，22，-22，……，q^2，-q^2 且q≤(m-1)/2
:::

###### 流程图
@flowstart
st=>start: 计算Hash(3)哈希值
process1=>operation: 初始化di序列 m=11;
process2=>operation: 计算di=di.next
process3=>operation: 计算(Hash(3)+di) mod m
e=>end: 存入对应地址
cond=>condition: 哈希地址上冲突?

st->process1->cond
cond(no)->e
cond(yes)->process2->process3(left)->cond
@flowend

##### 双哈希函数探测法
Hi=(Hash(key)+i*ReHash(key)) mod m (i=1，2，……，m-1)

::: details 标识解释
- Hash(key)，ReHash(key)是两个哈希函数，
- m 为哈希表长度
:::

###### 流程图
@flowstart
st=>start: 计算Hash(3)哈希值
cond=>condition: 哈希地址上冲突?
process1=>operation: 确定移动的步长b=ReHash(3); i=1
process2=>operation: 计算di=(i++) * b
process3=>operation: 计算(Hash(3)+di) mod m
cond2=>condition: 哈希地址上冲突?
e=>end: 存入对应地址

st->cond
cond(no)->e
cond(yes)->process1->process2->process3(bottom)->cond2
cond2(yes, left)->process2
cond2(no)->e
@flowend

#### 2. 拉链法
> 将计算得到相同hash值的关键字通过线性链表或者红黑树的数据结构放在一起存储

##### 流程图
@flowstart
st=>start: 计算Hash(3)哈希值
process1=>operation: 找到对应的hash地址
e2=>end: 添加到该hash地址对应链表的末尾
e=>end: 以链表形式存入对应hash地址
cond=>condition: 哈希地址上冲突?

st->cond
cond(no)->e
cond(yes)->process1->e2
@flowend

## 5. 树

**名词解释**
- 树: 以边相连接的节点的集合
- 边: 标识节点之间的父子关系
- 根节点: 树的首个节点
- 叶子结点: 没有子节点的节点
- 树高: 由根节点出发,叶子节点的最长路径
- 节点深度: 对应节点到根节点的长度

### 二叉树
> 子节点最多有两个的一种树结构
#### 1. 二叉搜索树
1. 左节点不为空时,则该节点的大小 __小于__ 父节点
2. 右节点不为空时,则该节点的大小 __大于__ 父节点

<<< @/docs/computer/code/algorithm/BinaryTree.ts
