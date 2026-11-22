def open_address(operations, size):
    table = [None] * size
    log = []
    for entry in operations:
        operation = entry[0]
        key = entry[1]
        first_deleted = -1
        available = -1
        found = -1
        probes = []
        for probe in range(size):
            slot = (key % size + probe) % size
            probes.append(slot)
            if table[slot] is None:
                available = slot
                break
            if table[slot] == "deleted":
                if first_deleted == -1:
                    first_deleted = slot
            elif table[slot] == key:
                found = slot
                break
        status = "not found"
        if operation == "insert":
            if found != -1:
                status = "already present"
            else:
                if first_deleted != -1:
                    available = first_deleted
                if available != -1:
                    table[available] = key
                    status = "inserted"
                else:
                    status = "no reachable slot"
        elif operation == "delete":
            if found != -1:
                table[found] = "deleted"
                status = "deleted"
        elif found != -1:
            status = "found"
        log.append([operation, key, probes[:], status])
    return [table, log]

result = open_address(operations, size)
