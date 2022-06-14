interface ListNode {
    val: number,
    next: ListNode | null,
}

function swapPairsByIteration(head: ListNode) {
    const virtualHead: ListNode = {
        val: 0,
        next: head,
    };
    let temp = virtualHead;
    // o -> a -> b -> c -> d -> e
    while (head.next && head.next.next) {
        let left = head.next;
        let right = head.next.next;
        temp.next = right;
        left.next = right.next;
        right.next = left;
        temp = left;
    }
    return virtualHead.next;
}

function swapPairsByRecursive(head: ListNode) {
    if (head === null || head.next === null) {
        return head;
    }
    // a -> b -> c -> d -> e
    const nexHead = head.next;
    head.next.next = head;
    head.next = swapPairsByIteration(nexHead);
    return nexHead;
}
