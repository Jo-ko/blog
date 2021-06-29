---
title: React源码-schedule
date: 2020-04-29
tags:
- 框架基础
categories:
- 前端知识
---

> 在调用render, setState, forceUpdate的最后,最终都会调用scheduleWork进入Schedule调度中心

## scheduleWork
1. 找到FiberRoot,比较新任务的过期时间和Fiber节点上的过期时间大小,将过期时间设置为优先级高的
2. 判断新任务优先级,执行旧任务打断,__这里的任务是指renderRoot阶段开始的任务__
3. 调用requestWork推入新任务

```flow js
function scheduleWork(
    fiber: Fiber, // render调用传入的是RootFiber,setState和foceUpdate传入的是调用实例的Fiber 
    expirationTime: ExpirationTime // 新任务的优先级
) {
  // 从该Fiber节点向上找到FiberRoot,同时更新当点Fiber节点的expirationTime属性和所有祖宗节点的childExpirationTime
  const root = scheduleWorkToRoot(fiber, expirationTime);
 
  // isWorking这个全局参数会在commitRoot和renderRoot阶段开始时会设置为true,结束为false,这两个阶段后面会讲到
  // 这个分支表示当前有一个优先级较低的异步任务没有执行完,但此时权限已经交给了宿主环境,但是新的任务的优先级要更高一点
  // 这样之前优先级低的任务就被打断了  
  if (
    !isWorking &&
    nextRenderExpirationTime !== NoWork &&
    expirationTime > nextRenderExpirationTime
  ) {
    interruptedBy = fiber;
    // 重置stack,会从nextUnitOfWork开始一步一步往上恢复,之前的任务会被重置
    // 重置所有的公共变量  
    resetStack();
  }
  // 重新设置FiberRoot中的earliestPendingTime和latestPendingTime
  // 重新设置FiberRoot中的nextExpirationTimeToWorkOn和exprationTime
  // 目的是找出下个需要执行的最高优先级  
  markPendingPriorityLevel(root, expirationTime);
  
  // isCommitting会在commitRoot阶段开始设置为true, 结束设置为false
  // 所以只要不是render阶段就调用requestork推入任务
  // 注意这里传入的优先级(过期时间)并一定是新任务的优先级,而是Fiber子节点中的最高优先级
  if (
    !isWorking ||
    isCommitting ||
    nextRoot !== root
  ) {
    const rootExpirationTime = root.expirationTime;
    requestWork(root, rootExpirationTime);
  }
  
  // 这块是对调度的合理性检查
  // 当我们在render方法中调用setState,会造成死循环
  if (nestedUpdateCount > NESTED_UPDATE_LIMIT) {
    nestedUpdateCount = 0;
    // ...报错 
  }
}

function scheduleWorkToRoot(fiber: Fiber, expirationTime): FiberRoot | null {
    // 开发模式下记录性能信息
    recordScheduleUpdate();

    // 当前Fiber节点的优先级小于新任务的优先级, 重新设置该节点的优先级 
    if (fiber.expirationTime < expirationTime) {
        fiber.expirationTime = expirationTime;
    }
    
    // 获取workInProgress, 同步优先级
    let alternate = fiber.alternate;
    if (alternate !== null && alternate.expirationTime < expirationTime) {
        alternate.expirationTime = expirationTime;
    }
    // 从当前的Fiber节点向上遍历祖宗节点直到RootFiber节点
    // 遍历到的节点和对应的workInProgress节点都更新childExpirationTime
    // 遍历到Rootiber节点时,返回对应的FiberRoot
    let node = fiber.return;
    let root = null;
    if (node === null && fiber.tag === HostRoot) {
        root = fiber.stateNode;
    } else {
        // 这块就是向上遍历Fibr链表
        // 关于workInProgress这段设置优先级的代码写的有点冗余,可以合并一下
        while (node !== null) {
            alternate = node.alternate;
            if (node.childExpirationTime < expirationTime) {
                node.childExpirationTime = expirationTime;
                if (
                    alternate !== null &&
                    alternate.childExpirationTime < expirationTime
                ) {
                    alternate.childExpirationTime = expirationTime;
                }
            } else if (
                alternate !== null &&
                alternate.childExpirationTime < expirationTime
            ) {
                alternate.childExpirationTime = expirationTime;
            }
            if (node.return === null && node.tag === HostRoot) {
                root = node.stateNode;
                break;
            }
            node = node.return;
        }
    }

    if (enableSchedulerTracing) {
       // ... 
    }
    return root;
}

function markPendingPriorityLevel(
    root: FiberRoot,
    expirationTime: ExpirationTime,
): void {
    // 防止FiberRoot由于之前的错误导致尝试新的更新 
    root.didError = false;

    const earliestPendingTime = root.earliestPendingTime;
    // 设置FiberRoot中所标识的子节点中最高优先级和最低优先级
    // 如果之前没有设置过最高优先级和最低优先级,就赋值为新任务的优先级
    // 否则更新这两个属性,使得新任务的优先级在两个属性之间
    if (earliestPendingTime === NoWork) {
        root.earliestPendingTime = root.latestPendingTime = expirationTime;
    } else {
        if (earliestPendingTime < expirationTime) {
            root.earliestPendingTime = expirationTime;
        } else {
            const latestPendingTime = root.latestPendingTime;
            if (latestPendingTime > expirationTime) {
                root.latestPendingTime = expirationTime;
            }
        }
    }
    // 设置nextExpirationTimeToWorkOn和exprationTime
    // nextExpirationTimeToWorkOn = earliestPendingTime ? earliestPendingTime : latestPingedTime || latestSuspendedTime
    // expirationTime = nextExpirationTimeToWorkOn > earliestSuspendedTime ? nextExpirationTimeToWorkOn : earliestSuspendedTime 
    findNextExpirationTimeToWorkOn(expirationTime, root);
}
```

