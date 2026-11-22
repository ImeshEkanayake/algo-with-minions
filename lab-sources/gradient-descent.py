def gradient_descent(a, b, c, x, rate, iterations, tolerance):
    points = [[x, a * x * x + b * x + c]]
    for step in range(iterations):
        gradient = 2 * a * x + b
        if abs(gradient) <= tolerance:
            return [x, True, "converged", points]
        previous_x = x
        x = x - rate * gradient
        if abs(x) > 1000000000:
            return [previous_x, False, "diverged", points]
        points.append([x, a * x * x + b * x + c])
    return [x, abs(2 * a * x + b) <= tolerance, "iteration limit", points]

result = gradient_descent(a, b, c, x, rate, iterations, tolerance)
