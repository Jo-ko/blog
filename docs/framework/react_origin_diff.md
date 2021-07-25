---
title: React源码-Diff
date: 2020-04-29
tags:
- 框架基础
categories:
- 前端知识
---

> 在beginWork进行节点更新的时候最终都会调用reconcileChildren进行调和
> 调和的主要任务就是新旧fiber的diff,也就涉及了react的另一个知识点virtualDom-Diff

## reconcileChildren

```flow js
export function reconcileChildren(
    current: Fiber | null,
    workInProgress: Fiber,
    nextChildren: any,
    renderExpirationTime: ExpirationTime,
) {
    if (current === null) {
        // 首次挂载  
        workInProgress.child = mountChildFibers(
            workInProgress,
            null,
            nextChildren,
            renderExpirationTime,
        );
    } else {
        // 更新渲染
        workInProgress.child = reconcileChildFibers(
            workInProgress,
            current.child,
            nextChildren,
            renderExpirationTime,
        );
    }
}

// 两个调和函数其实调用的是同一个工厂函数ChildReconciler
export const reconcileChildFibers = ChildReconciler(true);
export const mountChildFibers = ChildReconciler(false);

// 返回了reconcileChildFiners,通过闭包引用内置的方法 
function ChildReconciler(shouldTrackSideEffects) {
   // ...一些方法

   // 调和子节点
   function reconcileChildFibers(
           returnFiber: Fiber, // 实际传入的是workInProgress
           currentFirstChild: Fiber | null, // 首次挂载传入的null,更新传入的是current.child
           newChild: any, // render返回或者functio返回的ReactElement
           expirationTime: ExpirationTime, // 任务优先级
   ): Fiber | null {
      // ...    
   }
   return reconcileChildFibers;
}
```


## reconcileChildFibers

1. reconcileChildFibers会根据新节点的不同类型,进行不同的处理.
   1. 单个节点
      1. 单个元素,调用reconcileSingleElement
      2. 单个Portal元素,调用reconcileSinglePortal
      3. string或者number，调用reconcileSingleTextNode
   2. 多个节点
      1. array, 调用reconcileChildrenArray
2. 通过placeSingleChild将第一次挂载的Fiber的effectTag属性标识为Placement

```flow js
function reconcileChildFibers(
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    newChild: any,
    expirationTime: ExpirationTime,
): Fiber | null {
    
    // 判断传入的ReactElement是否是Fragment, 并且key不为null
    const isUnkeyedTopLevelFragment =
        typeof newChild === 'object' &&
        newChild !== null &&
        newChild.type === REACT_FRAGMENT_TYPE &&
        newChild.key === null;
    if (isUnkeyedTopLevelFragment) {
        newChild = newChild.props.children;
    }

    // 区别传入的是ReactElement对象/基本类型/数组对象 
    const isObject = typeof newChild === 'object' && newChild !== null;

    if (isObject) {
        switch (newChild.$$typeof) {
            // 单个元素
            case REACT_ELEMENT_TYPE:
                return placeSingleChild(
                    reconcileSingleElement(
                        returnFiber,
                        currentFirstChild,
                        newChild,
                        expirationTime,
                    ),
                );
            // 单个Portal
            case REACT_PORTAL_TYPE:
                return placeSingleChild(
                    reconcileSinglePortal(
                        returnFiber,
                        currentFirstChild,
                        newChild,
                        expirationTime,
                    ),
                );
        }
    }

    if (typeof newChild === 'string' || typeof newChild === 'number') {
        // string或者number类型
        return placeSingleChild(
            reconcileSingleTextNode(
                returnFiber,
                currentFirstChild,
                '' + newChild,
                expirationTime,
            ),
        );
    }

    if (isArray(newChild)) {
        // 数组对象
        return reconcileChildrenArray(
            returnFiber,
            currentFirstChild,
            newChild,
            expirationTime,
        );
    }

    if (getIteratorFn(newChild)) {
        // 不是数组,但是可迭代遍历对象
        return reconcileChildrenIterator(
            returnFiber,
            currentFirstChild,
            newChild,
            expirationTime,
        );
    }

    // ...一些报错信息
    // 如果不符合上述类型要求,直接删除子节点
    return deleteRemainingChildren(returnFiber, currentFirstChild);
}



```

## reconcileSingleElement 处理普通原生节点

