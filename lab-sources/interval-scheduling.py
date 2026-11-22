def schedule(intervals):
    ordered = []
    for i in range(len(intervals)):
        ordered.append([intervals[i][1], intervals[i][0], i])
    ordered = sorted(ordered)
    chosen = []
    last_end = float("-inf")
    for interval in ordered:
        end = interval[0]
        start = interval[1]
        index = interval[2]
        if start >= last_end:
            chosen.append(index)
            last_end = end
    return chosen

result = schedule(intervals)
