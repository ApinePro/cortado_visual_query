import cache.cache as cache
from endpoints.query_variant import evaluate_query_against_variant_graphs
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Any
import copy

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
    count = 0
    for bid, (variant, _, _, info) in cache.variants.items():
        #if check_node(query, variant):
        #    res.append(bid + 1)
        #print("")
        count += 1
        if count >= 7 and count <= 11:
            print("ID:", bid + 1,"\n")
            if check_node(query, variant):
                variant_list.append(bid + 1)
            print("########################################################################################################")
    
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
    print("Variant list:")
    print(variant_list)
    return {"res": variant_list}

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
        print(variant)
        result = pattern_match_variant(copy.deepcopy(node["pattern"]), variant.serialize())
    if node["negation"] == True:
        return not result
    else:
        return result

############################################################

def pattern_match_variant(pattern, variant):
    print("Pattern is:")
    print(pattern, '\n')
    print("Variant is:")
    print(variant, '\n')
    print("##########################################################################\n")

    if len(pattern) == 0 and len(variant) == 0: # check for []
        return True
    elif len(pattern) == 0 and len(variant) != 0:
        return False
    elif len(pattern) != 0 and len(variant) == 0: #what?
        return False
    
    if "follows" in pattern and len(pattern["follows"]) == 1 and not check_have_cardi(pattern):
        pattern = pattern["follows"][0]
    if "follows" in variant and len(variant["follows"]) == 1:
        variant = variant["follows"][0]

    p_head = find_head(pattern) #seq with cardi, leaf, para
    v_head = find_head(variant)
    p_body = cut_head(pattern)
    v_body = cut_head(variant)

    if "leaf" in p_head and p_head["leaf"][0] == '...':
        #print("... MATCH!")
        any_head = {"leaf": ["??"], "horizontalCardi": 0, "horizontalCardiOp": '=', "verticalCardi": 0, "verticalCardiOp": '='} #?? for any group. ? is for any activity
        pattern_with_any = add_head(pattern, any_head)
        return pattern_match_variant(p_body, variant) or pattern_match_variant(pattern_with_any, variant)
    elif check_have_cardi(p_head) and p_head["horizontalCardi"] > 0:
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
    pattern = copy.deepcopy(pattern)
    if "follows" not in pattern: # pattern is leaf / para. head == pattern
        pattern["horizontalCardi"] += num
    else:
        pattern["follows"][0]["horizontalCardi"] += num
    return pattern

def add_head(pattern, head):
    pattern = copy.deepcopy(pattern)
    if "follows" not in pattern:
        pattern = {"follows": [pattern], "horizontalCardi": 0, "horizontalCardiOp": '=', "verticalCardi": 0, "verticalCardiOp": '='}
    if "follows" in head: # if head is seq+cardi
        for p in reversed(head["follows"]):
            pattern["follows"].insert(0, p)
    else: # else, reduce the cardinality then insert to the front
        new_head = copy.deepcopy(head)
        new_head["horizontalCardi"] = 0
        new_head["horizontalCardiOp"] = "="
        pattern["follows"].insert(0, new_head)
    return pattern

def replace_head(pattern, head): # For '=' and '<;, when 1->0
    pattern = copy.deepcopy(pattern)
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
    # ??
    if "leaf" in p_head and p_head["leaf"][0] == "??":
        return True

    if "parallel" in p_head and "leaf" in v_head:
        return False
    elif "leaf" in p_head and "parallel" in v_head:
        #return compare(p_head, v_head)
        return False
    elif "parallel" in p_head and "parallel" in v_head:
        return compare_para(p_head, v_head)
    elif "leaf" in p_head and "leaf" in v_head:
        return compare_leaf(p_head, v_head)
    return False

def compare_para(p_head, v_head):
    return True

def compare_leaf(p_head, v_head):
    if p_head["leaf"][0] == "?" or p_head["leaf"][0] == v_head["leaf"][0]:
        return True
    else:
        return False

def find_head(variant):
    if "follows" in variant:
        return copy.deepcopy(variant["follows"][0]) # seq: the first sub-pattern
    else:
        return copy.deepcopy(variant) # case: only parallel or leaf.

def cut_head(variant):
    print(variant)
    variant = copy.deepcopy(variant)
    if "follows" in variant:
        variant["follows"].pop(0)
        if len(variant["follows"]) > 0:
            return variant
        else:
            return []
    else:
        return []

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