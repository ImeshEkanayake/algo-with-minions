def greedy_colouring(adj):
    n = len(adj)
    colours = [None] * n
    for u in range(n):
        forbidden = [False] * n
        for v in adj[u]:
            if colours[v] is not None:
                forbidden[colours[v]] = True
        colour = 0
        while forbidden[colour]:
            colour += 1
        colours[u] = colour
    return colours

result = greedy_colouring(adj)
