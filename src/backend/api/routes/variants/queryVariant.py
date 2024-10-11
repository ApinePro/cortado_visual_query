import cache.cache as cache
from endpoints.query_variant import evaluate_query_against_variant_graphs
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Any
import copy
import json
import random
from enum import Enum
from collections import deque
import networkx as nx

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

@router.post("/generate-query-test")
def generate_query_test(graphical_query: graphicalVariantQuery):
    print("Test start")
    test_variants = []
    trees = []
    activities = ["cancel order", "confirm payment", "make delivery", "pay",
                  "place order", "prepare delivery", "send invoice", "send reminder"]
    
    query = {"follows": [], "horizontalCardi": 0, "horizontalCardiOp": '=', "verticalCardi": 0, "verticalCardiOp": '='}
    query["follows"].append({"leaf": ["..."], "horizontalCardi": 0, "horizontalCardiOp": '=', "verticalCardi": 0, "verticalCardiOp": '='})
    query["follows"].append({"leaf": ["send invoice"], "horizontalCardi": 0, "horizontalCardiOp": '=', "verticalCardi": 0, "verticalCardiOp": '='})
    query["follows"].append({"leaf": ["send reminder"], "horizontalCardi": 2, "horizontalCardiOp": '>', "verticalCardi": 0, "verticalCardiOp": '='})
    query["follows"].append({"leaf": ["pay"], "horizontalCardi": 0, "horizontalCardiOp": '=', "verticalCardi": 0, "verticalCardiOp": '='})
    query["follows"].append({"leaf": ["..."], "horizontalCardi": 0, "horizontalCardiOp": '=', "verticalCardi": 0, "verticalCardiOp": '='})

    
    for x in range(1000):
        if x % 20 == 0:
            print(x + 1)
        #test_variants.append(generate_query(activities, ""))
        query = generate_query(activities, "", 1)
        if x == 0:
            result_stat = calculate_query_stat(query)
        else:
            stat = calculate_query_stat(query)
            for key in result_stat.keys():
                result_stat[key] += stat[key]

    for key in result_stat.keys():
        result_stat[key] /= 1000

    print(result_stat)
    
    '''
    group_id_list = []
    for variant in test_variants:
        print(variant)
        print("")
        trees.append(variant_to_tree(variant, group_id_list))
    

    m_l = []
    group_id_list = []
    count = 0
    variant_list = []
    for bid, (variant, _, _, info) in cache.variants.items():
        count += 1
        if count >= 1 and count <= 14:
            #print("ID:", count,"\n")
            match_result = dynamic_tree_matching(variant_to_tree(query, group_id_list)[0], variant_to_tree(variant.serialize(), group_id_list)[0], group_id_list)
            if match_result:
                print("Matched: ", count)
                m_l.append(count)
                variant_list.append(count-1)
    
    print(m_l)
    '''
    
    return 0
    #return {"ids": variant_list}

