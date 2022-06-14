(window.webpackJsonp=window.webpackJsonp||[]).push([[89],{597:function(_,v,t){"use strict";t.r(v);var r=t(3),s=Object(r.a)({},(function(){var _=this,v=_.$createElement,t=_._self._c||v;return t("ContentSlotsDistributor",{attrs:{"slot-key":_.$parent.slotKey}},[t("h2",{attrs:{id:"_1-introduction-图形学介绍"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#_1-introduction-图形学介绍"}},[_._v("#")]),_._v(" 1. Introduction 图形学介绍")]),_._v(" "),t("p",[_._v("计算机图形学这一术语描述了任何使用计算机来创建和处理图像。这本书介绍了用于创造各种图像所用到相关的算法和数学工具，这些图像包括各种逼真的视觉效果，信息丰富的技术插图或是绚丽的电脑动画。 图像可以是二维的，也可以是三维的， 可以是完全合成，亦可以通过处理照片产生的，这本书涵盖了基本的算法和数学知识，尤其是关于生成三维物体和场景的合成应用。")]),_._v(" "),t("p",[_._v("实际上做计算机图形不可避免的需要了解特定的硬件、文件格式和一些常用的图形API(参考1.3)。计算机图形学是一个快速发展的领域，所以该领域的知识细节是很难追踪溯源的(Moving Target)。所以，在这本书中，我们会尽可能的避免将注意力放在特定的硬件或者API上，我们鼓励读者自行补充自己的硬件环境和软件环境。幸运的是，计算机图形学拥有足够标椎的专业术语和概念，使得本书所描述的能够覆盖到大部分的场景。")]),_._v(" "),t("p",[_._v("本章定义了一些基本术语并提供了相应的历史背景，以及和图形学相关的信息来源")]),_._v(" "),t("h3",{attrs:{id:"_1-1-图形领域"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#_1-1-图形领域"}},[_._v("#")]),_._v(" 1.1 图形领域")]),_._v(" "),t("p",[_._v("在任何领域里面强加类别都是危险的，但是大多数的图形相关从业者都认同以下几个主要的计算机图形学领域。")]),_._v(" "),t("ul",[t("li",[t("strong",[_._v("建模：")]),_._v(" 以一种能够存储在计算机上的方式来处理形状和外观属性的数学规范，比如，一个咖啡杯可能被描述为一组有序的3D点，一些连接点的插值规则和一个反射模型，该反射模型用于描述光是如何与这个杯子相互作用的。")]),_._v(" "),t("li",[t("strong",[_._v("渲染：")]),_._v(" 从艺术中衍生出来的术语， 用于处理3D模型的阴影视觉")]),_._v(" "),t("li",[t("strong",[_._v("动画：")]),_._v(" 一种通过连续图片来创造运动错觉的技术、动画除了会使用模型和渲染，也会增加运动的关键部分，而建模和渲染并不会来处理这部分(指的是运动)")])]),_._v(" "),t("p",[_._v("这里还有一些其他的计算机图形相关领域，但是他们是否也是计算机图形的核心领域就是仁者见智了。其中一部分会在书中介绍。这部分包括：")]),_._v(" "),t("ul",[t("li",[t("strong",[_._v("用户交互：")]),_._v(" 处理一些输入设备（比如鼠标和平板）之间的接口、应用程序、以图形形式给用户的反馈和其他的传感器的反馈，从整个历史上来看，该领域与图形学的关联还是比较深的，因为图形研究人员是最早一批使用这种输入/输出设备的，而这种设备现在已经广泛的被使用了。")]),_._v(" "),t("li",[t("strong",[_._v("虚拟现实：")]),_._v(" 尝试是用户沉浸在3D世界中，通常，这至少需要立体影像和对头部运动的跟踪，同时还应该提供声音和触觉反馈。因为这个领域需要高阶的3D图形效果和显示技术，而这一切又与图形学密不可分。")]),_._v(" "),t("li",[t("strong",[_._v("可视化：")]),_._v(" 尝试通过视觉呈现来提供更复杂的信息给用户，通常需要在处理可视化的问题中解决图形相关问题。")]),_._v(" "),t("li",[t("strong",[_._v("图形处理：")]),_._v(" 处理在图形和视觉领域常用的2D图像。\n3D扫描: 使用测距技术来创建可测量的3D模型，这些模型有助于创造丰富的视觉图像，而这些模型通常需要图形算法。")]),_._v(" "),t("li",[t("strong",[_._v("计算摄影：")]),_._v(" 使用计算机图形，计算机视觉和图像处理方法来实现以照相的方式来捕获对象、场景和环境的新方法。")])]),_._v(" "),t("h3",{attrs:{id:"_1-2-主要应用"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#_1-2-主要应用"}},[_._v("#")]),_._v(" 1.2 主要应用")]),_._v(" "),t("p",[_._v("基本上所有的行业多多少少都涉及到了图形学，但是主要的应用场景还是集中在下面几个：")]),_._v(" "),t("ul",[t("li",[t("strong",[_._v("视频游戏：")]),_._v(" 使用了很多的复杂3D模型和渲染算法。")]),_._v(" "),t("li",[t("strong",[_._v("卡通动画：")]),_._v(" 经常直接使用3D模型来渲染，包括2D的动画，这些技术大大缩减了绘图师的时间。")]),_._v(" "),t("li",[t("strong",[_._v("视觉特效：")]),_._v(" 几乎使用了所有计算机图形的技术。基本上所有的现代电影都会将单独的拍摄时的前景和数- 字合成背景相结合的方式制作。许多电影使用了3D模型来帮助环境，角色达到了以假乱真的效果。")]),_._v(" "),t("li",[t("strong",[_._v("动画电影：")]),_._v(" 基本使用和视觉特效相同的技术除了以假乱真的技术效果。")]),_._v(" "),t("li",[t("strong",[_._v("CAD/CAM（工业软件）：")]),_._v(" 通过计算机图形来辅助设计和制造。")]),_._v(" "),t("li",[t("strong",[_._v("仿真技术：")]),_._v(" 类似飞行模拟器这类的使用复杂的3d图形来模拟飞行驾驶体验。")]),_._v(" "),t("li",[t("strong",[_._v("医疗影像：")]),_._v(" 例如CT这类扫描患者的身体，创建模拟图像，为医疗提供有效的信息数据。")]),_._v(" "),t("li",[t("strong",[_._v("信息可视化：")]),_._v(" 将数据以某种特殊的、直观的视觉表达出来，帮助人们进行具体的分析。")])]),_._v(" "),t("h3",{attrs:{id:"_1-3-图形api"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#_1-3-图形api"}},[_._v("#")]),_._v(" 1.3 图形API")]),_._v(" "),t("p",[_._v("使用图形库的关键部分是API的使用， API是执行一系列相关功能操作的标准接口，而图形学APi是实现图像绘制和3D显示的一系列函数。\n所有与图形程序都需要使用两种相关的API: 图形API（用于视觉输出）和用户界面API（用于获取用户输出）。目前有两种主要的图形和用户界面API范式：")]),_._v(" "),t("ol",[t("li",[_._v("第一种是以java为代表的 "),t("strong",[_._v("集成方法")]),_._v("，图像和用户工具是集成了一个包，作为语言的一个而得到较好的支持。")]),_._v(" "),t("li",[_._v("第二种是以Directed3D和OpenGL为代表的，绘制命令式是内置软件库的一部分并由类似C++这种语言来实现，用户界面的操作方式是一个独立的部分，每个系统都不尽相同。\n对于最后一种范式中，尽管对于简单的程序，可以使用可移植库层来封装特定的用户界面代码，但是编写可移植的代码仍是会产生问题的。")])]),_._v(" "),t("p",[_._v("不管你选择那种方式，基本的图形调用方法大体都是相似的，这本书中的内容也会有所提及。")]),_._v(" "),t("h3",{attrs:{id:"_1-4-绘图管线"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#_1-4-绘图管线"}},[_._v("#")]),_._v(" 1.4 绘图管线")]),_._v(" "),t("blockquote",[t("p",[_._v("绘图管线是计算机图形系统将三维模型渲染到二维屏幕上的过程。简单地说，在计算机即将显示电子游戏或三维动画内的三维模型时，绘图管线就是把该模型转换成屏幕画面的过程。由于这个过程中所进行的操作严重依赖用户所使用的软件、硬件等，因此并不存在通用的绘图管线。")])]),_._v(" "),t("p",[_._v("现在的电脑都拥有强大的3D绘图管线，这是一种高效绘制3D图元的软硬件子系统。")])])}),[],!1,null,null,null);v.default=s.exports}}]);