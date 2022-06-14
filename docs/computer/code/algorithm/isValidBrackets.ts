function isValidBrackets(s: string) {
    const str = s.split('');
    const stack = [];
    const readMap = {')': '(', ']': '[', '}': '{'};
    let i;
    for (i = 0; i < str.length; i++) {
        const current = str[i];
        if (readMap[current]) {
            // 判断stack中最新的值是否匹配,有的话就推出
            if (stack[stack.length - 1] === readMap[current]) {
                stack.pop();
            } else {
                // 放入堆中
                stack.push(current)
            }
        } else {
            // 放入堆中
            stack.push(current)
        }
    }
    // 最后判断栈中的是否还有括号
    return !stack.length
}
