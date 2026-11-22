def insert(heap, key):
    a = heap[:]
    a.append(key)
    i = len(a) - 1
    while i > 0:
        parent = (i - 1) // 2
        if a[parent] >= a[i]:
            break
        temporary = a[parent]
        a[parent] = a[i]
        a[i] = temporary
        i = parent
    return a

result = insert(heap, key)