def calculate_v_stat(variant):
    if "leaf" in variant:
        pass
    return 1

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
                variant_list.append(count - 1)
            print("########################################################################################################")
    print("Variant list:")
    print([x + 1 for x in variant_list])
    #variant_list = defaultdict(list)
    
    
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

    #return {"res": variant_list}
    return {"ids": variant_list}

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
    print(node["operator"])
    if node["operator"] == 'and':
        result = True
        for child in node["children"]: 
            result = result & check_node(child, variant)
    if node["operator"] == 'or':
        result = False
        for child in node["children"]: 
            result = result | check_node(child, variant)
    # Ware: v or X?
    if node["operator"] == 'v':
        #print("Original Variant:")
        #print(variant)
        pattern = add_start_end_wildcard(node["pattern"])
        print(pattern)
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
        elif p_head["horizontalCardiOp"] == '=' and p_head["horizontalCardi"] == 0: # 1->0, done
            pattern = replace_head(pattern, p_head)
        elif p_head["horizontalCardiOp"] == '>' and p_head["horizontalCardi"] == 0:
            new_pattern = replace_head(pattern, p_head)
            pattern = add_head_cardinality(pattern, 1)
            pattern = add_head(pattern, p_head)
            return (pattern_match_variant(new_pattern, variant) or
                    (pattern_match_variant(pattern, variant) if len(variant) > 0 else False))
        else:    
            pattern = add_head(pattern, p_head)
        # I think no else case
        return pattern_match_variant(pattern, variant)
    
    elif check_have_cardi(p_head) and p_head["verticalCardi"] > 0: # resolve vertical (only =)
        if "parallel" in p_head:
            for element in p_head["parallel"]:
                element["verticalCardi"] *= p_head["verticalCardi"]
            p_head["verticalCardi"] = 0
        if "leaf" in p_head:
            p_head = {"parallel": [{"leaf": p_head["leaf"], "horizontalCardi": 0, "horizontalCardiOp": '=', "verticalCardi": p_head["verticalCardi"], "verticalCardiOp": '='}], "horizontalCardi": 0, "horizontalCardiOp": '=', "verticalCardi": 0, "verticalCardiOp": '='}
            print("ppp")
            print(p_head)

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
                if element["verticalCardiOp"] == "<":
                    p_dic["leafs"][element["leaf"][0]][0] = -1
                elif element["verticalCardiOp"] == ">":
                    p_dic["leafs"][element["leaf"][0]][1] = -1
                elif element["verticalCardiOp"] == "=" and element["verticalCardi"] == 0:
                    p_dic["leafs"][element["leaf"][0]][0] = 1
                    p_dic["leafs"][element["leaf"][0]][1] = 1
            else:
                shift = 0
                if element["verticalCardi"] == 0:
                    shift = 1
                if element["verticalCardiOp"] == "<" and p_dic["leafs"][element["leaf"][0]][1] > element["verticalCardi"] + shift:
                    p_dic["leafs"][element["leaf"][0]][1] = element["verticalCardi"] + shift
                elif element["verticalCardiOp"] == ">" and p_dic["leafs"][element["leaf"][0]][0] < element["verticalCardi"] + shift:
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
    if not ("leaf" in pattern["follows"][0] and (pattern["follows"][0]["leaf"][0] == "▷" or pattern["follows"][0]["leaf"][0] == "...")):
        head = {"leaf": ["..."], "horizontalCardi": 0, "horizontalCardiOp": '=', "verticalCardi": 0, "verticalCardiOp": '='}
        pattern["follows"].insert(0, head)
    elif "leaf" in pattern["follows"][0] and pattern["follows"][0]["leaf"][0] == "▷":
        pattern["follows"].pop(0)
    if not ("leaf" in pattern["follows"][-1] and (pattern["follows"][-1]["leaf"][0] == "▢" or pattern["follows"][-1]["leaf"][0] == "...")):
        tail = {"leaf": ["..."], "horizontalCardi": 0, "horizontalCardiOp": '=', "verticalCardi": 0, "verticalCardiOp": '='}
        pattern["follows"].append(tail)
    elif "leaf" in pattern["follows"][0] and pattern["follows"][-1]["leaf"][0] == "▢":
        pattern["follows"].pop(-1) #any error if nothing after pop?
    return pattern

### Generate testing code ###

"""query_tree["pattern"] = graphical_query["pattern"]
    query_tree["operator"] = graphical_query["operator"]
    query_tree["negation"] = graphical_query["negation"]
    query_tree["children"]"""

# The query cannot generate group?
activities = ["...", "?"] + [str(x) for x in range(10)]

def generate_query_tree_node(activities, depth):
    THRES_NEGATE = 0.3
    THRES_LEAF = 0.3
    MAX_CHILD_NUM = 4

    THRES_LEAF *= 0.5 ** (depth - 1)
    depth += 1
    node = {}
    if_leaf = random.random()
    if if_leaf > THRES_LEAF:
        node["pattern"] = generate_query(activities, "", 1)
        node["operator"] == "v"
    else:
        if random.random() > 0.5:
            node["operator"] == "and"
        else:
            node["operator"] == "or"
        node["children"] = []
        child_num = random.choices(list(range(2, MAX_CHILD_NUM + 1)), weights=list(reversed(range(2, MAX_CHILD_NUM+ 1))), k=1)[0]
        for i in range(child_num):
            node["children"].append(generate_query_tree_node(activities, depth))
    if random.random() < THRES_NEGATE:
        node["negation"] = True
    else:
        node["negation"] = False
    return node
        

