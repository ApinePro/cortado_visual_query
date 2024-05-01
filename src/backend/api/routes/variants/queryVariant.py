import cache.cache as cache
from endpoints.query_variant import evaluate_query_against_variant_graphs
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Any

router = APIRouter(tags=["variantQuery"], prefix="/variantQuery")


class variantQuery(BaseModel):
    queryString: str

class graphicalVariantQuery(BaseModel):
    queryTree: Any = None


@router.post("/variant-query")
def variant_query(query: variantQuery):
    res = evaluate_query_against_variant_graphs(
        query, cache.variants, cache.parameters["activites"]
    )

    for bid in res["ids"]:
        print(cache.variants[bid][0])

    return res




@router.post("/graphical-variant-query")
def graphical_variant_query(graphical_query: graphicalVariantQuery):
    res = []
    print(graphical_query)
    #print(cache.variants.items())
    query = deserialize_query(graphical_query)
    variant_list = []
    for bid, (variant, _, _, info) in cache.variants.items():
        #if check_node(query, variant):
        #    res.append(bid + 1)
        #print("")
        #print(check_node(query ,variant))
        variant_list.append(variant)
    check_all_variant(query, variant_list)
    
    '''
    res = {
        "startActivities": start_activities,
        "endActivities": end_activities,
        "activities": nActivities,
        "variants": res_variants,
        "performanceInfoAvailable": cache.cache.parameters["lifecycle_available"],
        "timeGranularity": cache.cache.parameters["cur_time_granularity"],
    }
    '''

    return {"res": res}

def deserialize_query(graphical_query):
    query_tree = {}
    graphical_query = graphical_query.queryTree
    if "pattern" in graphical_query:
        query_tree["pattern"] = graphical_query["pattern"]
    query_tree["operator"] = graphical_query["operator"]
    query_tree["negation"] = graphical_query["negation"]
    query_tree["children"] = [c for c in graphical_query["children"]]
    return query_tree

def check_node(node, variant):
    result = True
    if node["operator"] == 'AND':
        for child in node["children"]: 
            result = result & check_node(child)
    if node["operator"] == 'OR':
        for child in node["children"]: 
            result = result | check_node(child)
    if node["operator"] == 'X':
        result = pattern_match_variant(node["pattern"], variant.serialize())
    if node["negation"] == True:
        return not result
    else:
        return result

############################################################

def pattern_match_variant(pattern, variant):
    if len(pattern) == 0 and len(variant) == 0: # check for []
        return True
    elif len(pattern) == 0 and len(variant) != 0:
        return False
    elif len(pattern) != 0 and len(variant) == 0: #?
        return False
    
    if "follows" in pattern and len(pattern["follows"]) == 1 and not check_have_cardi(pattern):
        pattern = pattern["follows"][0]
    if "follows" in variant and len(variant["follows"]) == 1:
        variant = variant["follows"][0]

    p_head = find_head(pattern) #seq with cardi, leaf, para
    v_head = find_head(variant)
    p_body = cut_head(pattern)
    v_body = cut_head(variant)

    if check_have_cardi(p_head) and p_head["horizontalCardi"] > 0:
        pattern = add_head_cardinality(pattern, -1)
          
        if p_head["horizontalCardiOp"] == '<':
            if p_head["horizontalCardi"] == 0:
                pattern = replace_head(pattern, p_head) # Remove the cardinality characteristics of the head
            else:   
                pattern = add_head(pattern, p_head)
            result =  pattern_match_variant(pattern, variant)
            if result:
                return result
            if not result: # Another chance: should it match at least once here? Now 0 head is allowed
                return pattern_match_variant(p_body, variant)
        if p_head["horizontalCardiOp"] == '=' and p_head["horizontalCardi"] == 0: # 1->0, done
            pattern = replace_head(pattern, p_head)
        if p_head["horizontalCardiOp"] == '>' and p_head["horizontalCardi"] == 0:
            new_pattern = replace_head(pattern, p_head)
            pattern = add_head_cardinality(pattern, 1)
            pattern = add_head(pattern, p_head)
            return (pattern_match_variant(new_pattern, variant) or
                    (pattern_match_variant(pattern, variant) if len(variant) > 0 else False))
        else:   
            pattern = add_head(pattern, p_head)
        # I think no else case

        return pattern_match_variant(pattern, variant)
    else:
        # p_head: para, leaf (may have vertical...)
        return match_head(p_head, v_head) and pattern_match_variant(p_body, v_body)

