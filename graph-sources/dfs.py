def visit(adj, u, visited, parent, output, finished):
    visited[u] = True
    output.append(u)
    for v in adj[u]:
        if not visited[v]:
            parent[v] = u
            visit(adj, v, visited, parent, output, finished)
    finished.append(u)

def dfs(adj, source):
    n = len(adj)
    visited = [False] * n
    parent = [None] * n
    output = []
    finished = []
    roots = []
    if n > 0:
        roots.append(source)
    for vertex in range(n):
        if vertex != source:
            roots.append(vertex)
    for start in roots:
        if not visited[start]:
            visit(adj, start, visited, parent, output, finished)
    return [output, parent, finished]

result = dfs(adj, source)