def generate_query(activities, parent_type, depth):
    THRES_LEAF = 0.2
    THRES_CARDI = 0.2
    MAX_SEQ_GROUP = 10
    MAX_PARA_GROUP = 3
    MAX_GROUP_CARDI = 3
    
    THRES_LEAF *= 0.5 ** (depth - 1)
    depth += 1

    cardi_ops = ["=", ">", "<"]
    if_leaf = random.random()
    if if_leaf > THRES_LEAF and depth - 1 != 1:
        # return leaf, 70% probability
        leaf = {"leaf": [], "horizontalCardi": 0, "horizontalCardiOp": '=', "verticalCardi": 0, "verticalCardiOp": '='}
        leaf["leaf"].append(random.choice(activities))
        if leaf["leaf"][0] != "...":
            if random.random() < THRES_CARDI:
                # Cardinality 1-5
                if random.random() > 0.5:
                    leaf["horizontalCardi"] = random.choices(list(range(1, 6)), weights=list(reversed(range(1, 6))), k=1)[0]
                    op_type_rand = random.random()
                    if op_type_rand < 1/3:
                        leaf["horizontalCardiOp"] = "="
                    elif op_type_rand < 2/3:
                        leaf["horizontalCardiOp"] = ">"
                    else:
                        leaf["horizontalCardiOp"] = "<"
                else:
                    leaf["verticalCardi"] = random.choices(list(range(1, 6)), weights=list(reversed(range(1, 6))), k=1)[0]
                    op_type_rand = random.random()
                    if op_type_rand < 1/3:
                        leaf["verticalCardiOp"] = "<"
                    elif op_type_rand < 2/3:
                        leaf["verticalCardiOp"] = ">"

        return leaf
    else:
        #Non-leafnode, including half seq and half parallel group 
        if_seq = random.random()
        if if_seq <= 0.5 or parent_type == "para" or depth - 1 == 1:
            seq = {"follows": [], "horizontalCardi": 0, "horizontalCardiOp": '=', "verticalCardi": 0, "verticalCardiOp": '='}
            child_num = random.choices(list(range(2, MAX_SEQ_GROUP + 1)), weights=list(reversed(range(2, MAX_SEQ_GROUP + 1))), k=1)[0]
            for i in range(child_num):
                seq["follows"].append(generate_query(activities, "seq", depth))
            op_rand = random.random() # choose if it is not "="
            if op_rand < 0.2:
                # No vertical cardi for seq, max 3 cardinality
                seq["horizontalCardi"] = random.choices(list(range(1, MAX_GROUP_CARDI + 1)), weights=list(reversed(range(1, 4))), k=1)[0]
                op_type_rand = random.random()
                if op_type_rand < 1/3:
                    seq["horizontalCardiOp"] = "<"
                elif op_type_rand < 2/3:
                    seq["horizontalCardiOp"] = ">"

            return seq
        else:
            para = {"parallel": [], "horizontalCardi": 0, "horizontalCardiOp": '=', "verticalCardi": 0, "verticalCardiOp": '='}
            child_num = random.choices(list(range(2, MAX_PARA_GROUP + 1)), weights=list(reversed(range(2, MAX_PARA_GROUP + 1))), k=1)[0]
            #print(child_num = random.choices(list(range(2, 5)), weights=list(reversed(range(2, 5))), k=1))
            seq_exist = 0
            for i in range(child_num):
                child = generate_query(activities, "para", depth)
                # Ensure only one sequence child
                while seq_exist == 1 and "follows" in child:
                    # If double seq, generate again
                    child = generate_query(activities, "para", depth)
                if "follows" in child:
                    seq_exist = 1
                para["parallel"].append(child)
            op_rand = random.random() # choose if it is not "="
            if op_rand < 0.2:
                # Currently no vertical cardi for para
                para["horizontalCardi"] = random.choices(list(range(1, MAX_GROUP_CARDI)), weights=list(reversed(range(1, MAX_GROUP_CARDI))), k=1)[0] #注意一下这个 等于号等于1的时候是？
                op_type_rand = random.random()
                if op_type_rand < 1/3:
                    para["horizontalCardiOp"] = "<"
                elif op_type_rand < 2/3:
                    para["horizontalCardiOp"] = ">"
            return para
        
def test_patterns():
    test_list = []
    # Test <= 2
    example = {"follows": [], "horizontalCardi": 0, "horizontalCardiOp": '=', "verticalCardi": 0, "verticalCardiOp": '='}
    test_list.append(example)
    # Test >= 3
    # Test = 3
    # Test parallel
    # Test = 3
    # Test group outside

########################################################################################################
### New algorithm ###

import ahocorasick

class NodeType(Enum):
    NORMAL = 1
    GROUP = 2
    ANY = 3
    WILDCARD = 4
    SEQ = 5
    PARA = 6 # Parallel and also Vertical cardi

class VariantTree:
    label_to_char = {}
    label_index = 0
    preserved_char = ["(", ")", "→", "∧"]

    def __init__(self, id):
        self.id = id
        self.label = ""
        self.children = []
        self.type = NodeType.NORMAL
        self.cardiDirect = "vertical"
        self.cardinality = 0
        self.cardiOp = "="
        self.match_id = []
        self.determined = False
    
    @staticmethod
    def increase_label_index():
        VariantTree.label_index += 1
        while chr(VariantTree.label_index) in VariantTree.preserved_char:
            VariantTree.label_index += 1

