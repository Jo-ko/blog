---
title: React源码-renderRoot
date: 2020-04-29
tags:
- 框架基础
categories:
- 前端知识
---

> 找出需要更新的节点,并打上标记,该阶段可以被打断

## renderRoot

```flow js
function renderRoot(root: FiberRoot, isYieldy: boolean): void {
    // 处理useEffect
    flushPassiveEffects();

    // 用于标识开始renderRoot 
    isWorking = true;
    const previousDispatcher = ReactCurrentDispatcher.current;
    ReactCurrentDispatcher.current = ContextOnlyDispatcher;

    const expirationTime = root.nextExpirationTimeToWorkOn;

    // 这里判断执行的任务是新任务还是之前被打断的任务
    if (
        expirationTime !== nextRenderExpirationTime ||
        root !== nextRoot ||
        nextUnitOfWork === null
    ) {
        // 这里表示的是新任务,要重新初始化变量
        resetStack();
        nextRoot = root;
        nextRenderExpirationTime = expirationTime;
        // 这里比较关键,获取了workInProgress
        // nextUnitOfWork就是current.alternate
        nextUnitOfWork = createWorkInProgress(
            nextRoot.current,
            null,
            nextRenderExpirationTime,
        );
        root.pendingCommitExpirationTime = NoWork;
       
    }


    let didFatal = false;

    // dev环境调用,这里不考虑
    startWorkLoopTimer(nextUnitOfWork);

    // 开始执行workLoop
    // 同时捕获错误,并执行对应的策略
    do {
        try {
            workLoop(isYieldy);
        } catch (thrownValue) {
            // 出现错误要回滚
            resetContextDependences();
            resetHooks();

            if (nextUnitOfWork === null) {
                // 不存在nextUnitOfWork说明这是个无法预料的错误
                // This is a fatal error.
                didFatal = true;
                onUncaughtError(thrownValue);
            } else {
                // 相反这是个可预期的错误
                const sourceFiber: Fiber = nextUnitOfWork;
                let returnFiber = sourceFiber.return;
                if (returnFiber === null) {
                    // root节点错误也作为无法预料的错误
                    didFatal = true;
                    onUncaughtError(thrownValue);
                } else {
                    // 处理Fiber抛出的错误
                    // 第一种是throw promsie错误,suspense组件来处理
                    // 第二种是组件真正的报错
                    throwException(
                        root,
                        returnFiber,
                        sourceFiber,
                        thrownValue,
                        nextRenderExpirationTime,
                    );
                    // 从当前节点向上处理父兄节点,完成打标记的过程
                    nextUnitOfWork = completeUnitOfWork(sourceFiber);
                    continue;
                }
            }
        }
        break;
    } while (true);
    
    // 标志performUnitOfWork和completeUnitWork的结束
    // 重置变量
    isWorking = false;
    ReactCurrentDispatcher.current = previousDispatcher;
    resetContextDependences();
    resetHooks();

    if (didFatal) {
        // 表示有无法处理的错误,跳出当前调度进程,将权限交给宿主环境
        const didCompleteRoot = false;
        stopWorkLoopTimer(interruptedBy, didCompleteRoot);
        interruptedBy = null;
        nextRoot = null;
        onFatal(root);
        return;
    }

    if (nextUnitOfWork !== null) {
        // 表示还有异步调度任务,会在空闲的时候继续该任务
        const didCompleteRoot = false;
        stopWorkLoopTimer(interruptedBy, didCompleteRoot);
        interruptedBy = null;
        onYield(root);
        return;
    }

    // 表示完成了所有的任务,重置参数
    const didCompleteRoot = true;
    stopWorkLoopTimer(interruptedBy, didCompleteRoot);
    const rootWorkInProgress = root.current.alternate;
    nextRoot = null;
    interruptedBy = null;
    
    // 在throwException中如果是组件本身错误导致的会将nextRenderDidError设置为true
    // 先判断是否有优先级更低的任务，有的话把当前的渲染时间设置进suspendTime，调用onSuspend
    // 如果不符合再判断帧时间超时并且不是root节点报错,是的话,设置root的expirationTime为同步最高优先级, 调用onSuspend
    // 最终都会onSuspend,但其实是不会执行的,此时root.finishedWork === null, 返回上层函数performWorkOnRoot时也就不会执行completeRoot
    if (nextRenderDidError) {
        if (hasLowerPriorityWork(root, expirationTime)) {
            markSuspendedPriorityLevel(root, expirationTime);
            const suspendedExpirationTime = expirationTime;
            const rootExpirationTime = root.expirationTime;
            onSuspend(
                root,
                rootWorkInProgress,
                suspendedExpirationTime,
                rootExpirationTime,
                -1,
            );
            return;
        } else if (
            !root.didError &&
            isYieldy
        ) {
            root.didError = true;
            const suspendedExpirationTime = (root.nextExpirationTimeToWorkOn = expirationTime);
            const rootExpirationTime = (root.expirationTime = Sync);
            onSuspend(
                root,
                rootWorkInProgress,
                suspendedExpirationTime,
                rootExpirationTime,
                -1, 
            );
            return;
        }
    }

    // 表示是suquense情况
    // 计算调用timeout的调用时间(在timeout时间之后调用commit)
    if (isYieldy && nextLatestAbsoluteTimeoutMs !== -1) {
        const suspendedExpirationTime = expirationTime;
        markSuspendedPriorityLevel(root, suspendedExpirationTime);

        // 查找树中最早的未提交commit到期时间
        const earliestExpirationTime = findEarliestOutstandingPriorityLevel(
            root,
            expirationTime,
        );
        const earliestExpirationTimeMs = expirationTimeToMs(earliestExpirationTime);
        if (earliestExpirationTimeMs < nextLatestAbsoluteTimeoutMs) {
            nextLatestAbsoluteTimeoutMs = earliestExpirationTimeMs;
        }

        // timeout = 超时时间 - 当前时间
        // timeout小于零立即执行, 大于零调用定时器执行
        const currentTimeMs = expirationTimeToMs(requestCurrentTime());
        let msUntilTimeout = nextLatestAbsoluteTimeoutMs - currentTimeMs;
        msUntilTimeout = msUntilTimeout < 0 ? 0 : msUntilTimeout;

        const rootExpirationTime = root.expirationTime;
        onSuspend(
            root,
            rootWorkInProgress,
            suspendedExpirationTime,
            rootExpirationTime,
            msUntilTimeout,
        );
        return;
    }

    // 如果以上的情况都不存在,直接结束renderRoot阶段 
    onComplete(root, rootWorkInProgress, expirationTime);
}

// 通过createWorkInProgress创建current.alternate属性workInProgress
// current和workInProgress称为Fiber双缓存
// 首次渲染的时候,只有root节点存在alternate, alertnate指向的Fiber是懒创建的
// 在之后的更新中,如果节点只是更新属性的话,会重用fiber对象而不会再次创建,有利于节省空间
export function createWorkInProgress(
    current: Fiber, // Fiber.current
    pendingProps: any, // 待更新的属性值
    expirationTime: ExpirationTime, // 优先级
): Fiber {
    let workInProgress = current.alternate;
    if (workInProgress === null) {
        // 不存在,需要新建一个
        workInProgress = createFiber(
            current.tag,
            pendingProps,
            current.key,
            current.mode,
        );
        workInProgress.elementType = current.elementType;
        workInProgress.type = current.type;
        workInProgress.stateNode = current.stateNode;
        workInProgress.alternate = current;
        current.alternate = workInProgress;
    } else {
        // 存在,复用更新属性
        workInProgress.pendingProps = pendingProps;
        workInProgress.effectTag = NoEffect;
        workInProgress.nextEffect = null;
        workInProgress.firstEffect = null;
        workInProgress.lastEffect = null;
    }

    // 下面属性需要全部重新赋值
    workInProgress.childExpirationTime = current.childExpirationTime;
    workInProgress.expirationTime = current.expirationTime;

    workInProgress.child = current.child;
    workInProgress.memoizedProps = current.memoizedProps;
    workInProgress.memoizedState = current.memoizedState;
    workInProgress.updateQueue = current.updateQueue;
    workInProgress.contextDependencies = current.contextDependencies;
    workInProgress.sibling = current.sibling;
    workInProgress.index = current.index;
    workInProgress.ref = current.ref;

    return workInProgress;
}
```