```flow js

function reconcileSingleElement(
        returnFiber: Fiber,
        currentFirstChild: Fiber | null,
        element: ReactElement,
        expirationTime: ExpirationTime,
): Fiber {
    // 新节点key
   const key = element.key;
   //  当前节点的第一个子节点(workInProgress.child) 
   let child = currentFirstChild;
   // 遍历子节点节点及其兄弟节点, 找到可复用的节点
   while (child !== null) {
      if (child.key === key) {
          // 新老节点的key相同
         if (
                 child.tag === Fragment
                         ? element.type === REACT_FRAGMENT_TYPE
                         : child.elementType === element.type
         ) {
            // key相同且前后节点类型一致
            // 删除该复用节点的兄弟节点,删除不是真的删除,而是添加effectTag
            deleteRemainingChildren(returnFiber, child.sibling);
            // 复用该节点
            const existing = useFiber(
                    child,
                    element.type === REACT_FRAGMENT_TYPE
                            ? element.props.children
                            : element.props,
                    expirationTime,
            );
            // 把规范化ref,因为ref有三种形式,字符串类型的ref要转换成方法
            existing.ref = coerceRef(returnFiber, child, element);
            existing.return = returnFiber;
            return existing;
         } else {
            // key相同但是节点类型不同
            // 删除该节点及其兄弟节点,跳出循环
            deleteRemainingChildren(returnFiber, child);
            break;
         }
      } else {
         // key不相同直接删除该节点,继续循环
         deleteChild(returnFiber, child);
      }
      // 获取该节点的兄弟节点
      child = child.sibling;
   }

   // 没有可复用的节点,根据新节点类型调用不同的工厂函数
   if (element.type === REACT_FRAGMENT_TYPE) {
      const created = createFiberFromFragment(
              element.props.children,
              returnFiber.mode,
              expirationTime,
              element.key,
      );
      created.return = returnFiber;
      return created;
   } else {
      const created = createFiberFromElement(
              element,
              returnFiber.mode,
              expirationTime,
      );
      created.ref = coerceRef(returnFiber, currentFirstChild, element);
      created.return = returnFiber;
      return created;
   }
}
```

## reconcileSinglePortal 处理Portal节点
```flow js
function reconcileSinglePortal(
        returnFiber: Fiber,
        currentFirstChild: Fiber | null,
        portal: ReactPortal,
        expirationTime: ExpirationTime,
): Fiber {
   // ...和reconcileSingleElement过程类似,找到key相同可复用的节点
   // 没有就创建一个新的节点
   // createFiberFromPortal就是调用createFiber创建FiberNode
   const created = createFiberFromPortal(
           portal,
           returnFiber.mode,
           expirationTime,
   );
   created.return = returnFiber;
   return created;
}
```

## reconcileSingleTextNode 处理文本节点 
```flow js
function reconcileSingleTextNode(
        returnFiber: Fiber,
        currentFirstChild: Fiber | null,
        textContent: string,
        expirationTime: ExpirationTime,
): Fiber {
   
   if (currentFirstChild !== null && currentFirstChild.tag === HostText) {
      // 只有第一个子节点是Text类型才会复用 
      deleteRemainingChildren(returnFiber, currentFirstChild.sibling);
      const existing = useFiber(currentFirstChild, textContent, expirationTime);
      existing.return = returnFiber;
      return existing;
   }
   deleteRemainingChildren(returnFiber, currentFirstChild);
   // 创建一个新的Text类型节点
   const created = createFiberFromText(
           textContent,
           returnFiber.mode,
           expirationTime,
   );
   created.return = returnFiber;
   return created;
}
```

