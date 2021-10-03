---
title: WebpackV1版本源码分析
date: 2019-01-29
tags:
- 框架基础
categories:
- 前端知识
---

> v1版本的源码相对简单.我们可以通过对v1版本的结构分析来了解到webpack的运行机制
> v1版本运用了大量的寄生组合继承的继承方式
> v1版本乃至后面的版本,依托的都是插件体系

::: tip 构建的核心流程
<img :src="$withBase('/framework/webpack_v1_process.png')" alt="webpack_v1_process">
:::

## 继承关系
1. WebpackOptionsDefaulter -> OptionsDefaulter
2. Compiler -> Tapable
3. Parser -> Tapable
4. WebpackOptionsApply -> OptionsApply

## 执行过程
### 初始化阶段
1. WebpackOptionsDefaulter初始化参数: 用户配置 + 默认配置
2. 创建Compiler对象, 初始化Compiler环境, 包括注入用户插件和内置插件,注册各种模块
3. 调用Compiler的run方法,生成compilition对象, 根据入口entry找出所有的入口文件, 调用compilition的addEntry方法将其转换成dependence对象

### 构建阶段
1. 编译模块(make): 根据之前收集的dependence常见module对象,调用不同的loader将模块转成标准的JS对象,调用esprima解释器将内容转成AST, 递归遍历AST树找出模块依赖的模块,直到所有依赖文件都经过本步骤处理,最后得到整个依赖关系

### 生成chunk阶段
1. 根据模块之间的依赖关系,组成一个个包含模块的chunk
2. 根据出口配置和文件名,将chunk写入到指定的输出目录(seal)

## 处理插件
```flow js
// 调用Compiler的实例方法apply
compiler.apply(
        new JsonpTemplatePlugin(options.output),
        new FunctionModulePlugin(options.output),
        new NodeSourcePlugin(options.node)
);

// Compiler继承了Tapable,实际调用了Tapable.apply
// 实际是调用了插件函数.同时把this指向了Tapable或者Compiler
Tapable.prototype.apply = function apply() {
	for(var i = 0; i < arguments.length; i++) {
		arguments[i].apply(this);
	}
};

// 对于插件来说,通常会有一个apply方法,会传入compiler对象
JsonpTemplatePlugin.prototype.apply = function (compiler) {
    // ...
    // 调用compiler.plugins注册对应生命周期的钩子
    compiler.plugin("compilation", function(compilation) {
        // 这里是在compilation的生命周期上注册钩子
        compilation.plugin("normal-module-loader", function(loaderContext) {
            loaderContext.target = "web";
        });
    });
}
```

**Web环境默认会注入三个插件**
### JsonpTemplatePlugin
> chunk块的装载,利用JSONP的形式(立即执行函数)来调用,并通过添加script标签来加载chunk

### FunctionModulePlugin
> 对导出模块添加一层函数的包装

### NodeSourcePlugin
> 针对非node环境提供一些node的变量,比如process

**下面是一些通用插件**
### CompatibilityPlugin
> 用于确保模块加载器的兼容性

### SingleEntryPlugin/MultiEntryPlugin
> 处理入口模块

### LoaderPlugin

### NodeStuffPlugin
> node相关的

### RequireJsStuffPlugin
> require.js相关的

### APIPlugin
> webpack模块加载相关的垫片

### ConstPlugin
> 尝试将if(...)条件转成true/false

### RequireIncludePlugin
> 提供require.include写法

### RequireEnsurePlugin
> 提供require.ensure写法

### RequireContextPlugin
> 提供require.context, 用于快速查找文件

### AMDPlugin/CommonJsPlugin
> 提供AMD模块/CommonJs模块形式

### RemoveParentModulesPlugin/RemoveEmptyChunksPlugin/MergeDuplicateChunksPlugin/FlagIncludedChunksPlugin
> 和chunk生成和优化相关的插件


## 为什么resolve的extensions数组首个元素一定要是空字符串
可以先看下默认配置的extensions
```js
// 默认配置也是以空字符串开始的
options.resolve.extensions = defaultByTarget(options.resolve.extensions,
		["", ".webpack.js", ".web.js", ".js"],
		["", ".webpack-worker.js", ".webworker.js", ".web.js", ".js"],
		["", ".webpack-node.js", ".js", ".node"],
		["", ".js"]);
```
原因是在FileAppendPlugin插件中的webpack的读取文件方式
```js
FileAppendPlugin.prototype.apply = function(resolver) {
    // 这里的appendings就是我们传入的extensions
	var appendings = this.appendings;
	resolver.plugin("file", function(request, callback) {
		var fs = this.fileSystem;
		var addr = this.join(request.path, request.request);
		// 注意,这里遍历extensions,将我们resolve的地址都加上extension.然后按照这个地址遍历符合的文件
        // 如果没有空字符,当我们写地址全名时是无法遍历到正确的地址文件的
		var addrs = appendings.map(function(a) { return addr + a });
		var log = callback.log;
	    // ....
	});
};
```
