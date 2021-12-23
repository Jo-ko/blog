function tokenizer(html) {
    let current = 0;
    let tokenizer = [];

    const startReg = /</;
    const endReg = />/;
    const slashReg = /\//;
    const tagReg = /\w/;
    const whiteSpaceReg = /\s/;
    const attrReg = /[@\-="'\w]/;

    while (current < html.length) {
        let char = html[current];

        if (startReg.test(char)) {
            let value = '';
            let token = {};
            char = html[++current];

            if (slashReg.test(char)) {
                token.type = 'closeTag';
                char = html[++current];
            } else {
                token.type = 'startTag'
            }

            while (tagReg.test(char)) {
                value += char
                char = html[++current];
            }
            token.value = value;

            tokenizer.push(token)
            continue;
        }
        if (whiteSpaceReg.test(char)) {
            current++;
            continue;
        }
        if (attrReg.test(char)) {
            let value = '';
            while (attrReg.test(char)) {
                value += char;
                char = html[++current];
            }
            tokenizer.push({
                type: 'attr',
                value
            })
            continue;
        }
        if (slashReg.test(char)) {
            char = html[++current];
            if (endReg.test(char)) {
                tokenizer.push({
                    type: 'selfClose',
                    value: '/>'
                })
            } else {
                current--;
            }
            current++;
            continue
        }
        if (endReg.test(char)) {
            tokenizer.push({
                type: 'close',
                value: '>'
            })
            current++;
            continue;
        }
        current++;
    }
    return tokenizer;
}


const attributeAttr = /([@\-\w]*)(?:\=?)\"(\w*)\"/;
function parse(tokens) {
    let ast = {};
    let currentParents = [];
    let currentNode = null;
    tokens.forEach(token => {
        if (token.type === 'startTag') {
            const node = {
                type: 'tag',
                name: token.value,
                attrs: [],
                children: []
            }
            if (currentParents.length) {
                currentParents[currentParents.length - 1].children.push(node);
            }
            currentParents.push(node);
            currentNode = node;
        }
        if (token.type === 'attr') {
            const node = {
                type: 'attribute',
                name: '',
                value: null
            }
            const attrMatch = token.value.match(attributeAttr);
            node.name = attrMatch[1];
            node.value = attrMatch[2];
            if (currentNode) {
                currentNode.attrs.push(node);
            }
        }
    })
    return ast
}


const template = `
  <div class="test" @bind="handle">
    <br/>
    <div></div>
    <h3>hellow world</h3>
  </div>
`

console.log(tokenizer(template));
