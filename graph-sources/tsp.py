def extend(weight, source, path, visited, cost, best):
    u = path[-1]
    if len(path) == len(weight):
        if weight[u][source] is not None:
            total = cost + weight[u][source]
            if total < best[0]:
                best[0] = total
                best[1] = path[:] + [source]
        return
    for v in range(len(weight)):
        if not visited[v] and weight[u][v] is not None:
            visited[v] = True
            path.append(v)
            extend(weight, source, path, visited, cost + weight[u][v], best)
            path.pop()
            visited[v] = False

def tsp(weight, source):
    n = len(weight)
    best = [float("inf"), []]
    if n == 0:
        return best
    if n == 1:
        return [0, [source]]
    visited = [False] * n
    visited[source] = True
    path = [source]
    extend(weight, source, path, visited, 0, best)
    return best

result = tsp(weight, source)
