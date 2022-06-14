---
title: 消息队列和事件循环
date: 2020-04-29
tags:
- 浏览器知识
categories:
- 前端知识
---

## 事件循环机制
1. 先从多个消息队列中选出一个最老的任务，这个任务称为 oldestTask
2. 然后循环系统记录任务开始执行的时间，并把这个 oldestTask 设置为当前正在执行的任务；
3. 当任务执行完成之后，删除当前正在执行的任务，并从对应的消息队列中删除掉这个 oldestTask；
4. 最后统计执行完成的时长等信息。

## 宏任务和微任务
### 微任务
#### 如何产生微任务
1. MutationObserver
2. Promise
3. queueMicrotask

#### 微任务的执行过程
1. 在全局执行上下文环境中创建微任务队列
   - 每个宏任务都会创建自己的微任务队列
   - 这里的全局执行上下文不是我们之前说的
2. 宏任务执行过程将遇到的微任务放到微任务队列中
3. 宏任务执行完毕后会检查当前环境的微任务队列,按照顺序执行微任务(先进先出)
4. 在执行微任务的过程中遇到微任务,会将该微任务添加到当前的微任务队列,直到队列是空的,而不是放到下一个宏任务中执行
   - __因此微任务的执行时长会影响到当前宏任务的执行时长__

### setTimeout
在原有的消息队列上,增加延迟队列
```c++
void ProcessTimerTask(){
  //从delayed_incoming_queue中取出已经到期的定时器任务
  //依次执行这些任务
}

TaskQueue task_queue；
void ProcessTask();
bool keep_running = true;
void MainTherad(){
  for(;;){
    //执行消息队列中的任务
    Task task = task_queue.takeTask();
    ProcessTask(task);
    
    //执行延迟队列中的任务
    ProcessDelayTask()

    if(!keep_running) //如果设置了退出标志，那么直接退出线程循环
        break; 
  }
}
```
::: tip setTimeout的一些问题
1. setTimeout会在之前存在的消息队列任务完成后再开始执行,因此 __如果当前任务执行过久,会影响到定时器任务__
2. setTimeout在递归嵌套调用时,超过5次调用时(chromium内核), __如果时间间隔小于4ms,会被设置为4ms__,原因是避免cpu的忙碌等待(cpu-spinning)检查过于频繁
3. 未被激活的页面定时器的延迟时间会被锁定为1000ms,目的是为了避免性能损耗
4. 定时器的最大时间不能超过32bit存储的数字大小(2147483647),超过会溢出
:::

### Promise
1. Promise是微任务
   1. 由于promise采用.then延时绑定回调机制
   2. 初始化Promise的时候会执行传入的回调函数,前后冲突,因此需要使用微任务来延迟执行
2. Promise回调函数返回值是穿透的
3. Promise的错误是冒泡的


### 生成器
### 协程的实现方式
1. 子协程和父协程是在主线程上交互执行的，并不是并发执行的，它们之前的切换是通过 yield 和 gen.next 来配合完成的。
2. 当在子协程中调用了 yield 方法时，JavaScript 引擎会保存 gen 协程当前的调用栈信息，并恢复父协程的调用栈信息。同样，当在父协程中执行 gen.next 时，JavaScript 引擎会保存父协程的调用栈信息，并恢复子协程的调用栈信息。
### 执行器
执行生成器的代码函数(co库)
