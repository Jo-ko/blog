# React16

## [16相比15主要增加了什么?](https://zhuanlan.zhihu.com/p/52016989)

### 16早期版本(16.0 - 16.7)
1. 修改了原有的生命周期
   1. 标记原有的componentWillMount,componentWillReceiveProps,componentWillUpdate为不安全
   2. 新增getDerivedStateFromProps,getSnapShotBeforeUpdate
2. 增加错误边界机制(Error Boundaries)
   1. componentDidCatch生命周期
   2. getDerivedStateFromError生命周期
3. 增加[Fiber](/blog/docs/framework/react/react_fiber)架构模式代替原有的stack架构
4. react-call-return(很久没有更新了)
5. Suspense组件
6. Hooks

### 16后期版本(16.8+)
1. 增加Concurrent Mode(并发渲染模式)

## 生命周期
<img :src="$withBase('/framework/react_lifeCycle_16.png')" alt="react_lifeCycle_16">

1. componentWillMount,componentWillReceiveProps,componentWillUpdate被计划移除,原因是这些生命周期可能会在Fiber架构模式下重复执行一些副作用操作
2. getDerivedStateFromProps用来被替代componentWillReceiveProps
3. getSnapShotBeforeUpdate用来被替代componentWillUpdate

## 错误边界
> 错误边界是用于捕获子组件渲染时异常的

### 错误边界可以捕获和不可以捕获
1. 能捕获子组件渲染异常,不能捕获本身渲染异常
2. 能捕获render和各个生命周期函数, 不能捕获回调事件错误,异步和服务端渲染错误
3. 能捕获运行时错误, 无法捕获编译时错误
4. 能捕获函数组件错误, 不能在函数组件内部定义边界错误, 同理Hooks组件

### componentDidCatch和getDerivedStateFromError的区别
1. getDerivedStateFromProps会在 __Reconciliation阶段__ 被调用,该阶段是可以被中断的,因此可能会重复执行,所以适用一些无副作用的操作,比如,更新State
2. componentDidCatch会在 __commit阶段__ 被调用,该阶段是不可以中断的,因此可以用于执行一些副作用的操作,比如上传错误日志