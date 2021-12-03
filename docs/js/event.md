---
title: 事件
date: 2018-04-12
tags:
- Html
categories:
- 前端知识
---

## 事件冒泡和事件捕获
1. 事件冒泡又叫IE事件流,事件捕获又叫标准事件流
2. 冒泡和捕获的模型是DOM树模型,分别是从下到上和从上到下
3. DOM2 Events 规范规定事件流分为 3 个阶段:事件捕获、到达目标和事件冒泡

## 事件作用域链
```html
<form method="post">
      <input type="text" name="username" value="">
      <input type="button" value="Echo Username" onclick="console.log(username.value)">
</form>
```
```ts
function onclick() {
    with(document) {
        with(this.form) {
            with(this) { // 属性值
                console.log(username.value)
            }
        }
    } 
}
```

## 事件添加顺序
三种添加模式: on, addEventListener和attachEvent

### on 添加的事件只会执行最后定义的事件
```ts
// 下面输出的是2
const btn = document.getElementById('btn');
btn.onclick = function (event) {
    console.log(1)
}
btn.onclick = function (event) {
    console.log(2)
}
```

### addEventListener添加的事件会按顺序执行
```ts
// 下面输出的是1, 2
const btn = document.getElementById('btn');
btn.addEventListener('click', function () {
    console.log(1)
})
btn.addEventListener('click', function () {
    console.log(2)
})

// 但是通过修改事件时段可以修改顺序
// 通过添加捕获阶段状态,导致输出2, 1
btn.addEventListener('click', function () {
    console.log(1)
})
btn.addEventListener('click', function () {
    console.log(2)
}, true)
```

### attachEvent是倒序执行
// 下面输出的是2, 1
```ts
const btn = document.getElementById('btn');

btn.attachEvent('onClick', function () {
    console.log(1)
})

btn.attachEvent('onClick', function () {
    console.log(2)
})
```

## event对象
### target, currentTarget 和 this
- target: 当前点击的目标
- currentTarget: 事件添加到的意图目标,就是哪个元素添加了事件
- this: 始终等于currentTarget

```ts
// 当事件处理程序直接添加在了意图的目标时 target === currentTarget === this 
const btn = document.getElementById('btn');
btn.addEventListener('click', function (e) {
    console.log(e.target === e.currentTarget); // true
    console.log(e.target === this); // true
    console.log(e.currentTarget === this); // true
})

// 当事件处理程序添加在了非意图的目标时 target ?== currentTarget === this
document.body.addEventListener('click', function (e) {
    console.log(e.target === e.currentTarget); // false
    console.log(e.target === this); // false
    console.log(e.currentTarget === this); // true 
})
```
### eventPhase
- 表示调用事件处理程序的阶段: 1代表捕获阶段,2代表到达目标,3代表冒泡阶段
- 需要注意意图的目标的点击事件无论在哪个阶段,返回的值都是 2

```ts
// 点击button上
// body cap, eventPhase: 1, target: button#btn
// onclick, eventPhase: 2, target: btn
// body bubble, eventPhase: 3, target: button#btn

// 点击在body上
// body cap, eventPhase: 2, target: body
// body bubble, eventPhase: 2, target: body
const btn = document.getElementById('btn');
btn.onclick = function (e) {
    console.log('onclick, eventPhase: %s, target: btn', e.eventPhase);
}
document.body.addEventListener('click', function (e) {
    console.log('body cap, eventPhase: %s, target: %s', e.eventPhase, e.target)
}, true)
document.body.addEventListener('click', function (e) {
    console.log('body bubble, eventPhase: %s, target: %s', e.eventPhase, e.target)
})
```

### clientXY & pageXY & screenXY
- clientXY: 鼠标在当前屏幕可视区域内的相对坐标
- pageXY: 鼠标在当前页面(包括因滚动产生的非可视区域)的绝对坐标
- screenXY: 鼠标在当前屏幕的相对坐标


### DOMContentLoaded和onload事件
- DOMContentLoaded: 当初始的HTML文档被完全加载和解析完成之后,DOMContentLoaded事件被触,而无需等待样式表、图像和子框架的完成加载
- onload: 页面上所有的资源(图片，音频，视频等)被加载以后才会触发load事件
```ts
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded')
})
window.onload = function () {
    console.log('onload')
}
```

### hashChange
url散列值发生变化时的监听
```ts
window.addEventListener('hashchange', (event) => {
    console.log('old url: %s, new url: %s', event.oldURL, event.newURL);
})
```
