def chaining(operations, size):
    table = []
    for slot in range(size):
        table.append([])
    log = []
    for entry in operations:
        operation = entry[0]
        key = entry[1]
        slot = key % size
        bucket = table[slot]
        found = -1
        for j in range(len(bucket)):
            if bucket[j] == key:
                found = j
                break
        if operation == "insert":
            if found == -1:
                bucket.append(key)
                status = "inserted"
            else:
                status = "already present"
        elif operation == "delete":
            if found != -1:
                bucket.pop(found)
                status = "deleted"
            else:
                status = "not found"
        else:
            status = "not found"
            if found != -1:
                status = "found"
        log.append([operation, key, slot, status])
    return [table, log]

result = chaining(operations, size)
