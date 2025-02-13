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
import time
import ahocorasick
from pulp import LpProblem, LpVariable, lpSum, LpBinary, LpStatusOptimal, PULP_CBC_CMD

import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
from viztracer import VizTracer

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

# The real variant query function
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

def generate_variant_info(infix_type, traces):
    user_defined = len(traces) == 0

    return VariantInformation(infix_type=infix_type, is_user_defined=user_defined)

'''
def query_variants(query, variants):
    cate_list = []
    trees = []

    for variant in variants:
        #print(variant)
        #print("")
        trees.append(variant_to_tree(variant, cate_list))
    
    m_l = []
    cate_list = []
    count = 0
    variant_list = []
    for bid, (variant, _, _, info) in cache.variants.items():
        count += 1
        if count >= 1 and count <= 14:
            #print("ID:", count,"\n")
            match_result = dynamic_tree_matching(variant_to_tree(query, cate_list)[0], variant_to_tree(variant.serialize(), cate_list)[0], cate_list)
            if match_result:
                #print("Matched: ", count)
                m_l.append(count)
                variant_list.append(count-1)
        if len(m_l) > 0 and len(m_l) < 14:
            print("Matched: ", m_l)
    return 0
'''

@router.post("/generate-query-test")
def generate_query_test(graphical_query: graphicalVariantQuery):
    print("Test start")
    
    activities = list(cache.parameters["activites"])
    '''
    query = {"follows": [], "horizontalCardi": 0, "horizontalCardiOp": '=', "verticalCardi": 0, "verticalCardiOp": '='}
    query["follows"].append({"leaf": ["..."], "horizontalCardi": 0, "horizontalCardiOp": '=', "verticalCardi": 0, "verticalCardiOp": '='})
    query["follows"].append({"leaf": ["send invoice"], "horizontalCardi": 0, "horizontalCardiOp": '=', "verticalCardi": 0, "verticalCardiOp": '='})
    query["follows"].append({"leaf": ["send reminder"], "horizontalCardi": 2, "horizontalCardiOp": '>', "verticalCardi": 0, "verticalCardiOp": '='})
    query["follows"].append({"leaf": ["pay"], "horizontalCardi": 0, "horizontalCardiOp": '=', "verticalCardi": 0, "verticalCardiOp": '='})
    query["follows"].append({"leaf": ["..."], "horizontalCardi": 0, "horizontalCardiOp": '=', "verticalCardi": 0, "verticalCardiOp": '='})
    '''
    TOTAL_TEST_NUM = 5

    execution_time = []
    leaf_num_list = []
    early_stop_list = []
    test_num = 0
    cate_list = generate_categories(activities)

    query_count = [0, 0, 0, 0]
    accumulated_time = [[], [], [], []]
    thredhold_list = [5, 10, 15]

    print("Total variants", len(cache.variants.items()))

    while query_count[0] < TOTAL_TEST_NUM or query_count[1] < TOTAL_TEST_NUM or query_count[2] < TOTAL_TEST_NUM or query_count[3] < TOTAL_TEST_NUM:
        #test_variants.append(generate_query(activities, ""))
        query = generate_query_tree_node(activities, 1, cate_list)
        '''
        if test_num == 0:
            result_stat = calculate_query_stat(query)
        else:
            stat = calculate_query_stat(query)
            for key in result_stat.keys():
                result_stat[key] += stat[key]
        '''
        count = 0
        filtered_variant_list = []
        start_time = time.time()
        num_variants = len(cache.variants.items())
        leaf_num_list_one_query = []
        if_early_stopping_one_query = []
        for bid, (variant, _, _, info) in cache.variants.items():
            #print("ID:", count,"\n")
            match_result, leaf_count, early_stopping = check_node(query, variant, cate_list)
            leaf_num_list_one_query.append(leaf_count)
            if_early_stopping_one_query.append(early_stopping)
            if match_result:
                #print("Matched: ", count)
                filtered_variant_list.append(count)
            count += 1
        end_time = time.time()
        leaf_median = np.median(leaf_num_list_one_query)
        query_early_stop = any(if_early_stopping_one_query) # If there is one variant with early stopping
        print(len(filtered_variant_list))
        if len(filtered_variant_list) != 0 and len(filtered_variant_list) != num_variants:
            avg_time = (end_time - start_time) / num_variants

            if leaf_median <= thredhold_list[0] and query_count[0] < TOTAL_TEST_NUM:
                accumulated_time[0].append(avg_time)
                query_count[0] += 1
            elif leaf_median > thredhold_list[0] and leaf_median <= thredhold_list[1] and query_count[1] < TOTAL_TEST_NUM:
                accumulated_time[1].append(avg_time)
                query_count[1] += 1
            elif leaf_median > thredhold_list[1] and leaf_median <= thredhold_list[2] and query_count[2] < TOTAL_TEST_NUM:
                accumulated_time[2].append(avg_time)
                query_count[2] += 1
            elif leaf_median > thredhold_list[2] and query_count[3] < TOTAL_TEST_NUM:
                accumulated_time[3].append(avg_time)
                query_count[3] += 1
            else:
                continue
            
            execution_time.append(avg_time) # average execution time for querying all variants in the dataset
            leaf_num_list.append(leaf_median) # median leaf number which is visited when querying all variants in the dataset
            early_stop_list.append(query_early_stop) # If there is one early stopping for this query
            if query_count[0] % 25 == 0 or query_count[1] % 25 == 0 or query_count[2] % 25 == 0 or query_count[3] % 25 == 0:
                print(query_count)

    time_df = pd.DataFrame({
     'runtime': execution_time,
     "number_of_leaves": leaf_num_list,
     "early_stop": early_stop_list
 })
    
    def categorize_leaf_num(row):
        n = row["number_of_leaves"]
        thredhold_list = [5, 10, 15]
        labels = ["(0,5]", "(5,10]", "(10,15]", "(15, ∞)"]
        if n <= thredhold_list[0]:
            return labels[0]
        elif n <= thredhold_list[1]:
            return labels[1]
        elif n <= thredhold_list[2]:
            return labels[2]
        else:
            return labels[3]

    time_df['leaves_evaluated'] = time_df.apply(categorize_leaf_num, axis=1)

    '''
    for t, n in zip(execution_time, leaf_num_list):
        if n <= thredhold_list[0]:
            accumulated_time[0].append(t)
            query_count[0] += 1
        elif n <= thredhold_list[1]:
            accumulated_time[1].append(t)
            query_count[1] += 1
        elif n <= thredhold_list[2]:
            accumulated_time[2].append(t)
            query_count[2] += 1
        else:
            accumulated_time[3].append(t)
            query_count[3] += 1
    '''

    print("Average execution result for each group: ")
    real_query_count = [] # filter out one group if there is no content
    real_times = []
    labels = ["(0,5]", "(5,10]", "(10,15]", "(15, ∞)"]
    real_label = []
    for i in range(4):
        if query_count[i] == 0:
            print("0" + " ")
        else:
            print(str(sum(accumulated_time[i])/query_count[i]) + " ")
            real_query_count.append(query_count[i])
            real_times.append(accumulated_time[i])
            real_label.append(labels[i])

    data = {
        'Median Number of Leaves Evaluated': real_label,
        'Runtime (seconds)': real_times
    }

    df = pd.DataFrame({
        'Median Number of Leaves Evaluated': sum([[i]*len(rt) for i, rt in zip(data['Median Number of Leaves Evaluated'], data['Runtime (seconds)'])], []),
        'Runtime (seconds)': sum(data['Runtime (seconds)'], [])
    })
    custom_palette = sns.color_palette("husl", len(df['Median Number of Leaves Evaluated'].unique()))


    def get_bar_fig(df):
        plt.figure(figsize=(8, 6))
        sns.boxplot(x='Median Number of Leaves Evaluated', y='Runtime (seconds)', data=df, palette=custom_palette, showfliers=False)

        plt.title('Runtime vs. Median Number of Leaves Evaluated')
        plt.xlabel('Median Number of Leaves Evaluated')
        plt.ylabel('Runtime (seconds)')
        plt.savefig("./bar_result.png")  # Save before plt.show()
        plt.show()
        plt.close()  # Close the figure to avoid duplication

    def get_runtime_count_fig(time_df):
        plt.figure(figsize=(10, 6))
        sns.histplot(
            data=time_df,
            x='runtime',
            hue='leaves_evaluated',
            multiple='stack',
            bins=100,
            palette='magma',
            edgecolor='black'
        )
        plt.title('Runtime Distribution by Median Number of Leaves Evaluated')
        plt.xlabel('Runtime (seconds)')
        plt.ylabel('Count')
        plt.savefig("./runtime_count.png")  # Save before plt.show()
        plt.show()
        plt.close()

    def get_early_stop_runtime_count_fig(time_df):
        plt.figure(figsize=(10, 6))
        sns.histplot(
            data=time_df,
            x='runtime',
            hue='early_stop',
            multiple='stack',
            bins=100,
            palette='magma',
            edgecolor='black'
        )
        plt.title('Runtime Distribution of early stopped and non-early stopped query')
        plt.xlabel('Runtime (seconds)')
        plt.ylabel('Count')
        plt.savefig("./early_runtime_count.png")  # Save before plt.show()
        plt.show()
        plt.close()

    get_bar_fig(df)
    get_runtime_count_fig(time_df)
    get_early_stop_runtime_count_fig(time_df)
    
    

    '''
    for key in result_stat.keys():
        result_stat[key] /= TOTAL_TEST_NUM

    print(result_stat)
    print("Average execution time: ", execution_time / TOTAL_TEST_NUM)
    '''
    #print(execution_time)
    
    return 0
    #return {"ids": variant_list}

