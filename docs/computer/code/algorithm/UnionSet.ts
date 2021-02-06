const set1 = new Set([1,2,3]);
const set2 = new Set([3,4,5]);

const set3 = new Set();
set1.forEach(item => {
    set3.add(item)
})
set2.forEach(item => {
    set3.add(item)
})

console.log(set3.values());
