def extract(heap):
    a = heap[:]
    if len(a) == 0:
        return [None, a]
    maximum = a[0]
    last = a.pop()
    if len(a) == 0:
        return [maximum, a]
    a[0] = last
    root = 0
    while 2 * root + 1 < len(a):
        child = 2 * root + 1
        if child + 1 < len(a) and a[child + 1] > a[child]:
            child += 1
        if a[root] >= a[child]:
            break
        temporary = a[root]
        a[root] = a[child]
        a[child] = temporary
        root = child
    return [maximum, a]

result = extract(heap)
