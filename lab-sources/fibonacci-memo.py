def visit(n, memo):
    if memo[n] != -1:
        return memo[n]
    if n < 2:
        memo[n] = n
    else:
        memo[n] = visit(n - 1, memo) + visit(n - 2, memo)
    return memo[n]

def fibonacci(n):
    memo = [-1] * (n + 1)
    answer = visit(n, memo)
    return answer

result = fibonacci(n)
