---
title: React-Hooks
date: 2021-04-29
tags:
- 框架基础
categories:
- 前端知识
---



## 基本使用扩展
### useState的惰性求值
```js
// 每次执行useState返回的setState都是相同的, 因此不必再依赖项中声明
const [state, setState] = useState();

const [factory, setFactory] = useState(createFactory(1));
// 这个等同于下面的代码
// 在每次更新渲染时都会重新执行createFactory这个函数,会增加性能消耗;
const factoryRes = createFactory(1);
const [factory, setFactory] = useState(factoryRes);

// 下面这段代码是惰性求值, 只会在初始化的时候执行createFactory函数
const [factory, setFactory] = useState(() => createFactory(1))
```
### 缓存
#### 缓存回调函数
通过useCallback来缓存一些非必要更新的函数回调
```jsx
function Count() {
    const [count, setCount] = useState(0);
    // 只有在count发生变化的时候才更新回调函数
    const handleClick = useCallback(() => setCount(count), [count]);
    return <button onClick={handleClick}></button>
}
```

#### 缓存执行结果
通过useMemo来缓存执行结果
```jsx
function Data() {
    const [data, setData] = useState([]);
    // 下面这段筛选代码会在每次re-render都会执行
    const filter = data.filter(item => item.value > 2);
    // 修改成用useMemo
    const filter = useMemo(() => data.filter(item => item.value > 2), [data]);
    return filter.map(item => <div>{item}</div>)
}
```

## 为什么会有Hooks
1. class作为组件的表达形式显得过于臃肿: 类的继承,静态属性等特性未被用上
2. function作为组件的表达形式缺失了一些必须的功能: state,生命周期无法被定义

## hooks的好处
1. 逻辑复用, 将一些复杂的业务逻辑抽离,同时不会增加心智负担
2. 关注分离, 将分散在各个生命周期的关联逻辑整合

## hooks的使用规则
1. 只能在函数组件中或者自定义hooks中直接使用
2. hooks的执行顺序不能发生变化, 也就是hooks只能在函数体顶层使用
3. hooks中的依赖项是浅比较, 因此当依赖项是对象类型时需要注意

::: tip Hooks是如何区分是否在函数组件内执行的
1. Hooks中依赖的dispatcher函数会判断ReactCurrentDispatcher.current是否存在这个值,不存在就会报错
2. ReactCurrentDispatcher.current只有在函数组件执行renderWithHooks的时候才会被赋值
:::

::: tip 为什么Hooks不能在循环、条件或嵌套函数中调用
1. 在一个组件函数中,Hooks会用一个链表结构来保存每次hooks的顺序,这样在再次re-render的时候,重新执行组件函数就能获取到之前的值
2. 而在条件循环语句中使用,会造成Hooks的顺序不一致, 从而导致获取到hooks的值前后就不一致了
下面是一个useState的简化的过程
```js
let stateQueue = []; // 用于存放每个useState返回值。
let stateIndex = -1;  //给每个 useState的返回值一个序号。
function useState(initState) {
  stateIndex++;
  stateQueue[stateIndex] = stateQueue[stateIndex] || initState; // 这里在再次re-render的时候就会获取到之前设置的值
  const currentIndex = stateIndex;
  function setState(newState) {
    stateQueue[currentIndex] = newState;
    reRender(); //组件重渲染
  }
  return [stateQueue[stateIndex],setState]
}
```
当然真实的代码是用链表来替代数组(方便遍历和针对优先级来执行hooks),但是基本思路是一致的
```js
// 创建一个新的hook,并添加到hooks链表, 可以理解为一个Fiber节点的workInProgress
const hook = mountWorkInProgressHook();
const queue = hook.queue = {
    // ...
};
```
:::
