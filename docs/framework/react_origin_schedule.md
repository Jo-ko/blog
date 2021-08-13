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
2. 根据优先级和初始化状态来执行performWorkOnRoot & performSyncWork & performAsyncWork,这几个方法后面会讲到

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
    // 对于首次挂载的会直接走这个分支,直接执行performWorkOnRoot
    // performWorkOnRoot & performSyncWork & performAsyncWork & performWork 是整个调度环节最后真正去执行的reconciler部分
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
            // 优先级更高时更新
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
    scheduledHostCallback = callback; // 需要在调度执行的任务flushWork
    timeoutTime = absoluteTimeout; // 任务过期时间
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
    // timestamp是DOMHighResTimeStamp参数，该参数与performance.now()的返回值相同
    // 表示requestAnimationFrame执行的时间
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

## animationTick
animationTick是模拟requestIdlCallback的核心,主要有三个功能
1. 获取下一帧的结束时间frameDeadline
2. 通过MessageChannel触发当前任务在下一帧执行   
3. 递归触发下一个任务

```flow js
// 首先我们要知道animationTick这个函数是在下一帧的requestAnimationFrame的回调阶段执行
// postMessage触发的回调会在下一帧最早执行
var animationTick = function(
    rafTime // 当前帧开始的时间
) {
    if (scheduledHostCallback !== null) {
        // 如果还有callback任务,则递归继续在下一帧调用 
        requestAnimationFrameWithTimeout(animationTick);
    } else {
        // 没有任务就退出 
        isAnimationFrameScheduled = false;
        return;
    }
    
    // activeFrameTime初始值为 33
    // frameDeadline所表示的有点绕,在这里表示的上一帧的截止时间, 初始值为 0
    // nextFrameTime = 当前调用时间 - 上一帧帧截止时间 + 一帧的时间, 
    // 用数学表示 nextFrameTime = new_rafTime - （old_rafTime + old_activeFrameTime） + new_activeFrameTime
    //                        = new_rafTime - old_rafTime - (old_activeFrameTime - new_activeFrameTime)
    //                        = new_rafTime - old_rafTime 
    // 也就是nextFrameTime表示实际上一帧经历的时间, 通过前后差值来调整activeFrameTime
    var nextFrameTime = rafTime - frameDeadline + activeFrameTime;
    if (
        nextFrameTime < activeFrameTime &&
        previousFrameTime < activeFrameTime
    ) {
        // 下面的操作是为了动态修改activeFrameTime
        // 当2次两个任务之间的执行时间小于activeFrameTime,说明平台的帧率较高, 就设定activeFrameTime其为其中较大的一个
        if (nextFrameTime < 8) {
            // 这里不支持高帧率的刷新(120HZ) 
            nextFrameTime = 8;
        }
        activeFrameTime =
            nextFrameTime < previousFrameTime ? previousFrameTime : nextFrameTime;
    } else {
        // 保存上次的间隔时间用于对比
        previousFrameTime = nextFrameTime;
    }
    // frameDeadline在这里被赋值成下一帧的截止时间
    // 按照EventLoop的规则,在requestAnimationFrame之后还有浏览器的layout和paint阶段才是这一帧的结束,但是一般此时并无样式布局的变化,因此会跳过这个阶段
    // 即使发生的样式布局变化进入了layout和paint阶段,由于一帧的时间(activeFrameTime)是动态调节的,可以修正这个误差
    // 所以frameDeadline = 当前时间 + layoutPaintingTime + 一帧的时间 = 当前时间 + 一帧的时间 
    frameDeadline = rafTime + activeFrameTime;
   
    // isMessageEventScheduled表示每一帧的animationTick是否已经被执行完
    // 至此触发port1的监听回调,进入到下一帧执行
    if (!isMessageEventScheduled) {
        isMessageEventScheduled = true;
        port.postMessage(undefined);
    }
};

// port.postMessage(undefined) 触发onmessage回调
var channel = new MessageChannel();
var port = channel.port2;
channel.port1.onmessage = function(event) {
    isMessageEventScheduled = false;

    // react有很多这种开始将全局变量重新赋值给局部临时变量的,先保留之前的值,在执行完某个操作之后,再还原某个值
    // 1. 是为了避免在后面调用的时候由于作用域链的问题向上查找引起的时间浪费
    // 2. 是告知执行和回滚状态
    var prevScheduledCallback = scheduledHostCallback; // fleshWork
    var prevTimeoutTime = timeoutTime; // expirationTime
    scheduledHostCallback = null;
    timeoutTime = -1;

    var currentTime = getCurrentTime();

    var didTimeout = false;
    // 这块frameDeadline的值就是animationTick计算出当前帧的一个过期时间
    if (frameDeadline - currentTime <= 0) {
        if (prevTimeoutTime !== -1 && prevTimeoutTime <= currentTime) {
            // 说明任务已经过期了, prevTimeoutTime是任务的过期时间
            didTimeout = true;
        } else {
            // isAnimationFrameScheduled是判断是否在逐帧执行animationTick遍历scheduleCallback任务的
            if (!isAnimationFrameScheduled) {
                // 重启遍历scheduleCallback任务
                isAnimationFrameScheduled = true;
                requestAnimationFrameWithTimeout(animationTick);
            }
            // 因为上一个任务没有执行完,回滚原来的值,以便在requestAnimationFrameWithTimeout执行
            scheduledHostCallback = prevScheduledCallback;
            timeoutTime = prevTimeoutTime;
            return;
        }
    }

    // 说明当前帧没超时
    // 执行scheduleCallback, 进入flushWork
    if (prevScheduledCallback !== null) {
        isFlushingHostCallback = true;
        try {
            prevScheduledCallback(didTimeout);
        } finally {
            isFlushingHostCallback = false;
        }
    }
};
```

