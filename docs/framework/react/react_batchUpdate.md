# 批量更新策略
> 13版本开始,在15版本完善的功能,所谓的批量更新是指将连续的setState操作引发的多次更新合并为一次更新
批量更新的机制直接导致setState这个操作并不是及时响应的,也就是我们常说的"异步更新"

## 异步更新的意思
所谓异步更新的意思并不意味着setState是类似于setTimeout的异步操作,而是指setState的结果并不是同步更新的

## 批量更新的触发时机
**下面的时机仅针对13~17的版本**
1. 会触发
   1. 生命周期内部
   2. React事件代理
   3. 调用unstable_batchedUpdates包装函数
2. 不会触发
   1. 原生DOM添加的事件
   2. 异步代码内执行的代码

::: tip Demo
1. 页面初始化完成时触发了两次setState, 但是结果结果count为1(+1)
2. 点击数字执行了两次setState, 但是结果count为2(+1)
3. 点击"DOM原生事件点击"按钮执行了两次setState, 结果count为4(+2)
4. 点击"异步更新点击"按钮在1秒后执行两次setState, 结果count为6(+2)
5. 点击"batch更新点击"按钮在1秒后执行两次setState, 结果count为7(+1)
```jsx
import { unstable_batchedUpdates } from 'react-dom';

class Demo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            count: 0
        }
    }
    
    componentDidMouted() {
        document.getElementById('dom-naitve-listen').addEventListener('click', this.handleClick)
        this.setState({
            count: this.count + 1
        })
        this.setState({
            count: this.count + 1
        }) 
    }
    
    handleClick() {
        this.setState({
            count: this.count + 1
        })
        this.setState({
            count: this.count + 1
        })
    }
    
    handleSetTimeClick() {
        setTimeout(() => {
            this.setState({
                count: this.count + 1
            })
            this.setState({
                count: this.count + 1
            }) 
        }, 1000)
    }

   handleBatchedClick() {
        setTimeout(() => {
           unstable_batchedUpdates(() => {
              this.setState({
                 count: this.count + 1
              })
              this.setState({
                 count: this.count + 1
              })
           }) 
        }, 1000)
   }

    render() {
        const { count } = this.state;
        return (
            <div>
                <div onClick={this.handleClick}>
                    {count}
                </div>
                <button id="dom-naitve-listen">DOM原生事件点击</button>
                <div onClick={this.handleSetTimeClick.bind(this)}>异步更新点击</div>
                <div onClick={this.handleBatchedClick.bind(this)}>batch更新点击</div>
            </div>
        )
    }
}
```
:::

**对于18版本,官方做了更改,所有setState都会触发批量更新**

## 批量更新的原理
::: tip 15版本
**根据之前setState的情况来看,在执行setState的时候,代码已经进入到一个大的事务中了(已经调用了batchedUpdates)**
1. 获取当前包装实例
2. 将stState的callback推入包装实例的Callbacks队列中
3. 调用enqueueUpdate推入包装实例
   1. 判断isBatchingUpdates标识, false表示执行更新操作,true表示将更新推入dirtyComponents等待执行更新
4. 调用batchedUpdates执行更新
   1. 设置isBatchingUpdates标识为true 
   2. 触发FLUSH_BATCHED_UPDATES和RESET_BATCHED_UPDATES两个事务用例,在close阶段调用flushBatchedUpdates执行批量更新
      1. 处理dirtyComponents
      2. 处理Callbacks队列
   3. 事务结束设置isBatchingUpdates标识为false
:::

::: tip 16~17版本
**16增加了Fiber的概念, 事务机制也不局限于一个方法,而是作为思想贯穿整个Schedule和Reconciler**
**批量更新的发生场景和15是一致的, 在setState的时候都先调用batchedUpdates, 但是16的batchedUpdates并没有事务类函数**
1. setState创建Fiber对象和Update对象
2. 调用enqueueUpdate将新的Update对象推入UpdateQueue更新链表中(可以看成可中断的dirtyComponents)
   1. 将callback加入到updateQueue.callbackList中
3. 进入schedule调度中心
   1. requestWork中会判断isBatchingUpdates标识, false执行performWork调度进入render阶段,false直接返回,不做操作
   2. commit阶段执行callbackList中的回调
4. 渲染结束后设置isBatchingUpdates标识为false 
:::

## dirtyComponents(赃组件)
1. 赃组件,赃值检查,赃数据等等,这些名词的"赃"的意思大同小异,简单的说就是里数据和表数据的不一致性
2. 赃组件详细的解释应该是 __展示在用户面前的视图数据和内存中待显示的视图数据并非一致的,存在着需要更新的数据__
