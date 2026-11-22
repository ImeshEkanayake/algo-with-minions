from types import SimpleNamespace

def make_node(keys, children):
    return SimpleNamespace(keys=keys, children=children)

def split(node):
    middle = len(node.keys) // 2
    promoted = node.keys.pop(middle)
    right = make_node([], [])
    while len(node.keys) > middle:
        right.keys.append(node.keys.pop(middle))
    while len(node.children) > middle + 1:
        right.children.append(node.children.pop(middle + 1))
    return [node, promoted, right]

def insert(node, key, order):
    if node is None:
        return make_node([key], [])
    index = 0
    while index < len(node.keys) and node.keys[index] < key:
        index += 1
    if index < len(node.keys) and node.keys[index] == key:
        return node
    if len(node.children) == 0:
        node.keys.insert(index, key)
    else:
        node.children[index] = insert(node.children[index], key, order)
        child = node.children[index]
        if len(child.keys) == order:
            parts = split(child)
            node.keys.insert(index, parts[1])
            node.children[index] = parts[0]
            node.children.insert(index + 1, parts[2])
    return node

def insert_root(root, key, order):
    root = insert(root, key, order)
    if len(root.keys) == order:
        parts = split(root)
        root = make_node([parts[1]], [parts[0], parts[2]])
    return root

def search(node, key):
    while node is not None:
        index = 0
        while index < len(node.keys) and node.keys[index] < key:
            index += 1
        if index < len(node.keys) and node.keys[index] == key:
            return node
        if len(node.children) == 0:
            return None
        node = node.children[index]
    return None

def maximum_key(node):
    while len(node.children) > 0:
        node = node.children[-1]
    return node.keys[-1]

def repair(parent, index, order):
    child = parent.children[index]
    minimum = (order + 1) // 2 - 1
    if len(child.keys) >= minimum:
        return
    if index > 0 and len(parent.children[index - 1].keys) > minimum:
        left = parent.children[index - 1]
        separator = parent.keys.pop(index - 1)
        replacement = left.keys.pop()
        parent.keys.insert(index - 1, replacement)
        child.keys.insert(0, separator)
        if len(left.children) > 0:
            child.children.insert(0, left.children.pop())
    elif index + 1 < len(parent.children) and len(parent.children[index + 1].keys) > minimum:
        right = parent.children[index + 1]
        separator = parent.keys.pop(index)
        replacement = right.keys.pop(0)
        parent.keys.insert(index, replacement)
        child.keys.append(separator)
        if len(right.children) > 0:
            child.children.append(right.children.pop(0))
    else:
        if index > 0:
            left = parent.children[index - 1]
            separator = parent.keys.pop(index - 1)
            left.keys.append(separator)
            while len(child.keys) > 0:
                left.keys.append(child.keys.pop(0))
            while len(child.children) > 0:
                left.children.append(child.children.pop(0))
            parent.children.pop(index)
        else:
            right = parent.children[index + 1]
            separator = parent.keys.pop(index)
            child.keys.append(separator)
            while len(right.keys) > 0:
                child.keys.append(right.keys.pop(0))
            while len(right.children) > 0:
                child.children.append(right.children.pop(0))
            parent.children.pop(index + 1)

def delete(node, key, order):
    if node is None:
        return None
    index = 0
    while index < len(node.keys) and node.keys[index] < key:
        index += 1
    if index < len(node.keys) and node.keys[index] == key:
        if len(node.children) == 0:
            node.keys.pop(index)
        else:
            replacement = maximum_key(node.children[index])
            node.children[index] = delete(node.children[index], replacement, order)
            node.keys[index] = replacement
            repair(node, index, order)
    elif len(node.children) > 0:
        node.children[index] = delete(node.children[index], key, order)
        repair(node, index, order)
    return node

def delete_root(root, key, order):
    root = delete(root, key, order)
    if root is not None and len(root.keys) == 0:
        if len(root.children) == 0:
            return None
        return root.children[0]
    return root

def traverse(node, output, mode):
    if node is None:
        return
    if mode == "preorder":
        for value in node.keys:
            output.append(value)
    for index in range(len(node.keys)):
        if len(node.children) > 0:
            traverse(node.children[index], output, mode)
        if mode == "inorder":
            output.append(node.keys[index])
    if len(node.children) > 0:
        traverse(node.children[-1], output, mode)
    if mode == "postorder":
        for value in node.keys:
            output.append(value)
