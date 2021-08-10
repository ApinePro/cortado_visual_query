import itertools

def generate_variants_naive(variant):
    if 'follows' in variant:
        lst = list(itertools.product(*[generate_variants_naive(v) for v in variant['follows']]))
        return [[a for g in vv for a in g] for vv in lst]
    elif 'parallel' in variant:
        activities = get_all_activities(variant, set())
        return itertools.permutations(activities)
    else:
        return itertools.permutations(variant['leaf'])

def get_all_activities(variant, activities=set()):
    if 'leaf' in variant:
        activities.update(variant['leaf'])
    elif 'follows' in variant:
        for v in variant['follows']:
            get_all_activities(v, activities)
    elif 'parallel' in variant:
        for v in variant['parallel']:
            get_all_activities(v, activities)
    return activities

def generate_variants(variant):
    if 'follows' in variant:
        v = [generate_variants(v) for v in variant['follows']]
        v = list(itertools.product(*v))
        return [[a for g in vv for a in g] for vv in v]
    elif 'parallel' in variant:
        v = [generate_variants(vv) for vv in variant['parallel']]
        v = [[ee for e in vv for ee in e] for vv in v]
        v = itertools.permutations(v)
        v = [[ee for e in vv for ee in e] for vv in v]
        return v
    else:
        return itertools.permutations(variant['leaf'])