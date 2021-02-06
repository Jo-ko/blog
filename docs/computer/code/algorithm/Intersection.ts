
const set1 = new Set([1,2,4,5]);
const set2 = new Set([2,3,5]);

const set3 = new Set(
    Array.from(set1)
        .concat(Array.from(set2))
        .filter(item => set1.has(item) && set2.has(item))
);

console.log(set3); // [2, 5]


