def rectangle_sum(grid, r1, c1, r2, c2):
    m = len(grid)
    if m == 0:
        return [0, [[0]]]
    n = len(grid[0])
    prefix = []
    for i in range(m + 1):
        prefix.append([0] * (n + 1))
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            prefix[i][j] = grid[i - 1][j - 1] + prefix[i - 1][j] + prefix[i][j - 1] - prefix[i - 1][j - 1]
    answer = prefix[r2 + 1][c2 + 1] - prefix[r1][c2 + 1] - prefix[r2 + 1][c1] + prefix[r1][c1]
    return [answer, prefix]

result = rectangle_sum(grid, r1, c1, r2, c2)