def variant_to_tree(variant, group_id_list):
    # Convert process variant to variant tree.
    # Including the expansion of vertical and parallel cardinality
    tree =  VariantTree(random.randint(1, 10000))

    if "follows" in variant:
        tree.type = NodeType.SEQ
        tree.determined = True # default is true, if any child is false, it becomes false
        tree.label = "→"
        for child in variant["follows"]:
            # Process wildcard simplification.
            # ... can simplify cardinality "<" and ">", and also "..." could be merged.
            child_node = variant_to_tree(child, group_id_list) # Could be a list
            if len(tree.children) > 0 and tree.children[-1].type == NodeType.WILDCARD:
                # wildcard before node
                i = 0
                while child_node[i].cardiOp == "<" or child_node[i].type == NodeType.WILDCARD:
                    i += 1
                child_node = child_node[i:]
                if len(child_node) > 0 and child_node[0].cardiOp == ">" and child_node[0].cardiDirect == "horizontal":
                    child_node[0].cardiOp = "="
                    child_node[0].determined = True
                    if child_node[0].cardinality == 1:
                        child_node[0].cardinality = 0
            
            if child_node[0].type == NodeType.WILDCARD:
                # first child is wildcard, simplify the last node.
                if len(tree.children) > 0:
                    while len(tree.children) > 0 and (tree.children[-1].type == NodeType.WILDCARD or tree.children[-1].cardiOp == "<"):
                        tree.children.pop(-1) # Don't need to change tree.determined. Because the new node is wildcard
                    if len(tree.children) > 0 and tree.children[-1].cardiOp == ">":
                        tree.children[-1].cardiOp = "="
                        tree.children[-1].determined = True
                        if tree.children[-1].cardinality == 1:
                            tree.children[-1].cardinality = 0
            tree.children = tree.children + child_node
        for child in tree.children:
            tree.determined = tree.determined & child.determined
        if len(tree.children) == 1:
            tree = tree.children[0]
    elif "parallel" in variant:
        tree.type = NodeType.PARA
        tree.determined = True
        tree.label = "∧"
        wildcard_exist = False
        for child in variant["parallel"]:
            child_node = variant_to_tree(child, group_id_list)
            if child_node[0].type == NodeType.WILDCARD:
                wildcard_exist = True
            tree.children = tree.children + child_node
        merged_children = []
        for child in tree.children:
            if wildcard_exist:
                # 记得限制在UI里对para里多个...的限制
                if child.cardiOp == "<":
                    continue
                elif child.cardiOp == ">" and child.cardiDirect == "vertical":
                    child.cardiOp = "="
                    if child.cardinality == 1:
                        child.cardinality = 0
            merged_children.append(child)
            tree.determined = tree.determined & child.determined
        tree.children = merged_children
        if len(tree.children) == 1:
            tree = tree.children[0]
    elif "leaf" in variant:
        # Possible cases: cardinality, group, any, wildcard, normal.
        tree.label = variant["leaf"][0]
        if variant["leaf"][0] in group_id_list:
            tree.type = NodeType.GROUP
            tree.determined = False
        elif variant["leaf"][0] == "?":
            tree.type = NodeType.ANY
            tree.determined = False
        elif variant["leaf"][0] == "...":
            tree.type = NodeType.WILDCARD
            tree.determined = False
        else:
            tree.type = NodeType.NORMAL
            tree.determined = True
    if "horizontalCardiOp" in variant:
        # Keep "<" cardi, expand "=", simplify ">" cardinality
        # After simplification, "=" -> NORMAL (no cardinality) and we could use self.cardinality to know if there's cardinality
        # Handle horizontal
        if variant["horizontalCardiOp"] == "<":
            tree.cardiOp = "<"
            tree.cardinality = variant["horizontalCardi"]
            tree.determined = False
            tree.cardiDirect = "horizontal"
            return [tree]
        elif variant["horizontalCardi"] > 1 or variant["horizontalCardiOp"] == ">":
            expanded_node = []
            tree.cardiOp = "="
            # unzip sequence without cardinality. Only applied to original sequence with cardinality
            if tree.type == NodeType.SEQ:
                for i in range(variant["horizontalCardi"] - 1):
                    expanded_node += copy.deepcopy(tree.children)
                if variant["horizontalCardiOp"] == "=":
                    # Cardinality > 1
                    expanded_node += copy.deepcopy(tree.children)
                    return expanded_node
                else:
                    expanded_node.append(copy.deepcopy(tree))
                    expanded_node[-1].cardiOp = ">"
                    expanded_node[-1].cardinality = 1
                    expanded_node[-1].cardiDirect = "horizontal"
                    expanded_node[-1].determined = False
                    return expanded_node
            else:
                for i in range(variant["horizontalCardi"]):
                    expanded_node.append(copy.deepcopy(tree))
                if variant["horizontalCardiOp"] == "=":
                    # Cardinality > 1
                    return expanded_node
                else:
                    expanded_node[-1].cardiOp = ">"
                    expanded_node[-1].cardinality = 1
                    expanded_node[-1].cardiDirect = "horizontal"
                    expanded_node[-1].determined = False
                    return expanded_node
            
        # We don't need to handle vertical
        elif variant["verticalCardi"] > 1 or variant["verticalCardiOp"] == ">" or variant["verticalCardiOp"] == "<":
            tree.type = NodeType.PARA # Could compare para and vertical. Only leaf node (Normal, G, Any) could have vertical cardinality!
            tree.cardiDirect = "vertital"
            tree.cardiOp = variant["verticalCardiOp"]
            tree.cardinality = variant["verticalCardiOp"]

        else:
            return [tree]
    else:
        return [tree]

