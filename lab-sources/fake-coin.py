def find_lighter(weights):
    candidates = []
    for i in range(len(weights)):
        candidates.append(i)
    weighings = []
    while len(candidates) > 1:
        group = (len(candidates) + 1) // 3
        first = candidates[:group]
        second = candidates[group:2 * group]
        remaining = candidates[2 * group:]
        left_weight = 0
        right_weight = 0
        difference = 0
        for j in range(len(first)):
            left_weight += weights[first[j]]
            right_weight += weights[second[j]]
            difference += weights[first[j]] - weights[second[j]]
        weighings.append([first[:], second[:], left_weight, right_weight, difference])
        if difference < 0:
            candidates = first
        elif difference > 0:
            candidates = second
        else:
            candidates = remaining
    return [candidates[0], len(weighings)]

result = find_lighter(weights)