## reconcileChildrenArray 数组类型 
```flow js
function reconcileChildrenArray(
        returnFiber: Fiber,
        currentFirstChild: Fiber | null,
        newChildren: Array<*>,
        expirationTime: ExpirationTime,
): Fiber | null {

   let resultingFirstChild: Fiber | null = null;
   let previousNewFiber: Fiber | null = null;

   let oldFiber = currentFirstChild;
   let lastPlacedIndex = 0;
   let newIdx = 0;
   let nextOldFiber = null;
   for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
      if (oldFiber.index > newIdx) {
         nextOldFiber = oldFiber;
         oldFiber = null;
      } else {
         nextOldFiber = oldFiber.sibling;
      }
      const newFiber = updateSlot(
              returnFiber,
              oldFiber,
              newChildren[newIdx],
              expirationTime,
      );
      if (newFiber === null) {
         // TODO: This breaks on empty slots like null children. That's
         // unfortunate because it triggers the slow path all the time. We need
         // a better way to communicate whether this was a miss or null,
         // boolean, undefined, etc.
         if (oldFiber === null) {
            oldFiber = nextOldFiber;
         }
         break;
      }
      if (shouldTrackSideEffects) {
         if (oldFiber && newFiber.alternate === null) {
            // We matched the slot, but we didn't reuse the existing fiber, so we
            // need to delete the existing child.
            deleteChild(returnFiber, oldFiber);
         }
      }
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
      if (previousNewFiber === null) {
         // TODO: Move out of the loop. This only happens for the first run.
         resultingFirstChild = newFiber;
      } else {
         // TODO: Defer siblings if we're not at the right index for this slot.
         // I.e. if we had null values before, then we want to defer this
         // for each null value. However, we also don't want to call updateSlot
         // with the previous one.
         previousNewFiber.sibling = newFiber;
      }
      previousNewFiber = newFiber;
      oldFiber = nextOldFiber;
   }

   if (newIdx === newChildren.length) {
      // We've reached the end of the new children. We can delete the rest.
      deleteRemainingChildren(returnFiber, oldFiber);
      return resultingFirstChild;
   }

   if (oldFiber === null) {
      // If we don't have any more existing children we can choose a fast path
      // since the rest will all be insertions.
      for (; newIdx < newChildren.length; newIdx++) {
         const newFiber = createChild(
                 returnFiber,
                 newChildren[newIdx],
                 expirationTime,
         );
         if (!newFiber) {
            continue;
         }
         lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
         if (previousNewFiber === null) {
            // TODO: Move out of the loop. This only happens for the first run.
            resultingFirstChild = newFiber;
         } else {
            previousNewFiber.sibling = newFiber;
         }
         previousNewFiber = newFiber;
      }
      return resultingFirstChild;
   }

   // Add all children to a key map for quick lookups.
   const existingChildren = mapRemainingChildren(returnFiber, oldFiber);

   // Keep scanning and use the map to restore deleted items as moves.
   for (; newIdx < newChildren.length; newIdx++) {
      const newFiber = updateFromMap(
              existingChildren,
              returnFiber,
              newIdx,
              newChildren[newIdx],
              expirationTime,
      );
      if (newFiber) {
         if (shouldTrackSideEffects) {
            if (newFiber.alternate !== null) {
               // The new fiber is a work in progress, but if there exists a
               // current, that means that we reused the fiber. We need to delete
               // it from the child list so that we don't add it to the deletion
               // list.
               existingChildren.delete(
                       newFiber.key === null ? newIdx : newFiber.key,
               );
            }
         }
         lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
         if (previousNewFiber === null) {
            resultingFirstChild = newFiber;
         } else {
            previousNewFiber.sibling = newFiber;
         }
         previousNewFiber = newFiber;
      }
   }

   if (shouldTrackSideEffects) {
      // Any existing children that weren't consumed above were deleted. We need
      // to add them to the deletion list.
      existingChildren.forEach(child => deleteChild(returnFiber, child));
   }

   return resultingFirstChild;
}
```

## 复用节点

```flow js
// createWorkInProgress利用Fiber.alternate来复用节点
// 重置了 index 和 sibling
function useFiber(
    fiber: Fiber,
    pendingProps: mixed,
    expirationTime: ExpirationTime,
): Fiber {
    const clone = createWorkInProgress(fiber, pendingProps, expirationTime);
    clone.index = 0;
    clone.sibling = null;
    return clone;
}
```

## 删除节点

```flow js

// 删除节点及其兄弟节点
function deleteRemainingChildren(
        returnFiber: Fiber,
        currentFirstChild: Fiber | null,
): null {
    
    // 首次渲染直接返回
   if (!shouldTrackSideEffects) {
      return null;
   }

    // 循环调用deleteChild移除节点和兄弟节点 
   let childToDelete = currentFirstChild;
   while (childToDelete !== null) {
      deleteChild(returnFiber, childToDelete);
      childToDelete = childToDelete.sibling;
   }
   return null;
}

function deleteChild(returnFiber: Fiber, childToDelete: Fiber): void {
    // 首次渲染直接跳过
    if (!shouldTrackSideEffects) {
        return;
    }
    // 找到父节点的effect链表
    // 将新增的effectNode加入到该链表的末尾
    // 该effectNode增加删除标识
    const last = returnFiber.lastEffect;
    if (last !== null) {
        last.nextEffect = childToDelete;
        returnFiber.lastEffect = childToDelete;
    } else {
        returnFiber.firstEffect = returnFiber.lastEffect = childToDelete;
    }
    childToDelete.nextEffect = null;
    childToDelete.effectTag = Deletion;
}
```