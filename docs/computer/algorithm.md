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
#### 1. 二叉查找树
1. 左节点不为空时,则该节点的大小 __小于或者等于__ 父节点
2. 右节点不为空时,则该节点的大小 __大于或者等于__ 父节点

**名词解释**
- 前序遍历: 根节点->左子树->右子树
- 中序遍历: 左子树->根节点->右子树
- 后序遍历: 左子树->右子树->根节点
- 前驱节点: 小于当前节点的最大子节点
- 后继节点: 大于当前界定啊的最小子节点

优点
::: tip
符合二分查找思想,查询的最大次数等于树的高度
:::

缺点
::: warning
当数据分布不均匀的时候,整体的树形会变的线性化
:::




<<< @/docs/computer/code/algorithm/BinaryTree.ts

### 2-3-4树
> 一种多节点的搜索树(多叉树),用于解决二叉树的线性化分布

1. 所有叶子节点都有相同的深度
2. 节点有且仅有三种类型
    1. 二节点: 包含1个元素节点和2个子节点
    2. 三节点: 包含2个元素节点和3个子节点
    3. 四节点: 包含3个元素节点和4个子节点
3. 所有节点路径最终都有叶子节点
4. 符合二叉树的排序性质

#### 流程演示
1. 插入2节点

![](http://img.souche.com/f2e/48d0542898b8ecfe6e1f5db3f510853e.png)

2. 插入3节点(与二叉树不同,不会产生父子关系挂载,而是聚集挂载,直到不满足2-3-4树特点)

![](http://img.souche.com/f2e/95179fa55789a0248ac0195381626ae9.png)

3. 插入4节点(目前仍然符合四节点类型的要求)

![](http://img.souche.com/f2e/84c9fa999c62ae30207a95f35ada557e.png)

4. 插入5节点(5节点的插入导致树不平衡,使中间的3元素发生裂变)

![](http://img.souche.com/f2e/62668c050e5347770240506fb642b696.png)

5. 插入6节点(遵循二叉树的插入原则,找到45节点位置)

![](http://img.souche.com/f2e/9024286ff98ab655a0056cd484109181.png)

6. 插入7节点(同理5节点发生裂变,与3节点结合)

![](http://img.souche.com/f2e/0783919b7552f0802ce944392925945c.png)
   
7. 插入8节点

![](http://img.souche.com/f2e/9f57f632900eced0180ad1213c4f78b0.png)

8. 插入9节点

![](http://img.souche.com/f2e/508c2acf39839ac934975a6ace4fa29f.png)

9. 插入10节点

![](http://img.souche.com/f2e/45d41407b2e45be16b2909c0ab6344f6.png)

10. 插入11节点(11节点把9节点挤出,9节点与357节点结合,从而导致5节点被挤开)

![](http://img.souche.com/f2e/418989002b787df93b87489ba608d79e.png)

11. 插入12节点

![](http://img.souche.com/f2e/69e379a192e08ebffdc3ea54675c5b0d.png)
    
12 .插入1节点(这边按照二叉树的挂载方式,应该在2节点的前面)

![](http://img.souche.com/f2e/81b19f8af5c0bc2ee59f07cb61dbf740.png)


### 红黑树
> 2-3-4树的变体

1. 满足二叉搜索树的基本特性
2. 节点是红色或黑色
3. 根节点是黑色
4. 每个叶子节点都是黑色的空节点(null)
5. 每个红色节点的子节点都是黑色节点,也就是不能出现连续的红色节点
6. 从任一节点(包括根节点)到其每个叶子的所有路径都包含相同数目的黑色节点。