def generate_categories(activities):
    NUM_CATEGORY = 3
    MAX_ACT_IN_CATEGORY = 3
    cate_dic = {}
    for i in range(NUM_CATEGORY):
        cate_label = "cate" + str(i)
        act_num = random.choices(list(range(2, MAX_ACT_IN_CATEGORY + 1)), weights=list(reversed(range(2, MAX_ACT_IN_CATEGORY+ 1))), k=1)[0]
        if len(activities) < act_num:
            act_num = len(activities + list(cate_dic.keys()))
        cate_dic[cate_label] = random.sample(activities + list(cate_dic.keys()), act_num)
    return cate_dic

def cate_member(activity, category, cate_list):
    if category not in cate_list:
        return False
    else:
        if activity in cate_list[category]:
            return True
        else:
            for c in cate_list[category]:
                result = cate_member(activity, c, cate_list)
                if result:
                    return True
            return False

@router.post("/graphical-variant-query")
def graphical_variant_query(graphical_query: graphicalVariantQuery):
    query = deserialize_query(graphical_query)
    global group_dic
    group_dic = json.loads(graphical_query.activityGroups)
    variant_list = defaultdict(list)
    count = 0

    
    variant_list = []
    time_list = []

    for bid, (variant, _, _, info) in cache.variants.items():
        #if check_node(query, variant):
        #    res.append(bid + 1)
        count += 1
        start_time = time.time()
        if count >= 1:
            if count:
                print("ID:", count,"\n")
                if check_node(query, variant, [])[0]:
                    variant_list.append(count - 1)
                print("########################################################################################################")
        end_time = time.time()
        time_list.append(end_time - start_time)
    print(time_list)
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

def check_node(node, variant, cate_list):
    count = 0
    early_stopping = False
    if node["operator"] == 'and':
        if len(node["children"]) > 0:
            result = True
        else:
            result = False
        i = 0
        while result and i < len(node["children"]):
            child = node["children"][i]
            child_result, child_count, child_early_stopping = check_node(child, variant, cate_list)
            count += child_count
            early_stopping = early_stopping | child_early_stopping
            result = result & child_result
            i += 1
        if not result and i < len(node["children"]) - 1:
            early_stopping = True

    if node["operator"] == 'or':
        result = False
        for child in node["children"]: 
            child_result, child_count, child_early_stopping = check_node(child, variant, cate_list)
            early_stopping = early_stopping | child_early_stopping
            count += child_count
            result = result | child_result
    # Ware: v or X?
    if node["operator"] == 'v':
        if "pattern" not in node or len(node["pattern"]) == 0:
            return(False, count, early_stopping)
        else:
            pattern = variant_to_tree(add_start_end_wildcard(node["pattern"]), cate_list)[0] # do add start end first in order to clear the marks
            variant = variant_to_tree(variant.serialize(), cate_list)[0]
            result = dynamic_tree_matching(pattern, variant, cate_list)
            count += calculate_leaf_num_pattern(pattern)
    if node["negation"] == True:
        return (not result, count, early_stopping)
    else:
        return (result, count, early_stopping)

############################################################

def node_is_leaf(node):
    return node.type == NodeType.NORMAL or node.type == NodeType.GROUP or node.type == NodeType.ANY or node.type == NodeType.WILDCARD

def pattern_match_variant(pattern, variant, cate_list):
    '''
    if len(pattern) == 0 and len(variant) == 0: # check for []
        return True
    elif len(pattern) == 0 and len(variant) != 0:
        return False
    '''

    if pattern == [] and variant == []: # check for []
        return True
    elif pattern == [] and variant != []:
        return False

    if pattern.type == NodeType.SEQ and len(pattern.children) == 1 and not check_have_cardi(pattern):
        pattern = pattern.children[0]
    elif pattern.type == NodeType.PARA and len(pattern.children) == 1 and pattern.children[0].type == NodeType.SEQ: #newly added, only single seq child inside para for "matching rest"
        pattern = pattern.children[0]
    
    if pattern.type == NodeType.WILDCARD: # newly added. Don't know why did not implement before
        return True

    # len(pattern) != 0
    if variant == []:
        if pattern.type == NodeType.WILDCARD:
            return True
        else:
            return False
    
    if variant.type == NodeType.SEQ and len(variant.children) == 1:
        variant = variant.children[0]
    
    p_head = find_head(pattern) #seq with cardi, leaf, para
    v_head = find_head(variant)

    p_body = cut_head(pattern)
    v_body = cut_head(variant)

    #print(node_content(pattern))
    #print(node_content(variant))
    #print("########################################################################")
    #print("PMV")
    #print(len(VariantTree.id_used))
    if p_head.type == NodeType.WILDCARD:
        any_head = VariantTree(label="??", node_type=NodeType.ANYGROUP)
        pattern_with_any = add_head(pattern, any_head)
        #print("##########################################################################\n")
        #return single_node_match(p_body, variant, cate_list) or single_node_match(pattern_with_any, variant, cate_list)
        return pattern_match_variant(p_body, variant, cate_list) or pattern_match_variant(pattern_with_any, variant, cate_list)
    elif check_have_cardi(p_head) and p_head.cardiDirect == "horizontal" and p_head.cardinality > 0:
        # resolve "horizontal" case
        pattern = add_head_cardinality(pattern, -1)
        p_head = find_head(pattern)
        #print("PHEAD AFTER REDUCE")
        #print(p_head)
        #print("##########################################################################\n")
        if p_head.cardiOp == '<':
            if p_head.cardinality == 0:
                pattern = replace_head(pattern, p_head) # Remove the cardinality characteristics of the head
            else:   
                pattern = add_head(pattern, p_head)
            #result = single_mode_match(pattern, variant, cate_list)
            result =  pattern_match_variant(pattern, variant, cate_list)
            if result:
                return result
            if not result: # Another chance: should it match at least once here? Now 0 head is allowed
                #return single_node_match(p_body, variant, cate_list)
                return pattern_match_variant(p_body, variant, cate_list)
        elif p_head.cardiOp == '=' and p_head.cardinality == 0: # 1->0, done
            pattern = replace_head(pattern, p_head)
        elif p_head.cardiOp == '>' and p_head.cardinality == 0:
            new_pattern = replace_head(pattern, p_head)
            pattern = add_head_cardinality(pattern, 1)
            pattern = add_head(pattern, p_head)
            return (pattern_match_variant(new_pattern, variant, cate_list) or
                    (pattern_match_variant(pattern, variant, cate_list) if variant != [] else False))
        else:    
            pattern = add_head(pattern, p_head)
        # I think no else case
        return pattern_match_variant(pattern, variant, cate_list)
    

    # Not horizontal cardinality
    elif check_have_cardi(p_head) and p_head.cardiDirect == "vertical" and p_head.cardinality > 0: # resolve vertical (only =) (only EQ for para, right?)
        if p_head.type == NodeType.PARA:
            for element in p_head.children:
                if element.cardinality == 0: # newly added
                    element.cardinality = 1
                element.cardinality *= p_head.cardinality
            p_head.cardinality = 0
        if node_is_leaf(p_head):
            # Add a para parent for leaf with cardi
            p_head = get_para_parent([p_head]) #newly added
            p_head.update_determined()

    else:
        # p_head: para, leaf (may have vertical...)
        #print("HEAD IS PARA OR LEAF")
        return match_head(p_head, v_head, cate_list) and pattern_match_variant(p_body, v_body, cate_list)

