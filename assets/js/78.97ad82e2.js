(window.webpackJsonp=window.webpackJsonp||[]).push([[78],{534:function(a,t,s){"use strict";s.r(t);var e=s(3),_=Object(e.a)({},(function(){var a=this,t=a.$createElement,s=a._self._c||t;return s("ContentSlotsDistributor",{attrs:{"slot-key":a.$parent.slotKey}},[s("blockquote",[s("p",[a._v("正则表达式是一种字符串模式, 其实现依赖于宿主环境,因此不同的语言在具体方法上会有一些区别")])]),a._v(" "),s("h2",{attrs:{id:"创建正则"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#创建正则"}},[a._v("#")]),a._v(" 创建正则")]),a._v(" "),s("p",[s("strong",[a._v("下面三种形式创建的正则规则是一致的")])]),a._v(" "),s("div",{staticClass:"language-js line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-js"}},[s("code",[s("span",{pre:!0,attrs:{class:"token keyword"}},[a._v("const")]),a._v(" reg "),s("span",{pre:!0,attrs:{class:"token operator"}},[a._v("=")]),a._v(" "),s("span",{pre:!0,attrs:{class:"token regex"}},[s("span",{pre:!0,attrs:{class:"token regex-delimiter"}},[a._v("/")]),s("span",{pre:!0,attrs:{class:"token regex-source language-regex"}},[a._v("\\s")]),s("span",{pre:!0,attrs:{class:"token regex-delimiter"}},[a._v("/")]),s("span",{pre:!0,attrs:{class:"token regex-flags"}},[a._v("g")])]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(";")]),a._v("\n\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[a._v("// 当正则表达式有变量存在的时候使用")]),a._v("\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[a._v("const")]),a._v(" reg2 "),s("span",{pre:!0,attrs:{class:"token operator"}},[a._v("=")]),a._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[a._v("new")]),a._v(" "),s("span",{pre:!0,attrs:{class:"token class-name"}},[a._v("RegExp")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("(")]),s("span",{pre:!0,attrs:{class:"token string"}},[a._v("'\\\\s'")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(",")]),a._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[a._v("'g'")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(";")]),a._v(" \n\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[a._v("// 注意该形式下的第二个参数只有在ES6的环境中不会报错")]),a._v("\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[a._v("const")]),a._v(" reg3 "),s("span",{pre:!0,attrs:{class:"token operator"}},[a._v("=")]),a._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[a._v("new")]),a._v(" "),s("span",{pre:!0,attrs:{class:"token class-name"}},[a._v("RegExp")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("(")]),s("span",{pre:!0,attrs:{class:"token regex"}},[s("span",{pre:!0,attrs:{class:"token regex-delimiter"}},[a._v("/")]),s("span",{pre:!0,attrs:{class:"token regex-source language-regex"}},[a._v("\\s")]),s("span",{pre:!0,attrs:{class:"token regex-delimiter"}},[a._v("/")])]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(",")]),a._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[a._v("'g'")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(";")]),a._v("\n")])]),a._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[a._v("1")]),s("br"),s("span",{staticClass:"line-number"},[a._v("2")]),s("br"),s("span",{staticClass:"line-number"},[a._v("3")]),s("br"),s("span",{staticClass:"line-number"},[a._v("4")]),s("br"),s("span",{staticClass:"line-number"},[a._v("5")]),s("br"),s("span",{staticClass:"line-number"},[a._v("6")]),s("br"),s("span",{staticClass:"line-number"},[a._v("7")]),s("br")])]),s("h2",{attrs:{id:"语法标识"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#语法标识"}},[a._v("#")]),a._v(" 语法标识")]),a._v(" "),s("h3",{attrs:{id:"字符组"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#字符组"}},[a._v("#")]),a._v(" 字符组")]),a._v(" "),s("ul",[s("li",[a._v("\\b: 匹配一个词的边界,这个边界指的一边是\\w能够匹配的,一边是是空格和其他不在规定字符集中的字符")]),a._v(" "),s("li",[a._v("\\B: 匹配一个非单词边界, 和\\b相反")]),a._v(" "),s("li",[a._v("\\d: 匹配一个数字,和[0-9]的作用相同")]),a._v(" "),s("li",[a._v("\\D: 匹配一个非数字,和[^0-9]的作用相同")]),a._v(" "),s("li",[a._v("\\f: 匹配一个换页符")]),a._v(" "),s("li",[a._v("\\n: 匹配一个换行符")]),a._v(" "),s("li",[a._v("\\r: 匹配一个回车符")]),a._v(" "),s("li",[a._v("\\s: 匹配一个空白字符, 包括空格、制表符、换页符和换行符")]),a._v(" "),s("li",[a._v("\\S: 匹配一个非空白字符")]),a._v(" "),s("li",[a._v("\\t: 匹配一个水平制表符")]),a._v(" "),s("li",[a._v("\\v: 匹配一个垂直制表符")]),a._v(" "),s("li",[a._v("\\w: 匹配一个单子字符,等价于[0-9A-Za-z_]")]),a._v(" "),s("li",[a._v("\\n(\\1, \\2): 匹配第n个左括号捕获的子字符串")]),a._v(" "),s("li",[a._v("[xyz]: 匹配xyz中的任意字符,可以使用x-y表示一段范围,注意,像*, .这种字符在[]中没有任何特殊含义")]),a._v(" "),s("li",[a._v("[^xyz]: 匹配任何不包含在xyz中的字符")]),a._v(" "),s("li",[a._v(".: 匹配除换行符之外的任何单个字符")])]),a._v(" "),s("h4",{attrs:{id:"_1-字符组-a-z-为什么不能写成-z-a"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_1-字符组-a-z-为什么不能写成-z-a"}},[a._v("#")]),a._v(" 1. 字符组[a-z]为什么不能写成[z-a]")]),a._v(" "),s("p",[a._v("我们需要知道范围表示法的实质,一般根据字符对应的码值,码值小的在前,码值大的在后,依次排列,如果前后颠倒,会导致解析错误")]),a._v(" "),s("h4",{attrs:{id:"_2-字符组中需要转义的元字符"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_2-字符组中需要转义的元字符"}},[a._v("#")]),a._v(" 2. 字符组中需要转义的元字符")]),a._v(" "),s("p",[a._v("], -, ^ => ], -, ^")]),a._v(" "),s("h3",{attrs:{id:"量词字符"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#量词字符"}},[a._v("#")]),a._v(" 量词字符")]),a._v(" "),s("ul",[s("li",[a._v("*: 匹配0个或者多个")]),a._v(" "),s("li",[a._v("+: 匹配1个或者多个")]),a._v(" "),s("li",[a._v("?:\n"),s("ul",[s("li",[a._v("写在非量词字符后面表示匹配0个或者1个")]),a._v(" "),s("li",[a._v("写在量词字符后面表示匹配模式为非贪婪模式")]),a._v(" "),s("li",[a._v("用于非捕获括号标识")]),a._v(" "),s("li",[a._v("用于非捕获匹配先行断言,后行断言,正向否定查找,反向否定查找")])])]),a._v(" "),s("li",[a._v("{n}: 匹配出现n次")]),a._v(" "),s("li",[a._v("{n,}: 匹配至少出现n次")]),a._v(" "),s("li",[a._v("{n, m}: 匹配出现n-m之间的次数")])]),a._v(" "),s("h3",{attrs:{id:"模式匹配"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#模式匹配"}},[a._v("#")]),a._v(" 模式匹配")]),a._v(" "),s("ul",[s("li",[a._v("*?/+?/??/{m,n}?: 当匹配成功时先不选择匹配,而是忽略,除非下一个匹配成功")]),a._v(" "),s("li",[a._v("(?:x): 匹配x但是不记住匹配项,无法从返回的匹配项中检索到(非捕获型)")]),a._v(" "),s("li",[a._v("x(?=y): 匹配x,同时x的后面跟着y(先行断言)")]),a._v(" "),s("li",[a._v("x(?!y): 匹配x, 同时x的后面不是y(正向否定查找)")]),a._v(" "),s("li",[a._v("(?<=y)x: 匹配x, 同时x的前面是y(后行断言)")]),a._v(" "),s("li",[a._v("(?<!y)x: 匹配x, 同时x的前面不是y(反向否定查找)")])]),a._v(" "),s("h3",{attrs:{id:"标识符"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#标识符"}},[a._v("#")]),a._v(" 标识符")]),a._v(" "),s("ul",[s("li",[a._v("g: 全局搜索")]),a._v(" "),s("li",[a._v("i: 不区分大小写")]),a._v(" "),s("li",[a._v("m: 多行搜索")]),a._v(" "),s("li",[a._v("s: 允许.匹配换行符")]),a._v(" "),s("li",[a._v("u: 使用unicode码的模式进行匹配")]),a._v(" "),s("li",[a._v("y: 从lastIndex位置开始搜索匹配")])]),a._v(" "),s("h2",{attrs:{id:"构造函数方法"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#构造函数方法"}},[a._v("#")]),a._v(" 构造函数方法")]),a._v(" "),s("ul",[s("li",[a._v("exec: 返回一个匹配的数组或者null\n"),s("ul",[s("li",[a._v("在设置g或者y的模式下, 该正则是有状态的,它会将上次匹配成功的位置记录在lastIndex属性中")]),a._v(" "),s("li",[a._v("注意不要把正则表达式字面量或者RegExp构造器放在while条件表达式里,由于lastIndex每次都会重置,可能会导致无限循环")])])]),a._v(" "),s("li",[a._v("test: 返回boolean\n"),s("ul",[s("li",[a._v("在设置g或者y的模式下, 该正则是有状态的,它会将上次匹配成功的位置记录在lastIndex属性中")])])])]),a._v(" "),s("h2",{attrs:{id:"string类可以使用正则的方法"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#string类可以使用正则的方法"}},[a._v("#")]),a._v(" String类可以使用正则的方法")]),a._v(" "),s("ul",[s("li",[a._v("match: 类似exec, 返回一个匹配的数组或者null")]),a._v(" "),s("li",[a._v("matchAll: 返回分组匹配的迭代器(不可复用,迭代完需要重新生成), 注意,该正则表达式必须设置全局模式g")]),a._v(" "),s("li",[a._v("search: 返回第一次匹配到的索引值,如果不匹配则返回-1")]),a._v(" "),s("li",[a._v("replace: 替换匹配到的值,返回一个新的字符串")]),a._v(" "),s("li",[a._v("split: 将字符串用指定字符分隔")])]),a._v(" "),s("h3",{attrs:{id:"match-和-exec"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#match-和-exec"}},[a._v("#")]),a._v(" match 和 exec")]),a._v(" "),s("ol",[s("li",[a._v("match只会返回匹配的结果数组, 但exec会返回匹配的具体信息")]),a._v(" "),s("li",[a._v("exec在添加g或者y的模式下,该RegExp能够记录上次的匹配结果,保存lastIndex")])]),a._v(" "),s("h3",{attrs:{id:"matchall-和-exec"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#matchall-和-exec"}},[a._v("#")]),a._v(" matchAll 和 exec")]),a._v(" "),s("ol",[s("li",[a._v("matchAll可以看成exec的组合版")]),a._v(" "),s("li",[a._v("matchAll的迭代不会改变lastIndex")])]),a._v(" "),s("h3",{attrs:{id:"replace"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#replace"}},[a._v("#")]),a._v(" replace")]),a._v(" "),s("ul",[s("li",[a._v("有两个参数(regExp|string, replaceStr | replaceFunction)")])]),a._v(" "),s("h3",{attrs:{id:"replacefunction的参数"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#replacefunction的参数"}},[a._v("#")]),a._v(" replaceFunction的参数")]),a._v(" "),s("ul",[s("li",[a._v("match: 匹配的字符串")]),a._v(" "),s("li",[a._v("p1, p2: 第n个匹配到的字符串")]),a._v(" "),s("li",[a._v("offset: 匹配到的字符串在原字符串中的偏移量")]),a._v(" "),s("li",[a._v("string: 原字符串")])]),a._v(" "),s("h2",{attrs:{id:"优先级"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#优先级"}},[a._v("#")]),a._v(" 优先级")]),a._v(" "),s("blockquote",[s("p",[a._v("优先级由上到下变低")])]),a._v(" "),s("ol",[s("li",[a._v("(regexp) 整个括号内的子表达式成为单个元素")]),a._v(" "),s("li",[a._v("* ? + 限定之前紧邻的元素")]),a._v(" "),s("li",[a._v("abc 普通拼接，元素相继出现")]),a._v(" "),s("li",[a._v("a|b 多选结构")])]),a._v(" "),s("h2",{attrs:{id:"unicode相关"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#unicode相关"}},[a._v("#")]),a._v(" Unicode相关")]),a._v(" "),s("blockquote",[s("p",[a._v("Unicode由两大部分组成,1.我们所常说的unicode编码指的是字符集(UCS),即字符对应的码值是多少;2.该字符的码值是如何读取,存储和传输的(UTF), 我们常说的utf-8就是这个")])]),a._v(" "),s("ol",[s("li",[a._v("通过/[\\u4E00-\\u9FFF]/来匹配中文字符, 或者使用/\\p{Unified_Ideograph}/u(ES2018支持)")]),a._v(" "),s("li",[a._v("ES6 增加了新的转义序列: \\u{10437}来替代\\u10437这种带有歧义的写法")]),a._v(" "),s("li",[a._v("匹配中文字符时请添加u标识符来明确显示采用Unicode匹配规则")])]),a._v(" "),s("h2",{attrs:{id:"正则原理"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#正则原理"}},[a._v("#")]),a._v(" 正则原理")]),a._v(" "),s("h3",{attrs:{id:"有限自动机-有穷自动机"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#有限自动机-有穷自动机"}},[a._v("#")]),a._v(" 有限自动机(有穷自动机)")]),a._v(" "),s("ol",[s("li",[a._v("确定型有穷自动机(DFA): 任何时刻的状态都是确定的")]),a._v(" "),s("li",[a._v("非确定型有穷自动机(NFA): 在某个时刻,他的状态是不确定的\n一般使用的是NFA,虽然效率要比DFA低一些,但因为NFA拥有回溯的能力,因此能提供更多的功能")])])])}),[],!1,null,null,null);t.default=_.exports}}]);