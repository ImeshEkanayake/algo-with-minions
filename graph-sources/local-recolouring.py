def improve_colouring(adj, edges, colours, k):
    n = len(adj)
    conflict_count = 0
    for edge in edges:
        if colours[edge[1]] == colours[edge[2]]:
            conflict_count += 1
    while conflict_count > 0:
        best_count = conflict_count
        best_u = -1
        best_colour = -1
        for u in range(n):
            for colour in range(k):
                if colour != colours[u]:
                    candidate = conflict_count
                    for v in adj[u]:
                        if colours[v] == colours[u]:
                            candidate -= 1
                        if colours[v] == colour:
                            candidate += 1
                    if candidate < best_count:
                        best_count = candidate
                        best_u = u
                        best_colour = colour
        if best_u == -1:
            break
        colours[best_u] = best_colour
        conflict_count = best_count
    return [colours, conflict_count]

result = improve_colouring(adj, edges, initial_colours[:], k)