## workLoop && performUnitOfWork 
1. workLoop根据传入的isYieldy参数来判断performUnitOfWork执行的时机
2. performUnitOfWork调用beginWork更新任务节点, 遇到叶子节点调用completeUnitOfWork完成更新

```flow js
function workLoop(isYieldy) {
    if (!isYieldy) {
        // 同步或者过期 直接调用performUnitOfWork
        while (nextUnitOfWork !== null) {
            nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        }
    } else {
        // 异步 检查一帧是否有空闲时间
        // 有空闲的时间再执行performUnitOfWork
        while (nextUnitOfWork !== null && !shouldYieldToRenderer()) {
            nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        }
    }
}

function performUnitOfWork(workInProgress: Fiber): Fiber | null {

    const current = workInProgress.alternate;

    startWorkTimer(workInProgress);

    let next;
    if (enableProfilerTimer) {
        // ...
    } else {
        next = beginWork(current, workInProgress, nextRenderExpirationTime);
        workInProgress.memoizedProps = workInProgress.pendingProps;
    }

    if (next === null) {
        // 说明到达叶子节点
        next = completeUnitOfWork(workInProgress);
    }

    ReactCurrentOwner.current = null;

    return next;
}

```

## beginWork

```flow js
function beginWork(
    current: Fiber | null,
    workInProgress: Fiber,
    renderExpirationTime: ExpirationTime, // nextExpirationTimeToWorkOn 执行更新的优先级
): Fiber | null {
    const updateExpirationTime = workInProgress.expirationTime;

    if (current !== null) {
        // 一般情况下,无论初次挂载还是更新都会走这个分支的逻辑
        // 初始化的时候,下面的分支都不会走
        // 更新的时候会判断是否需要更新, 判断条件:
        //  1. 前后props不相等
        //  2. 使用老版本的context并发生了变化
        // 如果不需要更新,调用bailoutOnAlreadyFinishedWork复用节点,同时更新当前的context上下文
        const oldProps = current.memoizedProps;
        const newProps = workInProgress.pendingProps;

        if (oldProps !== newProps || hasLegacyContextChanged()) {
            didReceiveUpdate = true;
        } else if (updateExpirationTime < renderExpirationTime) {
            didReceiveUpdate = false;
            switch (workInProgress.tag) {
                //... 
            }
            return bailoutOnAlreadyFinishedWork(
                current,
                workInProgress,
                renderExpirationTime,
            );
        }
    } else {
        didReceiveUpdate = false;
    }

    workInProgress.expirationTime = NoWork;

    // 判断Fiber的节点类型,执行对应的更新
    switch (workInProgress.tag) {
        // FunctionComponent在首次创建的时候的tag类型默认是IndeterminateComponent
        case IndeterminateComponent: {
            // ... 
        }
        // 懒加载组件
        case LazyComponent: {
            // ... 
        }
        // 函数组件
        case FunctionComponent: {
            // ... 
        }
        // 类组件
        case ClassComponent: {
            // ... 
        }
        // 根节点
        case HostRoot:
            // ...
        // 原生标签节点
        case HostComponent:
            // ...
        // 原生文本节点
        case HostText:
            // ...
        // suspense组件 与LazyComponent配合使用, 异步组件
        case SuspenseComponent:
            // ...
        // portal组件
        case HostPortal:
            // ...
        // 通过React.forwardRef创造的组件
        case ForwardRef: {
            // ...
        }
        // React.Fragment组件
        case Fragment:
            // ...
        // React.unstable_AsyncMode组件,表示异步渲染
        case Mode:
            // ...
        // React.Profiler组件,检测性能
        case Profiler:
        // context状态提供组件
        case ContextProvider:
            // ... 
        //  context状态消费组件
        case ContextConsumer:
            // ... 
        // React.memo 组件 与LazyComponent配合使用, 异步组件
        // 添加自定义定比较方法    
        case MemoComponent: {
            // ... 
        }
        // React.memo 组件 与LazyComponent配合使用, 异步组件
        // 未添加自定义定比较方法    
        case SimpleMemoComponent: {
            // ... 
        }
        // 与SuspenseComponent配合使用, 异步组件
        case IncompleteClassComponent: {
           // ... 
        }
        // 与SuspenseComponent配合使用, 异步组件
        case DehydratedSuspenseComponent: {
            // ... 
        }
    }
}

```

