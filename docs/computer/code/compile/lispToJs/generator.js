const parser = require("./parser");
const tokenizer = require("./tokenizer");
const transform = require("./transformer");

function codeGenerator(node) {
    switch (node.type) {
        case 'Program':
            return node.body.map(codeGenerator).join('\n');
        case 'ExpressionStatement':
            return (
                codeGenerator(node.expression) + ';'
            )
        case 'CallExpression':
            // add()
            return  (
                codeGenerator(node.callee) + '(' + node.arguments.map(codeGenerator).join(',') + ')'
            )
        case 'Identifier':
            return node.name;
        case 'NumberLiteral':
            return node.value;
        case 'StringLiteral':
            return '"' + node.value +'"';
        default:
            throw new TypeError(node.type);
    }
}

const par = parser(
    tokenizer(
        "(add 2 (subtract 4 2))"
    )
)
const newAst = transform(
    par
)

// console.log(par);
console.log(newAst);
console.log(codeGenerator(newAst));
