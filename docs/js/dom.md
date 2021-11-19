---
title: DOM对象
date: 2018-01-16
tags:
- Html
categories:
- 前端知识
---

## Node常量类型(可正常使用)
- Node.ELEMENT_NODE(1) 元素节点
- Node.TEXT_NODE(3) 元素节点中的文字
- Node.CDATA_SECTION_NODE(4) 一个 CDATASection，例如 <!CDATA[[ … ]]>,该节点只允许在xml中使用
- Node.COMMENT_NODE 注释节点
- Node.DOCUMENT_NODE document节点
- Node.DOCUMENT_TYPE_NODE 描述文档类型的 DocumentType 节点
- Node.DOCUMENT_FRAGMENT_NODE 通过document.createDocumentFragment构造出的节点类型

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


```

1. 在我们获取scrollTop的时候经常会使用到 (document.documentElement || document.body).scrollTop
882,这是由于doctype引起的,在严格模式下
2. Document类型无法使用appendChild这种子节点操作方法 
3. document.domain经常用于iframe之间用于解决跨域, 同时该属性设置的严格程度是不能返回的

### Element类型

```js
const div = document.getElementsByTagName('div')[0];
// 获取属性
div.style.color // 公有属性可以直接获取
div.getAttribute('self-data') // 私有属性获取, 注意获取属性值会变成字符串类型

// 设置属性
div.self_data = 1; // 不可以通过getAttribute获取值
div.setAttribute('self-data', 1); // 可以通过getAttribute获取值

// 删除属性
div.removeAttribute('SE');
```
1. node.nodeName === node.tagName
2. Element属性是唯一有attribute的属性
3. setAttribute会将值变成小写 
3. 元素属性(HTML属性)和DOM对象属性是不同的, 对于公有属性,两者是互通的,私有属性是不互通的
   - 一般通过.操作的是DOM属性 
   - 通过setAttribute/getAttribute操作的是HTML属性 
   
#### attributes属性 
- getNamedItem
- setNamedItem
- removeNamedItem
- item
```js
const div = document.getElementsByTagName('div')[0];
div.attributes.id.nodeValue;
div.attributes.getNamedItem('id').nodeValue;
div.attributes.setNamedItem('id', 'myAttr')
div.attributes.removeNamedItem('id')
div.attributes.item[0]
```

### Text类型
```js
const div = document.getElementsByTagName('div')[0];
div.childNodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
        node.appendData('content'); // 会在当前text节点内容后面增加
        node.deleteData(1, 2); // 从index=1的位置删除2个数量的字符
        node.insertData(1, 'content'); // 从index=1的位置上后面加上'content'内容
        node.replaceData(1, 2, 'content') // 从1位置替换2个单位的内容
        node.splitText(1) // 从1位置将text分成两个节点, 这个经常用于Dom字符查询并高亮显示
    }
})
div.normalize() //将相邻的text节点合并
```

### 创建节点
```js
// Element类型
document.createElement('div');
// 创建Text类型
document.createTextNode('这是要插入的内容,注意会进行转码');
// 创建Comment节点
document.createComment('');
// 创建CDATASection节点
document.createCDataSection();
```

## DocumentFragment类型
```js
const fragment =  document.createDocumentFragment(); // 继承了所有文档类型具备的可以执行DOM操作的方法
```

## DOM实时性
NodeList, NamedNodeMap, HTMLCollection这三个集合类型都是指向了当前DOM, DOM的结构变化会

## DOM监听
### MutationObserver
```js
// 首先创建一个observer对象
const domOB = new MutationObserver(
        (MutationRecords, mutationObserverInstance) => {console.log('dom has changed')}
);
// 选择要监听的对象
// 可以多次执行observe,观察多个节点
domOB.observe(
    document.body, // 需要监听的对象
     {
        // 监听配置参数MutationObserverInit
        // childList，attributes 或者 characterData 三个属性之中，至少有一个必须为 true
        attributes: true, 
     }
)
// 取消监听
// 但是domDB并没有被回收,可以继续使用domOB.observe
domOB.disconnect();
// 情况记录MutationRecords的的队列
domOB.takeRecords();
```


#### MutationObserverInit
[查看详情](https://developer.mozilla.org/zh-CN/docs/Web/API/MutationObserverInit)
#### MutationRecords
- target: 被修改影响的目标节点
- type: 监听变化的类型: "attributes"、"characterData"或"childList"
- oldValue: 监听变化旧值,需要手动在MutationObserverInit开启
- attributeName: 对于"attributes"类型的变化，这里保存被修改属性的名字
- attributeNamespace: 使用了命名空间的"attributes"类型的变化
- addedNodes: 对于"childList"类型的变化，返回包含变化中添加节点的 NodeList
- removedNodes: 对于"childList"类型的变化，返回包含变化中删除节点的 NodeList
- previousSibling: 对于"childList"类型的变化，返回变化节点的前一个兄弟 Node
- nextSibling: 对于"childList"类型的变化，返回变化节点的后一个兄弟 Node

##### 应用场景
1. 用于执行微队列任务
```js
function flushCallbacks () {
   pending = false
   const copies = callbacks.slice(0)
   callbacks.length = 0
   for (let i = 0; i < copies.length; i++) {
      copies[i]()
   }
}
const observer = new MutationObserver(flushCallbacks)
const textNode = document.createTextNode(String(counter))
observer.observe(textNode, {
 characterData: true
})
timerFunc = () => {
 counter = (counter + 1) % 2
 textNode.data = String(counter)
}
```
2. 用于性能检测
## 元素获取

```js

document.getElementById() // 根据id找到元素, 多个id返回第一个 
document.getElementsByClassName() // 根据class找到元素, 返回nodeList
document.getElementsByName() // 根据元素的name属性寻找对应的节点, 返回nodeList
document.getElementsByTagName() // 根据元素的标签寻找对应的节点, 返回nodeList

// 注意,querySelector和querySelectorAll返回的是node的快照,这个与之前的获取dom元素的方法不同
document.querySelector()
document.querySelectorAll()

// 查询时候存在某元素, 返回boolean
document.body.matches()
```
## NodeIterator和TreeWalker
两者的作用就是深度优先遍历dom树, 通过createNodeIterator和createTreeWalker来创建迭代对象

## document.createRange
常见的作用是高亮选择