## 节点类型更新

### ClassComponent
1. 合并defaultProps和传入的props
2. 根据当前实例状态执行不同的状态函数
3. 判断是否更新,返回子节点

::: tip 流程

<img :src="$withBase('/frameWork/react_origin_renderRoot_beginWork_updateClassComponent.png')" alt="react_origin_renderRoot_beginWork_updateComponent">
:::

**源码**
```flow js
switch (workInProgress.tag) {
    // ...
    case ClassComponent: {
        const Component = workInProgress.type;
        // 待更新的props
        const unresolvedProps = workInProgress.pendingProps;
        // resolveDefaultProps 其实就是把更新的props 加上 Component.defaultProps
        const resolvedProps =
            workInProgress.elementType === Component
                ? unresolvedProps
                : resolveDefaultProps(Component, unresolvedProps);
        return updateClassComponent(
            current,
            workInProgress,
            Component,
            resolvedProps,
            renderExpirationTime,
        );
    }
    // ...
}

function updateClassComponent(
    current: Fiber | null,
    workInProgress: Fiber,
    Component: any,
    nextProps,
    renderExpirationTime: ExpirationTime,
) {

    // 用于处理context
    let hasContext;
    if (isLegacyContextProvider(Component)) {
        hasContext = true;
        pushLegacyContextProvider(workInProgress);
    } else {
        hasContext = false;
    }
    prepareToReadContext(workInProgress, renderExpirationTime);

    // 获取Class实例
    const instance = workInProgress.stateNode;
    let shouldUpdate;
    if (instance === null) {
        // 首次挂载
        if (current !== null) {
            // instance为null的时候,current应该也是null
            // 只有在suspend渲染的情况下会出现
            current.alternate = null;
            workInProgress.alternate = null;
            workInProgress.effectTag |= Placement;
        }
        // 创建该节点实例
        constructClassInstance(
            workInProgress,
            Component,
            nextProps,
            renderExpirationTime,
        )
        // 挂载该节点实例
        // 调用挂载生命周期
        mountClassInstance(
            workInProgress,
            Component,
            nextProps,
            renderExpirationTime,
        );
        shouldUpdate = true;
    } else if (current === null) {
        // 组件被中断渲染了,有实例但是没有current,复用之前的实例,调用挂载生命周期
        shouldUpdate = resumeMountClassInstance(
            workInProgress,
            Component,
            nextProps,
            renderExpirationTime,
        );
    } else {
        // 组件更新, 调用更新生命周期
        shouldUpdate = updateClassInstance(
            current,
            workInProgress,
            Component,
            nextProps,
            renderExpirationTime,
        );
    }
    // 判断是否执行render或者跳过更新, 并返回 render 下的第一个 child
    const nextUnitOfWork = finishClassComponent(
        current,
        workInProgress,
        Component,
        shouldUpdate,
        hasContext,
        renderExpirationTime,
    );
 
    return nextUnitOfWork;
}
```

#### constructClassInstance 
```flow js
function constructClassInstance(
    workInProgress: Fiber,
    ctor: any,
    props: any,
    renderExpirationTime: ExpirationTime,
): any {
    let isLegacyContextConsumer = false;
    let unmaskedContext = emptyContextObject;
    let context = null;
    const contextType = ctor.contextType;


    // 这块是处理context
    if (typeof contextType === 'object' && contextType !== null) {
        context = readContext((contextType: any));
    } else {
        unmaskedContext = getUnmaskedContext(workInProgress, ctor, true);
        const contextTypes = ctor.contextTypes;
        isLegacyContextConsumer =
            contextTypes !== null && contextTypes !== undefined;
        context = isLegacyContextConsumer
            ? getMaskedContext(workInProgress, unmaskedContext)
            : emptyContextObject;
    }

    // 实例化类对象
    // 传入两个参数props和context
    const instance = new ctor(props, context);
    // 获取实例的state属性
    // 赋值state(workInProgress.memoizedState = !isUndef(instance.state) || null)
    const state = (workInProgress.memoizedState =
        instance.state !== null && instance.state !== undefined
            ? instance.state
            : null);
    // 挂载当前实例到Fiber节点上
    adoptClassInstance(workInProgress, instance);

    // context缓存 
    if (isLegacyContextConsumer) {
        cacheContext(workInProgress, unmaskedContext, context);
    }

    return instance;
}

function adoptClassInstance(workInProgress: Fiber, instance: any): void {
    // 在这里设置了updater属性 this.updater.setState
    instance.updater = classComponentUpdater;
    // workInProgress上挂载instance
    workInProgress.stateNode = instance;
    // instance上挂载workInProgress
    setInstance(instance, workInProgress);
}
```

::: tip 问: updater属性是何时被添加的?
在创建实例化的时候调用adoptClassInstance,将classComponentUpdater挂载到updater属性上
:::
#### mountClassInstance

