module.exports = {
    "title": "小丑不哭",
    "description": "一只前端哈狗的开发日常",
    "dest": "dist",
    "base": "/blog/",
    "smoothScroll": true,
    "port": 8000,
    'plugins': [
        'flowchart',
        '@vuepress-reco/extract-code',
        [
            "md-enhance",
            {
                tex: true,
            },
        ],

    ],
    "head": [
        [
            "link",
            {
                "rel": "icon",
                "href": "/favicon.ico"
            }
        ],
        [
            "meta",
            {
                "name": "viewport",
                "content": "width=device-width,initial-scale=1,user-scalable=no"
            }
        ]
    ],
    "theme": "reco",
    "themeConfig": {
        "nav": [
            {
                "text": "Home",
                "link": "/",
                "icon": "reco-home"
            },
            {
                "text": "TimeLine",
                "link": "/timeline/",
                "icon": "reco-date"
            },
            {
                "text": "Docs",
                "icon": "reco-message",
                "items": [
                    {
                        "text": "计算机基础",
                        "link": "/docs/computer/"
                    },
                    {
                        "text": "浏览器基础",
                        "link": "/docs/browser/"
                    },
                    {
                        "text": "JS语法基础",
                        "link": "/docs/js/"
                    },
                    {
                        "text": "客户端基础",
                        "link": "/docs/native/",
                    },
                    {
                        "text": "通用编程基础",
                        "link": "/docs/general/"
                    },
                    {
                        "text": "后端基础",
                        "link": "/docs/backEnd/"
                    },
                    {
                        "text": "框架原理",
                        "items": [
                            {
                                "text": "React",
                                "link": "/docs/framework/react/"
                            },
                            {
                                "text": "React16",
                                "link": "/docs/framework/react16/"
                            },
                            {
                                "text": "webpack",
                                "link": "/docs/framework/webpack/"
                            }
                        ],
                    },
                    {
                        "text": "类库基础",
                        "link": "/docs/libs/"
                    },
                    {
                        "text": "工程化体系",
                        "link": "/docs/engineer/"
                    },
                    {
                        "text": "软技能",
                        "link": "/docs/softSkill/"
                    },
                    {
                        "text": "前沿技术",
                        "link": "/docs/future/"
                    },
                    {
                        "text": "数学基础",
                        "link": "/docs/math/"
                    },
                    {
                        "text": "原创文章",
                        "link": "/docs/article/"
                    }
                ]
            },
            {
                "text": "Contact",
                "icon": "reco-message",
                "items": [
                    {
                        "text": "GitHub",
                        "link": "https://github.com/Jo-ko",
                        "icon": "reco-github"
                    },
                    {
                        "text": "Twitter",
                        "link": "https://twitter.com/Jooker18506261",
                        "icon": "reco-twitter"
                    }
                ]
            }
        ],
        "sidebar": {
            "/docs/computer/": [
                ["", "简述"],
                "compile",
                "algorithm",
                "network"
            ],
            "/docs/browser/": [
                ["", "简述"],
                "v8",
                "crossOrigin",
                "request",
                "cache",
                "struct",
                "workThread",
                "http"
            ],
            "/docs/js/": [
                ["", "简述"],
                "ecma",
                "dom",
                "regExp",
                "prototype",
                "scope",
                "this",
                "gc",
                "proxy",
                "async",
                "boom",
                "event",
                "canvas",
                "form",
                "customEle",
                "custom"
            ],
            "/docs/native/": [
                ["", "简述"],
                'mini'
            ],
            "/docs/general/": [
                ["", "简述"]
            ],
            "/docs/backEnd/": [
                ["", "简述"]
            ],
            "/docs/framework/react/": [
                ["", "简述"],
                "react_hooks",
                "react_batchUpdate",
                "react_fiber",
                "react_transaction",
            ],
            "/docs/framework/react16/": [
                ["", "简述"],
                "react_origin_renderAndUpdate",
                "react_origin_schedule",
                "react_origin_renderRoot",
                "react_origin_diff",
                "react_origin_completeWork",
                "react_origin_completeRoot",
            ],
            "/docs/framework/webpack/": [
                ["", "简述"],
                "webpack_v1",
                "webpack_v4",
                "webpack_tapable",
                "webpack_HMR",
                "webpack_plugins"
            ],
            "/docs/libs/": [
                ["", "简述"],
                "babel"
            ],
            "/docs/engineer/": [
                ["", "简述"],
                "bundler",
                "workingFlow",
                "middleware"
            ],
            "/docs/softSkill/": [
                ["", "简述"]
            ],
            "/docs/future/": [
                ["", "简述"]
            ],
            "/docs/math/": [
                ["", "简述"],
                "linearAlgebra",
            ],
            "/docs/article/": [
                ["", "简述"],
                "mini-router"
            ]
        },
        "type": "blog",
        "blogConfig": {
            "category": {
                "location": 2,
                "text": "Category"
            },
            "tag": {
                "location": 3,
                "text": "Tag"
            }
        },
        "friendLink": [
            // {
            //     "title": "午后南杂",
            //     "desc": "Enjoy when you can, and endure when you must.",
            //     "email": "1156743527@qq.com",
            //     "link": "https://www.recoluan.com"
            // },
            // {
            //     "title": "vuepress-theme-reco",
            //     "desc": "A simple and beautiful vuepress Blog & Doc theme.",
            //     "avatar": "https://vuepress-theme-reco.recoluan.com/icon_vuepress_reco.png",
            //     "link": "https://vuepress-theme-reco.recoluan.com"
            // }
        ],
        "subSidebar": "auto",
        "logo": "/logo.png",
        "search": true,
        "searchMaxSuggestions": 10,
        "lastUpdated": "Last Updated",
        "author": "Jooker",
        "authorAvatar": "/avatar.png",
        "record": "xxxx",
        "startYear": "2020",
        keyPage: {
            keys: ['3c07c009b7b52fcc5a72368896cb59fa'], // 1.3.0 版本后需要设置为密文
            color: '#42b983', // 登录页动画球的颜色
            lineColor: '#42b983' // 登录页动画线的颜色
        }
    },
    "markdown": {
        "lineNumbers": true
    }
}
