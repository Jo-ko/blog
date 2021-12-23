const unicodeRegExp = /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z${unicodeRegExp.source}]*`
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qnameCapture}`)
const startTagClose = /^\s*(\/?)>/
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const comment = /^<!\--/
const conditionalComment = /^<!\[/

let html = '';
let index = 0;
let stack = [];
let lastTag;

function parse(source) {
    html = source.trim().replace('\n', '');
    while (html) {

        if (!lastTag) {
            let textEnd = html.indexOf('<');
            let text, rest, next

            if (textEnd === 0) {
                // 匹配开始和结束节点
                const matchStartTag = parseStartTag();
                if (matchStartTag) {
                    handleStartTag(matchStartTag);
                    continue;
                }

                const matchEndTag = html.match(endTag);
                if (endTag) {
                    handleEndTag(matchEndTag);
                    continue
                }
            }

            if (textEnd >= 0) {
                // 去除空格和非标准文本
                rest = html.slice(textEnd);
                while (
                    !endTag.test(rest) &&
                    !startTagOpen.test(rest) &&
                    !comment.test(rest) &&
                    !conditionalComment.test(rest)
                    ) {
                    next = rest.indexOf('<', 1);
                    if (next < 0) break;
                    textEnd += next;
                    rest = html.slice(textEnd)
                }
                text = html.substring(0, textEnd);
            }

            if (textEnd < 0){
                text = html
            }

            if (text) {
                read(text.length)
            }
        } else {
            console.log(111);
        }

    }

}

function parseStartTag() {
    // 读取tag类型
    // 返回['<div', 'div', index: 0....]
    const startMatch = html.match(startTagOpen);
    if (startMatch) {
        const currentMath = {
            tagName: startMatch[1],
            attrs: [],
            start: index,
            end: null,
            unarySlash: null,
        }
        let end, attr;
        // 读取tag开始标签结束的第一个字符
        read(startMatch[0].length);

        // 注意while循环判断的顺序,先判断是否是结束标识,再判断是否是属性标识
        while (
            !(end = html.match(startTagClose)) &&
            (attr = html.match(attribute))
        ) {
            // 不断读取属性,自动当前标签的结束
            read(attr[0].length);
            currentMath.attrs.push(attr);
        }
        if (end) {
            // 保存结束标识

            read(end[0].length);
            currentMath.unarySlash = end[1];
            currentMath.end = index;
            return currentMath;
        }
    }
}

function handleStartTag(match) {
    const tagName = match.tagName;
    const unarySlash = match.unarySlash;

    // 判断是否是一元标签: true是, false不是
    const unary = !!unarySlash;
    const attrsArr = [];
    // 遍历unarySlash,保存属性值
    for (let i = 0, length = match.attrs.length; i < length; i++) {
        const args = match.attrs[i];
        const value = args[3] || args[4] || args[5] || '';
        attrsArr[i] = {
            name: args[1],
            value
        }
    }
    if (!unary) {
        // 如果是不是一元就将标签推入ast栈,同时保存lastAgName用于后面的结束标签的匹配
        stack.push({
            tagName,
            lowerCasedTag: tagName.toLowerCase(),
            attrs: attrsArr,
            start: match.start,
            end: match.end
        })
        lastTag = tagName;
    }
}


function handleEndTag(match) {
    const currentIndex = index;
    read(match[0].length);
    parseEndTag(match[1], currentIndex, index);
}

function parseEndTag(tagName, start, end) {
    let pos
    if (start === null) start = index;
    if (end === null) end = index;

    // 找到最近类型相同的起始标签
    if (tagName) {
        const lowercaseTagName = tagName.toLowerCase();
        for (pos = stack.length; pos >= 0; pos--) {
            if (stack[pos].lowerCasedTag === lowercaseTagName) {
                break;
            }
        }
    } else {
        pos = 0;
    }
}

function read(n) {
    index += n; // 记录当前位置
    html = html.substring(n); // 读取对应位置字符
}


module.exports = parse;