```flow js
function mountClassInstance(
    workInProgress: Fiber,
    ctor: any,
    newProps: any,
    renderExpirationTime: ExpirationTime,
): void {

    // 实例属性挂载
    const instance = workInProgress.stateNode;
    instance.props = newProps;
    instance.state = workInProgress.memoizedState;
    instance.refs = emptyRefsObject;

    // context属性挂载
    const contextType = ctor.contextType;
    if (typeof contextType === 'object' && contextType !== null) {
        instance.context = readContext(contextType);
    } else {
        const unmaskedContext = getUnmaskedContext(workInProgress, ctor, true);
        instance.context = getMaskedContext(workInProgress, unmaskedContext);
    }

    // 获取updateQueue并计算更新队列,获取最后的state
    let updateQueue = workInProgress.updateQueue;
    if (updateQueue !== null) {
        processUpdateQueue(
            workInProgress,
            updateQueue,
            newProps,
            instance,
            renderExpirationTime,
        );
        instance.state = workInProgress.memoizedState;
    }

    // 调用getDerivedStateFromProps钩子并设置新的state
    const getDerivedStateFromProps = ctor.getDerivedStateFromProps;
    if (typeof getDerivedStateFromProps === 'function') {
        applyDerivedStateFromProps(
            workInProgress,
            ctor,
            getDerivedStateFromProps,
            newProps,
        );
        instance.state = workInProgress.memoizedState;
    }

    // 这里调用之后会在新版本中移除的生命周期钩子方法
    // UNSAFE_componentWillMount(componentWillMount)
    // componentWillMount这个方法的调用只有在getDerivedStateFromProps和getSnapshotBeforeUpdate都不存在时调用
    if (
        typeof ctor.getDerivedStateFromProps !== 'function' &&
        typeof instance.getSnapshotBeforeUpdate !== 'function' &&
        (typeof instance.UNSAFE_componentWillMount === 'function' ||
            typeof instance.componentWillMount === 'function')
    ) {
        callComponentWillMount(workInProgress, instance);
        // 重新计算下state 
        updateQueue = workInProgress.updateQueue;
        if (updateQueue !== null) {
            processUpdateQueue(
                workInProgress,
                updateQueue,
                newProps,
                instance,
                renderExpirationTime,
            );
            instance.state = workInProgress.memoizedState;
        }
    }
    
    // 这里做了标记,当挂载到真实节点上会触发该生命周期
    if (typeof instance.componentDidMount === 'function') {
        workInProgress.effectTag |= Update;
    }
}
```

#### resumeMountClassInstance
```flow js
function resumeMountClassInstance(
    workInProgress: Fiber,
    ctor: any,
    newProps: any,
    renderExpirationTime: ExpirationTime,
): boolean {
    // 实例props属性挂载
    // context相关
    const instance = workInProgress.stateNode;

    const oldProps = workInProgress.memoizedProps;
    instance.props = oldProps;

    const oldContext = instance.context;
    const contextType = ctor.contextType;
    let nextContext;
    if (typeof contextType === 'object' && contextType !== null) {
        nextContext = readContext(contextType);
    } else {
        const nextLegacyUnmaskedContext = getUnmaskedContext(
            workInProgress,
            ctor,
            true,
        );
        nextContext = getMaskedContext(workInProgress, nextLegacyUnmaskedContext);
    }

    // 这里判断是否执行getDerivedStateFromProps
    // 和之前一样,如果有新的生命周期钩子就不会执行
    const getDerivedStateFromProps = ctor.getDerivedStateFromProps;
    const hasNewLifecycles =
        typeof getDerivedStateFromProps === 'function' ||
        typeof instance.getSnapshotBeforeUpdate === 'function';
    if (
        !hasNewLifecycles &&
        (typeof instance.UNSAFE_componentWillReceiveProps === 'function' ||
            typeof instance.componentWillReceiveProps === 'function')
    ) {
        if (oldProps !== newProps || oldContext !== nextContext) {
            callComponentWillReceiveProps(
                workInProgress,
                instance,
                newProps,
                nextContext,
            );
        }
    }

    // 设置了hasForceUpdate = false
    resetHasForceUpdateBeforeProcessing();

    // 获取了updateQueue并计算最后的state
    const oldState = workInProgress.memoizedState;
    let newState = (instance.state = oldState);
    let updateQueue = workInProgress.updateQueue;
    if (updateQueue !== null) {
        processUpdateQueue(
            workInProgress,
            updateQueue,
            newProps,
            instance,
            renderExpirationTime,
        );
        newState = workInProgress.memoizedState;
    }
    
    
    // 当重新挂载的时候state, props, context都没变就返回
    if (
        oldProps === newProps &&
        oldState === newState &&
        !hasContextChanged() &&
        !checkHasForceUpdateAfterProcessing()
    ) {
        if (typeof instance.componentDidMount === 'function') {
            workInProgress.effectTag |= Update;
        }
        return false;
    }

    // 调用了getDerivedStateFromProps需要重新计算state
    if (typeof getDerivedStateFromProps === 'function') {
        applyDerivedStateFromProps(
            workInProgress,
            ctor,
            getDerivedStateFromProps,
            newProps,
        );
        newState = workInProgress.memoizedState;
    }

    // 判断是否需要更新
    // 如果存在shouldCompoentDidUpdate,就调用函数判断
    // 如果是pureComponent,会进行浅比较
    const shouldUpdate =
        checkHasForceUpdateAfterProcessing() ||
        checkShouldComponentUpdate(
            workInProgress,
            ctor,
            oldProps,
            newProps,
            oldState,
            newState,
            nextContext,
        );

    if (shouldUpdate) {
        // 有更新就需要判断componentWillMount是否执行
        if (
            !hasNewLifecycles &&
            (typeof instance.UNSAFE_componentWillMount === 'function' ||
                typeof instance.componentWillMount === 'function')
        ) {
            startPhaseTimer(workInProgress, 'componentWillMount');
            if (typeof instance.componentWillMount === 'function') {
                instance.componentWillMount();
            }
            if (typeof instance.UNSAFE_componentWillMount === 'function') {
                instance.UNSAFE_componentWillMount();
            }
            stopPhaseTimer();
        }
        // 标记componentDidMount，中断的组件仍然按照首次挂载执行
        if (typeof instance.componentDidMount === 'function') {
            workInProgress.effectTag |= Update;
        }
    } else {
        if (typeof instance.componentDidMount === 'function') {
            workInProgress.effectTag |= Update;
        }

        workInProgress.memoizedProps = newProps;
        workInProgress.memoizedState = newState;
    }
    
    // 更新props和props
    instance.props = newProps;
    instance.state = newState;
    instance.context = nextContext;

    return shouldUpdate;
}
```

