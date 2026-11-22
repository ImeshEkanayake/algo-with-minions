def extrema(a, lo, hi):
    if lo == hi:
        return [a[lo], a[lo]]
    if hi == lo + 1:
        if a[lo] <= a[hi]:
            return [a[lo], a[hi]]
        return [a[hi], a[lo]]
    mid = (lo + hi) // 2
    first = extrema(a, lo, mid)
    second = extrema(a, mid + 1, hi)
    return [min(first[0], second[0]), max(first[1], second[1])]

def minmax(a):
    if len(a) == 0:
        return None
    return extrema(a, 0, len(a) - 1)

result = minmax(a)
