---
title: React源码
date: 2020-04-29
tags:
- 框架基础
categories:
- 前端知识
---

## React15
### __Reconciler(Stack Reconciler协调器)__
> 执行虚拟dom到真实dom的协调映射, 包括组件的挂载,更新和卸载(由于该过程中涉及diff算法的调用,我们常常以为reconciler===diff, 但其实diff只是其中的一环)
::: tip 执行过程
1. 通过调用this.setState、this.forceUpdate、ReactDom.render等API触发
2. 调用函数组件、或class组件的render方法，将返回的JSX转化为虚拟DOM,各个元素和父子组件通过 __树型结构__ 连接
3. 通过 __深度优先遍历递归方式__ 将虚拟DOM和上次更新时的虚拟DOM对比, 由于是采用栈递归的方式,导致 __整个任务无法中断__
4. 通过diff对比找出本次更新中变化的虚拟DOM
5. 通过对比找出本次更新中变化的虚拟DOM
:::
### __Render(渲染器)__
> 执行最终的宿主环境渲染呈现,将渲染器脱离,来适应不同平台的需求
1. react-dom: 浏览器环境渲染
2. react-native-renderer: RN环境渲染
3. react-art: canvas, SVG, VML渲染

### 相关知识点

::: tip 事务机制
1. Transaction创建一个黑盒子，它能够包装任何方法，以便在调用方法之前和之后维护某些不变量(即使在调用包装方法时抛出异常)
2. react事务机制的生命周期包括四个部分:perform, initialize, method, close
3. 通过继承重写getTransactionWrappers方法,返回事务执行的wrapper
4. perform调用后会在执行所有的wrapper的initialize方法,再执行传入的method方法, 最后执行所有wapper的close方法
5. perform方法会通过invariant来保证不执行当前正在执行的事务
6. 使用一个临时变量来标记当前的执行过程是否有异常(用于报错时能够更好的找到出错地方), initialize, method出错会始终执行close方法
:::


