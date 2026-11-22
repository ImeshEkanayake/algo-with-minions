def sift_down(a, root):
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

def build_heap(values):
    a = values[:]
    for root in range(len(a) // 2 - 1, -1, -1):
        sift_down(a, root)
    return a

result = build_heap(values)
