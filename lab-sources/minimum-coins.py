def minimum_coins(coins, amount):
    dp = [float("inf")] * (amount + 1)
    previous = [-1] * (amount + 1)
    dp[0] = 0
    for value in range(1, amount + 1):
        for coin in coins:
            if coin <= value and dp[value - coin] + 1 < dp[value]:
                dp[value] = dp[value - coin] + 1
                previous[value] = coin
    if dp[amount] == float("inf"):
        return [-1, []]
    chosen = []
    value = amount
    while value > 0:
        chosen.append(previous[value])
        value -= previous[value]
    return [dp[amount], chosen]

result = minimum_coins(coins, amount)
