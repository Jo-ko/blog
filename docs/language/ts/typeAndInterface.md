---
title: 类型和接口
date: 2021-04-29
tags:
- Typescript
categories:
- 前端知识
---

## type和interface的区别
1. type 可以用于表示基本类型,对象类型,联合类型,元组和交集,还有泛型; interface 只能用于表示对象类型;
```ts
// 声明联合类型
type Student = {stuId: number} | {classId: number}
// 声明元组
type Things = [number, string];
```
2. type声明的队形类型不能合并, 但是interface的对象类型可以合并
```ts
interface Student {
    name: string;
}
interface Student {
    age: number;
}
// 等同于
interface Student {
    name: string;
    age: number;
}
```
## type和interface的相同
1. 都可以用于描述对象和方法
```ts
type SetPoint = (x: number, y: number) => void;
interface SetPoint {
    (x: number, y: number): void; 
}
```
2. 两者都可以继承
```ts
// interface 继承 interface
interface Person {
    name: string;
}

interface Student extends Person {
    schoolName: string;
}
// interface 继承 type
type Person = {
    name: string;
}

interface Student extends Person {
    schoolName: string;
}
// type 继承 type
type Person = {
    name: string;
}

type Student = Person & {schoolName: string};

// type 继承 interface
interface Person {
    name: string;
}

type Student = Person & {schoolName: string};
```
3. 都可以用于implement
```ts
interface Person {
    name: string;
}

type Stdudent = Person & {schoolName: string};

class Man implements Person {
    name: 'jooker'
}

class LiLei implements Stdudent {
   name: 'lilei';
   schoolName: 'jialidun'; 
}
```
