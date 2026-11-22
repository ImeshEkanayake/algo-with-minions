def topological(adj):
    n = len(adj)
    indegree = [0] * n
    for u in range(n):
        for v in adj[u]:
            indegree[v] += 1
    queue = []
    for u in range(n):
        if indegree[u] == 0:
            queue.append(u)
    output = []
    head = 0
    while head < len(queue):
        u = queue[head]
        head += 1
        output.append(u)
        for v in adj[u]:
            indegree[v] -= 1
            if indegree[v] == 0:
                queue.append(v)
    cycle = len(output) != n
    return [output, cycle]

result = topological(adj)
