def count_paths(grid):
    m = len(grid)
    if m == 0:
        return 0
    n = len(grid[0])
    dp = []
    for i in range(m):
        dp.append([0] * n)
    for i in range(m):
        for j in range(n):
            if grid[i][j] == 1:
                dp[i][j] = 0
            elif i == 0 and j == 0:
                dp[i][j] = 1
            else:
                if i > 0:
                    dp[i][j] += dp[i - 1][j]
                if j > 0:
                    dp[i][j] += dp[i][j - 1]
    return dp[m - 1][n - 1]

result = count_paths(grid)
