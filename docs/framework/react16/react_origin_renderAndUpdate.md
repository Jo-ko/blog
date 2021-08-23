---
title: React16源码-render&更新 
date: 2020-01-02 
tags:
- 框架基础 
categories:
- 前端知识

---


## ReactDOM.render()

> ver.16
### 调用入口
```flow js
//业务调用入口 
ReactDOM.render(<App/>, document.getElementById('root'))

// 实际调用的对象
const ReactDOM = {
    // ....
    render(
        element: React$Element<any>,
        container: DOMContainer,
        callback: ?Function,
    ) {
        return legacyRenderSubtreeIntoContainer(
            null,
            element,
            container,
            false,
            callback,
        )
    }
    // ...
}
```
### legacyRenderSubtreeIntoContainer (ver.16)
1. 创建FiberRoot
2. 调用render方法创建DOM并挂载

```flow js
function legacyRenderSubtreeIntoContainer(
  parentComponent: ?React$Component<any, any>, // null
  children: ReactNodeList, // 待挂载的Element
  container: DOMContainer, // 挂载容器container
  forceHydrate: boolean, // false 服务端用到
  callback: ?Function, // 挂载完的回调函数
) {
   let root: Root = (container._reactRootContainer: any);
    // 初始化时候root不存在
    // 因此只会走这段逻辑 
   if (!root) {
       // 创建FiberRoot(ReactRoot)对象
      root = container._reactRootContainer = legacyCreateRootFromDOMContainer(
              container,
              forceHydrate,
      );
      // 执行ReactDOM.render(element, container, callback)中的callback函数
      if (typeof callback === 'function') {
         const originalCallback = callback;
         callback = function () {
            const instance = getPublicRootInstance(root._internalRoot);
            originalCallback.call(instance);
         };
      }
       // 这里会判断是否开启批量更新
       // 由于初始化的时候不存在parentComponent,因此会直接执行root.render
      unbatchedUpdates(() => {
         if (parentComponent != null) {
            root.legacy_renderSubtreeIntoContainer(
                    parentComponent,
                    children,
                    callback,
            );
         } else {
            root.render(children, callback);
         }
      });
   } else {
       // ...
   }
   return getPublicRootInstance(root._internalRoot);
}
```   

### legacyCreateRootFromDOMContainer (ver.16) 
1. 清除挂载节点的子节点
2. new一个ReactRoot, 创建FiberRoot

```flow js
function legacyCreateRootFromDOMContainer(
  container: DOMContainer, // 挂载容器container
  forceHydrate: boolean, // false
): Root {
  const shouldHydrate =
    forceHydrate || shouldHydrateDueToLegacyHeuristic(container);
  // 由于传入饿shouldHydrate为false
  // 会执行清除挂载容器下面的子节点
  if (!shouldHydrate) {
    let warned = false;
    let rootSibling;
    while ((rootSibling = container.lastChild)) {
      container.removeChild(rootSibling);
    }
  }
  // 设置了同步模式 
  const isConcurrent = false;
  // ReactRoot对象创建FiberRoot
  return new ReactRoot(container, isConcurrent, shouldHydrate);
}
```

### 创建FiberRoot和RootFiber

```flow js
function ReactRoot(
  container: DOMContainer, // 挂载容器
  isConcurrent: boolean, // 是否是异步模式 false
  hydrate: boolean, // false
) {
  const root = createContainer(container, isConcurrent, hydrate);
  this._internalRoot = root;
}

export function createContainer(
    containerInfo: Container, // 挂载容器
    isConcurrent: boolean, // 是否是异步模式 false
    hydrate: boolean,  // false
): OpaqueRoot {
    return createFiberRoot(containerInfo, isConcurrent, hydrate);
}

export function createFiberRoot(
    containerInfo: any,
    isConcurrent: boolean,
    hydrate: boolean,
): FiberRoot {
    // 这里创建了RootFiber 
    const uninitializedFiber = createHostRootFiber(isConcurrent);

    // root就是FiberRoot
    let root;
    // enableSchedulerTracing在开发环境为true, 生产环境为false
    // 直接看false分支
    if (enableSchedulerTracing) {
        // ... 
    } else {
       // 这里设置了FiberRoot的初始属性
       // 具体属性看FiberRoot
        root = ({
           // 将RootFiber挂载到FiberRoot上
           current: uninitializedFiber,
           containerInfo: containerInfo,
           // ...
        }: BaseFiberRootProperties);
    }

    // 设置了RootFiber的stateNode映射为FiberRoot
    uninitializedFiber.stateNode = root;

    return ((root: any): FiberRoot);
}

```

