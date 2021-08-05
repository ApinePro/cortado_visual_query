cache = {}

def get(key, getter):
    if key in cache:
        return cache[key]
    else:
        v = getter()
        cache[key] = v
        return v