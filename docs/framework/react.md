---
title: React应用
date: 2020-04-29
tags:
- 框架基础
categories:
- 前端知识
---


## 为什么要使用react
> 这个问题没有答案,下面都是个人理解(不存在最好的框架,只有最适合自己的框架)
1. react是你们公司熟悉的,成熟的架构基础
2. react是你们团队的容颜上手和维护的技术栈
3. 有针对RN的跨端需求
4. 业务体量较大,需要控制页面的渲染

## React基础使用
### 代码分割
```jsx
// import 分割
import("@/path/to/module").then(result => {
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

## React高阶使用
### React hooks
#### useState
1. 与this.setState的区别
    1. 多次调用useState会多次触发虚拟dom渲染, 多次调用setState会被合并处理,只触发一次
    2. useState修改state时,如果新旧值相同,不会触发组件渲染, this

## React源码
### React 整体架构
1. React: 对外的接口
2. Schedule(调度器): 处理任务的优先级
3. Reconciler(协调器): 找出diff
4. Render(渲染器): 执行最终的渲染
### JSX
> JSX的本质是调用了React.createElement的方法, 因此要在顶部导入React

::: tip React.createElement(type, config, children);
1. 将config参数挂载到props属性上,排除了ref和key
2. 单独设置ref和key属性   
2. 添加children属性,算入的children可以是多个对象,也可以是一个数组
3. 设置defaultProps
4. 转成虚拟dom对象,设置$$typeof属性
:::
   
::: tip Component&PureComponent
1. Component在原型上设置了setState作为数据更新的入口
2. setState调用了Component实例上updater.enqueueSetState的方法,该方法是在react-dom或者react-native上实现,做到平台渲染分离
3. PureComponent继承了Component,同时设置了isPureReactComponent属性用于标识
:::
   
::: tip forwardRef
1. forwardRef是用来解决HOC组件传递ref的问题的
2. 返回的依旧是$$typeof为REACT_ELEMENT_TYPE的reactElement,但是 __type为{$$typeof: REACT_FORWARD_REF_TYPE, render}__,
3. 通过updateForwardRef来传递ref指向
:::
   
::: tip Context
1. 用于解决祖孙关系组件之间的沟通
2. 老版本: childContextType, 新版本: createContext
3. createContext返回一个context对象,包含Provider属性和Consumer属性
4. Provider有一个_context属性指向context对象; Consumer就是context对象
:::

#### 与Fiber的关系
1. JSX只包含当前组件内容的数据结构,是面向开发的
2. Fiber包含了更新的优先级,数据内容,render的标记,是面向框架的
3. Fiber是根据JSX生成和更新的
   

### Fiber
> React16出现,用 __异步的可中断更新__ 来解决React15 Reconcile递归创建虚拟DOM时无法中断造成的卡顿

#### 数据结构
::: tip 整体架构相关
Fiber节点对应的React Element通过树形式相连接
```ts
interface Fiber {
    return: Fiber; // 父级
    child: Fiber; // 子集
    sibling: Fiber; // 右边第一个兄弟
    index: number;
}
```
:::

::: tip 作为静态数据结构
作为静态的数据结构,Fiber部分属性对应了React Element, 保存了该组件的类型和DOM节点信息
```ts
interface FiberNode {
    tag: WorkTag; // 节点类型(Function/Class/Host...)
    key: string | null; // 属性key
    type: any; // 对于 FunctionComponent，指函数本身，对于ClassComponent，指class，对于HostComponent，指DOM节点tagName
    elementType: any; // 同type属性
    stateNode: any; // 对应真实节点
    ...
}
```
:::

::: tip 作为动态的工作单元
作为动态工作单元,Fiber部分属性保存了本次更新的相关信息
```ts
interface FiberNode {
    // 保存本次更新造成的状态改变相关信息
    pendingProps: any;
    memoizedProps: any;
    updateQueue: any;
    memoizedState: any;
    dependencies: any;
    mode: any;
    // 保存本次更新会造成的DOM操作
    effectTag: any;
    nextEffect: Fiber | null;
    firstEffect: Fiber | null;
    lastEffect: Fiber | null;
    // 调度优先级相关
    lanes: Lanes;
    childLanes: Lanes;
}
```
:::

#### 双缓存
> react保存着两种Fiber树,一个是current Fiber树,一个是workInProgress Fiber树, 需要更新当前页面的时候,直接用workInProgress替换current Fiber来减少中间的计算绘制时间
::: tip 关键术语
1. workInProgress Fiber: 内存中的Fiber树
2. current Fiber: 当前显示的Fiber树
3. alternate: 连接workInProgress Fiber树和current Fiber树
```js
workInProgress.alternate = current;
current.alternate = workInProgress;
```   
4. fiberRoot: 整个应用的根节点,是唯一的
5. rootFiber: <App/>组件树的根节点,在更新的时候我们会多次创建
:::
   
#### FiberRoot
1. 整个应用的起点
2. 包含应用挂载的目标节点
3. 记录整个应用更新的相关信息






### ExpirationTime
### Reconciler




## React优化


[comment]: <> (https://juejin.cn/post/6960835286100082695)