::: tip ReactRoot
代理器,用于执行render的两种模式: 同步和异步, 同时保存着FiberRoot对象

```flow js
function ReactRoot(
        container: DOMContainer,
        isConcurrent: boolean,
        hydrate: boolean,
) {
    // 初始化FiberRoot
   const root = createContainer(container, isConcurrent, hydrate);
   // 挂载FiberRoot到ReactRoot实例对象上
   this._internalRoot = root;
}

// ReactDOM.render的调用
ReactRoot.prototype.render = function (
        children: ReactNodeList,
        callback: ?() => mixed,
): Work {
   // ... 
};
ReactRoot.prototype.unmount = function (callback: ?() => mixed): Work {
   // ... 
};
ReactRoot.prototype.legacy_renderSubtreeIntoContainer = function (
        parentComponent: ?React$Component<any, any>,
        children: ReactNodeList,
        callback: ?() => mixed,
): Work {
   // ...
};
ReactRoot.prototype.createBatch = function (): Batch {
   // ... 
};
```
:::





### 调用ReactRoot.render(ver.16)
1. 获取过期时间
2. 创建Update对象,推入RootFiber的updateQueue中
3. 开始Schedule调度

```flow js
ReactRoot.prototype.render = function (
        children: ReactNodeList, // ReactDOM.render(<App />, ....)的 <App />
        callback: ?() => mixed, // ReactDOM.render(<App />, ...., callback)的 callback
): Work {
   // ... 
   updateContainer(children, root, null, work._onCommit);
   // ...
};

export function updateContainer(
        element: ReactNodeList, // ReactDOM.render(<App />, ....)的 <App /> 
        container: OpaqueRoot, // FiberRoot
        parentComponent: ?React$Component<any, any>, // null
        callback: ?Function, // ReactWork包装后的callback
): ExpirationTime {
   // 获取FiberRoot
   const current = container.current;
   // currentTime是用来计算过期时间(过期时间是对currentTime加权得到的)
   // 目的是在同一事件中发生的所有优先级相同的更新都收到相同的到期时间
   const currentTime = requestCurrentTime();
   // 过期时间,表示任务的优先级
   const expirationTime = computeExpirationForFiber(currentTime, current);
   return updateContainerAtExpirationTime(
           element,
           container,
           parentComponent,
           expirationTime,
           callback,
   );
}

export function updateContainerAtExpirationTime(
        element: ReactNodeList, // ReactDOM.render(<App />, ....)的 <App /> 
        container: OpaqueRoot, // FiberRoot
        parentComponent: ?React$Component<any, any>, // null
        expirationTime: ExpirationTime, // computeExpirationForFiber计算的过期时间
        callback: ?Function, // ReactWork包装后的callback
) {
    // 获取当前的RootFiber
   const current = container.current;

   // ... 

   return scheduleRootUpdate(current, element, expirationTime, callback);
}

function scheduleRootUpdate(
        current: Fiber, // FiberRoot
        element: ReactNodeList,  // ReactDOM.render(<App />, ....)的 <App />
        expirationTime: ExpirationTime, // 过期时间
        callback: ?Function, // ReactWork包装后的callback
) {
    // 创建一个Update
   const update = createUpdate(expirationTime);
   // 把ReactElement挂载到Update的payload
   update.payload = {element};
    
   // 在Update上挂载render的回调函数
   callback = callback === undefined ? null : callback;
   if (callback !== null) {
       // ...
      update.callback = callback;
   }

   // 处理useEffect的一些副作用
   flushPassiveEffects();
   // 将刚创建的update对象推入到RootFiber.updateQueue队列中
   enqueueUpdate(current, update);
   // 进入schedule调度环节
   scheduleWork(current, expirationTime);

   return expirationTime;
}


```

