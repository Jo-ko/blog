import * as assert from "assert";

class Difference {
    diff: number[];

    constructor(nums: number[]) {
        if (nums.length) {
            this.diff = new Array(nums.length).fill(0);
            this.diff[0] = nums[0];
            for (let i = 1; i < nums.length; i++) {
                this.diff[i] = nums[i] - nums[i - 1];
            }
        }
    }

    change(i: number, j: number, value: number) {
        this.diff[i] += value;
        if (j + 1 < this.diff.length) {
            this.diff[j + 1]  -= value;
        }
    }

    result() {
        const result = [];
        result[0] = this.diff[0];
        for (let i = 1; i < this.diff.length; i++) {
            result[i] = result[i - 1] + this.diff[i];
        }
        return result;
    }
}


function getModifiedArray (length: number, updates: number[][]) {
    const nums = new Array(length).fill(0);
    const df = new Difference(nums);

    for (const update of updates) {
        df.change(update[0], update[1], update[2]);
    }
    console.log(df.result());

    return df.result();
}

getModifiedArray(5, [[1,3,2], [2,4,3], [0,2,-2]])
