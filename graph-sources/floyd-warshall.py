def floyd_warshall(weight):
    n = len(weight)
    INF = float("inf")
    distance = []
    for i in range(n):
        row = []
        for j in range(n):
            value = INF
            if weight[i][j] is not None:
                value = weight[i][j]
            if i == j:
                value = min(value, 0)
            row.append(value)
        distance.append(row)
    for k in range(n):
        for i in range(n):
            for j in range(n):
                candidate = distance[i][k] + distance[k][j]
                if candidate < distance[i][j]:
                    distance[i][j] = candidate
    negative = []
    for k in range(n):
        if distance[k][k] < 0:
            negative.append(k)
    return [distance, negative]

result = floyd_warshall(weight)
