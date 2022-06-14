import {MaxHeap} from "./heap";

function maxSlidingWindow(nums: number[], k: number): Array<number> {
    if (nums.length < k || nums.length === 0) return [];
    const deque = [];
    for (let i = 0; i < k; i++) {
        while (deque.length && nums[i] >= nums[deque[deque.length - 1]]) {
            deque.pop();
        }
        deque.push(i);
    }
    const res = [nums[deque[0]]];
    for (let i = k; i < nums.length; i++) {
        while (deque.length && nums[i] >= nums[deque[deque.length - 1]]) {
            deque.pop();
        }
        if (deque.length && deque[0] < i - k) {
            deque.shift();
        }
        deque.push(i);
        res.push(nums[deque[0]])
    }
    return res;
}


console.log(maxSlidingWindow([1,3,2,0,2,5,7,9], 2))
