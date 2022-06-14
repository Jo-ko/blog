---
title: 模块化
date: 2020-04-29
tags:
- 工程化体系
categories:
- 前端知识
---

## 模块
1. 满足独立性
2. 解决依赖问题
3. 异步加载

## bundler
> 将多个模块根据依赖关系打包成一个或者多个文件

## 模块类型
### commonjs(CMD)
1. commonjs是动态同步的,意味着你可以在其中使用变量
2. commonjs导入的是一个副本, 修改其中的变量不会导致源文件被修改

**示例**
```js
//importing 
const doSomething = require('./doSomething.js'); 

//exporting
module.exports = function doSomething(n) {
  // do something
}
```

### AMD
1. AMD是异步导入的
2. AMD 也支持 require 和 exports 对象, 将其识别为原生AMD

**示例**
```js
define('moduleA', ['moduleB'], (moduleB) => {
    return {
        funcA: moduleB.funcA
    } 
})

define('moduleA', ['require', 'exports'], function (require, exports) {
    const moduleB = require('moduleB');
    exports.funcA = moduleB.funcA
})
```

### CMD 通用模块
1. 兼容commonJS和AMD
2. 把所有逻辑包装在一个立即调用的函数表达式

**示例**
```ts
;(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery', 'debounce'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // CMD
        module.exports = factory(require('jquery'), require('debounce'))
    } else {
        root.returnExports = factory(root.$, root._);
    }
})(this, function($, _) {
    const returnExports = {};
    return returnExports
});
```

### ESM
1. 模块的加载会在文档解析完成之后执行,异步加载
2. 相同模块只会执行一次
3. 嵌入的模块定义代码不能使用 import 加载到其他模块
4. 模块内不共享全局命名空间
5. 模块中定义的全局var不会添加到window上
6. 模块中定级的this的值时undefined

```ts
// moduleA.js
function run() {
    console.log(123)
}

function run2() {
    console.log(222);
}

export {
    run as default,
    run2,
    run
}

```
```html

<script type="module">
    import fun, {run, run2} from './moduleA.js';
    fun();
    run();
    run2();
</script>
```

::: tip 导入需要注意
1. import模块会被提升到顶部, 因此可以将import语句放在底部, 但不建议
2. 普通导入的对象相当于const声明的变量, 是无法修改对象的,但是可以修改其属性, *导入的对象相当于Object.freeze(), 是无法修改对象和其属性的的
:::

<!-- https://juejin.cn/post/6940218189921910797#heading-1 -->
<!-- https://juejin.cn/post/6935973925004247077 -->
