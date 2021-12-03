---
title: 表单
date: 2018-04-12
tags:
- Html
categories:
- 前端知识
---

## 表单基础
### 获取表单&表单子元素
```html
<form name="form1">
    <input type="text" name="form1" />
    <button value="Submit Form">submit</button> 
</form>
```
```ts
const formA = document.forms['form1'];
const formB = document.getElementsByName('form1')[0];
// 表单子元素
const input = formA.elements[1];
```
### 提交表单并校验
```html
<form name="form1" action="/name/post">
    <input type="text" name="form1" />
    <button value="Submit Form">submit</button>
</form>
```
```ts
const formA = document.forms['form1'];
formA.addEventListener('submit', function(event) {
    // 做校验
    event.preventDefault();
})
```
### 重置表单
```ts
const formA = document.forms['form1'];
formA.reset();
```
### input相关事件
1. 点击input时,触发 __focus事件__
2. 输入的时候会触发 __input事件__
3. input失去焦点时候触发 __blur事件__, 同时检查value是否发生变化,变化的话就触发 __change事件__
4. 选择文本触发 __select事件__
- 注意:输入的时候不会触发change事件
- 注意:blur和chang事件的顺序不一定
- 注意:单纯修改value属性值是不会触发input和change事件的
```ts
let textbox = document.forms[0].elements[0];
textbox.addEventListener('input', () => {
    console.log('input'); 
})
textbox.addEventListener("focus", (event) => {
    console.log('blur');
});
textbox.addEventListener("blur", (event) => {
    console.log('blur');
});
textbox.addEventListener("change", (event) => {
    console.log('change');
});
textbox.addEventListener("select", () => {
    console.log('select', textbox.selectionStart, textbox.selectionEnd);
})
```

::: tip 如何通过设置value值来触发input和change事件
通过实例化一个UIEvent或者InputEvent来通知消费
```ts
let textbox = document.forms[0].elements[0];
textbox.addEventListener('input', () => {
    console.log('input'); 
})
textbox.addEventListener("change", (event) => {
    console.log('change');
});

textbox.value = 'xxx'; // 此时是不会触发任何事件的

// 第一种写法
const inputEvent = new InputEvent('input'); // 设置input事件
const changeEvent = new InputEvent('change'); // 设置input事件
// 第二种写法 老版本可以使用
// const changeEvent = new UIEvent('change');
// 第三种写法
// const changeEvent = document.createEvent('UIEvents');
// changeEvent.initEvent('change');

textbox.dispatchEvent(inputEvent); // 此时触发input事件
textbox.dispatchEvent(changeEvent); // 此时触发input事件
```
:::

### 文本选择
```ts
const range = textbox.createTextRange();
range.collapse(true); 
range.moveStart("character", 4); 
range.moveEnd("character", 6); 
range.select();
```

### 文本复制粘贴
```ts
function getClipboardText(event) {
    var clipboardData = (event.clipboardData || window.clipboardData);
    return clipboardData.getData("text");
}

function setClipboardText(event, value) {
    if (event.clipboardData) {
        return event.clipboardData.setData("text/plain", value);
    } else if (window.clipboardData) {
        return window.clipboardData.setData("text", value);
    }
}
```
