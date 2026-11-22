def newton(a, b, c, x, iterations, tolerance):
    points = [[x, a * x * x + b * x + c]]
    for step in range(iterations):
        value = a * x * x + b * x + c
        if abs(value) <= tolerance:
            return [x, True, "converged", points]
        derivative = 2 * a * x + b
        if abs(derivative) <= 0.000000000001:
            return [x, False, "zero derivative", points]
        previous_x = x
        x = x - value / derivative
        if abs(x) > 1000000000:
            return [previous_x, False, "diverged", points]
        points.append([x, a * x * x + b * x + c])
    return [x, abs(a * x * x + b * x + c) <= tolerance, "iteration limit", points]

result = newton(a, b, c, x, iterations, tolerance)
