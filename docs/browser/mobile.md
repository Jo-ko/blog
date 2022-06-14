---
title: 移动端H5
date: 2020-04-29
tags:
- 浏览器知识
categories:
- 前端知识
---

## 移动端适配问题
### flexible和rem
核心是利用rem,但是这个方案有缺陷,rem最后还是要转成px,当出现小数的px时候会出现问题
```js
// set 1rem = viewWidth / 10 将页面分成10份, 1份等于1rem
// 设置root元素的fontSize = 其clientWidth / 10 + ‘px’
function setRemUnit () {
    var rem = docEl.clientWidth / 10
    docEl.style.fontSize = rem + 'px'
}
```
## 1px问题
```js
 var viewport = document.querySelector("meta[name=viewport]");
//下面是根据设备像素设置viewport
if (window.devicePixelRatio == 1) {
    viewport.setAttribute('content', 'width=device-width,initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no');
}
if (window.devicePixelRatio == 2) {
    viewport.setAttribute('content', 'width=device-width,initial-scale=0.5, maximum-scale=0.5, minimum-scale=0.5, user-scalable=no');
}
if (window.devicePixelRatio == 3) {
    viewport.setAttribute('content', 'width=device-width,initial-scale=0.3333333333333333, maximum-scale=0.3333333333333333, minimum-scale=0.3333333333333333, user-scalable=no');
}
var docEl = document.documentElement;
var fontsize = (docEl.clientWidth / 750) + 'px';
docEl.style.fontSize = fontsize;
```
[动态调整](https://jelly.jd.com/article/60dc262a78b202017b299257)
