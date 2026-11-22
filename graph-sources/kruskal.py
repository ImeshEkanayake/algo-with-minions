def find(parent, u):
    while parent[u] != u:
        u = parent[u]
    return u

def kruskal(edges, n):
    parent = []
    rank = [0] * n
    for u in range(n):
        parent.append(u)
    chosen = []
    total = 0
    ordered = sorted(edges)
    for edge in ordered:
        w = edge[0]
        u = edge[1]
        v = edge[2]
        a = find(parent, u)
        b = find(parent, v)
        if a != b:
            chosen.append([u, v])
            total += w
            if rank[a] < rank[b]:
                parent[a] = b
            else:
                parent[b] = a
                if rank[a] == rank[b]:
                    rank[a] += 1
    return [chosen, total, parent]

result = kruskal(edges, n)
