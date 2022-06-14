---
title: Webpack插件
date: 2020-06-30
tags:
- 框架基础
categories:
- 前端知识
---


## 插件使用
### 压缩插件
#### JS压缩
1. 在mode为"production"的情况下webpack会自动对js进行压缩
2. 也可以通过手动注入 __UglifyjsWebpackPlugin__ 或者 __TerserWebpackPlugin__
```js
module.exports = {
    optimization:{
        minimize:true,
        minimizer:[
            new TerserPlugin({
                test: /\.js(\?.*)?$/i,
            }),
        ],
    },
}

```

**TerserWebpackPlugin和UglifyjsWebpackPlugin的区别**

|name|是否支持多线程|是否支持es6语法| 版本兼容性  |   底层技术栈   |
|:---:|:---:|:---:|:------:|:---------:|
|UglifyjsWebpackPlugin|不支持|不支持|  兼容性好  |  uglify-js |
|TerserWebpackPlugin|支持|支持| 只支持新版本 | terser|

### css压缩
引入MiniCssExtractPlugin和OptimizeCSSAssetsPlugin(v4)/CssMinimizerPlugin(v5)
```js
module.exports = {
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    // 引入css独立分包
                    MiniCssExtractPlugin.loader,
                    "css-loader"
                ]
            }
        ]
    },
    optimization: {
        // webpack5中使用
        minimizer: [
            `...`, // 添加这行用于防止默认压缩配置被覆盖
            new CssMinimizerPlugin(),
        ],
    },
    plugins: [
        // webpack4中使用
        new OptimizeCSSAssetsPlugin({
            assetNameRegExp: /\.css\.*(?!.*map)/g,  //注意不要写成 /\.css$/g
            cssProcessor: require('cssnano'),
            cssProcessorOptions: {
                discardComments: { removeAll: true },
                // 避免 cssnano 重新计算 z-index
                safe: true,
                // cssnano 集成了autoprefixer的功能
                // 会使用到autoprefixer进行无关前缀的清理
                // 关闭autoprefixer功能
                // 使用postcss的autoprefixer功能
                autoprefixer: false
            },
            canPrint: true
        })
    ]
}
```
### html压缩
```js
module.exports = {
    plugins: [
        new HtmlWebpackPlugin({
            template: '',
            filename: '',
            chunks: [],
            inject: true,
            minify: {
                collapseWhitespace: true,
                removeComments: true,
            },
        }),
    ]
}
```
