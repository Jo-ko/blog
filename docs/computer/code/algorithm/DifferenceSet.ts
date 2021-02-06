const set1 = new Set([1,2,4]);
const set2 = new Set([2,3]);

// 存在set1中的但不存在set2中
const set3 = new Set(Array.from(set1).filter(item => !set2.has(item)));
console.log(set3.values()); // {1, 4}

// 存在set2中的但不存在set1中
const set4 = new Set(Array.from(set2).filter(item => !set1.has(item)));
console.log(set4.values()); // {3}
