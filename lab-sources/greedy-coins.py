def greedy_change(coins, amount):
    ordered = sorted(coins)
    chosen = []
    remaining = amount
    for i in range(len(ordered) - 1, -1, -1):
        coin = ordered[i]
        while coin <= remaining:
            chosen.append(coin)
            remaining -= coin
    return [chosen, remaining]

result = greedy_change(coins, amount)
