def knapsack(weights, values, capacity):
    n = len(weights)
    dp = []
    for i in range(n + 1):
        dp.append([0] * (capacity + 1))
    for i in range(1, n + 1):
        for w in range(capacity + 1):
            dp[i][w] = dp[i - 1][w]
            if weights[i - 1] <= w:
                candidate = values[i - 1] + dp[i - 1][w - weights[i - 1]]
                dp[i][w] = max(dp[i][w], candidate)
    chosen = []
    w = capacity
    for i in range(n, 0, -1):
        if dp[i][w] != dp[i - 1][w]:
            chosen.append(i - 1)
            w -= weights[i - 1]
    return [dp[n][capacity], chosen]

result = knapsack(weights, values, capacity)
