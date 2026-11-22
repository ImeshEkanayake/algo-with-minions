def bitonic_peak(a):
    if len(a) == 0:
        return None
    lo = 0
    hi = len(a) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if a[mid] < a[mid + 1]:
            lo = mid + 1
        else:
            hi = mid
    return [lo, a[lo]]

result = bitonic_peak(a)