#### updateClassInstance
整个过程和resumeClassInstance基本一致,不同的是执行对应的生命周期, 标记 didUpdate, getSnapshotBeforeUpdate

```flow js
function updateClassInstance(
    current: Fiber,
    workInProgress: Fiber,
    ctor: any,
    newProps: any,
    renderExpirationTime: ExpirationTime,
): boolean {
    // ...
    if (
        oldProps === newProps &&
        oldState === newState &&
        !hasContextChanged() &&
        !checkHasForceUpdateAfterProcessing()
    ) {
        if (typeof instance.componentDidUpdate === 'function') {
            if (
                oldProps !== current.memoizedProps ||
                oldState !== current.memoizedState
            ) {
                workInProgress.effectTag |= Update;
            }
        }
        if (typeof instance.getSnapshotBeforeUpdate === 'function') {
            if (
                oldProps !== current.memoizedProps ||
                oldState !== current.memoizedState
            ) {
                workInProgress.effectTag |= Snapshot;
            }
        }
        return false;
    }
    
    // ...
    if (shouldUpdate) {
        // 这里判断执行的是componentWillUpdate
        if (
            !hasNewLifecycles &&
            (typeof instance.UNSAFE_componentWillUpdate === 'function' ||
                typeof instance.componentWillUpdate === 'function')
        ) {
            startPhaseTimer(workInProgress, 'componentWillUpdate');
            if (typeof instance.componentWillUpdate === 'function') {
                instance.componentWillUpdate(newProps, newState, nextContext);
            }
            if (typeof instance.UNSAFE_componentWillUpdate === 'function') {
                instance.UNSAFE_componentWillUpdate(newProps, newState, nextContext);
            }
            stopPhaseTimer();
        }
        if (typeof instance.componentDidUpdate === 'function') {
            workInProgress.effectTag |= Update;
        }
        if (typeof instance.getSnapshotBeforeUpdate === 'function') {
            workInProgress.effectTag |= Snapshot;
        }
    } else {
        if (typeof instance.componentDidUpdate === 'function') {
            if (
                oldProps !== current.memoizedProps ||
                oldState !== current.memoizedState
            ) {
                workInProgress.effectTag |= Update;
            }
        }
        if (typeof instance.getSnapshotBeforeUpdate === 'function') {
            if (
                oldProps !== current.memoizedProps ||
                oldState !== current.memoizedState
            ) {
                workInProgress.effectTag |= Snapshot;
            }
        }

        workInProgress.memoizedProps = newProps;
        workInProgress.memoizedState = newState;
    }
    
    // ...
}
```

#### finishClassComponent
1. 调用render方法
2. 调用reconcileChildFibers将ReactElement转为Fiber,进行调和Diff

```flow js
function finishClassComponent(
    current: Fiber | null,
    workInProgress: Fiber,
    Component: any,
    shouldUpdate: boolean,
    hasContext: boolean,
    renderExpirationTime: ExpirationTime,
) {
    // 标记ref标志
    markRef(current, workInProgress);

    const didCaptureError = (workInProgress.effectTag & DidCapture) !== NoEffect;

    // 如果不需要更新并且没有错误捕获就复用节点返回子节点
    if (!shouldUpdate && !didCaptureError) {
        // context相关
        if (hasContext) {
            invalidateContextProvider(workInProgress, Component, false);
        }

        return bailoutOnAlreadyFinishedWork(
            current,
            workInProgress,
            renderExpirationTime,
        );
    }

    const instance = workInProgress.stateNode;

    // Rerender
    ReactCurrentOwner.current = workInProgress;
    let nextChildren;
    if (
        didCaptureError &&
        typeof Component.getDerivedStateFromError !== 'function'
    ) {
        // 如果捕获错误,并且没有getDerivedStateFromError,就卸载子组件
        nextChildren = null;

        if (enableProfilerTimer) {
            stopProfilerTimerIfRunning(workInProgress);
        }
    } else {
        // 需要更新且不报错就调用实例的render方法获得最新的 nextChildren, 
        if (__DEV__) {
            // ...
        } else {
            nextChildren = instance.render();
        }
    }

    // devtool相关标识
    workInProgress.effectTag |= PerformedWork;
    if (current !== null && didCaptureError) {
        // 如果有错误重新计算children
        // 最终调用的还是reconcilerChildrenFibers
        forceUnmountCurrentAndReconcile(
            current,
            workInProgress,
            nextChildren,
            renderExpirationTime,
        );
    } else {
        // 计算children将ReactElement转成Fiber
        // 最终调用的是reconcileChildFibers
        reconcileChildren(
            current,
            workInProgress,
            nextChildren,
            renderExpirationTime,
        );
    }

    workInProgress.memoizedState = instance.state;

    // 如果存在context需要重新计算状态
    if (hasContext) {
        invalidateContextProvider(workInProgress, Component, true);
    }

    return workInProgress.child;
}
```