### enqueueUpdate && Update

::: tip 描述
UpdateQueue是一个带有优先级的链表

UpdateQueue和Fiber类似,都是以成对的形式出现的:
   1. __currentUpdateQueue__ : 代表当前用户看到的状态
   2. __workInProgressUpdateQueue__: 代表进入commit阶段前接收其他的突变情况的状态
我们称其为双缓存技术,当workInProgressUpdateQueue因某些原因需要丢弃时,我们可以通过克隆currentUpdateQueue来重新生成它.
      
两个链表是共享一个持久性的单链表结构的,遇到一个更新Update, 我们将其插入到两个链表的末尾,每个链表都有一个指向最近未处理的的Update的指针, 
而workInProgress链表指针的位置总是等于或大于current链表,
因为我们总是在workInProgress链表上进行操作,而current链表仅在commit阶段(切换current和workInProgress)更新

同时在两个链表添加Update的目的是避免Update的丢失,如果我们只在workInProgressUpdateQueue上添加Update, 
当我们需要重新从currentUpdateQueue克隆workInProgressUpdateQueue时,就会丢失已有的Update, 同样,当只在currentUpdateQueue增加Update,
当一个已经存在的workInProgressUpdateQueue在commit并替换currentUpdateQueue的时候,Update也会丢失. 但是通过添加到连个队列,可以保证Update始终是下一个workInProgressUpdateQueue
的一部分,并且,一旦workInProgressUpdateQueue在commit后成为新的current,并不会存在相同的Update执行两次的风险.

Update链表不是以优先级来排序的,而是以插入的顺序排序的,新的Update会插入到链表的末尾, 但是优先级依然很重要. 当render阶段处理Update的时候,只要优先级高的才会被处理
而那些优先级较低的Update,依然会在队列中等待低优先级的render处理, 很重要的一点是, 即使跳过了更新,所有的Update依然在队列中(无视优先级),这就会导致一些高优先级的在两个不同优先级下执行两次.
同时,我们还保存了baseState属性, 用来表示firstUpdate属性之前的状态.
:::

### enqueueUpdate
1. 创建或者使用已有的updateQueue对象
2. 将传入的update推入update链表中,更新updateQueue对象,保证current和workInProgress的一致性

