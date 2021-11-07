---
title: Map&WeakMap
date: 2019-01-12
tags:
- JS
categories:
- 前端知识
---

## 创建Map
如果想在创建的同时初始化实例，可以给 Map 构造函数传入 __一个可迭代对象__，需要包含键/值对数组
```js
const a = new Map([
    ['name', 'jooker'],
    ['age', 18]
]);

const b = new Map({
    [Symbol.iterator]: function* () {
        yield ['name', 'jooker'];
        yield ['age', 18];
    }
})
```

## 与Object区别
1. Object中的属性是没有顺序的, Map中的属性的顺序是初始化迭代顺序或者是插入的顺序
2. Object中的属性值只能是字符串, Map中的属性可以是对象
3. Map占用的内存相比Object要小
4. Map的增删性能要优于Object, Object的查找性能要优于Map

## WeakMap
弱映射的集合类型, 键是弱引用, 但值不是, 当键不存在引用它的对象时, 这个对象键就会被当作垃圾回收, 键/值就成为了空映射, 当值也没有引用的时候, 值本身就会被垃圾回收

### 特点
1. 键只能是Object类型或者继承Object,实际是内存地址
2. 无法通过迭代获取键值
3. 键弱引用,能够及时的被垃圾回收机制回收

### WeakMap的使用
1. 通过闭包实现私有属性: 利用不可迭代性
2. 保存dom节点元数据