def add_head_cardinality(pattern, num):
    pattern = pattern.copy()
    if pattern.type != NodeType.SEQ: # pattern is leaf / para. head == pattern
        pattern.cardinality += num
    else:
        pattern.children[0].cardinality += num
    #print(pattern)
    return pattern

def add_head(pattern, head):
    pattern = pattern.copy()
    if pattern.type != NodeType.SEQ:
        child = pattern.copy()
        pattern = VariantTree(node_type=NodeType.SEQ, children=[child])
    if head.type == NodeType.SEQ: # if head is seq+cardi
        for p in reversed(head.children):
            pattern.children.insert(0, p)
    else: # else, reduce the cardinality then insert to the front
        new_head = head.copy()
        new_head.cardinality = 0
        new_head.cardiOp = "="
        pattern.children.insert(0, new_head)
    pattern.update_determined()
    return pattern

def replace_head(pattern, head): # For '=' and '<;, when 1->0
    pattern = pattern.copy()
    if pattern.type != NodeType.SEQ: # pattern is leaf / para. head == pattern
        pattern.cardiOp = '='
        pattern.update_determined() # newly added
    else:
        if head.type != NodeType.SEQ: # pattern is seq, head is leaf/para
            pattern.children[0].cardiOp = '='
            pattern.children[0].update_determined()
        else: # pattern is seq, head is seq
            pattern.children.pop(0)
            for p in reversed(head.children):
                pattern.children.insert(0, p)
    pattern.update_determined()
    return pattern

def variant_can_be_none(variant):
    # return if a variant can be nothing. But there is also a function "could be none" to check node list
    if variant.cardiOp == "<":
        return True
    else:
        if variant.type == NodeType.SEQ:
            for child in variant.children:
                if not variant_can_be_none(child):
                    return False
        elif variant.type == NodeType.PARA:
            for child in variant.children:
                if not variant_can_be_none(child):
                    return False
        else:
            return variant.type == NodeType.ANYGROUP or variant.type == NodeType.WILDCARD
        return True
    
def match_head(p_head, v_head, cate_list):
    # ?? Wildcard case
    if p_head.type == NodeType.ANYGROUP:
        return True

    if p_head.type == NodeType.PARA and node_is_leaf(v_head):
        return compare_para_leaf(p_head, v_head, cate_list)
    elif node_is_leaf(p_head) and v_head.type == NodeType.PARA:
        return compare_leaf_para(p_head, v_head, cate_list)
    elif p_head.type == NodeType.PARA and v_head.type == NodeType.PARA:
        return compare_para(p_head, v_head, cate_list)
    elif node_is_leaf(p_head) and node_is_leaf(v_head):
        return compare_leaf(p_head, v_head, cate_list)
    return False

def compare_para(p_head, v_head, cate_list): # With cardinality
    # If vertical there is no seq inside. seq need to match seq，sometimes to be none (but don't consider to be leaf?)
    # Need to consider the case that ... can match everything

    v_seq_child = None
    p_seq_child = None
    wildcard_in_p = False
    for c in v_head.children:
        if c.type == NodeType.SEQ:
            v_seq_child = c.copy()
            break
    for c in p_head.children:
        if c.type == NodeType.SEQ:
            p_seq_child = c.copy()
        elif c.type == NodeType.WILDCARD:
            wildcard_in_p = True

    #First handle seq
    if v_seq_child:
        if not p_seq_child and not wildcard_in_p:
            return False
        elif p_seq_child and not pattern_match_variant(get_seq_parent(p_seq_child.children), get_seq_parent(v_seq_child.children), cate_list):
            # ckeck follows
            return False
        else:
            # p and v's seq are removed.
            p_head.children = [c.copy() for c in p_head.children if c.type != NodeType.SEQ]
            v_head.children = [c.copy() for c in v_head.children if c.type != NodeType.SEQ]
            if p_seq_child:
                return compare_para_no_cardi(p_head, v_head, 1, cate_list)
    else:
        if p_seq_child:
            if not variant_can_be_none(p_seq_child):
                return False
            else:
                # with seq, para could only cardi = 1
                p_head.children = [c.copy() for c in p_head.children if c.type != NodeType.SEQ]
                return compare_para_no_cardi(p_head, v_head, 1, cate_list)
            
    # Both do not have seq now, but can have vertical cardi

    determined_count = 0
    v_count = len(v_head.children)
    for c in p_head.children:
        # These children only have vertical cardinality
        if c.type != NodeType.WILDCARD and (c.cardiOp == "=" or c.cardiOp == ">"):
            determined_count += c.cardinality
            if c.cardiOp == "=" and c.cardinality == 0:
                determined_count += 1
    
    if p_head.cardiOp == "=":
        if p_head.cardinality == 0:
            i = 1
        else:
            i = p_head.cardinality
        if determined_count * i > v_count:
            return False
        else:
            return compare_para_no_cardi(p_head, v_head, i, cate_list)
    elif p_head.cardiOp == "<":
        for i in range(p_head.cardiOp + 1):
            result = compare_para_no_cardi(p_head, v_head, i, cate_list)
            if result:
                return True
        return False
    elif p_head.cardiOp == ">":
        i = p_head.cardinality
        if determined_count > 0:
            while i * determined_count <= v_count:
                result = compare_para_no_cardi(p_head, v_head, i, cate_list)
                if result:
                    return True
                i += 1
            return False
        else:
            # Only count leaf, there are only <
            minimum_leaf = 0
            for c in p_head.children:
                if node_is_leaf(c) and c.cardiOp == "<" and c.type != NodeType.WILDCARD:
                    if minimum_leaf == 0:
                        minimum_leaf = c.cardinality
                    else:
                        if c.cardinality < minimum_leaf:
                            minimum_leaf = c.cardinality

            v_count = len(v_head.children)
            while i * minimum_leaf <= v_count:
                result = compare_para_no_cardi(p_head, v_head, i, cate_list)
                if result:
                    return True
                i += 1
            return False
    else:
        return False
    

