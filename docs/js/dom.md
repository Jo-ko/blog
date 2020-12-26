---
title: DOM对象
date: 2020-04-29
---

## Node常量类型(可正常使用)
- Node.ELEMENT_NODE(1) 元素节点
- Node.TEXT_NODE(3) 元素节点中的文字
- Node.CDATA_SECTION_NODE(4) 一个 CDATASection，例如 <!CDATA[[ … ]]>,该节点只允许在xml中使用
- Node.COMMENT_NODE 注释节点
- Node.DOCUMENT_NODE document节点
- Node.DOCUMENT_TYPE_NODE 描述文档类型的 DocumentType 节点
- Node.DOCUMENT_FRAGMENT_NODE 通过document.createDocumentFragment构造出的节点类型

## Node属性
- nodeName
- nodeValue

## Node操作方法
### 子节点方法
- node.appendChild
- node.insertBefore
- node.replaceChild
- node.removeChild
### 单节点操作方法
- node.cloneNode
- node.normalize

## Document类型
```js
// html的引用
document.documentElement = document.childNodes[0] = document.firstChild;

// body的引用
document.body

// doctype的引用
document.doctype

// 获取地址相关
document.location

// 获取并修改标题
document.title = 'your title'

// 获取并修改域名
document.domain = 'your.com'

// 获取元素
document.getElementById() // 根据id找到元素, 多个id返回第一个 
document.getElementsByClassName() // 根据class找到元素, 返回nodeList
document.getElementsByName() // 根据元素的name属性寻找对应的节点, 返回nodeList
document.getElementsByTagName() // 根据元素的标签寻找对应的节点, 返回nodeList
```

1. 在我们获取scrollTop的时候经常会使用到 (document.documentElement || document.body).scrollTop
882,这是由于doctype引起的,在严格模式下
2. Document类型无法使用appendChild这种子节点操作方法 
3. document.domain经常用于iframe之间用于解决跨域, 同时该属性设置的严格程度是不能返回的