def add_head_cardinality(pattern, num):
    if "follows" not in pattern: # pattern is leaf / para. head == pattern
        pattern["horizontalCardi"] += num
    else:
        pattern["follows"][0] += num
    return pattern

def add_head(pattern, head):
    if "follows" not in pattern:
        pattern = {"follows": [pattern], "horizontalCardi": 0, "horizontalCardiOp": '='}
    if "follows" in head: # if head is seq+cardi
        for p in reversed(head["follows"]):
            pattern["follows"].insert(0, p)
    else: # else, reduce the cardinality then insert to the front
        new_head = head #need copy here???
        new_head["horizontalCardi"] = 0
        new_head["horizontalCardiOp"] = "="
        #check here
        #print(head)
        #print(new_head)
        pattern["follows"].insert(0, new_head)
    return pattern

def replace_head(pattern, head): # For '=' and '<;, when 1->0
    if "follows" not in pattern: # pattern is leaf / para. head == pattern
        pattern["horizontalCardiOp"] = '='
    else:
        if "follows" not in head: # pattern is seq, head is leaf/para
            pattern["follows"][0]["horizontalCardiOp"] = '='
        else: # pattern is seq, head is seq
            pattern["follows"].pop(0)
            for p in reversed(head["follows"]):
                pattern["follows"].insert(0, p)
    return pattern


def match_head(p_head, v_head):
    if "parallel" in p_head and "leaf" in v_head:
        return False
    elif "leaf" in p_head and "parallel" in v_head:
        #return compare(p_head, v_head)
        return False
    elif "parallel" in p_head and "parallel" in v_head:
        return compare(p_head, v_head)
    elif "leaf" in p_head and "leaf" in v_head:
        return compare(p_head, v_head)
    return False

def compare(p_head, v_head):
    return True

def find_head(variant):
    if "follows" in variant:
        return variant["follows"][0] # seq: the first sub-pattern
    else:
        return variant # case: only parallel or leaf.

def cut_head(variant):
    print(variant)
    if "follows" in variant:
        variant["follows"].pop(0)
        if len(variant["follows"]) > 0:
            return variant
        else:
            return []
    else:
        return []
'''
    else:
        return pattern_match(p_body, v_body)

    result, rest_variants = p_head_match(p_head, variant)
    if result == False:
        return False
    else:
        pattern = cut_head(pattern)
        for v in rest_variants: # Maybe return several variant without various heads (may match 1, 2, or more patterns)
            result = pattern_match_variant(pattern, v)
            if result == True:
                return True
        return False
'''
    
'''
def pattern_match_variant(pattern, variant):
    if "follows" in pattern and len(pattern["follows"]) == 1 and not check_have_cardi(pattern):
        pattern = pattern["follows"][0]
    if "follows" in variant and len(variant["follows"]) == 1:
        variant = variant["follows"][0]
        
    p_head = find_head(pattern)
    result, rest_variants = p_head_match(p_head, variant)
    if result == False:
        return False
    else:
        pattern = cut_head(pattern)
        for v in rest_variants: # Maybe return several variant without various heads (may match 1, 2, or more patterns)
            result = pattern_match_variant(pattern, v)
            if result == True:
                return True
        return False
'''

'''
def find_head(variant):
    if "follows" in variant:
        return variant["follows"][0] # seq: the first sub-pattern
    else:
        return variant # case: only parallel or leaf.

def cut_head(variant):
    print(variant)
    if "follows" in variant:
        rest_head = cut_head(variant["follows"][0])
        if len(rest_head) > 0:
            variant["follows"][0] = rest_head
        else:
            variant["follows"].pop(0)
        return variant
    else:
        return []
'''

def check_cardi_direction(pattern):
    if pattern["verticalCardi"] == 0 and pattern["horizontalCardi"] != 0:
        return "vertical"
    elif pattern["verticalCardi"] != 0 and pattern["horizontalCardi"] == 0:
        return "horizontal"
    else:
        return "error"
    
def check_have_cardi(pattern):
    if pattern["verticalCardi"] > 0 or pattern["horizontalCardi"] > 0:
        return True
    else:
        return False

