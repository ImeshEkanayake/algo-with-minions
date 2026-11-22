def bfs(adj, source):
    n = len(adj)
    visited = [False] * n
    parent = [None] * n
    distance = [None] * n
    component = [None] * n
    output = []
    roots = []
    if n > 0:
        roots.append(source)
    for vertex in range(n):
        if vertex != source:
            roots.append(vertex)
    for start in roots:
        if not visited[start]:
            queue = [start]
            visited[start] = True
            distance[start] = 0
            component[start] = start
            head = 0
            while head < len(queue):
                u = queue[head]
                head += 1
                output.append(u)
                for v in adj[u]:
                    if not visited[v]:
                        visited[v] = True
                        parent[v] = u
                        distance[v] = distance[u] + 1
                        component[v] = start
                        queue.append(v)
    return [output, parent, distance, component]

result = bfs(adj, source)