## requestWork
1. 将新任务的FiberRoot添加到Root调度单向循环链表中, 同时更新FiberRoot的expirationTime

```typescript
function requestWork(root: FiberRoot, expirationTime: ExpirationTime) {
    // 将FiberRoot加入到Root调度队列中
    addRootToSchedule(root, expirationTime);
    // isRendering会在performWorkOnRoot开始时设置为true
    // performWorkOnRoot会遍历Root调度链表,不用重新更新
    if (isRendering) {
        return;
    }

    // 下面的分支是判断是否需要批量更新
    // 当我们在合成事件调用更新的时候isBatchingUpdates会设置为true,isUnbatchingUpdates会设置为false
    // 合成事件需要批量更新,因此不会马上执行调度更新
    if (isBatchingUpdates) {
        if (isUnbatchingUpdates) {
            nextFlushedRoot = root;
            nextFlushedExpirationTime = Sync;
            performWorkOnRoot(root, Sync, false);
        }
        return;
    }

    // 这里判断优先级是同步还是异步
    // 同步直接调用performSyncWork, 异步进入调度
    if (expirationTime === Sync) {
        performSyncWork();
    } else {
        scheduleCallbackWithExpirationTime(root, expirationTime);
    }
}

function addRootToSchedule(root: FiberRoot, expirationTime: ExpirationTime) {

    // 检查当前FiberRoot是否在调度队列中,没有就将其推入链表
    // 更新expirationTime(render和普通更新的前后过期时间是一致的)
    if (root.nextScheduledRoot === null) {
        // 同时设置firstScheduledRoot和lastScheduledRoot 
        root.expirationTime = expirationTime;
        if (lastScheduledRoot === null) {
            firstScheduledRoot = lastScheduledRoot = root;
            root.nextScheduledRoot = root;
        } else {
            // 一般情况我们只有一个root, 多个root的情况会走这个分支
            lastScheduledRoot.nextScheduledRoot = root;
            lastScheduledRoot = root;
            lastScheduledRoot.nextScheduledRoot = firstScheduledRoot;
        }
    } else {
        // 说明该FiberRoot已经在调度队列中,直接更新expirationTime
        const remainingExpirationTime = root.expirationTime;
        if (expirationTime > remainingExpirationTime) {
            // Update the priority.
            root.expirationTime = expirationTime;
        }
    }
}
```
## scheduleCallbackWithExpirationTime
1. 异步进行root任务调度
2. 取消低优先级的Root调度任务, __这里的任务指的是还未进入performWork中任务__
3. 调用unstable_scheduleCallback将performAsyncWork __按照优先级__ 加入callbackNode __双向循环链表__,以便在空闲时候调用

