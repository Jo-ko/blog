

function traverser(ast, visitor) {
    function traverserArray(nodes, parent) {
        nodes.forEach(node => {
            traverserNode(node, parent)
        })
    }
    function traverserNode(node, parent) {
        const methods = visitor[node.type];
        if (methods && methods.enter) {
            methods.enter(node, parent)
        }
        switch (node.type) {
            case 'Program':
                traverserArray(node.body, node) // 递归去遍历子对象
                break;
            case 'CallExpression':
                traverserArray(node.params, node) // 递归去遍历子对象
                break;
            case 'NumberLiteral':
            case 'StringLiteral':
                break;
            default:
                throw new TypeError(node.type)
        }
        if (methods && methods.exit) {
            methods.exit(node, parent);
        }
    }
    traverserNode(ast, null);
}

module.exports = traverser;