### FunctionComponent
1. 执行function函数和hooks钩子
2. 调用reconcileChildFibers将ReactElement转为Fiber,进行调和Diff

::: tip 流程

<img :src="$withBase('/frameWork/react_origin_renderRoot_beginWork_updateFunctionComponent.png')" alt="react_origin_renderRoot_beginWork_updateComponent">
:::

**源码**
```flow js
switch (workInProgress.tag) {
    // ...
    case FunctionComponent: {
        const Component = workInProgress.type;
        const unresolvedProps = workInProgress.pendingProps;
        const resolvedProps =
            workInProgress.elementType === Component
                ? unresolvedProps
                : resolveDefaultProps(Component, unresolvedProps);
        return updateFunctionComponent(
            current,
            workInProgress,
            Component,
            resolvedProps,
            renderExpirationTime,
        );
    }
    // ...    
}

function updateFunctionComponent(
    current,
    workInProgress,
    Component,
    nextProps: any,
    renderExpirationTime,
) {

    // context相关
    const unmaskedContext = getUnmaskedContext(workInProgress, Component, true);
    const context = getMaskedContext(workInProgress, unmaskedContext);

    let nextChildren;
    prepareToReadContext(workInProgress, renderExpirationTime);
    if (__DEV__) {
        // ... 
    } else {
        // 处理函数组件中的hooks
        // 调用函数获取对应的ReactElement同时处理hooks
        nextChildren = renderWithHooks(
            current,
            workInProgress,
            Component,
            nextProps,
            context,
            renderExpirationTime,
        );
    }

    if (current !== null && !didReceiveUpdate) {
        // 表示非首次挂载并且未更新数据
        // 复用节点
        bailoutHooks(current, workInProgress, renderExpirationTime);
        return bailoutOnAlreadyFinishedWork(
            current,
            workInProgress,
            renderExpirationTime,
        );
    }

    workInProgress.effectTag |= PerformedWork;
    // 将ReactElement转为Fiber,提供Diff
    // 函数返回值赋值给workInProgress.child
    // 最终调用的是reconcileChildFibers
    reconcileChildren(
        current,
        workInProgress,
        nextChildren,
        renderExpirationTime,
    );
    
    return workInProgress.child;
}

```

#### renderWithHooks
> renderWithHooks主要处理了新增的hooks钩子的逻辑

```flow js
export function renderWithHooks(
    current: Fiber | null,
    workInProgress: Fiber,
    Component: any,
    props: any,
    refOrContext: any,
    nextRenderExpirationTime: ExpirationTime,
): any {
    renderExpirationTime = nextRenderExpirationTime;
    // 当前真要渲染的Fiber对象
    currentlyRenderingFiber = workInProgress;
    // 这块memoizedState就是我们调用useState Hook对象
    nextCurrentHook = current !== null ? current.memoizedState : null;

    if (__DEV__) {
        // ... 
    } else {
        // 用来存放 useState、useEffect 等 hook 函数的调用对象
        // 首次渲染使用的是 HooksDispatcherOnMount
        // 之后更新使用的是 HooksDispatcherOnUpdate
        ReactCurrentDispatcher.current =
            nextCurrentHook === null
                ? HooksDispatcherOnMount
                : HooksDispatcherOnUpdate;
    }

    // 执行Function获取return返回的节点信息
    // 可以看到函数组件传入的第一个参数是props,第二个参数是context
    let children = Component(props, refOrContext);

    if (didScheduleRenderPhaseUpdate) {
        // 当触发更新时,执行一次循环, 重新调用函数计算children
        do {
            didScheduleRenderPhaseUpdate = false;
            //记录渲染次数 
            numberOfReRenders += 1;

            nextCurrentHook = current !== null ? current.memoizedState : null;
            nextWorkInProgressHook = firstWorkInProgressHook;

            currentHook = null;
            workInProgressHook = null;
            componentUpdateQueue = null;


            ReactCurrentDispatcher.current = __DEV__
                ? HooksDispatcherOnUpdateInDEV
                : HooksDispatcherOnUpdate;

            children = Component(props, refOrContext);
        } while (didScheduleRenderPhaseUpdate);

        renderPhaseUpdates = null;
        numberOfReRenders = 0;
    }

    // 阻止hooks在函数外使用
    // 只有在函数内执行dispatcher才会被赋予正确的环境值
    ReactCurrentDispatcher.current = ContextOnlyDispatcher;

    const renderedWork: Fiber = (currentlyRenderingFiber: any);

    // 为当前的workInProgress设置相关属性
    renderedWork.memoizedState = firstWorkInProgressHook;
    renderedWork.expirationTime = remainingExpirationTime;
    renderedWork.updateQueue = (componentUpdateQueue: any);
    renderedWork.effectTag |= sideEffectTag;
    
    const didRenderTooFewHooks =
        currentHook !== null && currentHook.next !== null;

    // 重置全局属性
    renderExpirationTime = NoWork;
    currentlyRenderingFiber = null;

    currentHook = null;
    nextCurrentHook = null;
    firstWorkInProgressHook = null;
    workInProgressHook = null;
    nextWorkInProgressHook = null;

    remainingExpirationTime = NoWork;
    componentUpdateQueue = null;
    sideEffectTag = 0;

    return children;
}
```


### IndeterminateComponent
> 组件首次渲染的默认类型,在第一次渲染后会确定具体类型

::: tip 流程

<img :src="$withBase('/frameWork/react_origin_renderRoot_beginWork_IndeterminateComponent.png')" alt="react_origin_renderRoot_beginWork_IndeterminateComponent">
:::

