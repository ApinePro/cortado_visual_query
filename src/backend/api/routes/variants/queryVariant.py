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

def generate_tree(activities):
    pass

def generate_query(pattern, activities):
    cardi_ops = ["=", ">", "<"]
    if_leaf = random.random()
    if if_leaf > 0.3:
        # return leaf
        leaf = {"leaf": [], "horizontalCardi": 0, "horizontalCardiOp": '=', "verticalCardi": 0, "verticalCardiOp": '='}
        leaf["leaf"].append(random.choice(activities))
        op_rand = random.random()
        if op_rand < 0.2:
            if random.random() < 0.5:
                leaf["horizontalCardi"] = random.choice(list(range(1, 11)))
            else:
                leaf["verticalCardi"] = random.choice(list(range(1, 11)))
        return leaf 
    else:
        if_seq = random.random()
        if if_seq <= 0.5:
            seq = {"follows": [], "horizontalCardi": 0, "horizontalCardiOp": '=', "verticalCardi": 0, "verticalCardiOp": '='}
            child_num = random.choice(list(range(2, 11)))
            for i in range(child_num):
                seq["follows"].append(generate_query(pattern, activities))
            op_rand = random.random() # choose if it is not "="
            if op_rand < 0.2:
                # No vertical cardi for seq
                seq["horizontalCardi"] = random.choice(list(range(1, 11)))
                if random.random() < 0.5:
                    seq["horizontalCardiOp"] = "<"
                else:
                    seq["horizontalCardiOp"] = ">"
            return seq
        else:
            para = {"parallel": [], "horizontalCardi": 0, "horizontalCardiOp": '=', "verticalCardi": 0, "verticalCardiOp": '='}
            child_num = random.choice(list(range(2, 11)))
            seq_exist = 0
            for i in range(child_num):
                child = generate_query(pattern, activities)
                # Ensure only one sequence child
                while seq_exist == 1 and "follows" in child:
                    child = generate_query(pattern, activities)
                if "follows" in child:
                    seq_exist = 1
                para["parallel"].append(child)
            op_rand = random.random() # choose if it is not "="
            if op_rand < 0.2:
                if random.random() < 0.5 and seq_exist == 0:
                    para["horizontalCardi"] = random.choice(list(range(1, 4)))
                    if random.random() < 0.5:
                        para["horizontalCardiOp"] = "<"
                    else:
                        para["horizontalCardiOp"] = ">"
                else:
                    para["verticalCardi"] = random.choice(list(range(1, 4)))
                    if random.random() < 0.5:
                        para["horizontalCardiOp"] = "<"
                    else:
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


### New algorithm ###

import ahocorasick

class NodeType(Enum):
    NORMAL = 1
    CARDINALITY = 2
    GROUP = 3
    ANY = 4
    WILDCARD = 5
    SEQ = 6
    PARA = 7

class VariantTree:
    def __init__(self, id):
        self.id = id
        self.label = ""
        self.children = []
        self.type = NodeType.NORMAL
        self.cardinality = 0
        self.cardiOp = "="
        self.match_id = []
        self.determined = True

#para = {"parallel": [], "horizontalCardi": 0, "horizontalCardiOp": '=', "verticalCardi": 0, "verticalCardiOp": '='}

#TODO process equal!

def variant_to_tree(variant, group_id_list):
    tree =  VariantTree(random.randint(1, 10000))
    if "follows" in variant:
        tree.type = NodeType.SEQ
        tree.determined = False
        for child in variant["follows"]:
            tree.children.append(variant_to_tree(child))
    elif "parallel" in variant:
        tree.type = NodeType.PARA
        tree.determined = False
        for child in variant["parallel"]:
            tree.children.append(variant_to_tree(child))
    elif "leaf" in variant:
        # Possible cases: cardinality, group, any, wildcard, normal. Only consider horizontal cardinality now
        tree.label = variant["leaf"][0]
        if variant["horizontalCardi"] > 0 or variant["verticalCardi"] > 0:
            tree.type = NodeType.CARDINALITY
            tree.cardiOp = variant["horizontalCardiOp"]
            if tree.cardiOp != "=":
                tree.determined = False
        elif variant["leaf"][0] in group_id_list:
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
    return tree

