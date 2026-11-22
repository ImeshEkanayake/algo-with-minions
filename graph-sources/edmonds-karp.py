def find_path(residual, source, sink):
    n = len(residual)
    parent = [None] * n
    parent[source] = source
    queue = [source]
    while queue and parent[sink] is None:
        u = queue.pop(0)
        for v in range(n):
            if parent[v] is None and residual[u][v] > 0:
                parent[v] = u
                queue.append(v)
    return parent

def max_flow(capacity, source, sink):
    n = len(capacity)
    flow = []
    residual = []
    for u in range(n):
        flow.append([0] * n)
        residual.append(capacity[u][:])
    value = 0
    if n == 0:
        return [0, flow, residual, []]
    while True:
        parent = find_path(residual, source, sink)
        if parent[sink] is None:
            break
        delta = float("inf")
        v = sink
        path = [sink]
        while v != source:
            u = parent[v]
            delta = min(delta, residual[u][v])
            v = u
            path.insert(0, v)
        v = sink
        while v != source:
            u = parent[v]
            flow[u][v] += delta
            flow[v][u] -= delta
            residual[u][v] -= delta
            residual[v][u] += delta
            v = u
        value += delta
    reachable = [False] * n
    reachable[source] = True
    queue = [source]
    while queue:
        u = queue.pop(0)
        for v in range(n):
            if not reachable[v] and residual[u][v] > 0:
                reachable[v] = True
                queue.append(v)
    return [value, flow, residual, reachable]

result = max_flow(capacity, source, sink)