## flushWork
> flushWork就是一个时间分片要执行的内容
1. 超时情况执行过期的callback任务
1. 非超时情况在一帧内最大化的执行callback任务
2. 最后执行其余任务

```typescript
function flushWork(
    didTimeout // 是否超时
) {
    // 在调试或者显示暂停调度的时候返回
    if (enableSchedulerDebugging && isSchedulerPaused) {
        return;
    }

    // 标识是否已经开始flushWork
    isExecutingCallback = true;
    const previousDidTimeout = currentDidTimeout;
    currentDidTimeout = didTimeout;
    try {
        if (didTimeout) {
            // 已经超时,就执行所有已经过期的callback任务
            while (
                firstCallbackNode !== null &&
                !(enableSchedulerDebugging && isSchedulerPaused)
                ) {
                // 通过比较当前时间和任务的过期时间
                // 在unstable_scheduleCallback中我们会把任务按照优先级最高(最早过期)到最低的排序
                // 如果第一个任务已经过期了,后面的任务也可能过期了
                // 如果第一个任务没过期,后面的任务也不会过期
                // 通过调用flushFirstCallback来推进任务
                var currentTime = getCurrentTime();
                if (firstCallbackNode.expirationTime <= currentTime) {
                    do {
                        flushFirstCallback();
                    } while (
                        firstCallbackNode !== null &&
                        firstCallbackNode.expirationTime <= currentTime &&
                        !(enableSchedulerDebugging && isSchedulerPaused)
                        );
                    continue;
                }
                break;
            }
        } else {
            // 表示没有超时
            // 同样调用flushFirstCallback推进任务
            // 在每次调用flushFirstCallback后检查是否超时
            // shouldYieldToHost = () => frameDeadline <= getCurrentTime();
            if (firstCallbackNode !== null) {
                do {
                    if (enableSchedulerDebugging && isSchedulerPaused) {
                        break;
                    }
                    flushFirstCallback();
                } while (firstCallbackNode !== null && !shouldYieldToHost());
            }
        }
    } finally {
        isExecutingCallback = false;
        currentDidTimeout = previousDidTimeout;
        if (firstCallbackNode !== null) {
            // 还有一些低优先级的任务未执行, 继续调度
            ensureHostCallbackIsScheduled();
        } else {
            isHostCallbackScheduled = false;
        }
        // 最后在结束的时候,将所有优先级为ImmediatePriority的任务处理 
        flushImmediateWork();
    }
}

// 调用callbackNode的执行函数performWork
function flushFirstCallback() {
    var flushedNode = firstCallbackNode;

    // 从队列中获取并移除 firstCallbackNode, 这样即时出错了也能保持一致, 否则等到结束再移除会导致不一致问题
    var next = firstCallbackNode.next;
    if (firstCallbackNode === next) {
        // 当前节点是最后一个节点
        firstCallbackNode = null;
        next = null;
    } else {
        // 移除callback链表中的第一个callbackNode
        var lastCallbackNode = firstCallbackNode.previous;
        firstCallbackNode = lastCallbackNode.next = next;
        next.previous = lastCallbackNode;
    }
    
    // 移除callbackNode上的链接属性信息
    flushedNode.next = flushedNode.previous = null;

    // 安全的获取callbackNode上的执行属性
    // 这里执行了performWork
    // flushedNode.callback是在unstable_scheduleCallback创建node是赋予的,其实就是performWork这个方法
    var callback = flushedNode.callback;
    var expirationTime = flushedNode.expirationTime;
    var priorityLevel = flushedNode.priorityLevel;
    var previousPriorityLevel = currentPriorityLevel;
    var previousExpirationTime = currentExpirationTime;
    currentPriorityLevel = priorityLevel;
    currentExpirationTime = expirationTime;
    var continuationCallback;
    try {
        continuationCallback = callback();
    } finally {
        currentPriorityLevel = previousPriorityLevel;
        currentExpirationTime = previousExpirationTime;
    }
  
    // 如果performWork返回的是函数, 就把它加入callback链表中
    // 整个插入过程类似scheduleCallback中创建node根据优先级插入,不同的是遇到优先级相同的情况,会将其插到前面,而不是后面
    if (typeof continuationCallback === 'function') {
        var continuationNode: CallbackNode = {
            callback: continuationCallback,
            priorityLevel,
            expirationTime,
            next: null,
            previous: null,
        };

        if (firstCallbackNode === null) {
            // callback链表已经空的情况,直接赋值给firstCallbackNode
            firstCallbackNode = continuationNode.next = continuationNode.previous = continuationNode;
        } else {
            var nextAfterContinuation = null;
            var node = firstCallbackNode;
            do {
                if (node.expirationTime >= expirationTime) {
                    nextAfterContinuation = node;
                    break;
                }
                node = node.next;
            } while (node !== firstCallbackNode);

            if (nextAfterContinuation === null) {
                nextAfterContinuation = firstCallbackNode;
            } else if (nextAfterContinuation === firstCallbackNode) {
                firstCallbackNode = continuationNode;
                ensureHostCallbackIsScheduled();
            }

            var previous = nextAfterContinuation.previous;
            previous.next = nextAfterContinuation.previous = continuationNode;
            continuationNode.next = nextAfterContinuation;
            continuationNode.previous = previous;
        }
    }
}
```

