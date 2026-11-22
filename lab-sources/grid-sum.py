def grid_sum(grid, maximize):
    m = len(grid)
    if m == 0:
        return [None, []]
    n = len(grid[0])
    dp = []
    parent = []
    for i in range(m):
        dp.append([0] * n)
        parent.append([-1] * n)
    for i in range(m):
        for j in range(n):
            if i == 0 and j == 0:
                dp[i][j] = grid[i][j]
            elif i == 0:
                dp[i][j] = dp[i][j - 1] + grid[i][j]
                parent[i][j] = 1
            elif j == 0:
                dp[i][j] = dp[i - 1][j] + grid[i][j]
                parent[i][j] = 0
            else:
                take_up = dp[i - 1][j] <= dp[i][j - 1]
                if maximize:
                    take_up = dp[i - 1][j] >= dp[i][j - 1]
                if take_up:
                    dp[i][j] = dp[i - 1][j] + grid[i][j]
                    parent[i][j] = 0
                else:
                    dp[i][j] = dp[i][j - 1] + grid[i][j]
                    parent[i][j] = 1
    path = []
    i = m - 1
    j = n - 1
    while i >= 0 and j >= 0:
        path.append([i, j])
        if i == 0 and j == 0:
            break
        if parent[i][j] == 0:
            i -= 1
        else:
            j -= 1
    return [dp[m - 1][n - 1], path]

result = grid_sum(grid, maximize)