class PartialOrderNode:
    def __init__(self, label):
        self.label = label
        self.children = []
        self.type = NodeType.NORMAL
        self.cardinality = 0
        self.cardiOp = "="
        self.match_id = []
        self.determined = True

def serialize_determined_tree(tree):
    #谨记这个要判断的 如果seq para node的label已经不止一位了，那就直接返回就行了. 如果是leaf也是在这里返回
    if len(tree.label) > 1:
        if tree.label not in VariantTree.label_to_char:
            VariantTree.label_to_char[tree.label] = chr(VariantTree.label_index)
            VariantTree.increase_label_index()
        return tree
    else:
        if tree.label[0] == "→":
            tree.label += "("
            for child in tree.children:
                # child's label is already in label_to_char
                tree.label += VariantTree.label_to_char[child.label]
            tree.label += ")"
        else:
            #∧
            tree.label += "("
            ordered_children = sorted([VariantTree.label_to_char[child.label] for child in tree.children])
            tree.label += ''.join(ordered_children)
            tree.label += ")"

        if tree.label not in VariantTree.label_to_char:
                VariantTree.label_to_char[tree.label] = chr(VariantTree.label_index)
                VariantTree.increase_label_index()
        return tree

def get_parent(p_list):
    p_tree = VariantTree(random.randint(1, 10000))
    p_tree.children = p_list.copy()
    p_tree.cardiDirect = "horizontal"
    p_tree.type = NodeType.SEQ
    return p_tree

def could_be_non(list):
    for l in list:
        if not(l.type==NodeType.WILDCARD or l.cardiOp == "<"):
            return False
    return True

def brutal_match(p_children, v_children):
    if len(p_children) == 0:
        if len(v_children) == 0:
            return True
        else:
            return False
    elif len(v_children) == 0:
        return could_be_non(p_children)
    p = tree_to_variant(get_parent(p_children))
    v = tree_to_variant(get_parent(v_children))
    return pattern_match_variant(p, v)

def match_para(p_children, v_children, group_id_list):
    return True

