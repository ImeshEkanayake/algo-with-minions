def height(node, left, right):
    if node == -1:
        return 0
    first = height(left[node], left, right)
    second = height(right[node], left, right)
    return 1 + max(first, second)

result = height(root, left, right)