## performAsyncWork & performSyncWork & performWork & performWorkOnRoot 
1. performAsyncWork, performSyncWork最终都会调用performWork,只是传入的参数不一样
2. performWork 最终调用performWorkOnRoot

### performAsyncWork & performSyncWork & performWork
> performAsyncWork & performSyncWork算是一个调度周期
```flow js
function performAsyncWork() {
    try {
        if (!shouldYieldToRenderer()) {
            // 进入这个分支说明一帧的时间已经超时,并且已经有任务过期了
            // 重新计算当前时间currentRendererTime, 并将该事件设置为FiberRoot的nextExpirationTimeToWorkOn
            // 该时间决定哪些节点的更新要在当前周期中被执行
            if (firstScheduledRoot !== null) {
                recomputeCurrentRendererTime();
                let root: FiberRoot = firstScheduledRoot;
                do {
                    didExpireAtExpirationTime(root, currentRendererTime);
                    // scheduleRoot链表是循环链表
                    root = (root.nextScheduledRoot: any);
                } while (root !== firstScheduledRoot);
            }
        }
        performWork(NoWork, true);
    } finally {
        didYield = false;
    }
}

function performSyncWork() {
    performWork(Sync, false);
}

function shouldYieldToRenderer() {
    if (didYield) {
        return true;
    }
    if (shouldYield()) {
        didYield = true;
        return true;
    }
    return false;
}

// shouldYield schedule.js
// 判断一帧超时并且有任务过期
function unstable_shouldYield() {
    return (
        // currentDidTimeout首次渲染时为false
        // 当前的callbackNode任务过期 && 一帧的时间已经超时 就返回true,否则返回false
        !currentDidTimeout &&
        ((firstCallbackNode !== null &&
            firstCallbackNode.expirationTime < currentExpirationTime) ||
            shouldYieldToHost())
    );
}

function performWork(
    minExpirationTime: ExpirationTime, // NoWork或者Sync，表示最小的到期时间
    isYieldy: boolean // true表示异步的需要调度，false表示是同步的不需要调度
) {
    // 获取root调度链表中最高优先级的root节点
    findHighestPriorityRoot();

    if (isYieldy) {
        // 异步任务
        // 重新计算当前渲染时间
        // 同步currentSchedulerTime和currentRendererTime
        recomputeCurrentRendererTime();
        currentSchedulerTime = currentRendererTime;

        if (enableUserTimingAPI) {
           // debugger时候时候调用
           // .... 
        }

        // 循环执行rootSchedule中优先级最高的root更新任务
        // 循环停止的条件: 所有root更新任务完成或者一帧超时并且有任务过期
        // 同步currentSchedulerTime和currentRendererTime
        while (
            nextFlushedRoot !== null &&
            nextFlushedExpirationTime !== NoWork &&
            minExpirationTime <= nextFlushedExpirationTime &&
            !(didYield && currentRendererTime > nextFlushedExpirationTime)
            ) {
            performWorkOnRoot(
                nextFlushedRoot,
                nextFlushedExpirationTime,
                currentRendererTime > nextFlushedExpirationTime, // true表示没过期, false表示过期 
            );
            // 由于通过调用performWorkOnRoot会执行一些生命周期函数，导致每个root上的更新任务会变化，即最高的优先级会变化
            // 因此需要调用findHighestPriorityRoot来更新nextFlushedExpirationTime
            // 同时需要更新当前渲染时间, 判断任务是否过期
            findHighestPriorityRoot();
            recomputeCurrentRendererTime();
            currentSchedulerTime = currentRendererTime;
        }
    } else {
        // 同步任务
        // 不断找到优先级最高的scheduleRoot执行更新
        // 和异步任务一样,performWorkOnRoot可能会产生新的更新任务,根据任务的类型进入同步或者异步的调度队列
        while (
            nextFlushedRoot !== null &&
            nextFlushedExpirationTime !== NoWork &&
            // 这个情况下minExpirationTime = nextFlushedExpirationTime = Sync 
            minExpirationTime <= nextFlushedExpirationTime
            ) {
            performWorkOnRoot(nextFlushedRoot, nextFlushedExpirationTime, false);
            findHighestPriorityRoot();
        }
    }

    // 执行完当前任务后,重置 callbackID
    if (isYieldy) {
        callbackExpirationTime = NoWork;
        callbackID = null;
    }
    
    // 如果还有一些未过期的scheduleRoot异步任务,继续走新一轮调度流程
    if (nextFlushedExpirationTime !== NoWork) {
        scheduleCallbackWithExpirationTime(
            ((nextFlushedRoot: any): FiberRoot),
            nextFlushedExpirationTime,
        );
    }

    // 结束渲染
    finishRendering();
}

// 在多个root更新任务链表中找到优先级最高的
// 大部分情况下我们只有一个root
// 不过因为react支持多个实例,即支持调用多次ReactDOM.render
function findHighestPriorityRoot() {
    let highestPriorityWork = NoWork;
    let highestPriorityRoot = null;
    if (lastScheduledRoot !== null) {
        let previousScheduledRoot = lastScheduledRoot;
        let root = firstScheduledRoot;
        // 下面循环查询最大优先级的任务
        while (root !== null) {
            const remainingExpirationTime = root.expirationTime;
            if (remainingExpirationTime === NoWork) {
                // NoWork说明该root已经没有需要更新的任务了
                // 下面的操作将其从链表中删除的逻辑
                if (root === root.nextScheduledRoot) {
                    root.nextScheduledRoot = null;
                    firstScheduledRoot = lastScheduledRoot = null;
                    break;
                } else if (root === firstScheduledRoot) {
                    const next = root.nextScheduledRoot;
                    firstScheduledRoot = next;
                    lastScheduledRoot.nextScheduledRoot = next;
                    root.nextScheduledRoot = null;
                } else if (root === lastScheduledRoot) {
                    lastScheduledRoot = previousScheduledRoot;
                    lastScheduledRoot.nextScheduledRoot = firstScheduledRoot;
                    root.nextScheduledRoot = null;
                    break;
                } else {
                    previousScheduledRoot.nextScheduledRoot = root.nextScheduledRoot;
                    root.nextScheduledRoot = null;
                }
                root = previousScheduledRoot.nextScheduledRoot;
            } else {
                // 这块的逻辑是找到优先级最高的root节点
                // 注意这里过期时间越大优先级越大
                if (remainingExpirationTime > highestPriorityWork) {
                    highestPriorityWork = remainingExpirationTime;
                    highestPriorityRoot = root;
                }
                if (root === lastScheduledRoot) {
                    break;
                }
                if (highestPriorityWork === Sync) {
                    // 遇到同步任务直接跳出查询
                    break;
                }
                previousScheduledRoot = root;
                root = root.nextScheduledRoot;
            }
        }
    }

    // 将查询到最高优先级任务和优先级赋值于全局对象
    // nextFlushedRoot&nextFlushedExpirationTime会在performWorkOnRoot被用到 
    nextFlushedRoot = highestPriorityRoot;
    nextFlushedExpirationTime = highestPriorityWork;
}
```