def match_seq(p, v, group_id_list):
    # Match sequence node p
    # 在这个seq match算法里是只考虑了NORMAL的，因为只有这个可以用在aho里面...
    # 要不要分成determined这种来做呢
    # 还需要能够把同构的determined tree给转化为字符串的能力
    p_children = p.children # p is seq
    v_children = v.children

    if p.determined:
        # if p is determined, all p_children are determined. So we could directly compare
        if len(p_children) != len(v_children):
            return False
        else:
            for p_child, v_child in zip(p_children, v_children):
                if v_child.id not in p_child.match_id:
                    return False
            return True
    else:
        if v.type != NodeType.SEQ:
            v_children = [v]
        subpattern_set = set()
        subpattern_dic = {} # abbr to subpattern
        subpattern_reverse_dic = {} # subpattern to abbr
        subpattern_order = [] # A list about the order of subpatterns in pattern.
        subpattern_tmp = ""
        pattern_segments = [] # [[[nodes], if-determined], ...]
        is_determined = True
        index = 0
        # Segment the pattern. The result at least has one segment
        for node in p_children:
            if len(pattern_segments) == 0:
                # Initialize when there is no segment
                pattern_segments.append([[node], node.determined])
                is_determined = node.determined
                if is_determined:
                    if node.label not in VariantTree.label_to_char:
                        VariantTree.label_to_char[node.label] = chr(VariantTree.label_index)
                        VariantTree.increase_label_index()
                    VariantTree.label_to_char[node.label] = VariantTree.label_to_char[node.label]
                    subpattern_tmp += VariantTree.label_to_char[node.label]
            elif node.determined != is_determined:
                # Change segment
                if is_determined:
                    # Get a subpattern
                    subpattern_order.append(subpattern_tmp)
                    if subpattern_tmp not in subpattern_set:
                        subpattern_set.add(subpattern_tmp)
                        subpattern_dic[chr(index)] = subpattern_tmp
                        subpattern_reverse_dic[subpattern_tmp] = chr(index)
                else:
                    # Initialize the new determined segment
                    subpattern_tmp = ""
                    if node.label not in VariantTree.label_to_char:
                        VariantTree.label_to_char[node.label] = chr(VariantTree.label_index)
                        VariantTree.increase_label_index()
                    VariantTree.label_to_char[node.label] = VariantTree.label_to_char[node.label]
                    subpattern_tmp += VariantTree.label_to_char[node.label]
                pattern_segments.append([[node], not is_determined])
                index += 1 # Handle new segment
                is_determined = not is_determined
            else:
                pattern_segments[index][0].append(node)
                if is_determined:
                    if node.label not in VariantTree.label_to_char:
                        VariantTree.label_to_char[node.label] = chr(VariantTree.label_index)
                        VariantTree.increase_label_index()
                    subpattern_tmp += VariantTree.label_to_char[node.label]

        # Deal with last subpattern if there is one
        if is_determined:
            subpattern_order.append(subpattern_tmp)
            if subpattern_tmp not in subpattern_set:
                subpattern_set.add(subpattern_tmp)
                subpattern_dic[chr(index)] = subpattern_tmp
                subpattern_reverse_dic[subpattern_tmp] = chr(index)
        elif len(pattern_segments) == 1:
            # Deal with case: pattern has only 1 non-determined part.
            return brutal_match(p_children, v_children, group_id_list)
        
        # Following lines: at least find one determined segment in pattern

        variant_str = ""
        for v_node in v_children:
            if v_node.label not in VariantTree.label_to_char:
                VariantTree.label_to_char[v_node.label] = chr(VariantTree.label_index)
                VariantTree.increase_label_index()
            variant_str += VariantTree.label_to_char[v_node.label]

        ac = ahocorasick.Automaton()

        for idx, subpattern in enumerate(subpattern_order):
            ac.add_word(subpattern, (idx, subpattern))

        ac.make_automaton()

        partial_graph = nx.DiGraph()
        subpattern_order_abbr = [subpattern_reverse_dic[x] for x in subpattern_order] # A list shows the order of subpatterns in pattern, but in abbr form

        discovery_iter = ac.iter(variant_str)

        if len(list(discovery_iter)) < len(subpattern_order):
            return False

        new_node_id = str(0)
        #new_node_id = 0

        # Handle discovered pattern as partial order graph vertices
        for end_index, (idx, original_value) in ac.iter(variant_str):
            # the subpattern include the char at end_index
            start_index = end_index - len(original_value) + 1
            #there might be several same subpattern in a pattern, so new_node here should be an id
            partial_graph.add_node(new_node_id, pattern=subpattern_reverse_dic[original_value], orders=[], start_index=start_index, end_index=end_index)
            if partial_graph.nodes[new_node_id]["pattern"] == subpattern_order_abbr[0]:
                # Initialize a new string if applies
                partial_graph.nodes[new_node_id]["orders"].append([0, "", [new_node_id]]) #[current position, last node id, path]
            for node, attributes in partial_graph.nodes(data=True):
                # Connect old nodes with the new node 
                if attributes["end_index"] < start_index: # should not be equal here
                    partial_graph.add_edge(node, new_node_id)
                    # Order: [index, node]
                    for order in attributes["orders"]:
                        if subpattern_order_abbr[order[0] + 1] == partial_graph.nodes[new_node_id]["pattern"]:
                            partial_graph.nodes[new_node_id]["orders"].append([order[0] + 1, node, order[2] + [new_node_id]])
            new_node_id = str(int(new_node_id) + 1)
            #new_node_id += 1

        print("Start partial graph")

        # After getting partial graph
        for node, attributes in partial_graph.nodes(data=True):
            for order in attributes["orders"]:
                if len(subpattern_order_abbr) == order[0] + 1:
                    subpattern_index_list = [[partial_graph.nodes[current_node]["start_index"], partial_graph.nodes[current_node]["end_index"]] for current_node in order[2]]
                    extended_subpattern_index_list = [-1]
                    for indices in subpattern_index_list:
                        extended_subpattern_index_list.append(indices[0])
                        extended_subpattern_index_list.append(indices[1])
                    extended_subpattern_index_list.append(len(v_children))
                    subvariant_index_list = [[extended_subpattern_index_list[i]+1, extended_subpattern_index_list[i+1]] for i in range(0, len(extended_subpattern_index_list)-1, 2)]

                    variant_segments = [v_children[subvariant_index[0]:subvariant_index[1]] for subvariant_index in subvariant_index_list]
                    non_determined_pattern_seg = [s[0] for s in pattern_segments if s[1]==False]
                    if pattern_segments[0][1]:
                        non_determined_pattern_seg = [[]] + non_determined_pattern_seg
                    if pattern_segments[-1][1]:
                        non_determined_pattern_seg = non_determined_pattern_seg + [[]]
                    if match_rest(non_determined_pattern_seg, variant_segments):
                        return True
        return False
    