def compare_para_no_cardi(p_head, v_head, count, cate_list):
    #print(p_head)
    #print(v_head)
    # Only leaves in both heads
    p_dic = {}
    v_dic = {}
    border_dic = {}
    for c in p_head.children:
        label = c.label
        if label not in p_dic:
            p_dic[label] = [0, 0, 0]
        if c.cardiOp == "=":
            if c.cardinality == 0:
                p_dic[label][1] += 1
            else:  
                p_dic[label][1] += c.cardinality
        elif c.cardiOp == "<":
            p_dic[label][2] += c.cardinality
        else:
            p_dic[label][1] += (c.cardinality - 1)
            p_dic[label][0] += 1

    for c in v_head.children:
        label = c.label
        if label not in v_dic:
            v_dic[label] = 0
        v_dic[label] += 1

    if "..." in p_dic:
        for k in p_dic.keys():
            p_dic[k][2] = 0

    for k in p_dic.keys():
        # Build border dictionary
        for i in range(3):
            p_dic[k][i] *= count
        cardi = p_dic[k][1]
        if cardi > 0 and k != "?" and k not in cate_list:
            # determined leaves, match these first and delete them
            if k not in v_dic.keys() or v_dic[k] < cardi:
                return False
            else:
                v_dic[k] -= cardi
                if v_dic[k] == 0:
                    v_dic.pop(k)
                if p_dic[k][0] == 0 and p_dic[k][2] == 0:
                    p_dic.pop(k)
                    break
                else:
                    p_dic[k][1] = 0
        border = [p_dic[k][1], p_dic[k][1]]
        if p_dic[k][0] > 0:
            border[0] += p_dic[k][0]
            border[1] = -1
        if p_dic[k][2] > 0:
            if border[1] >= 0:
                border[1] += p_dic[k][2]
        if border[1] != -1 and border[0] > border[1]:
            return False
        border_dic[k] = border
    
    if "..." in p_dic:
        border_dic["..."] = [0, -1]

    if(not p_dic and not v_dic): #newly added for the case that p_dic and v_dic are both cleared
        return True

    problem = LpProblem("Element_Classification")
    # elements, categories
    elements = []
    for k in v_dic.keys():
        for i in range(v_dic[k]):
            elements.append(k + "\u2237\u2980" + str(i))
    classifications = border_dic.keys()

    # Define variable
    z = LpVariable.dicts("assign", (elements, classifications), cat=LpBinary)

    def element_in_category(e, c, cate_list):
        # Really?
        #if c == "?" or c == "wildcard":
        if c == "?" or c == "...":
            return True
        e_label = e.split("\u2237\u2980")[0]
        if c not in cate_list:
            if e_label == c:
                return True
            else:
                return False
        else:
            # c is group
            return cate_member(e_label, c, cate_list)
    
    #print("")
    #print("Solve this:")
    #print(classifications)
    #print(elements)
    #print(border_dic)
    #print("")
    
    # Add restrictions：one element - one category
    for e in elements:
        problem += lpSum(z[e][c] for c in classifications if element_in_category(e, c, cate_list)) == 1
        problem += lpSum(z[e][c] for c in classifications if not element_in_category(e, c, cate_list)) == 0

    for c in classifications:
        problem += lpSum(z[e][c] for e in elements) >= border_dic[c][0]  # c 至少有n个元素
        if border_dic[c][1] != -1:
            problem += lpSum(z[e][c] for e in elements) <= border_dic[c][1]  # c 最多有n元素

    problem += lpSum(0)  # No optimization target. It's no an optmization problem

    # solve problem
    solver = PULP_CBC_CMD(msg=False)
    problem.solve(solver)
    #print("LP")

    # output
    if problem.status == LpStatusOptimal:
        
        #print("exist solution")
        #for e in elements:
        #    for c in classifications:
        #        if z[e][c].value() == 1:
        #            print(f"{e} is assigned to {c}")
        
        return True
    else:
        #print("No solution")
        return False

def compare_parallel_dics(p_dic, v_dic):

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

    if len(p_dic) == 0 and diff_count == 0:
        #print("PARA TRUE")
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

def compare_leaf(p_head, v_head, cate_list):
    if p_head.type == NodeType.ANY or p_head.type == NodeType.WILDCARD or p_head.label == v_head.label:
        return True
    elif p_head.type == NodeType.GROUP and cate_member(v_head.label, p_head.label, cate_list):
        return True
    else:
        return False
    
def compare_leaf_para(p_head, v_head, cate_list):
    # p is leaf and v is para
    if p_head.type == NodeType.WILDCARD:
        return True
    elif (p_head.cardiDirect == "horizontal" and p_head.cardinality > 1) or p_head.cardiOp != "=":
        return False
    elif p_head.cardiDirect == "vertical" and p_head.cardiOp != "<" and p_head.cardinality > len(v_head.children):
        return False
    elif p_head.cardiDirect == "vertical" and p_head.cardiOp != ">" and p_head.cardinality < len(v_head.children) and len(v_head.children) > 1:
        # newly added. When p_head.cardi = 0 and there is a problem when len(v.chilren) == 1
        return False
    else:
        # to here
        extend_p = VariantTree(node_type=NodeType.PARA, children=[p_head.copy()])
        extend_p.update_determined()
        return compare_para(extend_p, v_head, cate_list)

def compare_para_leaf(p_head, v_head, cate_list):
    # p is leaf and v is para
    extend_v = VariantTree(node_type=NodeType.PARA, children=[v_head.copy()])
    extend_v.update_determined()
    return compare_para(p_head, extend_v, cate_list)

def find_head(variant):
    if variant.type == NodeType.SEQ:
        return variant.children[0].copy() # seq: the first sub-pattern
    else:
        return variant.copy() # case: only parallel or leaf.

def cut_head(variant):
    #print(variant)
    variant = variant.copy()
    if variant.type == NodeType.SEQ:
        variant.children.pop(0)
        if len(variant.children) > 0:
            return variant
        else:
            return []
    else:
        return []

def check_cardi_direction(pattern):
    if pattern.cardiDirect == "vertical":
        return "vertical"
    elif pattern.cardiDirect == "hotizontal":
        return "horizontal"
    else:
        return "error"
    
def check_have_cardi(pattern):
    #print("Check this: \n")
    #print(pattern)
    if pattern.cardinality > 0:
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

'''
def add_start_end_wildcard(pattern):
    pattern = pattern.copy()
    t = pattern.copy()
    if len(pattern.children) == 0:
        print(1)
    # Pattern is for sure a seq?
    if pattern.type != NodeType.SEQ:
        pattern = get_seq_parent([pattern])
    if not (node_is_leaf(pattern.children[0]) and (pattern.children[0].label == "▷" or pattern.children[0].type == NodeType.WILDCARD)):
        head = VariantTree(label="...", node_type=NodeType.WILDCARD)
        pattern.children.insert(0, head)
    elif node_is_leaf(pattern.children[0]) and pattern.children[0].label == "▷":
        pattern.children.pop(0)
    if len(pattern.children) == 0:
        print(1)
    if not (node_is_leaf(pattern.children[-1]) and (pattern.children[-1].label == "▢" or pattern.children[-1].type == NodeType.WILDCARD)):
        tail = VariantTree(label="...", node_type=NodeType.WILDCARD)
        pattern.children.append(tail)
    elif node_is_leaf(pattern.children[0]) and pattern.children[-1].label == "▢":
        pattern.children.pop(-1) #any error if nothing after pop?
    pattern.update_determined()
    return pattern
'''