def check_all_variant(pattern, variant_list):
    new_variant_list = []
    for v in variant_list:
        pattern_match_variant(pattern, v)
    return True

# Process cardinality
def p_head_match(pattern, variant):
    
    if check_have_cardi(pattern) and pattern["horizontalCardi"] > 0:
        # EQUAL: do it serveral times
        if pattern["horizontalCardiOp"] == '=':
            count = pattern["horizontalCardi"]
            while count > 0:
                result, rest_variant = p_head_match(pattern, variant)
                if result == True:
                    variant = rest_variant
                    count -= 1
                else:
                    return False, []
        # MORE THAN 
        elif pattern["horizontalCardiOp"] == '>':
            count = 0
            # before the cardinality, repeat
            while count < pattern["horizontalCardi"]:
                result, rest_variant = p_head_match(pattern, variant)
                if result == True:
                        variant = rest_variant
                        count += 1
                else:
                    break
            # after that, pattern could match any times
            if count >= pattern["horizontalCardi"]:
                while 1:
                    result, rest_variant = p_head_match(pattern, variant)
            else:
                return False, []
        # LESS THAN 
        elif pattern["horizontalCardiOp"] == '<':
            pass

    else: # No cardinality, maybe head as leaf / parallel
        result = match_head(pattern, variant)
        if not result:
            return False, []
        else:
            return True, cut_head(variant)

    
    return True, rest_variant


# Check if a single p_head match the variant
# pattern here is p_head. Single pattern element here
# because, need return(match, rest_variant) lile (False, []) or (True, rest_variant)
def pp_head_match(pattern, variant):
    if "follows" in pattern and len(pattern["follows"]) == 1 and not check_have_cardi(pattern): # single parallel of leaf (not cardinality seq) 如果是先做了一个para再加cardi，那么是不是seq包含seq包含para呢
        pattern = pattern["follows"][0]
    if "follows" in variant and len(variant["follows"]) == 1:
        variant = variant["follows"][0]
    print("pattern:")
    print(pattern, '\n')
    print("variant:")
    print(variant, '\n')

    
    if check_have_cardi(pattern) and pattern["horizontalCardi"] > 0:
        # EQUAL: do it serveral times
        if pattern["horizontalCardiOp"] == '=':
            count = pattern["horizontalCardi"]
            while count > 0:
                result, rest_variant = p_head_match(pattern, variant)
                if result == True:
                    variant = rest_variant
                    count -= 1
                else:
                    return False, []
        # MORE THAN 
        elif pattern["horizontalCardiOp"] == '>':
            count = 0
            # before the cardinality, repeat
            while count < pattern["horizontalCardi"]:
                result, rest_variant = p_head_match(pattern, variant)
                if result == True:
                        variant = rest_variant
                        count += 1
                else:
                    break
            # after that, pattern could match any times
            if count >= pattern["horizontalCardi"]:
                while 1:
                    result, rest_variant = p_head_match(pattern, variant)
            else:
                return False, []
        # LESS THAN 
        elif pattern["horizontalCardiOp"] == '<':
            pass

    else: # No cardinality, maybe head as leaf / parallel
        result = match_head(pattern, variant)
        if not result:
            return False, []
        else:
            return True, cut_head(variant)

    
    return True, rest_variant
    # No verticalCardi at this time
    '''
    elif check_have_cardi(pattern) and pattern["verticalCardi"] > 0:
        pass
    '''
    '''
    #else?
    # Need recursive to handle cardinality(...: for 1 or more chevrons)
    while len(pattern) > 0 and len(variant) > 0: # need check condition
        p_head = find_head(pattern)
        #if pattern[""]
        if not fit(p_head, variant):
            return False
        else:
            pattern = cut_head(pattern)
            variant = cut_head(variant)
            check_pattern(pattern, variant)

    return True
    '''

# Done
'''
if repeat:
            # 匹配0次或多次
            return (match(rest_regex, text) or
                    (match(subpattern + regex, text) if text else False))
        else:
            return match(subpattern + rest_regex, text)
'''

'''
    if "follows" in pattern and len(pattern["follows"]) == 1:
        pattern = pattern["follows"][0]
    if "follows" in variant and len(variant["follows"]) == 1:
        variant = variant["follows"][0]
'''
