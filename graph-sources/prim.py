def prim(weight, source):
    n = len(weight)
    INF = float("inf")
    key = [INF] * n
    parent = [None] * n
    settled = [False] * n
    chosen = []
    total = 0
    for turn in range(n):
        u = -1
        for v in range(n):
            if not settled[v]:
                if u == -1 or key[v] < key[u]:
                    u = v
        if key[u] == INF:
            if turn == 0:
                u = source
            key[u] = 0
        settled[u] = True
        if parent[u] is not None:
            chosen.append([parent[u], u])
            total += key[u]
        for v in range(n):
            if weight[u][v] is not None and not settled[v]:
                if weight[u][v] < key[v]:
                    key[v] = weight[u][v]
                    parent[v] = u
    return [chosen, total, parent]

result = prim(weight, source)