### Generate testing code ###

"""query_tree["pattern"] = graphical_query["pattern"]
    query_tree["operator"] = graphical_query["operator"]
    query_tree["negation"] = graphical_query["negation"]
    query_tree["children"]"""

# The query cannot generate group?
#activities = ["...", "?"] + [str(x) for x in range(10)]

'''
def generate_query_tree_node(activities, depth, cate_list):
    THRES_NEGATE = 0.3
    THRES_LEAF = 0.2
    THRES_START_END = 0.3
    MAX_CHILD_NUM = 4
    

    THRES_LEAF *= 0.5 ** (depth - 1)
    depth += 1
    node = {}
    if_leaf = random.random()
    if if_leaf > THRES_LEAF:
        node["pattern"] = generate_query(activities + ["...", "?"] + list(cate_list.keys()), "", 1)
        node["operator"] = "v"
        if random.random() > THRES_START_END:
            node["pattern"].children.insert(0, VariantTree(label="▷"))
        if random.random() > THRES_START_END:
            node["pattern"].children.append(VariantTree(label="▢"))
    else:
        if random.random() > 0.5:
            node["operator"] = "and"
        else:
            node["operator"] = "or"
        node["children"] = []
        child_num = random.choices(list(range(2, MAX_CHILD_NUM + 1)), weights=list(reversed(range(2, MAX_CHILD_NUM+ 1))), k=1)[0]
        for i in range(child_num):
            node["children"].append(generate_query_tree_node(activities, depth, cate_list))
    if random.random() < THRES_NEGATE:
        node["negation"] = True
    else:
        node["negation"] = False
    return node
'''

def generate_query_tree_node(activities, depth, cate_list):
    THRES_NEGATE = 0.3
    THRES_LEAF = 0.2
    THRES_START_END = 0.3
    MAX_CHILD_NUM = 4
    

    THRES_LEAF *= 0.5 ** (depth - 1)
    depth += 1
    node = {}
    if_leaf = random.random()
    if if_leaf > THRES_LEAF:
        node["pattern"] = generate_query(activities + ["...", "?"] + list(cate_list.keys()), "", 1)
        node["operator"] = "v"
        if len(node["pattern"]["follows"]) == 0:
            print(1)
        if random.random() > THRES_START_END:
            node["pattern"]["follows"].insert(0, {"leaf": ["▷"], "horizontalCardi": 0, "horizontalCardiOp": '=', "verticalCardi": 0, "verticalCardiOp": '='})
        if random.random() > THRES_START_END:
            node["pattern"]["follows"].append({"leaf": ["▢"], "horizontalCardi": 0, "horizontalCardiOp": '=', "verticalCardi": 0, "verticalCardiOp": '='})
    else:
        if random.random() > 0.5:
            node["operator"] = "and"
        else:
            node["operator"] = "or"
        node["children"] = []
        child_num = random.choices(list(range(2, MAX_CHILD_NUM + 1)), weights=list(reversed(range(2, MAX_CHILD_NUM+ 1))), k=1)[0]
        for i in range(child_num):
            node["children"].append(generate_query_tree_node(activities, depth, cate_list))
    if random.random() < THRES_NEGATE:
        node["negation"] = True
    else:
        node["negation"] = False
    return node

def generate_query(activities, parent_type, depth):
    THRES_LEAF = 0.15
    THRES_CARDI = 0.2
    MAX_SEQ_GROUP = 7
    MAX_PARA_GROUP = 4
    MAX_GROUP_CARDI = 3
    
    THRES_LEAF *= 0.5 ** (depth - 1)
    depth += 1

    cardi_ops = ["=", ">", "<"]
    if_leaf = random.random()
    if (if_leaf > THRES_LEAF and depth - 1 != 1) or depth == 3:
        # return leaf, 70% probability
        leaf = {"leaf": [], "horizontalCardi": 0, "horizontalCardiOp": '=', "verticalCardi": 0, "verticalCardiOp": '='}
        leaf["leaf"].append(random.choice(activities))
        if leaf["leaf"][0] != "...":
            if random.random() < THRES_CARDI:
                # Cardinality 1-5
                if random.random() > 0.5 and parent_type != "para":
                    # No horizontal leaf for para group!
                    leaf["horizontalCardi"] = random.choices(list(range(1, 6)), weights=list(reversed(range(1, 6))), k=1)[0]
                    op_type_rand = random.random()
                    if op_type_rand < 1/3:
                        leaf["horizontalCardiOp"] = "="
                        if leaf["horizontalCardi"] == 1:
                            leaf["horizontalCardi"] = 0
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
                    else:
                        if leaf["verticalCardi"] == 1:
                            leaf["verticalCardi"] = 0
        if depth == 1:
            return {"follows": [leaf], "horizontalCardi": 0, "horizontalCardiOp": '=', "verticalCardi": 0, "verticalCardiOp": '='}
        else:
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
                else:
                    if seq["horizontalCardi"] == 1:
                        seq["horizontalCardi"] = 0
            return seq
        else:
            para = {"parallel": [], "horizontalCardi": 0, "horizontalCardiOp": '=', "verticalCardi": 0, "verticalCardiOp": '='}
            child_num = random.choices(list(range(2, MAX_PARA_GROUP + 1)), weights=list(reversed(range(2, MAX_PARA_GROUP + 1))), k=1)[0]
            seq_exist = True
            for i in range(child_num):
                child = generate_query(activities, "para", depth)
                # Ensure only one sequence child
                while seq_exist and "follows" in child:
                    # If double seq, generate again
                    child = generate_query(activities, "para", depth)
                if "follows" in child:
                    seq_exist = True
                para["parallel"].append(child)
            op_rand = random.random() # choose if it is not "="
            if op_rand < 0.2:
                # No vertical cardi for para if there is seq child
                cardi = random.choices(list(range(1, MAX_GROUP_CARDI)), weights=list(reversed(range(1, MAX_GROUP_CARDI))), k=1)[0] #注意一下这个 等于号等于1的时候是？
                if random.random() > 0.5 or seq_exist:
                    para["horizontalCardi"] = cardi
                    op_type_rand = random.random()
                    if op_type_rand < 1/3:
                        para["horizontalCardiOp"] = "<"
                    elif op_type_rand < 2/3:
                        para["horizontalCardiOp"] = ">"
                    else:
                        if para["horizontalCardi"] == 1:
                            para["horizontalCardi"] = 0
                else:
                    para["verticalCardi"] = cardi
                    op_type_rand = random.random()
                    if op_type_rand < 1/3:
                        para["verticalCardiOp"] = "<"
                    elif op_type_rand < 2/3:
                        para["verticalCardiOp"] = ">"
                    else:
                        if para["verticalCardi"] == 1:
                            para["verticalCardi"] = 0

            return {"follows": [para], "horizontalCardi": 0, "horizontalCardiOp": '=', "verticalCardi": 0, "verticalCardiOp": '='}
        
