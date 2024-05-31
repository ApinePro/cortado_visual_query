import cache.cache as cache
from endpoints.query_variant import evaluate_query_against_variant_graphs
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Any
import copy
import json

from cortado_core.models.infix_type import InfixType
from endpoints.load_event_log import (
    create_variant_object,
    compute_log_stats,
    variants_to_variant_objects,
)
from collections import defaultdict
from api.routes.variants.variants import VariantInformation

router = APIRouter(tags=["variantQuery"], prefix="/variantQuery")


class variantQuery(BaseModel):
    queryString: str

class graphicalVariantQuery(BaseModel):
    queryTree: Any = None
    activityGroups: Any = None


@router.post("/variant-query")
def variant_query(query: variantQuery):
    res = evaluate_query_against_variant_graphs(
        query, cache.variants, cache.parameters["activites"]
    )

    '''
    for bid in res["ids"]:
        print(cache.variants[bid][0])
    '''
    return res


group_dic = {}

def generate_variant_info(infix_type, traces):
    user_defined = len(traces) == 0

    return VariantInformation(infix_type=infix_type, is_user_defined=user_defined)

@router.post("/graphical-variant-query")
def graphical_variant_query(graphical_query: graphicalVariantQuery):
    res = []
    print(graphical_query)
    
    #print(cache.variants.items())
    query = deserialize_query(graphical_query)
    global group_dic
    group_dic = json.loads(graphical_query.activityGroups)
    print(group_dic)
    variant_list = defaultdict(list)
    count = 0

    
    variant_list = []
    
    for bid, (variant, _, _, info) in cache.variants.items():
        #if check_node(query, variant):
        #    res.append(bid + 1)
        #print("")
        count += 1
        if count >= 1 and count <= 31:
            print("ID:", count,"\n")
            if check_node(query, variant):
                variant_list.append(count)
            print("########################################################################################################")
    print("Variant list:")
    print(variant_list)
    variant_list = defaultdict(list)
    
    
    '''
    variants = cache.variants
    new_variants = {
        InfixType.NOT_AN_INFIX: defaultdict(list),
    }

    n_traces = 0
    for _, (variant, traces, _, info) in variants.items():
        count += 1
        if check_node(query, variant):
            new_variants[info.infix_type][variant] += traces
            variant_list[variant] += traces
            n_traces += len(traces)

    cache_variants = dict()
    cache_max_bid = 0
    res_variants = []

    for infix_type, var in new_variants.items():  # var: dict, key(variant) value(trace)

        res_vars, new_cache_variants = variants_to_variant_objects(
            variant_list,
            cache.parameters["cur_time_granularity"],
            n_traces,
            lambda ts: generate_variant_info(infix_type, ts),
        )
        res_variants += res_vars

        for bid, variant in new_cache_variants.items():
            cache_variants[bid + cache_max_bid] = variant

        cache_max_bid = max(cache_variants.keys())

    cache.variants = cache_variants
    start_activities, end_activities, nActivities = compute_log_stats(
        cache.variants
    )

    cache.parameters["activites"] = set(nActivities.keys())
    
    res = {
        "startActivities": start_activities,
        "endActivities": end_activities,
        "activities": nActivities,
        "variants": res_variants,
        "performanceInfoAvailable": cache.parameters["lifecycle_available"],
        "timeGranularity": cache.parameters["cur_time_granularity"],
    }
    '''

    return {"res": variant_list}
    #return res

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
    print(add_start_end_wildcard(node["pattern"]))
    result = True
    if node["operator"] == 'AND':
        for child in node["children"]: 
            result = result & check_node(child, variant)
    if node["operator"] == 'OR':
        for child in node["children"]: 
            result = result | check_node(child, variant)
    if node["operator"] == 'X':
        #print("Original Variant:")
        #print(variant)
        pattern = add_start_end_wildcard(node["pattern"])
        result = pattern_match_variant(pattern, variant.serialize())
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

    if len(pattern) == 0 and len(variant) == 0: # check for []
        return True
    elif len(pattern) == 0 and len(variant) != 0:
        return False
    
    if "follows" in pattern and len(pattern["follows"]) == 1 and not check_have_cardi(pattern):
        pattern = pattern["follows"][0]

    # len(pattern) != 0
    if len(variant) == 0:
        if "leaf" in pattern and pattern["leaf"][0] == '...':
            return True
        else:
            return False
    
    if "follows" in variant and len(variant["follows"]) == 1:
        variant = variant["follows"][0]

    p_head = find_head(pattern) #seq with cardi, leaf, para
    v_head = find_head(variant)
    print("p_head is:")
    print(p_head, '\n')
    print("v_head is:")
    print(v_head, '\n')
    p_body = cut_head(pattern)
    v_body = cut_head(variant)
    print("p_body is:")
    print(p_body, '\n')
    print("v_body is:")
    print(v_body, '\n')

    if "leaf" in p_head and p_head["leaf"][0] == '...':
        any_head = {"leaf": ["??"], "horizontalCardi": 0, "horizontalCardiOp": '=', "verticalCardi": 0, "verticalCardiOp": '='} #?? for any group. ? is for any activity
        pattern_with_any = add_head(pattern, any_head)
        print("##########################################################################\n")
        return pattern_match_variant(p_body, variant) or pattern_match_variant(pattern_with_any, variant)
    elif check_have_cardi(p_head) and p_head["horizontalCardi"] > 0: # resolve horizontal
        pattern = add_head_cardinality(pattern, -1)
        p_head = find_head(pattern)
        #print("PHEAD AFTER REDUCE")
        #print(p_head)
        print("##########################################################################\n")
        if p_head["horizontalCardiOp"] == '≤':
            if p_head["horizontalCardi"] == 0:
                pattern = replace_head(pattern, p_head) # Remove the cardinality characteristics of the head
            else:   
                pattern = add_head(pattern, p_head)
            result =  pattern_match_variant(pattern, variant)
            if result:
                return result
            if not result: # Another chance: should it match at least once here? Now 0 head is allowed
                return pattern_match_variant(p_body, variant)
        elif p_head["horizontalCardiOp"] == '=' and p_head["horizontalCardi"] == 0: # 1->0, done
            pattern = replace_head(pattern, p_head)
        elif p_head["horizontalCardiOp"] == '≥' and p_head["horizontalCardi"] == 0:
            new_pattern = replace_head(pattern, p_head)
            pattern = add_head_cardinality(pattern, 1)
            pattern = add_head(pattern, p_head)
            return (pattern_match_variant(new_pattern, variant) or
                    (pattern_match_variant(pattern, variant) if len(variant) > 0 else False))
        else:   
            pattern = add_head(pattern, p_head)
        # I think no else case
        return pattern_match_variant(pattern, variant)
    
    elif check_have_cardi(p_head) and p_head["verticalCardi"] > 0: # resolve vertical
        pass

    else:
        # p_head: para, leaf (may have vertical...)
        print("HEAD IS PARA OR LEAF")
        return match_head(p_head, v_head) and pattern_match_variant(p_body, v_body)

