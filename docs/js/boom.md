---
title: Boom(浏览器对象模型)
date: 2019-01-12
tags:
- JS
categories:
- 前端知识
---

## window对象
### 像素比
物理像素(DP) = 逻辑像素(DIP) * DPR
css像素 = 逻辑像素 = 设备独立像素
物理像素 = 设备像素

::: tip 物理像素和逻辑像素的关系
dpr为1时,表示1个逻辑像素等于1个物理像素
dpr为2时,表示1个逻辑像素等于4个物理像素(2的2次方)
:::

### viewport
- layout viewport(布局视口): 通常是一个较大的宽度,保证pc上的网页也能显示
  - document.documentElement.clientWidth或者document.documentElement.clientHeight
- visual viewport(视觉视口): 当前设备可视区域,用户缩放会导致变化
  - window.innerWidth
- ideal viewport(理想视口): 与分辨率无关的可视区域,可以看成屏幕尺寸
  - window.screen.width
  - 通过 __<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">__ 触发

### 视口位置
```ts
// 相对于当前视口向下滚动 100 像素 
window.scrollBy(0, 100);
// 滚动到页面左上角 
window.scrollTo(0, 0);
window.scroll(0, 0);

// 同时接受一个ScollToOption字典
// 正常滚动 
window.scrollTo({
  left: 100,
  top: 100,
  behavior: 'auto' // auto, smooth
});
```
## location
### 获取查询参数
```ts
const query = new URLSearchParams(location.search);
```
### 跳转
```ts
location.assign(url);
```

## history
```ts
// 增加历史状态
history.pushState(state, 'title', '/path/to/name')
// 替换历史状态
history.replaceState(state, 'title')
window.addEventListener('hashchange', (event) => {
    console.log(event)
})
// 监听后退按钮
window.addEventListener('popstate', (event) => {
    console.log(event); // 第一次加载 event.state等于null
})
```