'''
def generate_query(activities, parent_type, depth):
    THRES_LEAF = 0.15
    THRES_CARDI = 0.2
    MAX_SEQ_GROUP = 7
    MAX_PARA_GROUP = 4
    MAX_GROUP_CARDI = 3
    
    THRES_LEAF *= 0.5 ** (depth - 1)
    depth += 1

    cardi_ops = ["=", ">", "<"]
    if_leaf = random.random()
    if (if_leaf > THRES_LEAF and depth - 1 != 1) or depth == 3:
        # return leaf, 70% probability
        leaf = VariantTree(label=random.choice(activities))
        if leaf.label == "...":
            leaf.type = NodeType.WILDCARD
        if leaf.type != NodeType.WILDCARD:
            if random.random() < THRES_CARDI:
                # Cardinality 1-5
                if random.random() > 0.5 and parent_type != NodeType.PARA:
                    # No horizontal leaf for para group!
                    leaf.cardiDirect = "horizontal"
                    leaf.cardinality = random.choices(list(range(1, 6)), weights=list(reversed(range(1, 6))), k=1)[0]
                    op_type_rand = random.random()
                    if op_type_rand < 1/3:
                        leaf.cardiOp = "="
                    elif op_type_rand < 2/3:
                        leaf.cardiOp = ">"
                    else:
                        leaf.cardiOp = "<"
                else:
                    leaf.cardiDirect == "vertical"
                    leaf.cardinality = random.choices(list(range(1, 6)), weights=list(reversed(range(1, 6))), k=1)[0]
                    op_type_rand = random.random()
                    if op_type_rand < 1/3:
                        leaf.cardiOp = "<"
                    elif op_type_rand < 2/3:
                        leaf.cardiOp = ">"
        tree = VariantTree()
        tree.children = [leaf]
        return tree
    else:
        #Non-leafnode, including half seq and half parallel group 
        if_seq = random.random()
        if if_seq <= 0.5 or parent_type == NodeType.PARA or depth - 1 == 1:
            seq = VariantTree(node_type=NodeType.SEQ)
            child_num = random.choices(list(range(2, MAX_SEQ_GROUP + 1)), weights=list(reversed(range(2, MAX_SEQ_GROUP + 1))), k=1)[0]
            for i in range(child_num):
                seq.children.append(generate_query(activities, "seq", depth))
            op_rand = random.random() # choose if it is not "="
            if op_rand < 0.2:
                # No vertical cardi for seq, max 3 cardinality
                seq.cardiDirect = "horizontal"
                seq.cardinality = random.choices(list(range(1, MAX_GROUP_CARDI + 1)), weights=list(reversed(range(1, 4))), k=1)[0]
                op_type_rand = random.random()
                if op_type_rand < 1/3:
                    seq.cardiOp = "<"
                elif op_type_rand < 2/3:
                    seq.cardiOp = ">"

            return seq
        else:
            para = VariantTree(node_type=NodeType.PARA)
            child_num = random.choices(list(range(2, MAX_PARA_GROUP + 1)), weights=list(reversed(range(2, MAX_PARA_GROUP + 1))), k=1)[0]
            seq_exist = True
            for i in range(child_num):
                child = generate_query(activities, "para", depth)
                # Ensure only one sequence child
                while seq_exist and child.type == NodeType.SEQ:
                    # If double seq, generate again
                    child = generate_query(activities, "para", depth)
                if child.type == NodeType.SEQ:
                    seq_exist = True
                para.children.append(child)
            op_rand = random.random() # choose if it is not "="
            if op_rand < 0.2:
                # No vertical cardi for para if there is seq child
                cardi = random.choices(list(range(1, MAX_GROUP_CARDI)), weights=list(reversed(range(1, MAX_GROUP_CARDI))), k=1)[0] #注意一下这个 等于号等于1的时候是？
                if random.random() > 0.5 or seq_exist:
                    para.cardiDirect = "horizontal"
                    para.cardinality = cardi
                    op_type_rand = random.random()
                    if op_type_rand < 1/3:
                        para.cardiOp = "<"
                    elif op_type_rand < 2/3:
                        para.cardiOp = ">"
                else:
                    para.cardiDirect = "vertical"
                    para.cardinality = cardi
                    # edited: for vertical cardi only = exists
                    para.cardiOp = "="

            tree = VariantTree(node_type=NodeType.SEQ)
            tree.children = [para]
            return tree
'''

########################################################################################################
### New algorithm ###

class NodeType(Enum):
    NORMAL = 1
    GROUP = 2
    ANY = 3
    WILDCARD = 4
    SEQ = 5
    PARA = 6 # Parallel and also Vertical cardi
    ANYGROUP = 7

class VariantTree:
    label_to_char = {}
    label_index = 0
    id_used = []
    preserved_char = ["(", ")", "→", "∧"]

    def __init__(self, id=random.randint(1, 1000000), label = "", children = [], node_type = NodeType.NORMAL, cardiDirect = "vertical"
                 , cardinality = 0, cardiOp = "=", match_id = [], determined = False, variant = 0):
        self.label = label
        self.children = [c for c in children]
        self.type = node_type
        self.cardiDirect = cardiDirect
        self.cardinality = cardinality
        self.cardiOp = cardiOp
        self.match_id = [id for id in match_id]
        self.determined = determined
        self.variant = variant
        while id in VariantTree.id_used:
            id += 1
        self.id = id
        VariantTree.id_used.append(id)

    def copy(self):
        #print("copy")
        new_node = VariantTree()
        new_node.label = self.label 
        new_node.type = self.type
        new_node.cardiDirect = self.cardiDirect
        new_node.cardinality = self.cardinality
        new_node.cardiOp = self.cardiOp
        new_node.match_id = [id for id in self.match_id]
        new_node.determined = self.determined
        new_node.variant = self.variant
        if len(self.children) == 0:
            new_node.children = []
        else:
            new_node.children = [c.copy() for c in self.children]
        return new_node
    
    def realcopy(self):
        # Also copy id...
        new_node = VariantTree()
        new_node.id = self.id
        new_node.label = self.label 
        new_node.type = self.type
        new_node.cardiDirect = self.cardiDirect
        new_node.cardinality = self.cardinality
        new_node.cardiOp = self.cardiOp
        new_node.match_id = [id for id in self.match_id]
        new_node.determined = self.determined
        new_node.variant = self.variant
        if len(self.children) == 0:
            new_node.children = []
        else:
            new_node.children = [c.copy() for c in self.children]
        return new_node
    
    def update_determined(self): #re-calculate "determined" according to the children
        if self.type == NodeType.NORMAL and self.cardinality == 0:
            self.determined = True
        elif self.type == NodeType.SEQ or self.type == NodeType.PARA:
            self.determined = True
            for c in self.children:
                if not c.update_determined():
                    self.determined = False
        else:
            self.determined = False
        return self.determined
    
    @staticmethod
    def increase_label_index():
        VariantTree.label_index += 1
        while chr(VariantTree.label_index) in VariantTree.preserved_char:
            VariantTree.label_index += 1
        #print(VariantTree.label_index)

    @staticmethod
    def clear_dic():
        VariantTree.label_index = 0
        VariantTree.label_to_char = {}
        VariantTree.id_used = []

