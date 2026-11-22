def grow_hash(values, sizes, threshold):
    size_index = 0
    size = sizes[size_index]
    table = [None] * size
    count = 0
    rehashes = 0
    old_table = []
    for key in values:
        present = False
        for existing in table:
            if existing == key:
                present = True
        if not present:
            if count + 1 > size * threshold:
                old_table = table
                size_index += 1
                size = sizes[size_index]
                table = [None] * size
                for existing in old_table:
                    if existing is not None:
                        slot = existing % size
                        while table[slot] is not None:
                            slot = (slot + 1) % size
                        table[slot] = existing
                rehashes += 1
            slot = key % size
            while table[slot] is not None:
                slot = (slot + 1) % size
            table[slot] = key
            count += 1
    return [table, rehashes]

result = grow_hash(values, sizes, threshold)
