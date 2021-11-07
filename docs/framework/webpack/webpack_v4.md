---
title: WebpackV4版本源码分析
date: 2020-06-30
tags:
- 框架基础
categories:
- 前端知识
---

> V3之后的webpack都是通过webpack-cli启动的 V4将webpack-cli分离为单独的包

## 启动入口
通过调用 webpack -config webpack.config.js, 通过cli对命令行参数的处理, 最后还是调用了webpack的执行函数
```js
// webpack
// 触发 node_modules/webpack/.bin/webpack
// require的对象地址就是 node_modules/webpack-cli/.bin/cli.js
// ...
require(path.resolve(
    path.dirname(pkgPath),
    pkg.bin[installedClis[0].binName]
));
// ...

// webpack-cli
// ...cli处理命令行参数后
require("webpack");
try {
    compiler = webpack(options);
} catch (err) {
    // ...
}
// ...
if (firstOptions.watch || options.watch) {
    //...
    compiler.watch(watchOptions, compilerCallback);
} else {
    // 调用run开始执行编译流程
    compiler.run((err, stats) => {
        if (compiler.close) {
            compiler.close(err2 => {
                compilerCallback(err || err2, stats);
            });
        } else {
            compilerCallback(err, stats);
        }
    });
}
```

## 创建Compiler编译器对象
> Compiler对象代表了完整的webpack环境, 并配置好所有可以操作的设置, 包括options, loader和plugins, 通过它可以访问webpack的主环境

```js
const webpack = (options, callback) => {
    // 这里会通过json-schema来校验option的书写
	const webpackOptionsValidationErrors = validateSchema(  
		webpackOptionsSchema,
		options
	);
	// ...
	let compiler;
	
	// [option导出的类型](https://www.webpackjs.com/configuration/configuration-types/)
    // 在cli处理后会产生两种类型: 数组和对象
	if (Array.isArray(options)) {
		compiler = new MultiCompiler(
			Array.from(options).map(options => webpack(options))
		);
	} else if (typeof options === "object") {
	    // 处理参数
		options = new WebpackOptionsDefaulter().process(options);
        // 生成Compiler对象
		compiler = new Compiler(options.context);
		compiler.options = options;
		new NodeEnvironmentPlugin({
			infrastructureLogging: options.infrastructureLogging
		}).apply(compiler);
		// 注入插件
		if (options.plugins && Array.isArray(options.plugins)) {
			for (const plugin of options.plugins) {
				if (typeof plugin === "function") {
					plugin.call(compiler, compiler);
				} else {
					plugin.apply(compiler);
				}
			}
		}
		compiler.hooks.environment.call();
		compiler.hooks.afterEnvironment.call();
		compiler.options = new WebpackOptionsApply().process(options, compiler);
	} else {
		throw new Error("Invalid argument: options");
	}
	//...
    
    // 返回Compiler对象给webpack-cli
	return compiler;
};
```

## 创建Compilation对象
> webpack-cli调用run产生当前的编译控制的Compilation对象
```js
class Compiler extends Tapable {
    run(callback) {
        // ...
        
        this.hooks.beforeRun.callAsync(this, err => {
            if (err) return finalCallback(err);

            this.hooks.run.callAsync(this, err => {
                if (err) return finalCallback(err);

                this.readRecords(err => {
                    if (err) return finalCallback(err);

                    // this.compile
                    this.compile(onCompiled);
                });
            });
        });
    }

    compile(callback) {
        const params = this.newCompilationParams();
        this.hooks.beforeCompile.callAsync(params, err => {
            if (err) return callback(err);

            this.hooks.compile.call(params);

            // 创建compilation
            const compilation = this.newCompilation(params);
            
            // ...
        });
    }

    newCompilation(params) {
        const compilation = this.createCompilation();
        // ...
        return compilation;
    }

    createCompilation() {
        return new Compilation(this);
    }
}

class Compilation extends Tapable {}
```

## Tapable
> Compiler和Compilation都继承自Tapable, Tapable支撑了webpack整个流体系, 是整个插件机制的支柱,其本质的作用就是事件监听与触发


