def warshall(weight):
    n = len(weight)
    reach = []
    for i in range(n):
        row = []
        for j in range(n):
            row.append(i == j or weight[i][j] is not None)
        reach.append(row)
    for k in range(n):
        for i in range(n):
            for j in range(n):
                reach[i][j] = reach[i][j] or (reach[i][k] and reach[k][j])
    return reach

result = warshall(weight)
