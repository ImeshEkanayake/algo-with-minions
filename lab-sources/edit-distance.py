def edit_distance(first, second):
    m = len(first)
    n = len(second)
    dp = []
    for i in range(m + 1):
        dp.append([0] * (n + 1))
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            cost = 0
            if first[i - 1] != second[j - 1]:
                cost = 1
            dp[i][j] = min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
    path = []
    i = m
    j = n
    while i > 0 or j > 0:
        if i > 0 and j > 0 and first[i - 1] == second[j - 1]:
            path.append([i, j, "match"])
            i -= 1
            j -= 1
        elif i > 0 and j > 0 and dp[i][j] == dp[i - 1][j - 1] + 1:
            path.append([i, j, "replace"])
            i -= 1
            j -= 1
        elif i > 0 and dp[i][j] == dp[i - 1][j] + 1:
            path.append([i, j, "delete"])
            i -= 1
        else:
            path.append([i, j, "insert"])
            j -= 1
    return [dp[m][n], path]

result = edit_distance(first, second)
