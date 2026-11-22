def build(a, lo, hi, left, right):
    if lo > hi:
        return -1
    mid = (lo + hi) // 2
    left[mid] = build(a, lo, mid - 1, left, right)
    right[mid] = build(a, mid + 1, hi, left, right)
    return mid

def balanced_tree(a):
    left = [-1] * len(a)
    right = [-1] * len(a)
    root = build(a, 0, len(a) - 1, left, right)
    return [root, left, right]

result = balanced_tree(a)