```flow js
function scheduleCallbackWithExpirationTime(
    root: FiberRoot,
    expirationTime: ExpirationTime,
) {
    // 判断是否已经存在调度任务
    if (callbackExpirationTime !== NoWork) {
        // 如果已经存在调度任务,需要比对新旧任务的优先级
        // 如果传入的任务比已经在调度的任务优先级低就直接退出
        // 如果传入的任务比已经在调度的任务优先级高就取消之前的任务
        if (expirationTime < callbackExpirationTime) {
            return;
        } else {
            if (callbackID !== null) {
                cancelDeferredCallback(callbackID);
            }
        }
        // The request callback timer is already running. Don't start a new one.
    } else {
        startRequestCallbackTimer();
    }

    // 标识调度开始
    callbackExpirationTime = expirationTime;
    // 计算出任务超时时间
    // timeout = 过期时间 - 当前任务创建时间, 即为距离现在还有多久过期
    const currentMs = now() - originalStartTimeMs;
    const expirationTimeMs = expirationTimeToMs(expirationTime);
    const timeout = expirationTimeMs - currentMs;
    callbackID = scheduleDeferredCallback(performAsyncWork, {timeout});
}

// scheduleDeferredCallback, 在独立包Schedule.js中
// 创建新的callbaclNode,按照优先级插入到队列中
function unstable_scheduleCallback(
    callback, // 就是performWork,可以简单理解为是带有暂定跳出功能的V15版本的Reconciler
    deprecated_options // {timeout}
) {
    // 计算出该函数开始的时间
    var startTime =
        currentEventStartTime !== -1 ? currentEventStartTime : getCurrentTime();

    var expirationTime;
    if (
        typeof deprecated_options === 'object' &&
        deprecated_options !== null &&
        typeof deprecated_options.timeout === 'number'
    ) {
        // 目前16版本的只会走这个分支
        // 传入的deprecated_options都是{timeout}
        expirationTime = startTime + deprecated_options.timeout;
    } else {
        // ... 
    }

    // 创建新的callbackNode
    var newNode = {
        callback,
        priorityLevel: currentPriorityLevel,
        expirationTime,
        next: null,
        previous: null,
    };

    // Insert the new callback into the list, ordered first by expiration, then
    // by insertion. So the new callback is inserted any other callback with
    // equal expiration.
    // 下面阶段是按照优先级高低将新callback加入链表
    // firstCallbackNode的优先级最高,lastCallbackNode优先级最低 
    if (firstCallbackNode === null) {
        // 如果链表不存在, 直接将newNode作为firstCallbackNode
        firstCallbackNode = newNode.next = newNode.previous = newNode;
        ensureHostCallbackIsScheduled();
    } else {
        var next = null;
        var node = firstCallbackNode;
        do {
            // 这个循环是找到当前链表中优先级比新callbackNode低的任务,赋值给next
            // 这里会比较奇怪,之前的是expirationTime越大,优先级越高,但是到这越大反而优先级越低
            // 因为当前的expirationTime不是之前的expirationTime
            // 当前expirationTime = startTime + deprecated_options.timeout(优先级越高,timeout就越小,因此expirationTime也就越小);
            if (node.expirationTime > expirationTime) {
                next = node;
                break;
            }
            node = node.next;
        } while (node !== firstCallbackNode);

        if (next === null) {
            // 说明新节点的优先级最低
            // 设置next为当前的firstCallbackNode是为了后面的链表操作
            next = firstCallbackNode;
        } else if (next === firstCallbackNode) {
            // 说明新节点的优先级最高
            // 将其作为第一个待执行的callback任务, 调用ensureHostCallbackIsScheduled
            firstCallbackNode = newNode;
            ensureHostCallbackIsScheduled();
        }

        // 这里涉及循环链表的操作, 无论新callbackNode优先级,它都插入到了next节点的前面
        // 新callbackNode优先级最低, 插入原firstCallbackNode的前面, 成为最后一个节点
        // 新callbackNode优先级最低, 插入原firstCallbackNode的前面, 修改firstCallbackNode指针指向新callbackNode, 成为第一个节点 
        var previous = next.previous;
        previous.next = next.previous = newNode;
        newNode.next = next;
        newNode.previous = previous;
    }
 
    return newNode;
}

// 主要目的是在执行requestHostCallback调度时候确认是否有callback任务在执行
// isHostCallbackScheduled标识 表示是否已经进入requestAnimationFrameWithTimeout调度
// isExecutingCallback标识 表示已经进入requestAnimationFrameWithTimeout调度,是否开始执行flushWork
// 对已经在执行flushWork的callback,我们无法取消
// 对已经执行requestAnimationFrameWithTimeout但未执行flushWork的callback,我们可以取消
function ensureHostCallbackIsScheduled() {
    if (isExecutingCallback) {
        return;
    }
    var expirationTime = firstCallbackNode.expirationTime;
    if (!isHostCallbackScheduled) {
        isHostCallbackScheduled = true;
    } else {
        cancelHostCallback();
    }
    // 传入的flushWork就是用来遍历callback链表的
    requestHostCallback(flushWork, expirationTime);
}
```

