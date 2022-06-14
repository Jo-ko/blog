function threeSum(nums: number[]) {
    let result = [];
    nums = nums.sort((a, b) => a - b);
    const length = nums.length;
    for (let i = 0; i < length; i++) {
        if ( i !== 0 && nums[i] === nums[i - 1]) continue;
        let left = i + 1;
        let right = length - 1;
        const target = 0 - nums[i];
        while (left < right) {
            if (nums[left] + nums[right] === target) result.push(nums[i], nums[left], nums[right]);
            if (nums[left] + nums[right] > target) {
                let mo = 1;
                while(left < right - mo && nums[right] === nums[right - mo]) mo++;
                right -= mo;
            } else {
                let mo = 1;
                while(left + mo < right && nums[left] === nums[left + mo]) mo++;
                left += mo;
            }
        }
    }
    return result;
}
