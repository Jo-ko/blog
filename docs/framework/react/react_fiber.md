# Fiber

## 什么是Fiber
> React中的Fiber表示的是用于替换原有Stack更新模型的一种将 __IO密集型操作碎片化__ 的模型

1. 表示一种流程控制原语,字面意思为协程,也叫纤程,作用是控制流程的让出机制, React中的Fiber遵循的是一种主动让出机制: 合作式调度 
2. 表示一个执行单元,或者说是一种数据结构,保存着结构信息,任务信息和调度信息

## 为什么会有Fiber
> 首先,我们需要了解[浏览器一帧中执行了什么](/docs/browser/struct.html#what-happens-in-%E6%B8%B2%E6%9F%93%E8%BF%9B%E7%A8%8B).
> 在React16之前的版本对更新/挂载 -> 组件生命周期调用 -> 计算和对比虚拟dom -> 将不同更新到真实DOM树上这一个整个过程是一气呵成的,
> 因此当整个组件较大时,由于执行的时间较长,会造成js主线程被长时间占用,使得浏览器在一帧中可执行的操作受限,从而影响用户的其他操作和页面的渲染,所以我们需要一种机制来可中断/恢复更新执行过程

## Fiber是如何控制更新中断/恢复的
> 严格意义上说Fiber本质是一种数据结构(16中的虚拟dom),它并非控制中断/恢复,而是保存了更新的数据节点相关信息,给Schedule调度器提供了更新任务优先级属性等一些信息的 __执行单元__,Schedule调度器才是真正控制更新中断/恢复的执行者
1. 我们将Fiber视为一个执行单元, 每次通过requestIdlCallback(React自己实现了调度器Schedule)执行完一个单元,就会检查剩余的时间,如果没有时间就会将控制权交还给宿主环境
2. Fiber的调度利用了requestAnimation在EventLoop进入渲染前开始触发执行任务,同时记录时间,通过调用MessageChannel在下一帧最开始的时候开始执行任务(根据EventLoop运行机制,MessageChannel会在宏任务中较先执行,其实setImmediately才是最先执行的宏任务)
3. Fiber中的更新任务依然是串行执行的,对于那些高优先级的任务依旧会被阻塞

### Fiber的中断/恢复机制是如何控制状态一致性和视图一致性

## Fiber的数据结构组成
1. 用于表示链表结构属性的信息
```flow js
type Fiber = {
    // 当前Fiber节点的父节点
    return: Fiber | null,

    // 当前Fiber节点的子节点
    child: Fiber | null,
    // 当前Fiber节点的兄弟节点
    sibling: Fiber | null,
    index: number,
}
```
2. 用于表示一些渲染结构的信息
```flow js
type Fiber = {
    // 标记不同组件的类型
    tag: WorkTag,

    // ReactElement的属性key 
    key: null | string,

    // ReactElement.type, 表示标签类型, 也就是我们调用`createElement`的第一个参数
    elementType: any,

    // 异步组件返回的类型,一般是function或者class 
    type: any,

    // 与Fiber相关的本地状态(比如reactDOM下的原生DOM节点),这和宿主环境有关
    // Root节点的stateNode对应的是FiberRoot对象
    stateNode: any,
}
``` 

3. 用于表示一些工作单元的信息
```flow js
type Fiber = {
    // 新变动带来的新props
    pendingProps: any,
    // 上一次渲染完成的props
    memoizedProps: any,

    // 该Fiber对应组件产生更新存放的链表
    updateQueue: UpdateQueue<any> | null,

    // 上次渲染完成的state
    memoizedState: any,

    // 存放Fiber依赖context对象 
    contextDependencies: ContextDependencyList | null,

    // 表示当前的渲染模式
    // NoContext = 0b000;
    // ConcurrentMode = 0b001;
    // StrictMode = 0b010;
    // ProfileMode = 0b100;
    mode: TypeOfMode,

    // 记录sideEffect
    // 性能检测 & 更新删除插入 & 生命周期
    effectTag: SideEffectTag,

    // Effect链表中指向下一个Effect 
    nextEffect: Fiber | null,

    // 子树中第一个side effect
    firstEffect: Fiber | null,
    // 子树中最后一个side effect
    lastEffect: Fiber | null,

    // 该节点的过期时间 
    expirationTime: ExpirationTime,

    // 子节点中的最高优先级的过期时间
    childExpirationTime: ExpirationTime,

    // 在Fiber树更新的过程中，每个Fiber都会有一个跟其对应的Fiber
    // 我们称他为`current <==> workInProgress`(Fiber双缓存技术)
    // 在渲染完成之后他们会交换位置
    alternate: Fiber | null,
}
```

### Fiber为什么使用链表结构
> React Fiber被称为虚拟栈帧(virtual Stack Frame)
1. 使用链表不是目的,能够模拟调用栈才是Fiber的目的,链表这种能中断和恢复的特性符合模拟的要求,而整个遍历过程也就由递归变成了迭代
2. 链表可以保存了和调用栈一样的上下文信息(child表示子栈, return表示父栈)
3. 通过return属性,当节点出现异常的时候,我们可以通过return回溯打印出完整的节点栈

## FiberRoot和RootFiber
> FiberRoot和RootFiber产生关系的时机是ReactDOM.render调用[createFiberRoot](/docs/framework/react16/react_origin_renderAndUpdate.html#创建fiberroot和rootfiber)的时候
1. FiberRoot是整个应用的根节点, 通过current属性指向当前的RootFiber
2. RootFiber在应用中存在两个一个是currentRootFiber,表示当前渲染呈现的RootFiber; 一个是workInProgressRootFiber, 表示内存中调度更新的RootFiber, RootFiber通过stateNode指向FiberRoot

::: tip FiberRoot
通过调用createFiberRoot创建的对象, FiberRoot是应用的根节点, 通过current属性连接RootFiber(Fiber)
```flow js
type BaseFiberRootProperties = {
    // root挂载容器,调用ReactROM.render(<App />, document.getElementById('root'))的第二个参数
    containerInfo: any,
    // 在不支持增量更新的平台使用,比如RN,需要使用持久化更新 
    pendingChildren: any,
    // 当前指向的RootFiber
    // React通过双缓存机制,在current和workInProgress之间切换
    current: Fiber,

    // 以下的优先级是用来区分
    // 1) 没有提交(committed)的任务
    // 2) 没有提交的挂起任务
    // 3) 没有提交的可能被挂起的任务
    // 子树中最早的在提交阶段被挂起暂停的优先级值
    earliestSuspendedTime: ExpirationTime,
    // 子树中最迟的在提交阶段被挂起暂停的优先级值
    latestSuspendedTime: ExpirationTime,
    // 子树中需要进行渲染的最早的优先级值
    earliestPendingTime: ExpirationTime,
    // 子树中需要进行渲染的最迟的优先级值
    latestPendingTime: ExpirationTime,
    // 子树中最新的挂起的可以重新尝试的优先级值
    latestPingedTime: ExpirationTime,

    // 用于suspense错误捕获
    pingCache:
        | WeakMap<Thenable, Set<ExpirationTime>>
        | Map<Thenable, Set<ExpirationTime>>
        | null,

    // renderRoot出现错误时,并且此时没有其他的更新,会尝试重新渲染
    didError: boolean,

    // 正在等待提交任务的过期时间
    pendingCommitExpirationTime: ExpirationTime,
    // 等待进入commit提交更新阶段的任务
    finishedWork: Fiber | null,
    // it's superseded by a new one.
    timeoutHandle: TimeoutHandle | NoTimeout,
    // 顶层context对象，只有主动调用renderSubtreeIntoContainer才会生效
    context: Object | null,
    pendingContext: Object | null,
    // 判断是否是服务端渲染
    +hydrate: boolean,
    // 当前要更新渲染的是哪个优先级的任务
    nextExpirationTimeToWorkOn: ExpirationTime,
    // 当前更新对应的过期时间
    expirationTime: ExpirationTime,
    // List of top-level batches. This list indicates whether a commit should be
    // deferred. Also contains completion callbacks.
    // TODO: Lift this into the renderer
    firstBatch: Batch | null,
    // root之间关联的链表结构
    nextScheduledRoot: FiberRoot | null,
};
```
:::

::: tip RootFiber&Fiber
1. 通过createFiber创建,RootFiber是当前Fiber树的根节点
2. Fiber和ReactElement是一一对应的
```flow js
export type Fiber = {|
    // 标记不同组件的类型
    tag: WorkTag,

    // ReactElement的属性key 
    key: null | string,

    // ReactElement.type, 表示标签类型, 也就是我们调用`createElement`的第一个参数
    elementType: any,

    // 异步组件返回的类型,一般是function或者class 
    type: any,

    // 与Fiber相关的本地状态(比如reactDOM下的原生DOM节点),这和宿主环境有关
    // Root节点的stateNode对应的是FiberRoot对象
    stateNode: any,

   // 链表树结构
   // 当前Fiber节点的父节点
    return: Fiber | null,

    // 当前Fiber节点的子节点
    child: Fiber | null,
    // 当前Fiber节点的兄弟节点
    sibling: Fiber | null,
    index: number,

    // ref属性
    ref: null | (((handle: mixed) => void) & { _stringRef: ?string }) | RefObject,

    // 新变动带来的新props
    pendingProps: any, 
    // 上一次渲染完成的props
    memoizedProps: any, 

    // 该Fiber对应组件产生更新存放的链表
    updateQueue: UpdateQueue<any> | null,

    // 上次渲染完成的state
    memoizedState: any,

    // 存放Fiber依赖context对象 
    contextDependencies: ContextDependencyList | null,

    // 表示当前的渲染模式
    // NoContext = 0b000;
    // ConcurrentMode = 0b001;
    // StrictMode = 0b010;
    // ProfileMode = 0b100;
    mode: TypeOfMode,

    // 记录sideEffect
    // 性能检测 & 更新删除插入 & 生命周期
    effectTag: SideEffectTag,

    // Effect链表中指向下一个Effect 
    nextEffect: Fiber | null,

    // 子树中第一个side effect
    firstEffect: Fiber | null,
    // 子树中最后一个side effect
    lastEffect: Fiber | null,

    // 该节点的过期时间 
    expirationTime: ExpirationTime,

    // 子节点中的最高优先级的过期时间
    childExpirationTime: ExpirationTime,

    // 在Fiber树更新的过程中，每个Fiber都会有一个跟其对应的Fiber
    // 我们称他为`current <==> workInProgress`(Fiber双缓存技术)
    // 在渲染完成之后他们会交换位置
    alternate: Fiber | null,

    // 下面是调试相关的，收集每个Fiber和子树渲染时间的
    actualDuration?: number,

    actualStartTime?: number,

    selfBaseDuration?: number,

    treeBaseDuration?: number,
    
    // 开发模式下使用
    _debugID?: number,
    _debugSource?: Source | null,
    _debugOwner?: Fiber | null,
    _debugIsCurrentlyTiming?: boolean,

    _debugHookTypes?: Array<HookType> | null,
|}
```
:::

## Fiber双缓存
> Fiber双缓存类似图形化领域的双缓存

1. 在Reconciliation的render阶段将所有更改点在workInProgress(WIP树)上处理完成,然后在commit阶段统一更新到浏览器上
2. 由于WIP树的节点是可以共用的,因此这样可以减少内存的分配和垃圾的回收
3. 同时修改WIP树节点不会影响原有的current树,类似于git中的Fork出来的分支

### 双缓存结构
当前在屏幕上显示的成为current Fiber, 在内存中构建的成为workInProgress Fiber