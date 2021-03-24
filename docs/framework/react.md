---
title: React
date: 2020-04-29
tags:
- 框架基础
categories:
- 前端知识
---

## React使用(对官方文档的总结)
### 代码分割
```jsx
// import 分割
import("@/path/to").then(result => {
    result.method();
})

// 组件懒加载
import React, { Suspense } from 'react';
const lazyComponent = React.lazy(() => import('./components'));
const fallComponent = <div>hello word</div>;
    
const myComponent = () => (
    <Suspense fallback={fallComponent} f>
        <lazyComponent />
    </Suspense>
)
```
### Context
```jsx
// 创建
import React from 'react';
const context = React.createContext(defaultValue);
// 分享器调用
<context.Provider value={value}></context.Provider>
// 消费器调用
// 设置类静态属性
Component.contextType = context;
// 调用类实例属性
this.context
```
### 错误边界
::: tip 无法捕获一下错误
1. 事件处理,例如用户的点击行为
2. 异步代码
3. 自身报错(非子组件报错)
4. 服务端渲染
:::
```jsx
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state  = {
            hasError: false
        }
    }

    static getDerivedStateFromError(error) {
        // 捕获错误,渲染降级
        return {
            hasError: true
        }
    }
    
    componentDidCatch(error, errorInfo) {
        // 对于一些非ui上的操作
    }
    
    render() {
        if (this.state.hasError) {
            return <Error></Error>
        } else {
            return this.props.children;
        }
    }
}
```
### Refs转发
```jsx
const FancyButton = React.forwardRef((props, ref) => (
  <button ref={ref}>
    {props.children}
  </button>
));

class MyComponent{
    ref = React.createRef();
    render() {
        return <FancyButton ref={ref} />
    }
}
```
### Portals
子节点渲染到父节点以外的节点
1. 仍然适用context
2. 仍然会发生冒泡
```jsx
ReactDOM.createPortal(child, container)
```
### this方法方法
1. 在constructor中绑定
```jsx
this.method = this.method.bind(this)
```
2. 箭头函数
```jsx
<button onClick={() => this.method()}></button>
```
3. 使用createReactClass来代替Class
4. 使用ES6 class-properties
```jsx
class x {
   method = () => {}
   render() {
       return (
           <button onClick={this.method}></button>
       )
   }
}
```
### 受控组件和非受控组件
非受控组件使用ref获取当前值
受控组件使用state获取当前值`

## React源码
### JSX
> JSX的本质是调用了React.createElement的方法

接口: React.createElement(type, config, children);

::: tip 流程
1. 将config参数挂载到props属性上,排除了ref和key
2. 单独设置ref和key属性   
2. 添加children属性,算入的children可以是多个对象,也可以是一个数组
3. 设置defaultProps
4. 转成虚拟dom对象
:::
### Schedule   
### Filber
### Reconciler
## React优化