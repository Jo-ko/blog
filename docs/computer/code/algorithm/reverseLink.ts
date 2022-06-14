interface ListNode {
    val: number,
    next: ListNode | null,
}

// 需要将一段链表进行反转
// 1 -> 2 -> 3 -> null => null <- 1 <- 2 <- 3

function reverseLinkByIteration(head: ListNode) {
    let prev = null; // 待被指向的node
    let current = head; // 当前遍历到的node
    while(current) {
        const next = current.next;
        current.next = prev;
        prev = current;
        current = next;
    }
    return prev;
}

function reverseLinkByRecursive(head: ListNode) {
    if (head === null || head.next === null) {
        return head;
    }

    const newNode = reverseLinkByIteration(head.next);
    head.next.next = head;
    head.next = null;
    return newNode;
}

function swapPairs(head: ListNode) {
    let newHead = head.next ? head.next : head;
    let current = head;

    while (head.next) {
        const next = head.next.next;
        current.next.next = current;
    }

    return newHead
}
