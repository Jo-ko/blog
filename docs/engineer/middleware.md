---
title: 中间件体系
date: 2021-07-08
tags:
- 工程化体系
categories:
- 前端知识
---

## 什么是中间件
**简单的说就是插件系统**

广义: 指的是用于衔接上层服务商和下层提供商功能的中间介质

狭义: 可插拔的流构建体系,提供一些可集成的机制操作


## 通用模型
- 传入方通过一系列的中间体系到达最后的接收层执行逻辑
- 中间体系要求可伸缩和可扩展
- 前端常见的中间体系架构有 __洋葱模型__, __chains模型__, __stack模型__

<img :src="$withBase('/engineer/middleware_common_model.png')" alt="middleware_common_model">

## 洋葱模型
- 代表是Koa的中间件机制
- 每个中间件都有两次被执行的机会
- 通常是修改传入的参数,在结束的时候获取参数,前后参数类型一致
- 我们把进入最后中间件之前称为before, 进入之后称为after, 单个中间件before遵循的是先进先出的原则, after遵循的是先进后出的原则

- <img :src="$withBase('/engineer/middleware_onion_model.png')" alt="middleware_onion_model">

### 实现方式

::: tip 构造

```typescript
class OnIonMiddleware {
    
    middleWare = [];
    
    run(ctx) {
        return this.compose(this.middleWare)(ctx);
    }
    
    use(fn) {
        this.middleWare.push(fn)
    }
    
    compose(middleware) {
        return (ctx) => {
            let index = -1;
            
            // dispatch就是我们调用的next函数
            const dispatch = function (i) {
                index = i;
                const fn = i === middleware.length ? null : middleware[i];
                if (fn) {
                    try {
                        return fn(ctx, dispatch.bind(null, i + 1))
                    } catch (e) {
                       return Promise.reject(e); 
                    }
                } else {
                    return Promise.resolve(ctx);
                }
            };
            return dispatch(0);
        }
    }
}
```
:::

::: tip 注册/调用

```typescript
OnIonMiddleware.use(async (ctx, next) => {
    console.log('before 1')
    // 通过next调用进入下一个中间件
    await next();
    console.log('after 1')
})

OnIonMiddleware.use(async (ctx, next) => {
    console.log('before 2')
    await next();
    console.log('after 2')
})

OnIonMiddleware.run() //before 1 before 2 after 2 after 1 
```
:::

## Promise模型
- 代表是axios的拦截机制
- 通常下一个中间件以上一个中间件返回的数据为参数, 前后参数类型可能不一致
- 单个中间件遵循的是先进先出的原则

<img :src="$withBase('/engineer/middleware_chains_model.png')" alt="middleware_chains_model">

### 实现方式
::: tip 构造

```typescript
class ChainsMiddleware {

    middleware = [];

    run(ctx) {
        const fn = Promise.resolve(ctx);
        return this.compose(fn);
    }

    use(fulfilled, rejected) {
        this.middleware.push({
            fulfilled,
            rejected
        })
    }

    compose(fn) {
        while (this.middleware.length) {
            const middleware = this.middleware.shift(); 
            fn = fn.then(middleware.fulfilled, middleware.rejected)
        }
        return fn;
    }
}
```
:::

::: tip 注册/调用
```typescript
ChainsMiddleware.use(
    () => console.log('middle1')
);
ChainsMiddleware.use(
    () => console.log('middle2')
)

ChainsMiddleware.run()
```
:::

## stack模型
- 代表是redux的dispatch中间件
- stack模型类似洋葱模型的进出原则
- 但stack模型不一样的是
  - 需要手动去调用dispatch调用器执行中间件
  - 注册由两部分组成,第一步是use获取,第二步是在run生成调用器是产生

### 实现方式

::: tip 构造
```typescript
class StackMiddleware {

    constructor() {
        this.middleware = []
    }


    run(value, next) {
        const stacks = this.middleware.map(middleware => middleware(value));
        return this.compose(stacks)(next);
    }

    use(fn) {
        this.middleware.push(fn);
    }

    compose(stacks) {
        const middleNum = stacks.length;
        let dispatch =  arg => arg;
        if (middleNum) {
            if (middleNum === 1) {
                dispatch = stacks[0];
            } else {
                dispatch = stacks.reduce((a, b) => (...args) => a(b(...args)))
            }
        }
        return dispatch
    }
}

```
:::

::: tip 注册/调用
```typescript
const stackMiddleware = new StackMiddleware();

stackMiddleware.use(
    (value) => {
        return next => {
            console.log('注册middle1')
            return action => {
                console.log('middle1 before');
                next(action);
                console.log('middle1 after');
            }
        }
    }
)

stackMiddleware.use(
    (value) => {
        return next => {
            console.log('注册middle2')
            return action => {
                console.log('middle2 before');
                next(action);
                console.log('middle1 after');
            }
        }
    }
)

const dispatch = stackMiddleware.run({}, (action) => {
    console.log(action)
})
dispatch('test');
```
:::

## 三种模型考究
目前还没有碰到不适用三种模型的场景(想象一下将redux中间件模型用在axios上),原因三种模型的实质本就是通用模型(A到B之间的AOP拦截),不过我们可以根据每种架构模式特点选择
1. 洋葱模型和stack模型是通过next来调用下一个中间件, 通常传入一个对象用于变量修改, 流程控制性强, 但两者捕获其中的错误会相对麻烦
2. Promise模型会不间断执行下一个中间件, 通常用返回的参数作为下一个中间件的参数, 流程控制性较弱, 但由于promise的机制,容易捕获到错误



[comment]: <> (https://juejin.cn/post/6844904015373795342#heading-7)