module.exports = {
    "title": "小丑不哭",
    "description": "一只前端哈狗的日常",
    "dest": "public",
    "base": "/blog/",
    "smoothScroll": true,
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
                        "text": "JS语法基础",
                        "link": "/docs/js/"
                    }
                ]
            },
            {
                "text": "Contact",
                "icon": "reco-message",
                "items": [
                    {
                        "text": "GitHub",
                        "link": "https://github.com/recoluan",
                        "icon": "reco-github"
                    }
                ]
            }
        ],
        "sidebar": {
            "/docs/js/": [
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
        "logo": "/logo.png",
        "search": true,
        "searchMaxSuggestions": 10,
        "lastUpdated": "Last Updated",
        "author": "Jooker",
        "authorAvatar": "/avatar.png",
        "record": "xxxx",
        "startYear": "2020"
    },
    "markdown": {
        "lineNumbers": true
    }
}
