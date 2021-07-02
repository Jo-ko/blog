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

            // Reset in case completion throws.
            // This is only used in DEV and when replaying is on.
            let mayReplay;

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
                    // root错误也作为无法预料的错误
                    didFatal = true;
                    onUncaughtError(thrownValue);
                } else {
                    // 错误处理, 针对Suspend做了处理
                    throwException(
                        root,
                        returnFiber,
                        sourceFiber,
                        thrownValue,
                        nextRenderExpirationTime,
                    );
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

    // Yield back to main thread.
    if (didFatal) {
        const didCompleteRoot = false;
        stopWorkLoopTimer(interruptedBy, didCompleteRoot);
        interruptedBy = null;
        // `nextRoot` points to the in-progress root. A non-null value indicates
        // that we're in the middle of an async render. Set it to null to indicate
        // there's no more work to be done in the current batch.
        nextRoot = null;
        onFatal(root);
        return;
    }

    if (nextUnitOfWork !== null) {
        // There's still remaining async work in this tree, but we ran out of time
        // in the current frame. Yield back to the renderer. Unless we're
        // interrupted by a higher priority update, we'll continue later from where
        // we left off.
        const didCompleteRoot = false;
        stopWorkLoopTimer(interruptedBy, didCompleteRoot);
        interruptedBy = null;
        onYield(root);
        return;
    }

    // We completed the whole tree.
    const didCompleteRoot = true;
    stopWorkLoopTimer(interruptedBy, didCompleteRoot);
    const rootWorkInProgress = root.current.alternate;
    invariant(
        rootWorkInProgress !== null,
        'Finished root should have a work-in-progress. This error is likely ' +
        'caused by a bug in React. Please file an issue.',
    );

    // `nextRoot` points to the in-progress root. A non-null value indicates
    // that we're in the middle of an async render. Set it to null to indicate
    // there's no more work to be done in the current batch.
    nextRoot = null;
    interruptedBy = null;

    if (nextRenderDidError) {
        // There was an error
        if (hasLowerPriorityWork(root, expirationTime)) {
            // There's lower priority work. If so, it may have the effect of fixing
            // the exception that was just thrown. Exit without committing. This is
            // similar to a suspend, but without a timeout because we're not waiting
            // for a promise to resolve. React will restart at the lower
            // priority level.
            markSuspendedPriorityLevel(root, expirationTime);
            const suspendedExpirationTime = expirationTime;
            const rootExpirationTime = root.expirationTime;
            onSuspend(
                root,
                rootWorkInProgress,
                suspendedExpirationTime,
                rootExpirationTime,
                -1, // Indicates no timeout
            );
            return;
        } else if (
            // There's no lower priority work, but we're rendering asynchronously.
            // Synchronously attempt to render the same level one more time. This is
            // similar to a suspend, but without a timeout because we're not waiting
            // for a promise to resolve.
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
                -1, // Indicates no timeout
            );
            return;
        }
    }

    if (isYieldy && nextLatestAbsoluteTimeoutMs !== -1) {
        // The tree was suspended.
        const suspendedExpirationTime = expirationTime;
        markSuspendedPriorityLevel(root, suspendedExpirationTime);

        // Find the earliest uncommitted expiration time in the tree, including
        // work that is suspended. The timeout threshold cannot be longer than
        // the overall expiration.
        const earliestExpirationTime = findEarliestOutstandingPriorityLevel(
            root,
            expirationTime,
        );
        const earliestExpirationTimeMs = expirationTimeToMs(earliestExpirationTime);
        if (earliestExpirationTimeMs < nextLatestAbsoluteTimeoutMs) {
            nextLatestAbsoluteTimeoutMs = earliestExpirationTimeMs;
        }

        // Subtract the current time from the absolute timeout to get the number
        // of milliseconds until the timeout. In other words, convert an absolute
        // timestamp to a relative time. This is the value that is passed
        // to `setTimeout`.
        const currentTimeMs = expirationTimeToMs(requestCurrentTime());
        let msUntilTimeout = nextLatestAbsoluteTimeoutMs - currentTimeMs;
        msUntilTimeout = msUntilTimeout < 0 ? 0 : msUntilTimeout;

        // TODO: Account for the Just Noticeable Difference

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

    // Ready to commit.
    onComplete(root, rootWorkInProgress, expirationTime);
}
```