```flow js
// queue1取的是fiber.updateQueue(currentUpdateQueue), queue2取的是alternate.updateQueue(workInProgressUpdateQueue)
// 如果两者均为null，则调用createUpdateQueue()获取初始队列 
// 如果两者之一为null，则调用cloneUpdateQueue()从对方中获取队列 
// 如果两者均不为null，则将update作为lastUpdate
export function enqueueUpdate<State>(
    fiber: Fiber, // Fiber的current属性
    update: Update<State> // Update对象
) {
   // fiber就是current
   // current.alternate就是workInProgress
   // current与workInProgress构成了双缓存机制
   const alternate = fiber.alternate;
   // current update队列
   let queue1;
   // workInProgress update队列
   let queue2;
   // workInProgress为null, 说明是初次构建
   if (alternate === null) {
      queue1 = fiber.updateQueue;
      queue2 = null;
      if (queue1 === null) {
          // 初始化更新队列,挂载在current.updateQueue上
         queue1 = fiber.updateQueue = createUpdateQueue(fiber.memoizedState);
      }
   } else {
      // 获取current和workInProgress上的更新链表
      queue1 = fiber.updateQueue;
      queue2 = alternate.updateQueue;
      if (queue1 === null) {
         if (queue2 === null) {
            // 两者都为空时,各自以本身的update链表初始化更新队列 
            queue1 = fiber.updateQueue = createUpdateQueue(fiber.memoizedState);
            queue2 = alternate.updateQueue = createUpdateQueue(
                    alternate.memoizedState,
            );
         } else {
            // current不存在,workInProgress存在,这将workInProgress的更新队列克隆给current
            // Only one fiber has an update queue. Clone to create a new one.
            queue1 = fiber.updateQueue = cloneUpdateQueue(queue2);
         }
      } else {
          // current存在, workInProgress不存在,则将current的更新队列克隆给workInProgress
         if (queue2 === null) {
            queue2 = alternate.updateQueue = cloneUpdateQueue(queue1);
         } else {
            // Both owners have an update queue.
         }
      }
   }
   
   // 经过前面的赋值后,只有workInProgress无更新列表,current有更新列表或者workInProgress和current都有更新列表
   // 如果是workInProgress 无更新列表,说明是刚初始化,将Update推入currentUpdateQueue中
   if (queue2 === null || queue1 === queue2) {
      // 把update放入current的更新队列中,发生在首次渲染 
      appendUpdateToQueue(queue1, update);
   } else {

      // lastUpdate为null时,需要同时往currentUpdateQueue和workInProgress中推入新的Update
      // 此时的两个链表并不是同步的
      if (queue1.lastUpdate === null || queue2.lastUpdate === null) {
         appendUpdateToQueue(queue1, update);
         appendUpdateToQueue(queue2, update);
      } else {
         // 当lastUpdate都存在时,说明两个链表是共享的,只要修改其中一个链表状态,另一个也会变化
         // 但是还是需要重新校正下workInProgressUpdateQueue
         appendUpdateToQueue(queue1, update);
         queue2.lastUpdate = update;
      }
   }
}
```
::: tip workInProgress是在何时创建的
在enqueueUpdate中我们会获取current和workInProgress,并将Update插入在链表后面, 
但是这个workInProgress是何时创建并挂载到Fiber.alternate上的?

workInProgress是在reconcile的render阶段被创建和挂载的,具体看renderRoot这篇
代码如下:
```flow js
nextUnitOfWork = createWorkInProgress(
      nextRoot.current,
      null,
      nextRenderExpirationTime,
    );
```
在调用createWorkInProgress过程中创建并挂载到对应的Fiber.alternate上
:::

::: tip 共享一个持久性的单链表结构
这里的共享指的是什么?

在ReactUpdateQueue.js中提到current.updateQueue和workInProgress.updateQueue共享一个持久化单链表结构,
在16的版本中所谓的共享是指update链表本身,而作为保存链表相关指针信息容器的currentUpdateQueue和workInProgressUpdateQueue是两个updateQueue对象,
我们在cloneUpdateQueue的方法中能看出

```flow js
function cloneUpdateQueue<State>(
  currentQueue: UpdateQueue<State>,
): UpdateQueue<State> {
   const queue: UpdateQueue<State> = {
       // ...赋值属性
   };
   return queue;
}
```
cloneUpdateQueue返回的是一个新对象
当我们在添加Update的时候,会加在之前lastUpdate的next属性上,因此修改一个链表容器就可以,这就是16版本中的共享
:::

::: tip Update对象&UpdateQueue链表
1. Update是用于保存更新状态的
2. UpdateQueue是用来存放Update的单向链表(在17中UpdateQueue变成了单向循环链表)