def variant_to_tree(variant, cate_list):
    # Convert process variant to pattern/variant tree.
    # Including the expansion of vertical and parallel cardinality(Simplification 1)
    #return True
    tree = VariantTree()
    tree.variant = variant

    if "follows" in variant:
        tree.type = NodeType.SEQ
        tree.determined = True # default is true, if any child is false, it becomes false
        tree.label = "→"
        for child in variant["follows"]:
            # Process wildcard simplification.
            # ... can simplify cardinality "<" and ">", and also "..." could be merged.
            child_node = variant_to_tree(child, cate_list) # Could be a list ##这个什么时候会返回一个空值？
            if len(tree.children) > 0 and tree.children[-1].type == NodeType.WILDCARD:
                # wildcard before node
                i = 0
                while i < len(child_node) and (child_node[i].cardiOp == "<" or child_node[i].type == NodeType.WILDCARD):
                    i += 1
                child_node = child_node[i:]
                if len(child_node) > 0 and child_node[0].cardiOp == ">" and child_node[0].cardiDirect == "horizontal":
                    child_node[0].cardiOp = "="
                    child_node[0].determined = True
                    if child_node[0].cardinality == 1:
                        child_node[0].cardinality = 0
            
        
            if child_node is not None and len(child_node) > 0:
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
            # if child_node is only a wildcard and it was reduced, do nothing
        for child in tree.children:
            tree.determined = (tree.determined & child.determined)
        if len(tree.children) == 1:
            tree = tree.children[0]
    elif "parallel" in variant:
        tree.type = NodeType.PARA
        tree.determined = True
        tree.label = "∧"
        wildcard_exist = False
        for child in variant["parallel"]:
            child_node = variant_to_tree(child, cate_list)
            if len(child_node) > 1:
                # is a seq child node
                seq_child = VariantTree()
                seq_child.determined = all([c.determined for c in child_node])
                seq_child.children = [c.copy() for c in child_node]
                tree.children = tree.children + seq_child
            else:
                # leaf node or para (expanded vertical cardi node) as child
                if child_node[0].type == NodeType.PARA:
                    child_node = [c for c in child_node[0].children]
                    wildcard_exist = any([c.type == NodeType.WILDCARD for c in child_node])
                else:
                    wildcard_exist = child_node[0].type == NodeType.WILDCARD
                tree.children = tree.children + child_node
        merged_children = []
        for child in tree.children:
            if wildcard_exist:
                # need to restrict only 1 ... in GUI
                if child.cardiOp == "<":
                    continue
                elif child.cardiOp == ">" and child.cardiDirect == "vertical":
                    child.cardiOp = "="
                    if child.cardinality == 1:
                        child.cardinality = 0
            merged_children.append(child)
            tree.determined = (tree.determined & child.determined)
        tree.children = merged_children
        if len(tree.children) == 1:
            tree = tree.children[0]
    elif "leaf" in variant:
        # Possible cases: cardinality, group, any, wildcard, normal.
        tree.label = variant["leaf"][0]
        if variant["leaf"][0] in cate_list:
            tree.type = NodeType.GROUP
            tree.determined = False
        elif variant["leaf"][0] == "?":
            tree.type = NodeType.ANY
            tree.determined = False
        elif variant["leaf"][0] == "...":
            tree.type = NodeType.WILDCARD
            tree.cardinality = 0 # newly added
            tree.determined = False
        else:
            tree.type = NodeType.NORMAL
            if tree.cardiOp == "=" and tree.cardinality == 0:
                # EQ1 is determined. Other cases are determined elsewhere
                tree.determined = True
            else:
                tree.determined = False
    if len(tree.label) == 0:
        print("sad")
    # I don't know what's happending in this part Warning
    if (tree.label[0] == "→" or tree.label[0] == "∧") and tree.determined:
        tt = True
        for child in tree.children:
            tt = (tt and child.determined)
        if not tt:
            print("CHECK")

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
            # expand(unzip) sequence without cardinality. Only applied to original sequence with cardinality
            if tree.type == NodeType.SEQ:
                for i in range(variant["horizontalCardi"] - 1):
                    expanded_node += [c.copy() for c in tree.children]
                if variant["horizontalCardiOp"] == "=":
                    # Cardinality > 1
                    expanded_node += [c.copy() for c in tree.children]
                    return expanded_node
                else:
                    expanded_node.append(tree.copy())
                    expanded_node[-1].cardiOp = ">"
                    expanded_node[-1].cardinality = 1
                    expanded_node[-1].cardiDirect = "horizontal"
                    expanded_node[-1].determined = False
                    return expanded_node
            else:
                for i in range(variant["horizontalCardi"]):
                    expanded_node.append(tree.copy())
                if variant["horizontalCardiOp"] == "=":
                    # Cardinality > 1
                    return expanded_node
                else:
                    expanded_node[-1].cardiOp = ">"
                    expanded_node[-1].cardinality = 1
                    expanded_node[-1].cardiDirect = "horizontal"
                    expanded_node[-1].determined = False
                    return expanded_node
            
        elif variant["verticalCardi"] > 1 or variant["verticalCardiOp"] == ">" or variant["verticalCardiOp"] == "<":
            # Handle vertical cardi, only PARA and LEAF have vertical cardi
            # Vertical node does not need to be expanded because it will match as parallel group(?)
            # Warning: maybe wrong here
            if tree.type == NodeType.SEQ:
                print("SEQ vertical error!")
            elif tree.type != NodeType.PARA:
                # Single node
                # Expand the node with a new PARA outside? How about serialization?
                outer_para_node = VariantTree()
                outer_para_node.type = NodeType.PARA
                outer_para_node.label = "∧"
                if variant["verticalCardiOp"] == "=":
                    outer_para_node.determined = (tree.type == NodeType.NORMAL)
                    if outer_para_node.determined:
                        tree.cardiOp = "="
                        tree.cardinality = 0
                        tree.cardiDirect = "vertical"
                        for i in range(variant["verticalCardi"]):
                            outer_para_node.children.append(tree.copy())
                    else:
                        tree.cardiOp = variant["verticalCardiOp"]
                        tree.cardinality = variant["verticalCardi"]
                        tree.cardiDirect = "vertical"
                        outer_para_node.children.append(tree.copy())
                else:
                    tree.cardiOp = variant["verticalCardiOp"]
                    tree.cardinality = variant["verticalCardi"]
                    tree.cardiDirect = "vertical"
                    tree.determined = False
                    outer_para_node.children.append(tree.copy())
                return [outer_para_node]

            else:
                # If it is already para node, no need to 
                tree.cardiDirect = "vertical"
                tree.cardiOp = variant["verticalCardiOp"]
                tree.cardinality = variant["verticalCardi"]
                tree.determined = False
            return [tree]
        
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
    #If seq para node is already serialized, or it is a leaf
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
                if child.label in VariantTree.label_to_char:
                    tree.label += VariantTree.label_to_char[child.label]
                else:
                    print(child.label) #
            tree.label += ")"
        else:
            #∧
            tree.label += "("
            for child in tree.children:
                if child.label not in VariantTree.label_to_char:
                    print(child.label) #
            ordered_children = sorted([VariantTree.label_to_char[child.label] for child in tree.children])

            tree.label += ''.join(ordered_children)
            tree.label += ")"

        if tree.label not in VariantTree.label_to_char:
                VariantTree.label_to_char[tree.label] = chr(VariantTree.label_index)
                VariantTree.increase_label_index()
        return tree

def get_seq_parent(p_list):
    # Create a parent
    p_tree = VariantTree()
    p_tree.children = p_list.copy()
    p_tree.cardiDirect = "horizontal"
    p_tree.type = NodeType.SEQ
    p_tree.update_determined()
    return p_tree


def get_para_parent(p_list):
    # Create a parent
    p_tree = VariantTree()
    p_tree.children = p_list.copy()
    p_tree.cardiDirect = "horizontal"
    p_tree.type = NodeType.PARA
    p_tree.update_determined()
    return p_tree


def node_list_could_be_non(node_list):
    # Return if a list of nodes could be none theoretically
    for l in node_list:
        if not(l.type==NodeType.WILDCARD or l.cardiOp == "<"):
            return False
    return True

