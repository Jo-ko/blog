---
title: 虚拟DOM
date: 2020-04-29
tags:
- 框架基础
categories:
- 前端知识
---

## 生成虚拟DOM
### tokenizer
- 对标的是编译前端部分
- 这个过程是将DOM结构解析成Token字符
- 这个过程的关键是正则匹配字符串
```ts
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 匹配标签起始项开头
const startTagClose = /^\s*(\/?)>/; // 匹配标签起始项结束
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结束
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/ //匹配属性
```
### parser
- 对标的是编译前中端部分
- 这个过程是将正则匹配出的token通过对应的option参数解析成AST
- 关键是树形结构的生成和标签属性的处理
```ts
// 1. 树形结构(父子节点生成)
// options.start
// 在解析到起始标签的时候会将其推入堆中, 并设置currentParent
// 这样后面的子节点就能找到父级节点了
if (!unary) {
    currentParent = element
    stack.push(element)
} else {
    closeElement(element)
}

function closeElement(element) {
    // ...
    currentParent.children.push(element)
    element.parent = currentParent
    // ...
}

// 然后在遇到结束标签的时候将其从堆中移除, 同时更新currentTag
function parseEndTag() {
    // ...
    for (let i = stack.length - 1; i >= pos; i--) {
        // ...
        if (options.end) {
            options.end(stack[i].tag, start, end)
        }
    }
    stack.length = pos
    lastTag = pos && stack[pos - 1].tag
}

// options.end
// 最后一个AST信息弹出栈，并更新当前的currentParent节点
stack.length -= 1
currentParent = stack[stack.length - 1]

// 2. 标签属性处理
function parseAttrs() {
    // 对属性的处理主要是识别出vue的一些模板语法
    // ...
    const list = el.attrsList
    for (i = 0, l = list.length; i < l; i++) { 
        // 遍历attrsList属性
    }
}
```
### transform
- 这个过程是将AST进行优化为后面的render做准备
- __优化的目的是:__ 1.将节点提升为静态常量,重新渲染的时候不需要重新创建; 2. path的时候可以跳过该节点
- __优化的对象:__ 静态节点: 1. 文本节点; 2. 使用v-pre指令, 3. 没有使用v-for和绑定变量; 4. 子节点也是静态节点
```ts
const ast = parse(template.trim(), options)
if (options.optimize !== false) {
    optimize(ast, options)
}
```

### generator
- 这个过程是将AST解析成Vue识别的render函数
- 这个过程可以看成编译后端部分,类似将高级语言转成汇编的过程
- 最后生成的render中的with(this)中的this指向的是vue实例
```ts
// genElement会对指令和属性做对应处理
// 例如对v-model这类语法糖进行解析
const code = ast ? genElement(ast, state) : '_c("div")'
return {
    render: `with(this){return ${code}}`,
    staticRenderFns: state.staticRenderFns
}
```

## 虚拟DOM diff过程

## 补丁应用
