---
title: 自定义组件
date: 2018-04-12
tags:
- Html
categories:
- 前端知识
---

## 定义
```ts
customElements.define('element-details',
    class extends HTMLElement {
        constructor() {
            super();
            // 获取template
            const template = document
                .getElementById('element-details-template')
                .content;
            // 设置shadow DOM
            const shadowRoot = this.attachShadow({mode: 'open'})
                .appendChild(template.cloneNode(true));
        }
    }
);
```

## 生命周期
```ts
class CustomEle extends HTMLElement {
    // 构建初始化
    constructor(props) {
        super(props);
        console.log('ctor')
    }
    // 元素添加到dom
    connectedCallback() {}
    // 元素从dom中移除
    disconnectedCallback() {}
    // 元素属性修改
    attributeChangedCallback() {}
    // 通过document.adoptNode移动该元素
    adoptedCallback() {}
}
```

## 反射
### JSObject -> DOM
```ts
class CustomEle extends HTMLElement {
    constructor(props) {
        super(props);
        this.name = 'custom';
    }
    
    get name() {
        this.getAttribute('name')
    }
    
    set name(value) {
        this.setAttribute('name', value);
    }
}

// 定义的时候给元素的name的值赋予custom
customElements.define('custom-ele', CustomEle);
```

### DOM -> JSObject
```ts
class CustomEle extends HTMLElement {
    constructor(props) {
        super(props);
    }
    
    // 返回需要监听的属性
    static observedAttributes() {
        return ['name'] 
    }
    
    // 当属性变化的时候,通知js对象修改数据
    attributeChangedCallback(attr, oldValue, newValue) {
        if (oldValue !== newValue) {
            this[name] = newValue
        }
    }
}
customElements.define('x-custom', CustomEle);
document.querySelector('x-foo').setAttribute('bar', true);

```

## 更新组件
```ts
const fooElement = document.createElement('x-foo');
class FooElement extends HTMLElement {} 
customElements.define('x-foo', FooElement);
console.log(fooElement instanceof FooElement); // false
customElements.upgrade(fooElement); 
console.log(fooElement instanceof FooElement); // true
```