**源码**
```flow js
function mountIndeterminateComponent(
    _current,
    workInProgress,
    Component,
    renderExpirationTime,
) {
    if (_current !== null) {
        // 如果出现了_current参数,说明渲染时有Suspend的情况
        _current.alternate = null;
        workInProgress.alternate = null;
        workInProgress.effectTag |= Placement;
    }

    const props = workInProgress.pendingProps;
    // 下面是和context相关,设置节点读取context的范围
    const unmaskedContext = getUnmaskedContext(workInProgress, Component, false);
    const context = getMaskedContext(workInProgress, unmaskedContext);

    prepareToReadContext(workInProgress, renderExpirationTime);

    let value;

    if (__DEV__) {
        // ...
    } else {
        // renderWithHooks是用于处理函数式组件的hook
        // 同时返回函数return的对象
        value = renderWithHooks(
            null,
            workInProgress,
            Component,
            props,
            context,
            renderExpirationTime,
        );
    }
    // ...

    // 根据value判断Fiber类型是FunctionComponent还是ClassComponent
    if (
        typeof value === 'object' &&
        value !== null &&
        typeof value.render === 'function' &&
        value.$$typeof === undefined
    ) {
        // 这里判断返回的值有render属性就是ClassComponent类型
        workInProgress.tag = ClassComponent;

        // ClassComponent类型无法使用Hook,因此要清理
        resetHooks();

        // 下面的逻辑就是updateClassComponent的逻辑
        let hasContext = false;
        if (isLegacyContextProvider(Component)) {
            hasContext = true;
            pushLegacyContextProvider(workInProgress);
        } else {
            hasContext = false;
        }

        workInProgress.memoizedState =
            value.state !== null && value.state !== undefined ? value.state : null;

        const getDerivedStateFromProps = Component.getDerivedStateFromProps;
        if (typeof getDerivedStateFromProps === 'function') {
            applyDerivedStateFromProps(
                workInProgress,
                Component,
                getDerivedStateFromProps,
                props,
            );
        }

        adoptClassInstance(workInProgress, value);
        mountClassInstance(workInProgress, Component, props, renderExpirationTime);
        return finishClassComponent(
            null,
            workInProgress,
            Component,
            true,
            hasContext,
            renderExpirationTime,
        );
    } else {
        // 下面是updateFunctionComponent的处理逻辑
        workInProgress.tag = FunctionComponent;
        reconcileChildren(null, workInProgress, value, renderExpirationTime);

        return workInProgress.child;
    }
}
```

### HostRoot
> ReactDOM.render为Root节点的创建update

::: tip 流程

<img :src="$withBase('/frameWork/react_origin_renderRoot_beginWork_hostRoot.png')" alt="react_origin_renderRoot_beginWork_hostRoot">
:::

**源码**
```flow js

function updateHostRoot(current, workInProgress, renderExpirationTime) {
    // context相关
    pushHostRootContext(workInProgress);
    const updateQueue = workInProgress.updateQueue;
    const nextProps = workInProgress.pendingProps;
    const prevState = workInProgress.memoizedState;
    const prevChildren = prevState !== null ? prevState.element : null;
    // 获取新的state
    processUpdateQueue(
        workInProgress,
        updateQueue,
        nextProps,
        null,
        renderExpirationTime,
    );
    const nextState = workInProgress.memoizedState;
    // React DevTool依赖element这个属性
    const nextChildren = nextState.element;
    if (nextChildren === prevChildren) {
        // 新老state相同就会复用原来节点  
        resetHydrationState();
        return bailoutOnAlreadyFinishedWork(
            current,
            workInProgress,
            renderExpirationTime,
        );
    }
    const root: FiberRoot = workInProgress.stateNode;
    if (
        (current === null || current.child === null) &&
        root.hydrate &&
        enterHydrationState(workInProgress)
    ) {
        // 首次挂载,设置更新标识符 
        workInProgress.effectTag |= Placement;

        // 这块和前面很像,最终进入reconcileChildFibers Diff
        workInProgress.child = mountChildFibers(
            workInProgress,
            null,
            nextChildren,
            renderExpirationTime,
        );
    } else {
        // 更新,进行reconcileChildFibers Diff
        reconcileChildren(
            current,
            workInProgress,
            nextChildren,
            renderExpirationTime,
        );
        resetHydrationState();
    }
    return workInProgress.child;
}
```

### HostComponent
> 该类型表示的是原生节点(div,h1...)


::: tip 流程

<img :src="$withBase('/frameWork/react_origin_renderRoot_beginWork_hostComponent.png')" alt="react_origin_renderRoot_beginWork_hostComponent">
:::

**源码**
```flow js

function updateHostComponent(current, workInProgress, renderExpirationTime) {
    // context相关
    pushHostContext(workInProgress);

    if (current === null) {
        // 这块和服务端渲染有关,判断是否能够复用 
        tryToClaimNextHydratableInstance(workInProgress);
    }

    const type = workInProgress.type;
    const nextProps = workInProgress.pendingProps;
    const prevProps = current !== null ? current.memoizedProps : null;

    let nextChildren = nextProps.children;
    //shouldSetTextContent返回true的条件, 满足下面三个条件之一
    // 节点在(textarea, option, noscript) 之中
    // 节点的子元素是字符串或者数字类型
    // 存在dangerouslySetInnerHTML属性
    const isDirectTextChild = shouldSetTextContent(type, nextProps);

    if (isDirectTextChild) {
        // dom标签内是纯文本,直接渲染文本内容
        nextChildren = null;
    } else if (prevProps !== null && shouldSetTextContent(type, prevProps)) {
        // 之前是文本节点现在不是,打上标记
        workInProgress.effectTag |= ContentReset;
    }

    // 只有在hostComponent和hostText中使用markRef
    // 如果存在ref属性,打上ref标记  
    markRef(current, workInProgress);

    if (
        renderExpirationTime !== Never &&
        workInProgress.mode & ConcurrentMode &&
        shouldDeprioritizeSubtree(type, nextProps)
    ) {
        // concurrentMode下设置过期时间为Never,优先级最低
        workInProgress.expirationTime = workInProgress.childExpirationTime = Never;
        return null;
    }

    // 最终还是调用reconcileChildren进行Diff
    reconcileChildren(
        current,
        workInProgress,
        nextChildren,
        renderExpirationTime,
    );
    return workInProgress.child;
}
```

