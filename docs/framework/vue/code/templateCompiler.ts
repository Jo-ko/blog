type matchResult<T> = {
    type: string,
    value: T
}

type attr = Record<string, string>;

type tagToken = {
    tagName: string,
    attrs?: attr[]
}

type nodeType = {
    type: string,
    value: string,
    attrs?: attr[],
    children: nodeType[],
    parent: nodeType | null,
};

interface IParseResult<T> {
    parseRes: matchResult<T> | null;
    resultText: string;
}

const unicodeRegExp = /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/;
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
const dynamicArgAttribute = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+?\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
const ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z" + (unicodeRegExp.source) + "]*";
const qnameCapture = "((?:" + ncname + "\\:)?" + ncname + ")";
const startTagOpen = new RegExp(("^<" + qnameCapture));
const startTagClose = /^\s*(\/?)>/;
const endTag = new RegExp(("^<\\/" + qnameCapture + "[^>]*>"));
const doctype = /^<!DOCTYPE [^>]+>/i;
const defaultTagReg = /\{\{((?:.|\r?\n)+?)\}\}/g;

const NODE_TYPE = {
    ELEMENT_NODE: 'ELEMENT_NODE',
    TEXT_NODE: 'TEXT_NODE',
};

function parseHtml(html: string) {


    const astStack: nodeType[] = [];
    let currentParentNode: nodeType | null = null;
    let rootNode: nodeType | null = null;

    function advance(text: string, length: number) {
        return text.substring(length);
    }

    function parseStartTag(text: string): IParseResult<tagToken> {
        // 匹配标签的开始
        const match = text.match(startTagOpen);
        const result: IParseResult<tagToken>  = {
            parseRes: null,
            resultText: text
        };
        let tagToken: tagToken = {tagName: '', attrs: []}
        let end;
        if (match) {
            text = advance(text, match[0].length);
            tagToken.tagName = match[1];

            // 匹配标签结束
            // 获取属性
            while(!(end = text.match(startTagClose))) {
                let attr;
                if (attr = text.match(attribute)) {
                    tagToken.attrs!.push({
                        key: attr[1],
                        value: attr[3] || attr[4] || attr[5]
                    })
                    text = advance(text, attr[0].length);
                } else {
                    break;
                }
            }
            if (end) {
                text = advance(text, end[0].length);
            }

            result.parseRes = {
                type: 'startTag',
                value: tagToken
            };
            result.resultText = text;

            return result
        }
        return result
    }

    function parseEndTag(text: string): IParseResult<tagToken | null> {
        const endTagMatch = text.match(endTag);
        if (endTagMatch) {
            text = advance(text, endTagMatch[0].length)
        }
        return {
            parseRes: endTagMatch ? {
                type: 'closeTag',
                value: {tagName: endTagMatch[1]}
            } : null,
            resultText: text,
        };
    }

    function createASTElement(tag: string, attrs: attr[] = []): nodeType {
        return {
            type: NODE_TYPE.ELEMENT_NODE,
            value: tag,
            attrs,
            children: [],
            parent: null
        }
    }

    function handleStart(tagName: string, attrs?: attr[]) {
        const astNode = createASTElement(tagName, attrs);
        !rootNode && (rootNode = astNode);
        if (currentParentNode) {
            astNode.parent = currentParentNode
            currentParentNode.children.push(astNode);
        }
        currentParentNode = astNode;
        astStack.push(astNode);
    }

    function handleEnd(tagName: string) {
        if (tagName === astStack[astStack.length - 1].value) {
            astStack.pop();
            currentParentNode = astStack[astStack.length - 1];
        }
    }

    function handleText(text: string) {
        currentParentNode?.children?.push({
            type: NODE_TYPE.TEXT_NODE,
            value: text,
            parent: currentParentNode,
            children: []
        })
    }

    while (html) {
        const textEnd = html.indexOf('<');

        // 标签节点
        if (textEnd === 0) {
            // 匹配开始标签
            const startParseResult = parseStartTag(html);
            if (startParseResult.parseRes) {
                html = startParseResult.resultText;
                const parseRes = startParseResult.parseRes;
                if (parseRes && parseRes.value) {
                    handleStart(parseRes.value.tagName, parseRes.value.attrs);
                }
                continue;
            }
            // 匹配结束标签
            const endParseResult = parseEndTag(html);
            if (endParseResult.parseRes) {
                html = endParseResult.resultText;
                if (endParseResult.parseRes && endParseResult.parseRes.value) {
                    handleEnd(endParseResult.parseRes?.value?.tagName)
                }
                continue;
            }
        }

        // 文本
        if (textEnd > 0) {
            const text = html.substring(0, textEnd);
            if (text) {
                handleText(text);
                html = advance(html, text.length);
            }
        }
    }
    return rootNode;
}

function compileToFunction(html: string) {
   const ast = parseHtml(html);
   return ast && codeGen(ast);
}

function codeGen(ast: nodeType) {
    console.log(ast);
    function genProps(attrs: attr[]) {
        const res: any = {};
        const len = attrs.length;
        for (let i = 0; i < len; i++) {
            const {key, value} = attrs[i];
            if (key === 'style') {
                const body: any = {};
                value.split(';').forEach(item => {
                    const match = item.match(/(?:\s)*([a-zA-Z_]+)(?:\s)*:(?:\s)*((\S)*)(?:\s)*/);
                    if (match && match[1] && match[2]) {
                        body[match[1]] = match[2];
                    }
                })
                res[key] = body;
                continue;
            }
            res[key] = value;
        }
        return res;
    }
    function genChildren(asts: nodeType[]) {
        let res = '';
        asts.forEach(child => {
            if (child.type === NODE_TYPE.ELEMENT_NODE) {
                res += `${codeGen(child)},`
            }
            if (child.type === NODE_TYPE.TEXT_NODE) {
                res += `${genText(child)},`
            }
        })
        return res;
    }
    function genText(ast: nodeType) {
        if (ast.value.match(defaultTagReg)) {
            const tokens = [];
            let match;
            let lastIndex = 0;
            defaultTagReg.lastIndex = 0;
            while(match = defaultTagReg.exec(ast.value)) {
                console.log('------')
                console.log(match);
                const index = match.index;
                if (index > lastIndex) {
                    tokens.push(ast.value.slice(lastIndex, index))
                }
                tokens.push(`_s(${match[1].trim()})`);
                lastIndex = index + match[0].length;
            }
            if (lastIndex < ast.value.length - 1) {
                tokens.push(ast.value.slice(lastIndex))
            }
            return `_v(${tokens.join('+')})`
        } else {
            return `_v('${ast.value}')`;
        }
    }

    const type = ast.type;
    let render = `_c('${ast.value}'`;
    if (ast.attrs) {
        render += `,${genProps(ast.attrs)}`
    } else {
        render += `,null`
    }
    if (ast.children.length) {
        render += `,${genChildren(ast.children)}`;
    }
    render += ')';
    return render;

}

const template = `<div id="app" name="jooker" style="color: red;font-size: 12px">
<a href="qw">{{name}} as {{age}}</a>
<button>按钮</button>
</div>`

const str = compileToFunction(template);
console.log(str);

