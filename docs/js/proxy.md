---
title: 代理&反射
date: 2019-01-12
tags:
- JS
categories:
- 前端知识
---

## 代理
实际对象的中间层

### 捕获器&反射器
1. 代理的重要作用就是创建捕获器拦截操作
2. 反射器提供了属性原始行为,这样我们可以不用自己重建原有的属性行为
```ts
const target = {
    foo: 'bar'
};
const handler = {
    get(trapTarget, property, receiver) {
        return trapTarget[property] || 'NULL';
    }
};
// 用反射器创建handler
const reflectHandler = {
    get() {
        return Reflect.get(...arguments) || 'NULL';
    }
}
const proxy = new Proxy(target, handler);
const reflectProxy = new Proxy(target, reflectHandler);
console.log(proxy.foo); // bar 
console.log(proxy.soo); // NULL
console.log(reflectProxy.foo); // bar
```

### 代理撤销
代理是可以撤销的,重复撤销无效
```ts
const target = {
    foo: 'bar'
};
const handle = {
    get() {}
}

const {proxy, revoke} = Proxy.revocable(target, handle);

console.log(proxy.foo);
revoke();
console.log(proxy.foo); // error
```
### this属性代理问题
通过代理访问的this属性通常指向代理对象而非目标对象

```ts
var vm = new WeakMap();

class User {
    constructor(userId) {
        vm.set(this, userId)
    }
    
    set id(id) {
        vm.set(this, userId)
    }
    
    get id() {
        return vm.get(this)
    }
}

//  User实例一开始使用目标对象作为 WeakMap 的键，代理对象却尝试从自身取得这个实例
var user = new User('No.1');
var proxy = new Proxy(user, {});

console.log(proxy.id); // undefined

// 将代理对象改为类本身
var UserProxy = new Proxy(User, {});
var user = new UserProxy('No.1'); 
console.log(user.id);
```

### 内置对象实例的代理
代理对于Date这类的内置对象的实例代理会存在一些问题
```ts
var date = new Date;
var proxy_date = new Proxy(date, {});
proxy_date.getDate(); // error
```