::: tip batchedUpdates(批量更新)
1. 批量更新依靠的是 __事务机制(批量更新事务部分)__
2. react会在[首次渲染组件](https://github.com/facebook/react/blob/bdf263625db59f54368d39e8ef077e7f0e9313db/src/renderers/dom/client/ReactMount.js#L383)和[事件代理机制](https://github.com/facebook/react/blob/911603b46e89ae0704561a2ad9a8cbd7f2bc12f1/src/renderers/dom/client/ReactEventListener.js#L167)中添加事务机制(调用[ReactDefaultBatchingStrategy.batchedUpdates](https://github.com/facebook/react/blob/bdf263625db59f54368d39e8ef077e7f0e9313db/src/renderers/shared/stack/reconciler/ReactDefaultBatchingStrategy.js#L56))
3. __调用batchedUpdates__ 事务启动后,setState会将partial state存到组件实例_pendingStateQueue,再将其放入dirtyComponents数组中,等到事务结束时调用runBatchedUpdates批量更新

**A. 首先调用batchedUpdates的时候**
1. batchedUpdates会开启ReactDefaultBatchingStrategyTransaction批量处理事务
2. 依次执行TransactionWrappers.initialize方法(这里都是emptyFunction)
3. 执行传入的callback方法(callback方法中可能会执行setState)
4. 依次执行传入的TransactionWrappers.close方法(先调用flushBatchedUpdates批量更新, 再结束本次batch)
```js
// 实例了一个事务
var transaction = new ReactDefaultBatchingStrategyTransaction();
var FLUSH_BATCHED_UPDATES = {
  initialize: emptyFunction,
  close: ReactUpdates.flushBatchedUpdates.bind(ReactUpdates),  // 批量更新
};
var RESET_BATCHED_UPDATES = {
  initialize: emptyFunction,
  close: function() {
    ReactDefaultBatchingStrategy.isBatchingUpdates = false;  // 结束本次batch
  },
};
var TRANSACTION_WRAPPERS = [FLUSH_BATCHED_UPDATES, RESET_BATCHED_UPDATES];
// 混合模式, 将批量更新机制注入事务机制
Object.assign(
  ReactDefaultBatchingStrategyTransaction.prototype,
  Transaction.Mixin,
  { 
    getTransactionWrappers: function() {
      return TRANSACTION_WRAPPERS; // 包括[FLUSH_BATCHED_UPDATES, RESET_BATCHED_UPDATES];
    },
  }
);
var ReactDefaultBatchingStrategy = {
  isBatchingUpdates: false, // 事务标识锁
  batchedUpdates: function(callback, a, b, c, d, e) {
    var alreadyBatchingUpdates = ReactDefaultBatchingStrategy.isBatchingUpdates;
    ReactDefaultBatchingStrategy.isBatchingUpdates = true; //开启一次事务

    if (alreadyBatchingUpdates) { // 说明事务已经开始,直接执行
      return callback(a, b, c, d, e);
    } else {
      // 启动事务, 将callback放进事务里执行
      return transaction.perform(callback, null, a, b, c, d, e);
    }
  },
};

```
**B. 在调用完batchedUpdates过程中调用setState**
1.  调用enqueueSetState,拿到内部组件实例,将partial state存到实例的_pendingStateQueue属性中,然后调用enqueueUpdate
2.  如果已经开启事务,就存储到dirtyCompents中
3.  如果没开启事务,就开启事务,重新调用enqueueUpdate
4.  无论哪个条件都没有立即更新
```js
ReactComponent.prototype.setState = function(partialState, callback) {
  this.updater.enqueueSetState(this, partialState);
  if (callback) {
    this.updater.enqueueCallback(this, callback, 'setState');
  }
}

enqueueSetState: function(publicInstance, partialState) {
    // 根据 this.setState 中的 this 拿到内部实例, 也就是组件实例
    var internalInstance = getInternalInstanceReadyForUpdate(publicInstance, 'setState');
    // 取得组件实例的_pendingStateQueue
    var queue =
      internalInstance._pendingStateQueue ||
      (internalInstance._pendingStateQueue = []);
    // 将partial state存到_pendingStateQueue
    queue.push(partialState);
    // 调用enqueueUpdate
    enqueueUpdate(internalInstance);
 }

 function enqueueUpdate(component) {
  ensureInjected(); // 注入默认策略
    
    // 如果没有开启batch(或当前batch已结束)就开启一次batch再执行, 这通常发生在异步回调中调用 setState      // 的情况
  if (!batchingStrategy.isBatchingUpdates) {
    batchingStrategy.batchedUpdates(enqueueUpdate, component);
    return;
  }
    // 如果batch已经开启就存储更新
  dirtyComponents.push(component);
  if (component._updateBatchNumber == null) {
    component._updateBatchNumber = updateBatchNumber + 1;
  }
}
```

**C. close阶段批量更新**

首次渲染组件时调用事务的ABC总体流程

<img :src="$withBase('/framework/react_origin_transaction_mounted_process.png')" alt="react_origin_transaction_mounted_process">

1. close阶段执行[FLUSH_BATCHED_UPDATES, RESET_BATCHED_UPDATES]
2. 执行ReactUpdateFlushTransaction更新事务
3. 执行perform,调用runBatchedUpdates
4. 遍历dirtyComponents数组调用updateComponent进行更新

**D. setState调用时机**
1. constructor: 不会触发死循环,但会导致赋值失败,因为此时用于更新的_pandingStateQueue还未初始化,因此只能使用this.state赋值
2. componentWillMount&componentWillReciveProps: 不会触发死循环,会和原来的state合并
3. componentDidMount: 会重新触发一次渲染
4. coponentShouldUpdate,componentWillUpdate,render和componentDidUpdate: 会造成死循环
:::


### 架构缺陷
虽然15版本实现了通过 __batchedUpdates(批量更新)__ 将多个更新操作合并,但是单个更新在Reconciler递归diff组件的时候是同步的( __Reconciler和Renderer是交替工作__ ),由于JS线程和GUI渲染线程是互斥的,如果长时间执行递归操作会导致页面刷新的延迟(16.6ms页面刷新频率),从而造成卡顿的现象



::: tip Reconciler和Renderer交替工作
所谓交替工作是指Reconciler检测到dom节点的变化的时候会立即通知Renderer渲染器进行渲染
```jsx
export default function App() {
  const [count, setCount] = useState(1);
  return (
    <div className="App">
      <button onClick={() => setCount(count + 1)}>click to add count</button>
      <ul className="list">
        <li className='lia'>{1 * count}</li>
        <li className='lib'>{2 * count}</li>
        <li className='lic'>{3 * count}</li>
      </ul>
    </div>
  );
}
```
1. 点击button,触发useState更新
2. Reconciler检测lia的值变更为2, 立即通知Renderer更新DOM, 列表变成2,2,3
3. Reconciler检测lib的值变更为3, 立即通知Renderer更新DOM, 列表变成2,3,3
4. Reconciler检测lic的值变更为4, 立即通知Renderer更新DOM, 列表变成2,3,4
:::

## React16
### Schedule(调度器)
> 调节任务的优先级,在合理的时间内中断和执行任务

::: tip 调度流程
1. 16版本通过启发式更新算法,根据用户不同的操作来指定任务的优先级,为每个任务分配各自的 __expirationTime__.
2. 在 __requestIdleCallback__ (react自己编写了对应的垫片)规定的有效时间内执行任务,超过时间,将权限交给浏览器,跳过该次的事件循环
3. 在过期时间内, 根据任务优先级来处理任务,如果新任务的优先级高, 可以打断低优先级任务,开始高优先级任务;  如果过期时间到期, 则马上执行该任务,无论优先级高低
:::

::: tip expirationTime
1. 我们可以粗略的归纳expirationTime的计算方式: msToExpirationTime(当前时间) + 优先级常量
2. msToExpirationTime用于表示一个时间范围间隔内取相同的值,相当于抹平了一段时间的差值,使的两个相近的任务在一次更新中完成
3. 当前时间的计算方式: perfromance.now()
:::

::: tip requestIdleCallback
1. 原生的requestIdleCallback有两个问题: a.兼容性问题; b.每秒调用回调大约20次,不符合要求
2. 用requestAnimationFrame和setTimeout(100ms)来定时调用任务
3. 用当前时间和下一帧时间的大小来判断是否有空闲时间执行任务
4. 通过MessageChannel在宏任务时间段执行任务
:::

### Reconciler(协调器)
> 通过Fiber架构和Schedule机制实现组件更新挂载任务,避免了Reconciler和Render交替执行的时间占用过大

Reconciler在Fiber架构下分成两个阶段

1. 调度渲染阶段(reconciliation)
在render|setState|forceUpdate触发,通过启发式diff算法找出需要更新的节点,并打上标记(我们称之为副作用effect),该阶段可以被中断



2. diff对比找出Fiber节点需要更新的部分,生成新的Fiber树并保存EffectList
3. 计算任务的expriationTime(当前时间点 + 优先级常量)
     1. [获取当前渲染时间点(终点常量时间 - 渲染经历时间)](https://github.com/facebook/react/blob/487f4bf2ee7c86176637544c5473328f96ca0ba2/packages/react-reconciler/src/ReactFiberScheduler.js#L1948)
     2. 获取当前任务的[优先级(同步, 交互, 异步, 空闲)](https://github.com/facebook/react/blob/487f4bf2ee7c86176637544c5473328f96ca0ba2/packages/scheduler/src/Scheduler.js#L433)
     3. 根据当前时间点和优先级常量获取过期时间,并通过[ceiling函数](https://github.com/facebook/react/blob/487f4bf2ee7c86176637544c5473328f96ca0ba2/packages/react-reconciler/src/ReactFiberExpirationTime.js#L31)抹平了一段时间的时间差,优化了渲染性能
4. 创建任务的Update, 并推入[UpdateQueue](https://github.com/facebook/react/blob/487f4bf2ee7c86176637544c5473328f96ca0ba2/packages/react-reconciler/src/ReactUpdateQueue.js#L220)中
     1. updateQueue分为current queue(queue1)、work-in-progress queue(queue2) 两个队列
     2. 如果两者均为null，则调用createUpdateQueue()获取初始队列
     3. 如果两者之一为null，则调用cloneUpdateQueue()从对方中获取队列
     4. 如果两者均不为null，则将update作为lastUpdate
5. 如果使用了useEffect(在早期16版本中没有)
      1. 调用该useEffect在上一次render时的销毁函数
      2. 调用该useEffect在本次render时的回调函数
6. 开启ScheduleWork调度, 遇到超时或者有更高优先级任务时会挂起退出
7. 每次调度之前,判断当前任务是否过期, 过期就直接调用port.postMessage(undefined),会在下次渲染之前执行任务
8. 没有过期,就调用RequestAnimationFrame,让任务在重绘前调用
9.  有些任务被打断并恢复执行时,会造成一些生命周期被多次调用, 不要在这些生命周期执行一些带有副作用的操作(包括操作dom, setState和调用Ajax)
       1. constructor
       2. componentWillMount,
       3. componentWillReceiveProps,
       4. static getDerivedStateFromProps
       5. shouldComponentUpdate,
       6. componentWillUpdate,
       7. render
10. 该阶段对于用户是没有副作用(DOM更新等)的

::: tip Schedule Work
前期版本
1. 找到FiberRoot并返回,同时设置节点的expirationTime和childExpirationTime为该update的expirationTime(如果这两个属性的时间小于update的时间)
2. [如果新任务优先级高,会打断之前的任务](https://github.com/facebook/react/blob/487f4bf2ee7c86176637544c5473328f96ca0ba2/packages/react-reconciler/src/ReactFiberScheduler.js#L1873)
   1. 没有任务执行(调度交给了浏览器)
   2. 存在任务未执行完成(比如异步任务)
   3. 新任务的过期时间小于之前的任务
3. 如果不是render阶段或者FiberRoot不一致就会通过requestWork调度任务
   1. 将当前的root加入到ScheduleRoot的单向循环链表
      1. 通过root.nextScheduledRoot判断当前的root是否已经进入调度阶段
      2. root.nextScheduledRoot == null 表示还没有进入调度
         1. 如果lastScheduledRoot不存在,说明当前没有要处理的root, 这时候就把 firstScheduleRoot、lastScheduleRoot、root.nextScheduleRoot都赋值为root __(形成首尾相连的单向循环链表 A->A)__
         2. 如果lastScheduledRoot存在,就把当前root插入到ScheduleRoot链表末尾 __(A->B->A)__
      3. root.nextScheduledRoot != null 表示已经进入了调度, 并设置当前root的最高优先级
    2. 判断三个环境
       1. 如果已经在render的过程中,会直接返回
       2. 如果是已经开始批处理
          1. 是首次渲染,会调用performWorkOnRoot立即更新
          2. 不是首次渲染,也会直接返回
       3. 当expirationTime为同步的时候,会调用performSyncWork立即执行(这种情况相对常见)
       4. 其余的走scheduleCallbackWithExpirationTime调度(该函数可以看成requestIdleCallback的polyfill版本)
             1. [调用cancelDeferredCallBack取消之前的任务](https://github.com/facebook/react/blob/487f4bf2ee7c86176637544c5473328f96ca0ba2/packages/react-reconciler/src/ReactFiberScheduler.js#L1966)
             2. 计算timeout(当前的任务的延迟过期时间),[执行scheduleDeferredCallback](https://github.com/facebook/react/blob/487f4bf2ee7c86176637544c5473328f96ca0ba2/packages/scheduler/src/Scheduler.js#L317)
:::

11. 提交更新阶段(commit): 将调度阶段需要处理的副作用一次性执行,该阶段不可调度不可中断
该阶段是将调度阶段生成的effectList应用到真实节点中


::: tip UpdateQueue
在16中UpdateQueue是单向链表,在17中UpdateQueue变成了单向循环链表
:::




::: tip 如何在Reconciler层中断任务
将原来的递归调用改成了while循环,关键是shouldYield这个函数判断了剩余可执行时间
```js
function workLoopConcurrent() {
  while (workInProgress !== null && !shouldYield()) {
    workInProgress = performUnitOfWork(workInProgress);
  }
}
```
:::

::: tip FiberNode
FiberNode在原有的虚拟dom结构上增加的多种属性,同时修改了将原有的树形结构改成了链表结构
1. 用于表示 __链表结构属性__,如return,child. sibling
2. 用于原来的React Element的 __静态数据结构__ ,保存了组件DOM信息,如tag,type,stateNode
3. 用于保存需要更新的 __动态的工作单元__,如pendingProps, effectTag
:::



### Render(渲染器): 执行最终的渲染


## React17