def add_head_cardinality(pattern, num):
    pattern = copy.deepcopy(pattern)
    if "follows" not in pattern: # pattern is leaf / para. head == pattern
        pattern["horizontalCardi"] += num
    else:
        pattern["follows"][0]["horizontalCardi"] += num
    #print(pattern)
    return pattern

def add_head(pattern, head):
    pattern = copy.deepcopy(pattern)
    if "follows" not in pattern:
        pattern = {"follows": [copy.deepcopy(pattern)], "horizontalCardi": 0, "horizontalCardiOp": '=', "verticalCardi": 0, "verticalCardiOp": '='}
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
    elif "leaf" in p_head and "parallel" in v_head: #Need implementation...
        #return compare(p_head, v_head)
        return False
    elif "parallel" in p_head and "parallel" in v_head:
        return compare_para(p_head, v_head)
    elif "leaf" in p_head and "leaf" in v_head:
        return compare_leaf(p_head, v_head)
    return False

def compare_para(p_head, v_head): # No cardinality now
    p_dic = {"leafs": {}}
    v_dic = {"leafs": {}}
    for element in p_head["parallel"]:
        if "leaf" in element:
            if element["leaf"][0] == "...": # Match EVERYTHING
                return True
            if element["leaf"][0] not in p_dic["leafs"]:
                p_dic["leafs"][element["leaf"][0]] = [element["verticalCardi"], element["verticalCardi"]] #[min, max]
                if element["verticalCardiOp"] == "≤":
                    p_dic["leafs"][element["leaf"][0]][0] = -1
                elif element["verticalCardiOp"] == "≥":
                    p_dic["leafs"][element["leaf"][0]][1] = -1
                elif element["verticalCardiOp"] == "=" and element["verticalCardi"] == 0:
                    p_dic["leafs"][element["leaf"][0]][0] = 1
                    p_dic["leafs"][element["leaf"][0]][1] = 1
            else:
                shift = 0
                if element["verticalCardi"] == 0:
                    shift = 1
                if element["verticalCardiOp"] == "≤" and p_dic["leafs"][element["leaf"][0]][1] > element["verticalCardi"] + shift:
                    p_dic["leafs"][element["leaf"][0]][1] = element["verticalCardi"] + shift
                elif element["verticalCardiOp"] == "≥" and p_dic["leafs"][element["leaf"][0]][0] < element["verticalCardi"] + shift:
                    p_dic["leafs"][element["leaf"][0]][0] = element["verticalCardi"] + shift
                elif element["verticalCardiOp"] == "=":
                    #if element["verticalCardi"] == 0:
                    if p_dic["leafs"][element["leaf"][0]][0] == -1 and p_dic["leafs"][element["leaf"][0]][1] > 0:
                        p_dic["leafs"][element["leaf"][0]][0] == element["verticalCardi"] + shift
                        p_dic["leafs"][element["leaf"][0]][1] += element["verticalCardi"] + shift
                    elif p_dic["leafs"][element["leaf"][0]][1] == -1 and p_dic["leafs"][element["leaf"][0]][0] > 0:
                        p_dic["leafs"][element["leaf"][0]][0] += element["verticalCardi"] + shift
                    elif p_dic["leafs"][element["leaf"][0]][0] > 0 and p_dic["leafs"][element["leaf"][0]][1] > 0:
                        p_dic["leafs"][element["leaf"][0]][0] += element["verticalCardi"] + shift
                        p_dic["leafs"][element["leaf"][0]][1] += element["verticalCardi"] + shift
                    #Not sure about this...
                    '''
                    elif p_dic["leafs"][element["leaf"][0]][1] > element["verticalCardi"]:
                        p_dic["leafs"][element["leaf"][0]][1] = element["verticalCardi"]
                    elif p_dic["leafs"][element["leaf"][0]][0] < element["verticalCardi"]:
                        p_dic["leafs"][element["leaf"][0]][0] = element["verticalCardi"]
                    '''
        if "follows" in element: # How about ["...", "?"]
            p_dic["sequence"] = element

    for element in v_head["parallel"]:
        if "leaf" in element:
            if element["leaf"][0] not in v_dic["leafs"]:
                v_dic["leafs"][element["leaf"][0]] = 1
            else:
                v_dic["leafs"][element["leaf"][0]] += 1
        if "follows" in element:
            v_dic["sequence"] = element
    
    if ("sequence" in p_dic and "sequence" not in v_dic) or ("sequence" not in p_dic and "sequence" in v_dic):
        return False
    elif "sequence" not in p_dic and "sequence" not in v_dic:
        return compare_parallel_dics(p_dic["leafs"], v_dic["leafs"])
    else:
        return pattern_match_variant(p_dic["sequence"], v_dic["sequence"]) and compare_parallel_dics(p_dic["leafs"], v_dic["leafs"])