def brutal_match_seq(p_children, v_children, cate_list):
    if len(p_children) == 0:
        if len(v_children) == 0:
            return True
        else:
            return False
    elif len(v_children) == 0:
        return node_list_could_be_non(p_children)
    p = get_seq_parent(p_children)
    v = get_seq_parent(v_children)
    return pattern_match_variant(p, v, cate_list)

def brutal_match_para(p_children, v_children, cate_list):
    if len(p_children) == 0:
        if len(v_children) == 0:
            return True
        else:
            return False
    elif len(v_children) == 0:
        return node_list_could_be_non(p_children)
    p = get_para_parent(p_children)
    v = get_para_parent(v_children)
    return pattern_match_variant(p, v, cate_list)

def match_para(p, v, cate_list):
    p_children = p.children # p is para
    v_children = v.children
    p_have_seq = False
    v_have_seq = False

    if len(p.label) > 1 and p.label == v.label: # Serialized para
        return True

    # Check if there is a determined seq in pattern, and check if there is also a seq in variant. -> early stopping
    for c in p_children:
        if c.determined and c.type == NodeType.SEQ:
            p_have_seq = True
            break
    if p_have_seq:
        for c in v_children:
            if c.type == NodeType.SEQ:
                v_have_seq = True
                break
        if not v_have_seq:
            return False
        
    if p.determined:
        # if p is determined, all p_children are determined. So we could directly compare (这里包括了打开的EQ这种吗？)
        if len(p_children) != len(v_children):
            return False
        else:
            # Need Compare content!????? Just edited
            brutal_match_para(p_children, v_children, cate_list)
    else:
        #if v.type != NodeType.SEQ and v.type != NodeType.PARA:
        if v.type != NodeType.PARA:
            v_children = [v] # if v is seq or leaf, pack it

        determined_part = []
        undetermined_part = []
        # Segment the pattern. The result at least has one segment
        for node in p_children:
            if node.determined:
                determined_part.append(node)
            else:
                undetermined_part.append(node)
        
        if len(determined_part) > len(v_children):
            # Not enough variant nodes
            return False
        
        if len(undetermined_part) == 0:
            # Only have determined pattern nodes
            if len(determined_part) != len(v_children):
                return False
            else:
                return brutal_match_para(determined_part, v_children, cate_list)
        
        v_copy = [v.realcopy() for v in v_children]

        for node in determined_part:
            found = False
            for i, v in enumerate(v_copy):
                if v.id in node.match_id:
                    v_copy.pop(i)
                    found = True
                    break
            if not found:
                return False

        return brutal_match_para(undetermined_part, v_copy, cate_list)

def match_seq(p, v, cate_list):
    p_children = p.children # p is seq
    v_children = v.children

    if p.determined:
        # if p is determined, all p_children are determined. So we could directly compare
        if len(p_children) != len(v_children):
            return False
        if len(p.label) > 1 and p.label == v.label: # Serialized seq
            return True
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
            #return brutal_match(p_children, v_children, cate_list)
            return match_rest([p_children], [v_children], cate_list)
        
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
        #print("AC")

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
                        if order[0] + 1 < len(subpattern_order_abbr) and (subpattern_order_abbr[order[0] + 1] == partial_graph.nodes[new_node_id]["pattern"]):
                            partial_graph.nodes[new_node_id]["orders"].append([order[0] + 1, node, order[2] + [new_node_id]])
            new_node_id = str(int(new_node_id) + 1)
            #new_node_id += 1

        #print("Start partial graph")

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
                    if match_rest(non_determined_pattern_seg, variant_segments, cate_list):
                        return True
        return False
    
def match_rest(p_list, v_list, cate_list): # Need group or not?
    # Match the undetermined segments
    for p_segment, v_segment in zip(p_list, v_list):
        if not check_rest_matching_id(p_segment, v_segment):
            return False
        if speed_wildcard(p_segment, v_segment):
            return True
        result = brutal_match_seq(p_segment, v_segment, cate_list)
        if not result:
            return False
    return True

def check_rest_matching_id(p_segment, v_segment):
    for p in p_segment:
        match = False
        for v in v_segment:
            if v.id in p.match_id:
                match = True
        if not match and not variant_can_be_none(p):
            return False
    return True

def speed_wildcard(p_segment, v_segment):
    if len(p_segment) == 3 and p_segment[0].type == NodeType.WILDCARD and p_segment[-1].type == NodeType.WILDCARD:
        for v in v_segment:
            if v.id in p_segment[1].match_id:
                return True
    return False

# match p and v nodes in step 1
def single_node_match(p_node, v_node, cate_list):
    # For variant, only NORMAL, SEQ, PARA

    #temp
    for child in p_node.children:
        if child.determined == False:
            p_node.determined = False
    for child in v_node.children:
        if child.determined == False:
            v_node.determined = False
    #temp

    if p_node.determined:
        p_node = serialize_determined_tree(p_node)
    if v_node.determined:
        v_node = serialize_determined_tree(v_node)
    if p_node.type == NodeType.WILDCARD or p_node.type == NodeType.ANYGROUP:
        return True
    elif p_node.type == NodeType.GROUP:
        if v_node.type == NodeType.NORMAL and cate_member(v_node.label, p_node.label, cate_list):
            return True
        else:
            return False
    elif p_node.type == NodeType.ANY:
        if v_node.type == NodeType.NORMAL:
            return True
        else:
            return False
    elif p_node.type == NodeType.PARA:
        return match_para(p_node, v_node, cate_list)
    elif p_node.type == NodeType.SEQ:
        return match_seq(p_node, v_node, cate_list)
    else:
        # Case: NORMAL
        if v_node.type == NodeType.NORMAL and v_node.label == p_node.label:
            return True
        else:
            return False


def expand_tree(tree):
    # return a deque
    queue = [tree]

    #Expand tree by BFS

    index = 0
    while index < len(queue):
        for child in queue[index].children:
            queue.append(child) 
        index += 1
    return queue

def dynamic_tree_matching(p_tree, v_tree, cate_list):
    p_queue = list(reversed(expand_tree(p_tree)))
    v_queue = list(reversed(expand_tree(v_tree)))
    for p_node in p_queue:
        for v_node in v_queue:
            if single_node_match(p_node, v_node, cate_list):
                p_node.match_id.append(v_node.id)
        if not variant_can_be_none(p_node) and not p_node.match_id:     
        #if p has some content inside but len(p_node.match_id) == 0:
            # No match result, early stop
            VariantTree.clear_dic()
            return False
    VariantTree.clear_dic()
    return len(p_queue[-1].match_id) > 0 # Really???

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

def calculate_leaf_num_pattern(pattern):
    # return all leaves of one pattern variant
    if node_is_leaf(pattern):
        return 1
    elif pattern.type == NodeType.SEQ or pattern.type == NodeType.PARA:
        return sum([calculate_leaf_num_pattern(c) for c in pattern.children])
    return 0

'''
# query["follows"].append({"leaf": ["..."], "horizontalCardi": 0, "horizontalCardiOp": '=', "verticalCardi": 0, "verticalCardiOp": '='})
def calculate_query_stat(query):
    # No use in experiment
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
'''

def node_content(node):
    if node == []:
        return(str(node))
    if node.cardiDirect == "vertical":
        di = "↕"
    else:
        di = "↔"
    if node.type != NodeType.SEQ and node.type != NodeType.PARA:
        return node.label + " " + node.cardiOp + " " + str(node.cardinality) + di
    else:
        return str([node_content(c) for c in node.children])


