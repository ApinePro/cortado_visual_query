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
    for bid, (variant, _, _, info) in cache.variants.items():
        if check_node(query ,variant):
            res.append(bid)
        #print("")
        print(check_node(query ,variant))
    return {res: res}

def deserialize_query(graphical_query):
    query_tree = {}
    graphical_query = graphical_query.queryTree
    if "pattern" in graphical_query:
        query_tree["pattern"] = graphical_query["pattern"]
    query_tree["operator"] = graphical_query["operator"]
    query_tree["negation"] = graphical_query["negation"]
    query_tree["children"] = [c for c in graphical_query["children"]]
    return query_tree

#c.deserialize this

def check_node(node, variant):
    result = True
    if node["operator"] == 'AND':
        for child in node["children"]: 
            result = result & check_node(child)
    if node["operator"] == 'OR':
        for child in node["children"]: 
            result = result | check_node(child)
    if node["operator"] == 'X':
        check_pattern(node["pattern"], variant)
    if node["negation"] == True:
        return not result
    else:
        return result

def check_pattern(pattern, variant):
    while len(pattern) != 0:
        p_head = head_pattern(pattern)
        v_head = head_variant(variant)
        if not fit(p_head, v_head):
            return False
        else:
            pattern = cut_head(pattern)
            variant = cut_head(variant)

def head_pattern(pattern):
    if "follows" in pattern:
        if "follows" in pattern["follows"][1]:
            return head_pattern(pattern["follows"][1])
        else:
            return pattern["follows"][1]
    else:
        return pattern
    
def head_variant(variant):
    if "follows" in variant:
        if "follows" in variant["follows"][1]:
            return head_variant(variant["follows"][1])
        else:
            return variant["follows"][1]
    else:
        return variant
    
def fit(p_head, v_head):
    return True

def cut_head(variant):
    if "follows" in variant:
        if "follows" in variant["follows"][1]:
            variant["follows"][1] = cut_head(variant["follows"][1])
            return variant
        else:
            variant.pop(0)
            return variant
    else:
        return variant.pop(0)