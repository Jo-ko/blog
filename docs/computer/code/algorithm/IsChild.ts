const set1 = new Set([1,2,4]);
const set2 = new Set([2,3]);
const set3 = new Set([2,4]);

const test1 = Array.from(set2).every(item => Array.from(set1).includes(item));
const test2 = Array.from(set3).every(item => Array.from(set1).includes(item));

console.log(test1) // false
console.log(test2) // true
