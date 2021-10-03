## module & chunk & bundle
1. module 表示我们书写各个模块
2. chunk 表示webpack处理各个模块依赖的关系网络
3. bundle 表示实际输出用于加载的文件,bundle包含多个chunk

## hash & chunkhash & contenthash
> 三个属性都是用于控制文件的持久化缓存

::: tip hash
跟项目的文件结构有关, 当有文件修改时, hash就会改变, 并且所有文件对应的hash都是一样的
::: 

::: tip chunkhash
根据不同的入口文件(Entry)进行依赖文件解析、构建对应的 chunk，生成对应的哈希值,也就是说同一个chunk体系下的的hash是一样的
1. 同一个chunk体系下的文件,修改其中一个文件,其他文件的chunkhash也会发生变化,比如我们通过MiniCssExtractPlugin将css抽离
2. 观察打包后的stats,如果chunks为数值,表示模块标识是通过自增id的方式,就算不是同一个chunk体系下的文件,修改其中也会导致其他的发生变化
   1. 可以通过引入 HashedModuleIdsPlugin插件/optimization.chunkIds 解决
   2. 也可以通过引入 NamedChunksPlugin和NamedModulesPlugin两个插件修改模块标识的方式(develop模式下自动注入)
3. chunkhash和HotModuleReplacementPlugin有冲突
:::

::: tip contenthash
跟文件的内容有关,文件的内容不变,hash值不变,因此能很好的解决chunkhash带来的问题,但是contenthash在webpack4 之前都只能在css上使用，并不能在js上使用，并且现在也只是在production环境上才能使用
:::

## filename & chunkFilename
filename用于在entry中标明的入口文件打包后的文件名
chunkFilename是未在entry中标明的但是需要输出的文件名

## webpackPrefetch & webpackPreload & webpackChunkName
三个都是用于webpack的[魔法注释](https://webpack.docschina.org/api/module-methods/#magic-comments)
webpackPrefetch: 预拉取,会以<link rel="prefetch" as="script" href='path/to/module'>的形式在 __空闲的时候__ 拉取模块代码
webpackPreload: 预加载,在加载主代码的时候以<link rel="preload" as="script" href='path/to/module'>的形式 _并行_ 拉取模块代码
webpackChunkName: 用于显示额外异步加载模块的文件别名

## loader和plugin
1. loader是用于处理模块的,webpack会把资源模块转成js的有效模块,用于依赖收集和分析,webpack默认只认识js和json文件(json是v2版本新增的),我们需要对其他资源提供loader翻译官
2. plugins的范围更广, 通过webpack提供的生命周期钩子(Tapable)处理打包优化,资源管理和环境参数注入

## 常用的loader

## 常用的plugin

## webpack的一般步骤
> webpack是基于流的构建过程
1. 配置参数收集: webpack.config.js文件 + 命令参数 + 默认参数
2. 编译器初始化: 通过配置参数初始化Compiler,同时注入默认的插件
3. Module分析: 从入口文件开始编译每个文件,针对不同的文件会调用不同的loader进行编译,每个module都会分析其依赖的文件,然后递归执行该流程,最终形成一个依赖收集树
4. Chunk生成: 通过对module的依赖树分析生成Chunk文件并输出到本地或者内存中


## webpack文件监听和webpack热更新
::: tip 文件监听
通过轮询判断文件的最后编辑时间是否发生变化,如果文件发生变化,会在aggregateTimeout之后更新文件, 需要手动刷新浏览器
```bash
** 用过命令行
webpack --watch --config webpack.config.js
```
```js

// 通过config设置watch
module.exports = {    
    // 默认false,也就是不开启    
    watch: true,
    // 监听时的相关参数  
    watchOptions: {
        // 默认为空，不监听的文件或者文件夹，支持正则匹配        
        ignored: /node_modules/,
        // 监听到变化发生后会等300ms再去执行，默认300ms        
        aggregateTimeout:300,        
        // 判断文件是否发生变化是通过不停询问系统指定文件有没有变化实现的，默认每秒问1000次        \
        poll:1000    
    }
}
```
:::

::: tip HMR热更新机制
1. 通过webpack-dev-server和浏览器建立了Websocket通信
2. 本地资源发生变化时,webpack-dev-server会推送给浏览器并带上构建时的hash
3. 客户端进行比较,发现差异后会发起Ajax请求获取更改内容, 同时根据这些信息向webpack-dev-server发起jsonp获取该chunk的增量更新
4. 拿到增量更新后的后续处理由HotModulePlugin完成
```js
module.exports = {
    devServer: {
        hot: true,
    },
   plugins: [
       new webpack.HotModuleReplacementPlugin()
   ]
}
```
:::

## DLL
> DLL文件用于优化webpack构建速度,但是由于webpack在v4版本之后的性能提升, DLL文件的提升作用不是非常明显,一些框架已经移除了DLL的打包
### 创建DLL文件
```js
// webpack.dll.config.js
module.exports = {
   mode: 'production',
   entry: {
      react: ['react', 'react-dom'],
   },
   output: {
      path: path.resolve(__dirname, '../dll'),
      filename: '[name].dll.js',
      library: 'dll_[name]',
   },
   plugins: [
      new webpack.DllPlugin({
         name: 'dll_[name]', // 这个name和output.library的名称一致
         path: path.resolve(__dirname, '../dll/[name].manifest.json'),
      })
   ]
}
```
### 链接DLL文件


## 版本比较
### webpack2和webpack1
> 版本变化较大, 增加新特性
1. 增加对ES Module支持
2. 可以混用ES Module,AMD,CommonJS
3. 支持tree-shaking(摇树优化)
4. 增加CLI的参数 -p 指定当前环境
5. 配置语法修改
   1. 取消resolve.extensions首个子元素为空字符串
   2. loader配置项语法修改,增加rules(可以兼容v1的语法)
6. 默认配置json-loader,解析JSON文件
7. 增加了一些内置的插件

### webpack3和webpack2
1. 加入Scope Hoisting(作用域提升), 通过配置plugins: webpack.optimize.ModuleConcatenationPlugin,注意只适用与ES Module
2. 增加Magic Comments(魔法注释),为Code Splitting的chunk提供chunkName

### webpack4和webpack3
1. 新增mode环境属性,用于零配置启动项目, 针对不同的环境做一些默认的参数配置优化
   1. none: 退出任何默认优化配置
   2. development：会将 process.env.NODE_ENV 的值设为 development，启用optimization.nameModules、optimization.namedChunks（原nameModulesPlugin、NamedChunksPlugin 弃用）
   3. production，会将 process.env.NODE_ENV 的值设为 production，启用 FlagDependencyUsagePlugin , FlagIncludedChunksPlugin , ModuleConcatenationPlugin , NoEmitOnErrorsPlugin , OccurrenceOrderPlugin , SideEffectsFlagPlugin 和 TerserPlugin
2. 从原来的plugins分出optimization属性用于配置内置插件的参数优化
3. UglifyjsWebpackPlugin废除, 增加optimization属性: minimizer, 增加并行处理
4. CommonsChunkPlugin废除, 增加optimization属性: splitChunks和runtimeChunk
5. ExtractTextWebpackPlugin废除, 增加MiniCssExtractPlugin
6. 无法使用V1版本的loader属性,只能使用rules语法规则配置loader配置
7. HappyPack升级

### webpack4和webpack5
webpack5相比之前的版本更新较大,整个架构也发生了变化,具体变化看[官方文档](https://webpack.docschina.org/blog/2020-10-10-webpack-5-release)
