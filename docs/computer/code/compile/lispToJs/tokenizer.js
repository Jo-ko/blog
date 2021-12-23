function tokenizer(input) {
    let   current = 0;
    const WHITESPACE = /\s/;
    const NUMBERS = /[0-9]/;
    const LETTERS_F = /[a-z_$]/i;
    const LETTERS_L = /[\w_$]/i;
    const OPERATOR = /[\+\-\*\/%]/;
    const tokens = [];

    while (current < input.length) {
        let char = input[current];

        // 左括号
        if (char === '(') {
            tokens.push({
                type: 'paren',
                value: '('
            })
            current++;
            continue;
        }

        // 右括号
        if (char === ')') {
            tokens.push({
                type: 'paren',
                value: ')'
            })
            current++;
            continue;
        }

        // 空格
        if (WHITESPACE.test(char)) {
            current++;
            continue;
        }

        // 数字
        if (NUMBERS.test(char)) {
            let value = '';
            while(NUMBERS.test(char)) {
                value += char;
                char = input[++current];
            }
            tokens.push({
                type: 'number',
                value,
            })
            continue;
        }

        // 引号
        if (char === "'" || char === '"') {
            let value = '';
            char = input[++current]; // 跳过开始引号
            while (char !== "'" && char !== '"') {
                value += char;
                char = input[++current];
            }
            char = input[++current]; // 跳过结束引号
            tokens.push({
                type: 'string',
                value
            })
            continue;
        }

        // // 等号
        // if (char === '=') {
        //     tokens.push({
        //         type: 'equal',
        //         value: '='
        //     })
        //     current++;
        //     continue
        // }
        //
        // // 计算符
        // if (OPERATOR.test(char)) {
        //     tokens.push({
        //         type: 'operator',
        //         value: char
        //     })
        //     current++;
        //     continue
        // }

        // 标识符
        if (LETTERS_F.test(char)) {
            let value = '';
            while (LETTERS_L.test(char)) {
                value += char;
                char = input[++current];
            }
            tokens.push({
                type: 'identifier',
                value
            })
            continue;
        }

        throw new TypeError('I dont know what this character is: ' + char);
    }
    return tokens;
}

module.exports = tokenizer;