### performWorkOnRoot
对需要处理的FiberRoot节点下的Fiber节点执行最终的renderRoot渲染阶段和completeRoot提交阶段

```typescript
function performWorkOnRoot(
    root: FiberRoot, // 执行更新的root节点
    expirationTime: ExpirationTime, // 可更新的过期时间
    isYieldy: boolean, // 是否异步调度: true异步 false同步或者root已经过期
) {

    // 标识目前已经开始进入渲染阶段
    isRendering = true;

    if (!isYieldy) {
        // 表示同步任务或者任务已经过期  

        let finishedWork = root.finishedWork;
        if (finishedWork !== null) {
            // 判断该root节点是否已经执行过renderRoot
            // 由于completeRoot阶段会被打断,可能该root节点已经执行过renderRoot,避免性能浪费
            completeRoot(root, finishedWork, expirationTime);
        } else {
            // 没有finishedWork标识就按照renderRoot -> completeRoot的顺序执行 
            // finishedWork表示root之前在completeRoot被挂起,需要清除
            root.finishedWork = null;
            const timeoutHandle = root.timeoutHandle;
            if (timeoutHandle !== noTimeout) {
                root.timeoutHandle = noTimeout;
                cancelTimeout(timeoutHandle);
            }
            renderRoot(root, isYieldy);
            finishedWork = root.finishedWork;
            if (finishedWork !== null) {
                completeRoot(root, finishedWork, expirationTime);
            }
        }
    } else {
        // 调度异步任务
        // 处理的方式和同步方式基本一致, 只是在completeRoot的时候,需要检查一帧的时间是否有剩余
        let finishedWork = root.finishedWork;
        if (finishedWork !== null) {
            completeRoot(root, finishedWork, expirationTime);
        } else {
            root.finishedWork = null;
            const timeoutHandle = root.timeoutHandle;
            if (timeoutHandle !== noTimeout) {
                root.timeoutHandle = noTimeout;
                cancelTimeout(timeoutHandle);
            }
            renderRoot(root, isYieldy);
            finishedWork = root.finishedWork;
            if (finishedWork !== null) {
                if (!shouldYieldToRenderer()) {
                    // 时间充足,直接调用completeRoot
                    completeRoot(root, finishedWork, expirationTime);
                } else {
                    // 时间不充足, 跳过, 设置renderRoot过的标识
                    root.finishedWork = finishedWork;
                }
            }
        }
    }

    // 标识渲染阶段结束
    isRendering = false;
}
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

::: tip currentSchedulerTime和currentRendererTime
:::