def explore(i, weights, values, capacity, weight, value, chosen, best):
    if i == len(weights):
        if value > best[0]:
            best[0] = value
            best[1] = chosen[:]
        return
    explore(i + 1, weights, values, capacity, weight, value, chosen, best)
    if weight + weights[i] <= capacity:
        chosen.append(i)
        explore(i + 1, weights, values, capacity, weight + weights[i], value + values[i], chosen, best)
        chosen.pop()

def knapsack(weights, values, capacity):
    best = [0, []]
    chosen = []
    explore(0, weights, values, capacity, 0, 0, chosen, best)
    return best

result = knapsack(weights, values, capacity)