def match_para(p_children, v_children, group_id_list):
    pass

class PartialOrderNode:
    def __init__(self, label):
        self.label = label
        self.children = []
        self.type = NodeType.NORMAL
        self.cardinality = 0
        self.cardiOp = "="
        self.match_id = []
        self.determined = True

import networkx as nx

def match_seq(p_children, v_children, group_id_list):
    subpattern_set = set()
    subpattern_dic = {} # abbr to subpattern
    subpattern_reverse_dic = {}
    subpattern_order = []
    subpattern_tmp = ""
    pattern_segments = []
    is_determined = True
    index = 0
    # Segment the pattern
    for node in p_children:
        if len(pattern_segments) == 0:
            pattern_segments.append([[node], node.determined])
            is_determined = node.determined
            if is_determined:
                subpattern_tmp += node.label
        if node.determined != is_determined:
            # Get a subpattern
            if is_determined:
                subpattern_order.append(subpattern_tmp)
                if subpattern_tmp not in subpattern_set:
                    subpattern_set.add(subpattern_tmp)
                    subpattern_dic[str(index)] = subpattern_tmp
                    subpattern_reverse_dic[subpattern_tmp] = str(index)
                subpattern_tmp = ""
            pattern_segments.append([[node], not is_determined])
            index += 1
            is_determined = not is_determined
        else:
            pattern_segments[index][0].append(node)
            if is_determined:
                subpattern_tmp += node.label
    # Deal with last subpattern if there is one
    if is_determined:
        subpattern_order.append(subpattern_tmp)
        if subpattern_tmp not in subpattern_set:
            subpattern_set.add(subpattern_tmp)
            subpattern_dic[str(index)] = subpattern_tmp
            subpattern_reverse_dic[subpattern_tmp] = str(index)

    #TODO How to deal with para/seq in variant?
    variant_str = ""
    for v_node in v_children:
        if v_node.type == NodeType.PARA:
            variant_str += "∧"
        elif v_node.type == NodeType.SEQ:
            variant_str += "→"
        else:
            variant_str += v_node.label

    ac = ahocorasick.Automaton()

    for idx, subpattern in enumerate(subpattern_order):
        ac.add_word(subpattern, (idx, subpattern))

    ac.make_automaton()

    partial_graph = nx.DiGraph()
    subpattern_order_abbr = [subpattern_reverse_dic[x] for x in subpattern_order]

    for end_index, (idx, original_value) in ac.iter(variant_str):
        start_index = end_index - len(original_value) + 1
        new_node = subpattern_reverse_dic[original_value] # abbr, but should be id here i think
        partial_graph.add_node(new_node, orders=[], start_index=start_index, end_index=end_index)
        if new_node == subpattern_order_abbr[0]:
            partial_graph.nodes[new_node]["orders"].append([0, ""])
        for node in partial_graph:
            if node["end_index"] < start_index: # should not be equal here
                partial_graph.add_edge(node, new_node)
                #order[index, node]
                for order in node["orders"]:
                    if subpattern_order_abbr[order[0] + 1] == new_node:
                        partial_graph.nodes[new_node]["orders"].append([order[0] + 1, node])
    # After getting partial graph
    for node in partial_graph:
        for order in node["orders"]:
            if len(subpattern_order_abbr) == order[0] + 1:
                success = 1


# match p and v nodes in step 1
def single_node_match(p_node, v_node, group_id_list):
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
        if v_node.type != NodeType.PARA:
            return False
        else:
            return match_para(p_node.children, v_node.children, group_id_list)
    elif p_node.type == NodeType.SEQ:
        if v_node.type != NodeType.SEQ:
            return False
        else:
            return match_seq(p_node.children, v_node.children, group_id_list)
    else:
        # Case: normal or cardinality
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

def dynamic_tree_matching(p_tree, v_tree):
    p_queue = expand_tree(p_tree)
    v_queue = expand_tree(v_tree)
    for p_node in reversed(p_queue):
        for v_node in reversed(v_queue):
            if single_node_match(p_node, v_node):
                p_node.match_id.append(v_node.id)