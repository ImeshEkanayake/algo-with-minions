def gcd(a, b):
    a = abs(a)
    b = abs(b)
    divisions = []
    while b != 0:
        quotient = a // b
        remainder = a % b
        divisions.append([a, b, quotient, remainder])
        a = b
        b = remainder
    return a

result = gcd(a, b)
