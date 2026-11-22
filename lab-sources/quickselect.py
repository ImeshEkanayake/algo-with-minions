def quickselect(values, k):
    a = values[:]
    lo = 0
    hi = len(a) - 1
    target = k - 1
    while lo <= hi:
        pivot = a[hi]
        boundary = lo
        for j in range(lo, hi):
            if a[j] < pivot:
                temporary = a[boundary]
                a[boundary] = a[j]
                a[j] = temporary
                boundary += 1
        temporary = a[boundary]
        a[boundary] = a[hi]
        a[hi] = temporary
        if boundary == target:
            return a[boundary]
        if target < boundary:
            hi = boundary - 1
        else:
            lo = boundary + 1
    return None

result = quickselect(values, k)
