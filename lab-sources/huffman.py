def assign(node, prefix, left, right, codes):
    if left[node] == -1:
        if prefix == "":
            prefix = "0"
        codes[node] = prefix
    else:
        assign(left[node], prefix + "0", left, right, codes)
        assign(right[node], prefix + "1", left, right, codes)

def huffman(frequencies):
    weights = frequencies[:]
    left = [-1] * len(weights)
    right = [-1] * len(weights)
    codes = [""] * len(weights)
    queue = []
    for i in range(len(weights)):
        queue.append([weights[i], i])
    while len(queue) > 1:
        queue = sorted(queue)
        first = queue.pop(0)
        second = queue.pop(0)
        node = len(weights)
        weights.append(first[0] + second[0])
        left.append(first[1])
        right.append(second[1])
        queue.append([weights[node], node])
    root = -1
    if len(queue) > 0:
        root = queue[0][1]
        assign(root, "", left, right, codes)
    cost = 0
    for i in range(len(frequencies)):
        cost += frequencies[i] * len(codes[i])
    return [codes, cost]

result = huffman(frequencies)
