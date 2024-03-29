---
title: 正则表达式
date: 2018-01-20
tags:
- JS
categories:
- 前端知识
---
> 正则表达式是一种字符串模式, 其实现依赖于宿主环境,因此不同的语言在具体方法上会有一些区别

## 创建正则
**下面三种形式创建的正则规则是一致的**
```js
const reg = /\s/g;

// 当正则表达式有变量存在的时候使用
const reg2 = new RegExp('\\s', 'g'); 

// 注意该形式下的第二个参数只有在ES6的环境中不会报错
const reg3 = new RegExp(/\s/, 'g');
```
## 语法标识
### 字符组
- \b: 匹配一个词的边界,这个边界指的一边是\w能够匹配的,一边是是空格和其他不在规定字符集中的字符
- \B: 匹配一个非单词边界, 和\b相反
- \d: 匹配一个数字,和[0-9]的作用相同
- \D: 匹配一个非数字,和[^0-9]的作用相同
- \f: 匹配一个换页符
- \n: 匹配一个换行符
- \r: 匹配一个回车符
- \s: 匹配一个空白字符, 包括空格、制表符、换页符和换行符
- \S: 匹配一个非空白字符
- \t: 匹配一个水平制表符
- \v: 匹配一个垂直制表符
- \w: 匹配一个单子字符,等价于[0-9A-Za-z_]
- \n(\1, \2): 匹配第n个左括号捕获的子字符串
- \[xyz\]: 匹配xyz中的任意字符,可以使用x-y表示一段范围,注意,像*, .这种字符在[]中没有任何特殊含义
- \[^xyz\]: 匹配任何不包含在xyz中的字符
- .: 匹配除换行符之外的任何单个字符

#### 1. 字符组[a-z]为什么不能写成[z-a]
我们需要知道范围表示法的实质,一般根据字符对应的码值,码值小的在前,码值大的在后,依次排列,如果前后颠倒,会导致解析错误

#### 2. 字符组中需要转义的元字符
], -, ^ => \], \-, \^

### 量词字符
- *: 匹配0个或者多个
- +: 匹配1个或者多个
- ?: 
  - 写在非量词字符后面表示匹配0个或者1个
  - 写在量词字符后面表示匹配模式为非贪婪模式 
  - 用于非捕获括号标识
  - 用于非捕获匹配先行断言,后行断言,正向否定查找,反向否定查找
- {n}: 匹配出现n次
- {n,}: 匹配至少出现n次
- {n, m}: 匹配出现n-m之间的次数

### 模式匹配
- *?/+?/??/{m,n}?: 当匹配成功时先不选择匹配,而是忽略,除非下一个匹配成功 
- (?:x): 匹配x但是不记住匹配项,无法从返回的匹配项中检索到(非捕获型)
- x(?=y): 匹配x,同时x的后面跟着y(先行断言)
- x(?!y): 匹配x, 同时x的后面不是y(正向否定查找)
- (?<=y)x: 匹配x, 同时x的前面是y(后行断言)
- (?<!y)x: 匹配x, 同时x的前面不是y(反向否定查找)

### 标识符
- g: 全局搜索
- i: 不区分大小写
- m: 多行搜索
- s: 允许.匹配换行符
- u: 使用unicode码的模式进行匹配
- y: 从lastIndex位置开始搜索匹配

## 构造函数方法
- exec: 返回一个匹配的数组或者null
  - 在设置g或者y的模式下, 该正则是有状态的,它会将上次匹配成功的位置记录在lastIndex属性中
  - 注意不要把正则表达式字面量或者RegExp构造器放在while条件表达式里,由于lastIndex每次都会重置,可能会导致无限循环
- test: 返回boolean
  - 在设置g或者y的模式下, 该正则是有状态的,它会将上次匹配成功的位置记录在lastIndex属性中

## String类可以使用正则的方法
- match: 类似exec, 返回一个匹配的数组或者null
- matchAll: 返回分组匹配的迭代器(不可复用,迭代完需要重新生成), 注意,该正则表达式必须设置全局模式g
- search: 返回第一次匹配到的索引值,如果不匹配则返回-1
- replace: 替换匹配到的值,返回一个新的字符串
- split: 将字符串用指定字符分隔

### match 和 exec
1. match只会返回匹配的结果数组, 但exec会返回匹配的具体信息
2. exec在添加g或者y的模式下,该RegExp能够记录上次的匹配结果,保存lastIndex
### matchAll 和 exec
1. matchAll可以看成exec的组合版
2. matchAll的迭代不会改变lastIndex
### replace
- 有两个参数(regExp|string, replaceStr | replaceFunction)
### replaceFunction的参数
- match: 匹配的字符串
- p1, p2: 第n个匹配到的字符串
- offset: 匹配到的字符串在原字符串中的偏移量
- string: 原字符串

## 优先级
> 优先级由上到下变低
1. (regexp) 整个括号内的子表达式成为单个元素
2. \* ? + 限定之前紧邻的元素
3. abc 普通拼接，元素相继出现
4. a|b 多选结构

## Unicode相关
> Unicode由两大部分组成,1.我们所常说的unicode编码指的是字符集(UCS),即字符对应的码值是多少;2.该字符的码值是如何读取,存储和传输的(UTF), 我们常说的utf-8就是这个
1. 通过/[\u4E00-\u9FFF]/来匹配中文字符, 或者使用/\p{Unified_Ideograph}/u(ES2018支持)
2. ES6 增加了新的转义序列: \u{10437}来替代\u10437这种带有歧义的写法
3. 匹配中文字符时请添加u标识符来明确显示采用Unicode匹配规则

## 正则原理
### 有限自动机(有穷自动机)
1. 确定型有穷自动机(DFA): 任何时刻的状态都是确定的
2. 非确定型有穷自动机(NFA): 在某个时刻,他的状态是不确定的
一般使用的是NFA,虽然效率要比DFA低一些,但因为NFA拥有回溯的能力,因此能提供更多的功能
