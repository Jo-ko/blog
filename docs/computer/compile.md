---
title: 编译原理
date: 2020-04-29
tags:
- 计算机基础
categories:
- 前端知识
---
> 请先确保对正则表达式有足够的理解再看下面的知识点

## 了解编译原理的重要性
目前无论是前端的框架还是工程化体系,其中依赖的重要技术点就是编译技术,所以了解编译原理对了解现代前端有着重要的意义

## 编译的两个广义阶段
**对于前端来说,我们需要了解编译的前端部分就足够了**
1. 源代码的分析理解阶段(前端)
2. 生成目标代码阶段(后端)

### 源代码的分析理解阶段(前端)
#### 1. 词法分析
所谓的词法分析就是将源代码字符串切割成一个个有效的token的过程,通俗讲就是将一串字符串,拆分成一个个字符段
```js
const code = `console.log(name)`; 
const tokenizer = syntaxAnalysis(code); // [tokener('console'), tokener('log'), tokener('('), tokener('name'), tokener(')')]
```
整个分词过程就是一个有穷自动机(确定的有穷自动机DNF)的解析过程:
1. 一个个读取字符,组成token, 
2. 利用正则判断token流状态,是合法完整的token状态的话就保存当前token流类型
3. 迁移到下一个token

#### 2. 语法分析
将词法分析生成的字符组转成ast语法树,常用的方式是递归下降算法结合上下文无关文法
```js
const ast = parse(tokenizer);
// CallExpression
// - callee: MemberExpression
//  - object
//      - type: Identifier
//      - name: console
//  - property
//      - type: Identifier
//      - name: log
// - arguments: Identifier
//      - name: name
```
##### A. 递归下降算法
> 其实是一种深度优先的递归回溯算法
1. 递归的意思是从根节点开始遍历,根据约定的语言规则(正则文法和上下文无关文法)将非终结符转换成终结符的过程,然后回到根节点,继续匹配推导下一个
2. 下降指的是上级文法嵌套下级文法, 上级的算法调用下级的算法, 表现在生成 AST 中，上级算法生成上级节点，下级算法生成下级节点
3. 递归下降算法本身有左递归的问题,需要使用LR算法进行优化
```text
// 下面使用EBNF(扩展巴克斯泛式)表示文法
// 递归下降最初所采用的文法规则
add -> mul | add + mul
mul -> pri | mul * pri
pri -> Id | Num | (add)
// (LR优化)
add -> mul (+ mul)*
mul -> pri | mul * pri
pri -> Id | Num | (add)

```

##### B. 上下文无关文法
> 可以理解为正则文法的超集,可以调用自身, 所谓的上下文无关指的是在任何情况,文法推导的规则都是一样的

#### 3. 语义分析
在语法分析的基础上,对该语言的规则做一些校验,比如js的this问题,作用域问题

### ES Node type 
[estree](https://github.com/estree/estree/blob/master/es5.md)