## requestHostCallback
1. 用来模拟requestIdlCallback
1. 通过window.postMessage让任务在下一个事件轮询时候第一个执行
2. 通过requestAnimationFrame和setTimeout来调度任务到下一个事件轮询检查执行

```flow js
  const requestHostCallback = function (
    callback, // flushWork
    absoluteTimeout // expirationTime
) {
    scheduledHostCallback = callback; // 需要在调度执行的任务
    timeoutTime = absoluteTimeout; // 过期时间
    if (isFlushingHostCallback || absoluteTimeout < 0) {
        // isFlushingHostCallback表示需要立即执行
        // 超时了也需要立即执行
        port.postMessage(undefined);
    } else if (!isAnimationFrameScheduled) {
        isAnimationFrameScheduled = true;
        requestAnimationFrameWithTimeout(animationTick);
    }
};

// 由于requestAnimationFrame在tab切换或者浏览器在后台运行会导致终止运行
// 因此通过setTimeout来作为临时补偿
// 这里需要了解一帧的生命周期,requestAnimationFrame会在当前帧渲染执行, setTimeout在下一帧执行
// 因此requestAnimationFrame执行会取消setTimeout, setTimeout执行会取消requestAnimationFrame
var requestAnimationFrameWithTimeout = function(
    callback // animationTick,用于有任务的时候递归调用requestAnimationFrameWithTimeout去执行
) {
    rAFID = localRequestAnimationFrame(function(timestamp) {
        localClearTimeout(rAFTimeoutID);
        callback(timestamp);
    });
    rAFTimeoutID = localSetTimeout(function() {
        localCancelAnimationFrame(rAFID);
        callback(getCurrentTime());
    }, ANIMATION_FRAME_TIMEOUT); // ANIMATION_FRAME_TIMEOUT = 100
};
```

## ExpirationTime(过期时间&优先级)
1. 获取currentTime,表示一个时间标识
2. 根据这个时间标识获取过期时间

### 描述
调用requestCurrentTime来计算过期时间.
过期时间是通过将当前时间（开始时间）加起来得出的时间。 但是，如果在同一事件中安排了两次更新，即使实际时钟时间在第一次和第二次呼叫之间提前了，我们也应将它们的开始时间视为同时发生。
换句话说，由于到期时间决定了更新的批处理方式，因此我们希望在同一事件中发生的所有优先级相同的更新都收到相同的到期时间。
我们跟踪两个不同的时间：当前的“渲染器”时间和当前的“调度器”时间。 渲染器时间可以随时更新。 它只是为了最大程度地降低通话性能。但是，只有在没有待处理的工作，或者确定我们不在某个事件的中间时，才能更新调度程序时间。

```js
// ...
const currentTime = requestCurrentTime();
const expirationTime = computeExpirationForFiber(currentTime, current);
// ...

```
#### requestCurrentTime
```js
function requestCurrentTime() {
   // isRendering会在Schdule阶段中的performanceWorkOnRoot开始设置为true,结束设置为false
   // true表示调度开始,直接返回之前的SchduleTime
   if (isRendering) {
      return currentSchedulerTime;
   }
   // Check if there's pending work.
   findHighestPriorityRoot();
   if (
           nextFlushedExpirationTime === NoWork ||
           nextFlushedExpirationTime === Never
   ) {
      // If there's no pending work, or if the pending work is offscreen, we can
      // read the current time without risk of tearing.
      recomputeCurrentRendererTime();
      currentSchedulerTime = currentRendererTime;
      return currentSchedulerTime;
   }
   // There's already pending work. We might be in the middle of a browser
   // event. If we were to read the current time, it could cause multiple updates
   // within the same event to receive different expiration times, leading to
   // tearing. Return the last read time. During the next idle callback, the
   // time will be updated.
   return currentSchedulerTime;
}
```