def match_rest(p_list, v_list): # Need group or not?
    for p_segment, v_segment in zip(p_list, v_list):
        result = brutal_match(p_segment, v_segment)
        if not result:
            return False
    return True

# match p and v nodes in step 1
def single_node_match(p_node, v_node, group_id_list):
    # For variant, only NORMAL, SEQ, PARA
    if p_node.determined:
        p_node = serialize_determined_tree(p_node)
    if v_node.determined:
        v_node = serialize_determined_tree(v_node)
    if p_node.type == NodeType.WILDCARD:
        return True
    elif p_node.type == NodeType.GROUP:
        if v_node.type == NodeType.NORMAL and v_node.label in group_id_list:
            return True
        else:
            return False
    elif p_node.type == NodeType.ANY:
        if v_node.type == NodeType.NORMAL:
            return True
        else:
            return False
    elif p_node.type == NodeType.PARA:
        return match_para(p_node, v_node, group_id_list)
    elif p_node.type == NodeType.SEQ:
        return match_seq(p_node, v_node, group_id_list)
    else:
        # Case: NORMAL
        if v_node.type == NodeType.NORMAL and v_node.label == p_node.label:
            return True
        else:
            return False


def expand_tree(tree):
    # return a deque
    queue = deque([tree])
    visited = set()

    #Expand tree by BFS
    '''
    while queue:
        node = queue.popleft()
        if node in visited:
            continue
        print(node)

        visited.add(node)

        for child in node.children:
            if child not in visited:
                queue.append(child)
    '''
    index = 0
    while index < len(queue):
        for child in queue[index].children:
            if child not in visited:
                queue.append(child) 
        index += 1
    return queue

def dynamic_tree_matching(p_tree, v_tree, group_id_list):
    p_queue = list(reversed(expand_tree(p_tree)))
    v_queue = list(reversed(expand_tree(v_tree)))
    for p_node in p_queue:
        for v_node in v_queue:
            if single_node_match(p_node, v_node, group_id_list):
                p_node.match_id.append(v_node.id)
        if p_node.determined and len(p_node.match_id) == 0:
            # No match result for a determined node in pattern
            return False
    return len(p_queue[-1].match_id) > 0 # Really???

'''
    NORMAL = 1
    GROUP = 2
    ANY = 3
    WILDCARD = 4
    SEQ = 5
    PARA = 6 # Parallel and also Vertical cardi
    {"leaf": ["..."], "horizontalCardi": 0, "horizontalCardiOp": '=', "verticalCardi": 0, "verticalCardiOp": '='}
    '''

def tree_to_variant(tree):
    if tree.type == NodeType.WILDCARD:
        return {"leaf": ["..."], "horizontalCardi": 0, "horizontalCardiOp": '=', "verticalCardi": 0, "verticalCardiOp": '='}
    else:
        variant = {"leaf": [], "horizontalCardi": 0, "horizontalCardiOp": '=', "verticalCardi": 0, "verticalCardiOp": '='}
        if tree.cardinality > 0:
            if tree.cardiDirect == "vertical":
                variant["verticalCardi"] = tree.cardinality
                variant["verticalCardiOp"] = tree.cardiOp
            else:
                variant["horizontalCardi"] = tree.cardinality
                variant["horizontalCardiOp"] = tree.cardiOp
        if tree.type == NodeType.ANY:
            variant["leaf"].append("?")
        elif tree.type == NodeType.NORMAL or tree.type == NodeType.GROUP:
            variant["leaf"].append(tree.label)
        elif tree.type == NodeType.SEQ:
            variant.pop("leaf", None)
            variant["follows"] = [tree_to_variant(child) for child in tree.children]
        elif tree.type == NodeType.PARA:
            variant.pop("leaf", None)
            variant["parallel"] = [tree_to_variant(child) for child in tree.children]
        return variant

