import {MinHeap} from './heap';

class KthLargest {
    container: MinHeap<number>;
    k: number;
    constructor(k: number, nums: number[]) {
        this.k = k;
        this.container = new MinHeap<number>();
        nums.forEach(num => {
            this.add(num);
        })
    }
    add(val: number) {
        this.container.add(val);
        if (this.container.getSize() > this.k) {
            this.container.poll();
        }
        return this.container.getRoot();
    }
}


const kthLargest = new KthLargest(3, [4, 5, 8, 2])
console.log(kthLargest.add(3))
console.log(kthLargest.add(5))
console.log(kthLargest.add(10))
console.log(kthLargest.add(9))
console.log(kthLargest.add(4))
