def dijkstra(weight, source):
    n = len(weight)
    INF = float("inf")
    distance = [INF] * n
    parent = [None] * n
    settled = [False] * n
    if n > 0:
        distance[source] = 0
    for turn in range(n):
        u = -1
        for v in range(n):
            if not settled[v]:
                if u == -1 or distance[v] < distance[u]:
                    u = v
        if u == -1 or distance[u] == INF:
            break
        settled[u] = True
        for v in range(n):
            if weight[u][v] is not None and not settled[v]:
                candidate = distance[u] + weight[u][v]
                if candidate < distance[v]:
                    distance[v] = candidate
                    parent[v] = u
    return [distance, parent]

result = dijkstra(weight, source)
