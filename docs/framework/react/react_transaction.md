# React事务机制Transaction
> 事务机制在数据库中意味着ACID四个原则: 原子性, 一致性, 隔离性, 持久性(提供独立可靠的恢复机制，保证出错时数据的一致性，不同事务之间互相独立), 
> React中的事务机制的含义则不大一样,并非指的是数据库这种回滚隔离的能力,而是指恢复一些执行任务的前后状态

## React事务机制模型
### React15中的事务提供了类似函数执行生命周期的包装函数

1. Transaction创建一个黑盒子，它能够包装任何方法，以便在调用方法之前和之后维护某些不变量(即使在调用包装方法时抛出异常)
2. react事务机制的生命周期包括四个部分:perform, initialize, method, close
   1. 先执行initialize方法
   2. 再调用perform执行包装的方法method
   3. 最后调用close方法
3. 通过继承Transaction重写getTransactionWrappers方法,返回事务执行的wrapper(一组initialize及close方法称为一个wrapper)
4. perform调用后会在执行所有的wrapper的initialize方法,再执行传入的method方法, 最后执行所有wrapper的close方法
5. perform方法会通过invariant来保证不执行当前正在执行的事务
6. 使用一个临时变量来标记当前的执行过程是否有异常(为的是用于报错时能够更好的找到出错地方), initialize, method出错会始终执行close方法

<img :src="$withBase('/framework/react_transaction.png')" alt="react_transaction">

::: tip 事务中的数据流是如何运作?
**两个关键的方法initializeAll&closeAll**
```flow js
var TransactionImpl = {
    // ...
   initializeAll: function(startIndex: number): void {
       // transactionWrappers就是我们需要执行的事务 
      var transactionWrappers = this.transactionWrappers;
      for (var i = startIndex; i < transactionWrappers.length; i++) {
         var wrapper = transactionWrappers[i];
         try {
            // 通过标识OBSERVED_ERROR状态来捕获错误
            this.wrapperInitData[i] = OBSERVED_ERROR;
            this.wrapperInitData[i] = wrapper.initialize
                    ? wrapper.initialize.call(this)
                    : null;
         } finally {
             // 确保捕获的错误是第一个事务
            if (this.wrapperInitData[i] === OBSERVED_ERROR) {
               try {
                  this.initializeAll(i + 1);
               } catch (err) {}
            }
         }
      }
   },
   closeAll: function(startIndex: number): void {
      var transactionWrappers = this.transactionWrappers;
      for (var i = startIndex; i < transactionWrappers.length; i++) {
         var wrapper = transactionWrappers[i];
         var initData = this.wrapperInitData[i];
         var errorThrown;
         try {
             // 和initializeAll类似通过标识errorThrown来捕获错误
            errorThrown = true;
            if (initData !== OBSERVED_ERROR && wrapper.close) {
               wrapper.close.call(this, initData);
            }
            errorThrown = false;
         } finally {
            if (errorThrown) {
               try {
                  this.closeAll(i + 1);
               } catch (e) {}
            }
         }
      }
      this.wrapperInitData.length = 0;
   },
}
```
:::

::: tip 有哪些事务
#### SELECTION_RESTORATION input&textarea选择状态保存和恢复
```flow js
var SELECTION_RESTORATION = {
  initialize: ReactInputSelection.getSelectionInformation,
  close: ReactInputSelection.restoreSelection,
};
```
#### EVENT_SUPPRESSION DOM上的事件卸载和恢复
```flow js
var EVENT_SUPPRESSION = {
  initialize: function() {
    var currentlyEnabled = ReactBrowserEventEmitter.isEnabled();
    ReactBrowserEventEmitter.setEnabled(false);
    return currentlyEnabled;
  },
  close: function(previouslyEnabled) {
    ReactBrowserEventEmitter.setEnabled(previouslyEnabled);
  },
};
```
#### ON_DOM_READY_QUEUEING 收集componentDidMount&componentDidUpdate的回调
```flow js
var ON_DOM_READY_QUEUEING = {
  initialize: function() {
    this.reactMountReady.reset();
  },
  close: function() {
    this.reactMountReady.notifyAll();
  },
};
```
#### RESET_BATCHED_UPDATES 在更新事务结束后将isBatchingUpdates重置为false
```flow js
var RESET_BATCHED_UPDATES = {
  initialize: emptyFunction,
  close: function() {
    ReactDefaultBatchingStrategy.isBatchingUpdates = false;
  },
};
```
#### FLUSH_BATCHED_UPDATES 批量更新标记的dirtyComponents数组
```flow js
var FLUSH_BATCHED_UPDATES = {
  initialize: emptyFunction,
  close: ReactUpdates.flushBatchedUpdates.bind(ReactUpdates),  // 批量更新
};
```
#### NESTED_UPDATES 清空dirtyComponents, 同时当因为一些生命周期造成有新的更新的时候能执行这些更新事务
```flow js
var NESTED_UPDATES = {
  initialize: function() {
    this.dirtyComponentsLength = dirtyComponents.length;
  },
  close: function() {
    if (this.dirtyComponentsLength !== dirtyComponents.length) {
      dirtyComponents.splice(0, this.dirtyComponentsLength);
      flushBatchedUpdates();
    } else {
      dirtyComponents.length = 0;
    }
  },
};
```
### UPDATE_QUEUEING
```flow js
var UPDATE_QUEUEING = {
  initialize: function() {
    this.callbackQueue.reset();
  },
  close: function() {
    this.callbackQueue.notifyAll();
  },
};
```
:::

::: tip perform函数
perform的本质就是一个包装函数, 用于在执行任务的时候捕获错误,调用closeAll方法进行事务回滚
:::
### React16中做了较大的改动,我们已经看不到Transaction这个明显的事务类了
1. 16中虽然取消了Transaction这个事务类,但仍旧保留了之前的风格,事务机制不再试某一个类或者方法,而是作为思想的存在
