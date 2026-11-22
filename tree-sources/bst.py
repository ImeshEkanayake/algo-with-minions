from types import SimpleNamespace

def make_node(key):
    return SimpleNamespace(key=key, left=None, right=None)

def insert(node, key):
    if node is None:
        return make_node(key)
    if key < node.key:
        node.left = insert(node.left, key)
    elif key > node.key:
        node.right = insert(node.right, key)
    return node

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
    return node

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
    return node

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
