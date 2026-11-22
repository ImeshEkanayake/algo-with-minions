def coin_row(coins):
    n = len(coins)
    dp = [0] * (n + 1)
    if n > 0:
        dp[1] = max(0, coins[0])
    for i in range(2, n + 1):
        dp[i] = max(dp[i - 1], dp[i - 2] + coins[i - 1])
    chosen = []
    i = n
    while i > 0:
        if i == 1:
            if dp[1] > 0:
                chosen.append(0)
            i = 0
        elif dp[i] == dp[i - 1]:
            i -= 1
        else:
            chosen.append(i - 1)
            i -= 2
    return [dp[n], chosen]

result = coin_row(coins)