def compare_parallel_dics(p_dic, v_dic):
    print("P_DIC")
    print(p_dic)
    print("V_DIC")
    print(v_dic)
    for p_key in p_dic.keys():
        if p_dic[p_key][0] > p_dic[p_key][1]:
            return False
    diff_count = 0
    for v_key in v_dic.keys():
        if v_key not in p_dic:
            diff_count += v_dic[v_key]
        else:
            if v_dic[v_key] < p_dic[v_key][0]:
                return False
            elif v_dic[v_key] > p_dic[v_key][1]:
                diff_count += (v_dic[v_key] - p_dic[v_key][1])
            del p_dic[v_key] #potential error?
    print("After process")
    print("P_DIC")
    print(p_dic)
    print("V_DIC")
    print(v_dic)
    print(diff_count)

    if len(p_dic) == 0 and diff_count == 0:
        print("PARA TRUE")
        return True
    else:
        for p_key in p_dic.keys():
            if p_key != "?" and not(p_dic[p_key][0] == -1 and p_dic[p_key][1] > 0):
                return False
            elif p_key == "?":
                if diff_count >= p_dic["?"][0] and diff_count <= p_dic["?"][1]:
                    return True
                else:
                    return False  

def compare_leaf(p_head, v_head):
    print("group_dic")
    print(group_dic)
    if p_head["leaf"][0] == "?" or p_head["leaf"][0] == v_head["leaf"][0]:
        return True
    elif p_head["leaf"][0] in group_dic and v_head["leaf"][0] in group_dic[p_head["leaf"][0]]:
        return True
    else:
        return False
    
def compare_leaf_para(p_head, v_head):
    pass

def find_head(variant):
    if "follows" in variant:
        return copy.deepcopy(variant["follows"][0]) # seq: the first sub-pattern
    else:
        return copy.deepcopy(variant) # case: only parallel or leaf.

def cut_head(variant):
    #print(variant)
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
    #print("Check this: \n")
    #print(pattern)
    if pattern["verticalCardi"] > 0 or pattern["horizontalCardi"] > 0:
        return True
    else:
        return False

def add_start_end_wildcard(pattern):
    pattern = copy.deepcopy(pattern)
    if not ("leaf" in pattern["follows"][0] and (pattern["follows"][0]["leaf"][0] == "S" or pattern["follows"][0]["leaf"][0] == "...")):
        head = {"leaf": ["..."], "horizontalCardi": 0, "horizontalCardiOp": '=', "verticalCardi": 0, "verticalCardiOp": '='}
        pattern["follows"].insert(0, head)
    elif "leaf" in pattern["follows"][0] and pattern["follows"][0]["leaf"][0] == "S":
        pattern["follows"].pop(0)
    if not ("leaf" in pattern["follows"][-1] and (pattern["follows"][-1]["leaf"][0] == "E" or pattern["follows"][-1]["leaf"][0] == "...")):
        tail = {"leaf": ["..."], "horizontalCardi": 0, "horizontalCardiOp": '=', "verticalCardi": 0, "verticalCardiOp": '='}
        pattern["follows"].append(tail)
    elif "leaf" in pattern["follows"][0] and pattern["follows"][-1]["leaf"][0] == "E":
        pattern["follows"].pop(-1) #any error if nothing after pop?
    return pattern