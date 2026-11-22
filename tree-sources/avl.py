from types import SimpleNamespace

def make_node(key):
    return SimpleNamespace(key=key, left=None, right=None, height=0)

def height(node):
    if node is None:
        return -1
    return node.height

def update(node):
    node.height = 1 + max(height(node.left), height(node.right))

def balance(node):
    return height(node.left) - height(node.right)

def rotate_left(node):
    pivot = node.right
    beta = pivot.left
    node.right = beta
    pivot.left = node
    update(node)
    update(pivot)
    return pivot

def rotate_right(node):
    pivot = node.left
    beta = pivot.right
    node.left = beta
    pivot.right = node
    update(node)
    update(pivot)
    return pivot

def rebalance(node):
    if node is None:
        return None
    update(node)
    factor = balance(node)
    if factor > 1:
        if balance(node.left) < 0:
            node.left = rotate_left(node.left)
        return rotate_right(node)
    if factor < -1:
        if balance(node.right) > 0:
            node.right = rotate_right(node.right)
        return rotate_left(node)
    return node

def insert(node, key):
    if node is None:
        return make_node(key)
    if key < node.key:
        node.left = insert(node.left, key)
    elif key > node.key:
        node.right = insert(node.right, key)
    else:
        return node
    return rebalance(node)

def search(node, key):
    while node is not None:
        if key == node.key:
            return node
        if key < node.key:
            node = node.left
        else:
            node = node.right
    return None

def minimum(node):
    while node.left is not None:
        node = node.left
    return node

def remove_min(node):
    if node.left is None:
        return node.right
    node.left = remove_min(node.left)
    return rebalance(node)

def delete(node, key):
    if node is None:
        return None
    if key < node.key:
        node.left = delete(node.left, key)
    elif key > node.key:
        node.right = delete(node.right, key)
    else:
        if node.left is None:
            return node.right
        if node.right is None:
            return node.left
        successor = minimum(node.right)
        node.right = remove_min(node.right)
        successor.left = node.left
        successor.right = node.right
        node = successor
    return rebalance(node)

def traverse(node, output, mode):
    if node is None:
        return
    if mode == "preorder":
        output.append(node.key)
    traverse(node.left, output, mode)
    if mode == "inorder":
        output.append(node.key)
    traverse(node.right, output, mode)
    if mode == "postorder":
        output.append(node.key)