### HostText
> 纯文本节点

```flow js
function updateHostText(current, workInProgress) {
    if (current === null) {
        // 判断是否可以复用服务端的渲染
        tryToClaimNextHydratableInstance(workInProgress);
    }
    // 直接渲染,不需要调和 
    return null;
}
```

### SuspenseComponent
> react16新增的组件类型, 作用是异步操作的UI逻辑解耦

1. 判断组件是否获取到异常(reject/promise),
2. 捕获到异常渲染fallback节点
3. 没有捕获到渲染最终节点
4. 最终还是通过reconcileChildFibers进行调和diff

```flow js

function updateSuspenseComponent(
    current,
    workInProgress,
    renderExpirationTime,
) {
    const mode = workInProgress.mode;
    // fallback&children
    const nextProps = workInProgress.pendingProps;
    let nextState: SuspenseState | null = workInProgress.memoizedState;

    // 用于判断Suspense是否超时了, 超时就显示fallback的内容
    // 这块的超时指的是是否捕获到了错误
    let nextDidTimeout;
    // 判断是否抛出reject或者promise
    if ((workInProgress.effectTag & DidCapture) === NoEffect) {
        // 没抛出
        nextState = null;
        nextDidTimeout = false;
    } else {
        // 抛出了
        nextState = {
            timedOutAt: nextState !== null ? nextState.timedOutAt : NoWork,
        };
        nextDidTimeout = true;
        workInProgress.effectTag &= ~DidCapture;
    }

    let child;
    let next;
    if (current === null) {
        // 刚初始化挂载 
        if (nextDidTimeout) {
            // 触发第一次throw promise时触发,pendding状态
            // 通过fallback创建子节点
            const nextFallbackChildren = nextProps.fallback;
            // 创建Fragment类型的fiber,用于保存最终渲染的节点
            const primaryChildFragment = createFiberFromFragment(
                null,
                mode,
                NoWork,
                null,
            );

            if ((workInProgress.mode & ConcurrentMode) === NoContext) {
                // 保存最终渲染节点的子节点信息
                const progressedState: SuspenseState = workInProgress.memoizedState;
                const progressedPrimaryChild: Fiber | null =
                    progressedState !== null
                        ? (workInProgress.child: any).child
                        : (workInProgress.child: any);
                primaryChildFragment.child = progressedPrimaryChild;
            }

            // 为fallback创建节点
            const fallbackChildFragment = createFiberFromFragment(
                nextFallbackChildren,
                mode,
                renderExpirationTime,
                null,
            );
            primaryChildFragment.sibling = fallbackChildFragment;
            child = primaryChildFragment;
            next = fallbackChildFragment;
            child.return = next.return = workInProgress;
        } else {
            // 初始化Suspense的时候触发
            // 所以一开始会走这个逻辑,再走上面的逻辑
            const nextPrimaryChildren = nextProps.children;
            child = next = mountChildFibers(
                workInProgress,
                null,
                nextPrimaryChildren,
                renderExpirationTime,
            );
        }
    } else {
        // 更新阶段, throw reject或者返回结果的时候 
        // prevState 会携带timedOutAt属性
        const prevState = current.memoizedState;
        const prevDidTimeout = prevState !== null;
        if (prevDidTimeout) {
            // 表示之前已经抛出异常 
            const currentPrimaryChildFragment: Fiber = (current.child: any);
            const currentFallbackChildFragment: Fiber = (currentPrimaryChildFragment.sibling: any);
            if (nextDidTimeout) {
                // 还是有异常抛出, 复用之前的主要节点
                const nextFallbackChildren = nextProps.fallback;
                const primaryChildFragment = createWorkInProgress(
                    currentPrimaryChildFragment,
                    currentPrimaryChildFragment.pendingProps,
                    NoWork,
                );
                // ...
                // 渲染fallback节点, 跳过主要节点 
                next = fallbackChildFragment;
                child.return = next.return = workInProgress;
            } else {
                // 表示结束了suspense, 状态返回了真实数据,而不是抛出异常
                // 渲染真实节点
                const nextPrimaryChildren = nextProps.children;
                const currentPrimaryChild = currentPrimaryChildFragment.child;
                const primaryChild = reconcileChildFibers(
                    workInProgress,
                    currentPrimaryChild,
                    nextPrimaryChildren,
                    renderExpirationTime,
                );
                child = next = primaryChild;
            }
        } else {
            // ... 
        }
        workInProgress.stateNode = current.stateNode;
    }

    workInProgress.memoizedState = nextState;
    workInProgress.child = child;
    return next;
}
```

## 节点复用

```flow js

function bailoutOnAlreadyFinishedWork(
    current: Fiber | null,
    workInProgress: Fiber,
    renderExpirationTime: ExpirationTime,
): Fiber | null {
    cancelWorkTimer(workInProgress);

    if (current !== null) {
        // Reuse previous context list
        workInProgress.contextDependencies = current.contextDependencies;
    }

    if (enableProfilerTimer) {
        // Don't update "base" render times for bailouts.
        stopProfilerTimerIfRunning(workInProgress);
    }

    // Check if the children have any pending work.
    const childExpirationTime = workInProgress.childExpirationTime;
    if (childExpirationTime < renderExpirationTime) {
        // The children don't have any work either. We can skip them.
        // TODO: Once we add back resuming, we should check if the children are
        // a work-in-progress set. If so, we need to transfer their effects.
        return null;
    } else {
        // This fiber doesn't have work, but its subtree does. Clone the child
        // fibers and continue.
        cloneChildFibers(current, workInProgress);
        return workInProgress.child;
    }
}
```