const tokenizer = require('./tokenizer');

function parser(tokens) {
    let current = 0;
    const ast = {
        type: 'Program',
        body: []
    }

    function walk() {
        let token = tokens[current];
        if (token.type === 'number') {
            current++;
            return {
                type: 'NumberLiteral',
                value: token.value
            }
        }
        if (token.type === 'string') {
            current++;
            return {
                type: 'StringLiteral',
                value: token.value
            }
        }
        if (token.type === 'paren' && token.value === '(') {
            token = tokens[++current];
            const node = {
                type: 'CallExpression',
                name: token.value,
                params: []
            }
            token = tokens[++current]; // 获取下一个
            while ( token.type !== 'paren' || (token.type === 'paren' && token.value !== ')') ) {
                node.params.push(walk()); // 递归调用解析
                token = tokens[current]; // 重新赋值token,因为现在的token还是未递归前的token
            }

            current++; // 跳过')'
            return node;
        }
        throw TypeError(token.type);
    }

    while(current < tokens.length) {
        ast.body.push(walk());
    }

    return ast;
}

module.exports = parser;

