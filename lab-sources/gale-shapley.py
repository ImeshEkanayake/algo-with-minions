def stable_matching(proposers, receivers):
    n = len(proposers)
    rank = []
    for r in range(n):
        rank.append([0] * n)
        for position in range(n):
            rank[r][receivers[r][position]] = position
    partner = [-1] * n
    next_choice = [0] * n
    free = []
    for p in range(n):
        free.append(p)
    head = 0
    proposals = []
    while head < len(free):
        p = free[head]
        head += 1
        r = proposers[p][next_choice[p]]
        next_choice[p] += 1
        incumbent = partner[r]
        accepted = False
        if incumbent == -1:
            partner[r] = p
            accepted = True
        elif rank[r][p] < rank[r][incumbent]:
            partner[r] = p
            free.append(incumbent)
            accepted = True
        else:
            free.append(p)
        proposals.append([p, r, accepted])
    matches = [-1] * n
    for r in range(n):
        matches[partner[r]] = r
    return matches

result = stable_matching(proposers, receivers)