# query["follows"].append({"leaf": ["..."], "horizontalCardi": 0, "horizontalCardiOp": '=', "verticalCardi": 0, "verticalCardiOp": '='})
def calculate_query_stat(query):
    stat = {"depth": 0,
    "max_length": 0,
    "cardi_more_num": 0,
    "cardi_less_num": 0,
    "cardi_equal_num": 0,
    "non_cardi_num": 0,
    "horizontal_cardi_num": 0,
    "vertical_cardi_num": 0,
    "leaf_num": 0,
    "para_num": 0,
    "seq_num": 0,
    "avg_seq_len": 0,
    "avg_para_len": 0}

    if "leaf" in query:
        stat["depth"] = 1
        stat["max_length"] = 1
        stat["leaf_num"] += 1
    elif "follows" in query:
        stat["max_length"] = max([len(query["follows"]), max([calculate_query_stat(c)["max_length"] for c in query["follows"]])])
        stat["depth"] = max([calculate_query_stat(c)["depth"] for c in query["follows"]]) + 1
        stat["cardi_more_num"] = sum([calculate_query_stat(c)["cardi_more_num"] for c in query["follows"]])
        stat["cardi_less_num"] = sum([calculate_query_stat(c)["cardi_less_num"] for c in query["follows"]])
        stat["cardi_equal_num"] = sum([calculate_query_stat(c)["cardi_equal_num"] for c in query["follows"]])
        stat["non_cardi_num"] = sum([calculate_query_stat(c)["non_cardi_num"] for c in query["follows"]])
        stat["horizontal_cardi_num"] = sum([calculate_query_stat(c)["horizontal_cardi_num"] for c in query["follows"]])
        stat["vertical_cardi_num"] = sum([calculate_query_stat(c)["vertical_cardi_num"] for c in query["follows"]])
        stat["para_num"] = sum([calculate_query_stat(c)["para_num"] for c in query["follows"]])
        stat["seq_num"] = sum([calculate_query_stat(c)["seq_num"] for c in query["follows"]]) + 1
    elif "parallel" in query:
        stat["max_length"] = max([len(query["parallel"]), max([calculate_query_stat(c)["max_length"] for c in query["parallel"]])])
        stat["depth"] = max([calculate_query_stat(c)["depth"] for c in query["parallel"]]) + 1
        stat["cardi_more_num"] = sum([calculate_query_stat(c)["cardi_more_num"] for c in query["parallel"]])
        stat["cardi_less_num"] = sum([calculate_query_stat(c)["cardi_less_num"] for c in query["parallel"]])
        stat["cardi_equal_num"] = sum([calculate_query_stat(c)["cardi_equal_num"] for c in query["parallel"]])
        stat["non_cardi_num"] = sum([calculate_query_stat(c)["non_cardi_num"] for c in query["parallel"]])
        stat["horizontal_cardi_num"] = sum([calculate_query_stat(c)["horizontal_cardi_num"] for c in query["parallel"]])
        stat["vertical_cardi_num"] = sum([calculate_query_stat(c)["vertical_cardi_num"] for c in query["parallel"]])
        stat["para_num"] = sum([calculate_query_stat(c)["para_num"] for c in query["parallel"]]) + 1
        stat["seq_num"] = sum([calculate_query_stat(c)["seq_num"] for c in query["parallel"]])


    # Handle cardinality in this node    
    if query["horizontalCardiOp"] == ">" or query["horizontalCardiOp"] == "<" or query["horizontalCardi"] > 0:
        stat["horizontal_cardi_num"] += 1
        if query["horizontalCardiOp"] == ">":
            stat["cardi_more_num"] += 1
        elif query["horizontalCardiOp"] == "<":
            stat["cardi_less_num"] += 1
        elif query["horizontalCardiOp"] == "=":
            stat["cardi_equal_num"] += 1
    elif query["verticalCardiOp"] == ">" or query["verticalCardiOp"] == "<" or query["verticalCardi"] > 0:
        stat["vertical_cardi_num"] += 1
        if query["verticalCardiOp"] == ">":
            stat["cardi_more_num"] += 1
        elif query["verticalCardiOp"] == "<":
            stat["cardi_less_num"] += 1
        elif query["verticalCardiOp"] == "=":
            stat["cardi_equal_num"] += 1
    else:
        stat["non_cardi_num"] += 1

    return stat


