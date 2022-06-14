type NumberArray = number[];

function findMedianSortedArrays(nums1: NumberArray, nums2: NumberArray) {
    const total = nums1.length + nums2.length;
    if (total % 2) {
        const k = Math.ceil(total / 2);
        return findK(k, nums1, nums2);
    } else {
        const k1 = total / 2;
        const k2 = k1 + 1;
        return ((findK(k1, nums1, nums2) + findK(k2, nums1, nums2)) / 2).toFixed(1);
    }
}

function findK(k: number, nums1: NumberArray, nums2: NumberArray): number {
    const length1 = nums1.length;
    const length2 = nums2.length;
    let index1 = 0;
    let index2 = 0;
    let halfK = 0;

    while (true) {
        if (index1 === nums1.length) return nums2[index2 + k - 1];
        if (index2 === nums2.length) return nums1[index1 + k - 1];
        if (k === 1) return Math.min(nums1[index1], nums2[index2]);

        halfK = Math.floor(k / 2);
        const newIndex1 = Math.min(index1 + k, length1) - 1;
        const newIndex2 = Math.min(index2 + k, length2) - 1;
        if (nums1[newIndex1] > nums2[newIndex2]) {
            k -= newIndex2 - index2 + 1;
            index2 = newIndex2 + 1;
        } else {
            k -= newIndex1 - index1 + 1;
            index1 = newIndex1 + 1;
        }
    }
}
