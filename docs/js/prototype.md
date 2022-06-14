---
title: 原型&原型链
date: 2018-03-22
tags:
- JS
categories:
- 前端知识
---

## 原型
原型也是对象,是由Object构造的,它存储着实例对象的公有属性和方法

## 原型链
实例与其构造函数的原型的关系链

## 对象&构造器&原型
1. 普通对象都是由构造器创建的,构造器与原型通过prototype连接,原型通过constructor属性和普通对象构造器相连, 而对象通过__proto__与构造器的原型连接来找到公有属性和方法
2. 构造器是一种特殊对象,它的构造函数就是Function,所以构造器的prototype属性是构造器Name.prototype, 而__proto__属性指向Function.prototype
3. 原型本身也是一种对象,它的构造函数就是Object,所以原型的 __proto__属性指向的是Object.prototype
4. Object.prototype的原型是null

<img :src="$withBase('/js/prototype.png')" alt="prototype" width="500vw"/>

## 原型的动态性和不可变性
1. 动态性: 即使实例在修改原型之前已经存在,任何时候对原型对象所做的修改也会在实例上反映出来
```ts
function Person() {}
const man = new Person;
Person.prototype.say = function(ar) {console.log(ar)}
man.say();
```
2. 不可变性: 无法通过重写原型对象来修改实例
```ts
function Person() {}
const man = new Person;
Person.prototype = {
   constructor: Person,
   say() {}
}
man.say() // Error
```

## 相关方法
### instanceof
```ts
// 判断a的原型链上是否存在b的原型: a.__proto__.... === b.prototype
a instanceof b;

// 等同于
function instanceof_self(a, b) {
    const bPrototype = b.prototype;
    let a_Proto__ = a.__proto__;
    while(true) {
        if (a_Proto__ === bPrototype) return true;
        if (a_Proto__ === null) return false;
        a_Proto__ = a_Proto__.__proto__;
    }
}
```

### getProtoTypeOf & setPrototypeOf & isPrototypeOf
```ts
Object.getPrototypeOf(ClassA) // 获取ClassA的prototype属性
Object.setPrototypeOf(ClassA, ClassB) // 将ClassA的prototype属性设置为ClassB,注意有性能问题
ClassA.prototype.isPrototypeOf(instance) // ClassA.prototype是instance实例的原型 
```

## 构造函数和Class的区别
1. 构造函数存在作用域提升, class没有
2. 构造函数受函数作用域限制, class受块作用域限制  
3. 构造函数可以直接调用, class必须通过new调用

## 类混入
extends 关键字后面可以跟着 __可以解析为一个类或者一个构造函数的表达式__
```ts
 class Vehicle {}
let FooMixin = (Superclass) => class extends Superclass {
    foo() {
        console.log('foo'); }
};
let BarMixin = (Superclass) => class extends Superclass {
    bar() { console.log('bar');
    } };
let BazMixin = (Superclass) => class extends Superclass {
    baz() {
        console.log('baz'); }
};
function mix(BaseClass, ...Mixins) { 
    return Mixins.reduce((accumulator, current) => current(accumulator), BaseClass)
};
class Bus extends mix(Vehicle, FooMixin, BarMixin, BazMixin) {}

```
