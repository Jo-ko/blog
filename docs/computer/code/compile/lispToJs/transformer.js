const traverser = require('./traverser');
const parser = require('./parser');
const tokenizer = require('./tokenizer');

function transformer(ast) {
    const newAst = {
        type: 'Program',
        body: []
    }

    ast._context = newAst.body; // 设置节点保存子节点的容器

    traverser(ast, {
        NumberLiteral: {
            enter: (node, parent) => {
                parent._context.push({
                    type: 'NumberLiteral',
                    value: node.value
                })
            },
            exist: () => {
            }
        },
        StringLiteral: {
            enter: (node, parent) => {
                parent._context.push({
                    type: 'StringLiteral',
                    value: node.value
                })
            }
        },
        CallExpression: {
            enter: (node, parent) => {
                let expression = {
                    type: 'CallExpression',
                    callee: {
                        type: 'Identifier',
                        name: node.name
                    },
                    arguments: []
                };
                node._context = expression.arguments; // 设置节点保存子节点的容器
                if (parent.type !== 'CallExpression') {
                    expression = {
                        type: 'ExpressionStatement',
                        expression,
                    }
                }
                parent._context.push(expression);
            }
        }
    })
    return newAst;
}

module.exports = transformer;