```flow js

export type Update<State> = {
   // 过期时间(优先级)
   expirationTime: ExpirationTime,

   // 更新类型
   // export const UpdateState = 0; 普通更新
   // export const ReplaceState = 1; 替换更新(废弃)
   // export const ForceUpdate = 2; 强制更新
   // export const CaptureUpdate = 3; 捕获性错误更新
   tag: 0 | 1 | 2 | 3,
   // 更新提交的内容
   // setState => setState content
   // render => ReactElement
   payload: any,
   // 更新完对应的回调
   // setState({}, callback)
   // ReactDOM.render(<App />, document.getElementById(), callback)
   callback: (() => mixed) | null,

   // 指向下一个Update 
   next: Update<State> | null,
   // 指向下一个side Effect
   nextEffect: Update<State> | null,
};

export type UpdateQueue<State> = {
   // 应用更新后的state
   baseState: State,

   // 队列中第一个update
   firstUpdate: Update<State> | null,
   // 队列中最后一个update
   lastUpdate: Update<State> | null,

   // 队列中第一个更新出现错误的update
   firstCapturedUpdate: Update<State> | null,
   // 队列中最后一个更新出现错误的update
   lastCapturedUpdate: Update<State> | null,

   // 第一个副作用(dom diff)
   firstEffect: Update<State> | null,
   // 最后一个副作用(dom diff)
   lastEffect: Update<State> | null,

   // 第一个捕获类型的sideEffect
   firstCapturedEffect: Update<State> | null,
   // 最后一个捕获类型的sideEffect
   lastCapturedEffect: Update<State> | null,
};
```
:::

## setState

> ver.16
### 调用入口(ver.16)

```flow js
Component.prototype.setState = function(partialState, callback) {
    // updater属性是通过依赖注入的方式写入的
  this.updater.enqueueSetState(this, partialState, callback, 'setState');
};
```

::: tip this.updater是如何赋值的
:::

### enqueueSetState

```flow js
// 浏览器环境下this.update赋值对象
// 整个过程与render中的scheduleRootUpdate方法类似
const classComponentUpdater = {
   // ...
   enqueueSetState(inst, payload, callback) {// this, newState, setStateCallBack
      const fiber = getInstance(inst);
      const currentTime = requestCurrentTime();
      const expirationTime = computeExpirationForFiber(currentTime, fiber);

      const update = createUpdate(expirationTime);
      // 这块与初始化render不同
      // payload挂载的是setState(newState)的newState
      update.payload = payload;
      if (callback !== undefined && callback !== null) {
         update.callback = callback;
      }

      flushPassiveEffects();
      enqueueUpdate(fiber, update);
      scheduleWork(fiber, expirationTime);
   },
   // ... 
};
```


## forceUpdate

> ver.16
### 调用入口(ver.16)
```flow js
const classComponentUpdater = {
   // ...
   // 具体实现和setState一直
   // 只是修改了update的类型ReplaceState
   enqueueReplaceState(inst, payload, callback) {
      const fiber = getInstance(inst);
      const currentTime = requestCurrentTime();
      const expirationTime = computeExpirationForFiber(currentTime, fiber);

      const update = createUpdate(expirationTime);
      update.tag = ReplaceState;
      update.payload = payload;

      if (callback !== undefined && callback !== null) {
         update.callback = callback;
      }

      flushPassiveEffects();
      enqueueUpdate(fiber, update);
      scheduleWork(fiber, expirationTime);
   },
   // ... 
};
```

## replaceState(已经删除使用)

```flow js
const classComponentUpdater = {
   // ...
   // 具体实现和setState一直
   // 只是修改了update的类型
   enqueueReplaceState(inst, payload, callback) {
      const fiber = getInstance(inst);
      const currentTime = requestCurrentTime();
      const expirationTime = computeExpirationForFiber(currentTime, fiber);

      const update = createUpdate(expirationTime);
      update.tag = ReplaceState;
      update.payload = payload;

      if (callback !== undefined && callback !== null) {
         update.callback = callback;
      }

      flushPassiveEffects();
      enqueueUpdate(fiber, update);
      scheduleWork(fiber, expirationTime);
   },
   // ... 
};
```

## 整体流程图
三种更新方式最后都调用了 __scheduleWork__ ,进入Schedule调度阶段

<img :src="$withBase('/framework/react_origin_renderAndUpdate_process.png')" class="medium-zoom-image" alt="react_origin_renderAndUpdate_process">

