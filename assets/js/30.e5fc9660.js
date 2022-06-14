(window.webpackJsonp=window.webpackJsonp||[]).push([[30],{588:function(s,t,a){"use strict";a.r(t);var e=a(3),n=Object(e.a)({},(function(){var s=this,t=s.$createElement,a=s._self._c||t;return a("ContentSlotsDistributor",{attrs:{"slot-key":s.$parent.slotKey}},[a("blockquote",[a("p",[s._v("请先确保对正则表达式有足够的理解再看下面的知识点")])]),s._v(" "),a("h2",{attrs:{id:"了解编译原理的重要性"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#了解编译原理的重要性"}},[s._v("#")]),s._v(" 了解编译原理的重要性")]),s._v(" "),a("p",[s._v("目前无论是前端的框架还是工程化体系,其中依赖的重要技术点就是编译技术,所以了解编译原理对了解现代前端有着重要的意义")]),s._v(" "),a("h2",{attrs:{id:"编译的两个广义阶段"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#编译的两个广义阶段"}},[s._v("#")]),s._v(" 编译的两个广义阶段")]),s._v(" "),a("p",[a("strong",[s._v("对于前端来说,我们需要了解编译的前端部分就足够了")])]),s._v(" "),a("ol",[a("li",[s._v("源代码的分析理解阶段(前端)")]),s._v(" "),a("li",[s._v("生成目标代码阶段(后端)")])]),s._v(" "),a("h3",{attrs:{id:"源代码的分析理解阶段-前端"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#源代码的分析理解阶段-前端"}},[s._v("#")]),s._v(" 源代码的分析理解阶段(前端)")]),s._v(" "),a("h4",{attrs:{id:"_1-词法分析"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_1-词法分析"}},[s._v("#")]),s._v(" 1. 词法分析")]),s._v(" "),a("p",[s._v("所谓的词法分析就是将源代码字符串切割成一个个有效的token的过程,通俗讲就是将一串字符串,拆分成一个个字符段")]),s._v(" "),a("div",{staticClass:"language-js line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-js"}},[a("code",[a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("const")]),s._v(" code "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token template-string"}},[a("span",{pre:!0,attrs:{class:"token template-punctuation string"}},[s._v("`")]),a("span",{pre:!0,attrs:{class:"token string"}},[s._v("console.log(name)")]),a("span",{pre:!0,attrs:{class:"token template-punctuation string"}},[s._v("`")])]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v(" \n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("const")]),s._v(" tokenizer "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("syntaxAnalysis")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("code"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("// [tokener('console'), tokener('log'), tokener('('), tokener('name'), tokener(')')]")]),s._v("\n")])]),s._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[s._v("1")]),a("br"),a("span",{staticClass:"line-number"},[s._v("2")]),a("br")])]),a("p",[s._v("整个分词过程就是一个有穷自动机(确定的有穷自动机DNF)的解析过程:")]),s._v(" "),a("ol",[a("li",[s._v("一个个读取字符,组成token,")]),s._v(" "),a("li",[s._v("利用正则判断token流状态,是合法完整的token状态的话就保存当前token流类型")]),s._v(" "),a("li",[s._v("迁移到下一个token")])]),s._v(" "),a("h4",{attrs:{id:"_2-语法分析"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_2-语法分析"}},[s._v("#")]),s._v(" 2. 语法分析")]),s._v(" "),a("p",[s._v("将词法分析生成的字符组转成ast语法树,常用的方式是递归下降算法结合上下文无关文法")]),s._v(" "),a("div",{staticClass:"language-js line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-js"}},[a("code",[a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("const")]),s._v(" ast "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("parse")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("tokenizer"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("// CallExpression")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("// - callee: MemberExpression")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("//  - object")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("//      - type: Identifier")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("//      - name: console")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("//  - property")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("//      - type: Identifier")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("//      - name: log")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("// - arguments: Identifier")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("//      - name: name")]),s._v("\n")])]),s._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[s._v("1")]),a("br"),a("span",{staticClass:"line-number"},[s._v("2")]),a("br"),a("span",{staticClass:"line-number"},[s._v("3")]),a("br"),a("span",{staticClass:"line-number"},[s._v("4")]),a("br"),a("span",{staticClass:"line-number"},[s._v("5")]),a("br"),a("span",{staticClass:"line-number"},[s._v("6")]),a("br"),a("span",{staticClass:"line-number"},[s._v("7")]),a("br"),a("span",{staticClass:"line-number"},[s._v("8")]),a("br"),a("span",{staticClass:"line-number"},[s._v("9")]),a("br"),a("span",{staticClass:"line-number"},[s._v("10")]),a("br"),a("span",{staticClass:"line-number"},[s._v("11")]),a("br")])]),a("h5",{attrs:{id:"a-递归下降算法"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#a-递归下降算法"}},[s._v("#")]),s._v(" A. 递归下降算法")]),s._v(" "),a("blockquote",[a("p",[s._v("其实是一种深度优先的递归回溯算法")])]),s._v(" "),a("ol",[a("li",[s._v("递归的意思是从根节点开始遍历,根据约定的语言规则(正则文法和上下文无关文法)将非终结符转换成终结符的过程,然后回到根节点,继续匹配推导下一个")]),s._v(" "),a("li",[s._v("下降指的是上级文法嵌套下级文法, 上级的算法调用下级的算法, 表现在生成 AST 中，上级算法生成上级节点，下级算法生成下级节点")]),s._v(" "),a("li",[s._v("递归下降算法本身有左递归的问题,需要使用LR算法进行优化")])]),s._v(" "),a("div",{staticClass:"language-text line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-text"}},[a("code",[s._v("// 下面使用EBNF(扩展巴克斯泛式)表示文法\n// 递归下降最初所采用的文法规则\nadd -> mul | add + mul\nmul -> pri | mul * pri\npri -> Id | Num | (add)\n// (LR优化)\nadd -> mul (+ mul)*\nmul -> pri | mul * pri\npri -> Id | Num | (add)\n\n")])]),s._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[s._v("1")]),a("br"),a("span",{staticClass:"line-number"},[s._v("2")]),a("br"),a("span",{staticClass:"line-number"},[s._v("3")]),a("br"),a("span",{staticClass:"line-number"},[s._v("4")]),a("br"),a("span",{staticClass:"line-number"},[s._v("5")]),a("br"),a("span",{staticClass:"line-number"},[s._v("6")]),a("br"),a("span",{staticClass:"line-number"},[s._v("7")]),a("br"),a("span",{staticClass:"line-number"},[s._v("8")]),a("br"),a("span",{staticClass:"line-number"},[s._v("9")]),a("br"),a("span",{staticClass:"line-number"},[s._v("10")]),a("br")])]),a("h5",{attrs:{id:"b-上下文无关文法"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#b-上下文无关文法"}},[s._v("#")]),s._v(" B. 上下文无关文法")]),s._v(" "),a("blockquote",[a("p",[s._v("可以理解为正则文法的超集,可以调用自身, 所谓的上下文无关指的是在任何情况,文法推导的规则都是一样的")])]),s._v(" "),a("h4",{attrs:{id:"_3-语义分析"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_3-语义分析"}},[s._v("#")]),s._v(" 3. 语义分析")]),s._v(" "),a("p",[s._v("在语法分析的基础上,对该语言的规则做一些校验,比如js的this问题,作用域问题")]),s._v(" "),a("h3",{attrs:{id:"es-node-type"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#es-node-type"}},[s._v("#")]),s._v(" ES Node type")]),s._v(" "),a("p",[a("a",{attrs:{href:"https://github.com/estree/estree/blob/master/es5.md",target:"_blank",rel:"noopener noreferrer"}},[s._v("estree"),a("OutboundLink")],1)])])}),[],!1,null,null,null);t.default=n.exports}}]);