from collections import defaultdict

from cortado_core.subprocess_discovery.concurrency_trees.cTrees import cTreeOperator
from cortado_core.tiebreaker.algorithm import apply_tiebreaker_on_variants
from cortado_core.tiebreaker.pattern import parse_tiebreaker_pattern, TiebreakerPattern, WILDCARD_MATCH
from cortado_core.tiebreaker.two_plus_two_free_check import get_wildcard_node
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

import cache.cache
from api.routes.variants.variants import VariantInformation
from endpoints.alignments import InfixType
from endpoints.load_event_log import create_variant_object, compute_log_stats

router = APIRouter(tags=['Tiebreaker'], prefix="/tiebreaker")


class TiebreakerPatterns(BaseModel):
    sourcePattern: str
    targetPattern: str


@router.post("/apply")
def apply_tiebreaker(payload: TiebreakerPatterns):
    variants = cache.cache.variants
    new_variants = defaultdict(list)
    n_traces = 0

    for _, (variant, traces, _, _) in variants.items():
        new_variants[variant] += traces
        n_traces += len(traces)

    if not validate_string_pattern(payload.sourcePattern):
        raise HTTPException(status_code=400, detail='Source pattern is invalid')

    if not validate_string_pattern(payload.targetPattern):
        raise HTTPException(status_code=400, detail='Target pattern is invalid')

    source_pattern = parse_tiebreaker_pattern(payload.sourcePattern)
    target_pattern = parse_tiebreaker_pattern(payload.targetPattern)

    validate_patterns(source_pattern, target_pattern)

    print('SOURCE PATTERN:', str(source_pattern))
    print('TARGET PATTERN:', str(target_pattern))

    new_variants = apply_tiebreaker_on_variants(new_variants, source_pattern, target_pattern)
    res_variants = []

    # TODO niklas: unify duplicate code fragments with importing code
    cache_variants = dict()

    for bid, (v, ts) in enumerate(sorted(list(new_variants.items()), key=lambda e: len(e[1]), reverse=True)):
        info = VariantInformation(infix_type=InfixType.NOT_AN_INFIX, is_user_defined=False)
        variant, sub_vars = create_variant_object(cache.cache.parameters["cur_time_granularity"], n_traces, bid, v, ts,
                                                  info)

        res_variants.append(variant)
        cache_variants[bid] = (
            v, ts, sub_vars, info)

    cache.cache.variants = cache_variants

    res_variants = sorted(res_variants, key=lambda variant: variant["count"], reverse=True)

    start_activities, end_activities, nActivities = compute_log_stats(cache.cache.variants)

    cache.cache.parameters["activites"] = set(nActivities.keys())

    res = {
        "startActivities": start_activities,
        "endActivities": end_activities,
        "activities": nActivities,
        "variants": res_variants,
        "performanceInfoAvailable": cache.cache.parameters["lifecycle_available"],
        "timeGranularity": cache.cache.parameters["cur_time_granularity"],
    }

    return res


def validate_string_pattern(pattern: str) -> bool:
    return pattern.count('(') == pattern.count(')')


def validate_patterns(source_pattern: TiebreakerPattern, target_pattern: TiebreakerPattern):
    activities = cache.cache.parameters["activites"]
    source_activities = get_activities_in_pattern(source_pattern)
    target_activities = get_activities_in_pattern(target_pattern)

    for source_activity in source_activities:
        if source_activity not in activities:
            raise HTTPException(status_code=400, detail=f"Source pattern contains invalid activity '{source_activity}'")

    for target_activity in target_activities:
        if target_activity not in activities:
            raise HTTPException(status_code=400, detail=f"Target pattern contains invalid activity '{target_activity}'")

    source_labeled_nodes = [set(p.labels) for p in get_activity_nodes_in_pattern(source_pattern)]
    target_labeled_nodes = [set(p.labels) for p in get_activity_nodes_in_pattern(target_pattern)]

    for source_labeled_node in source_labeled_nodes:
        try:
            target_labeled_nodes.remove(source_labeled_node)
        except ValueError:
            raise HTTPException(status_code=400,
                                detail=f"Node with labels {source_labeled_node} is present in source pattern, but not in target pattern")

    if len(target_labeled_nodes) > 0:
        raise HTTPException(status_code=400,
                            detail=f"Node with labels {target_labeled_nodes[0]} is present in target pattern, but not in source pattern")

    source_wc_node = get_wildcard_node(source_pattern)
    target_wc_node = get_wildcard_node(target_pattern)

    if source_wc_node is None and target_wc_node is not None:
        raise HTTPException(status_code=400,
                            detail=f"Target pattern has wildcard (...), which is not present in source pattern")

    if source_wc_node is not None and target_wc_node is None:
        raise HTTPException(status_code=400,
                            detail=f"Source pattern has wildcard (...), which is not present in target pattern")

    if source_pattern.operator != cTreeOperator.Concurrent:
        raise HTTPException(status_code=400,
                            detail=f"Source pattern without concurrent operator at highest level")

    for child in source_pattern.children:
        if child.operator is not None and child.operator != WILDCARD_MATCH:
            raise HTTPException(status_code=400,
                                detail=f"Source pattern cannot have nested operators")


def get_activities_in_pattern(pattern: TiebreakerPattern):
    activities = set(pattern.labels)

    for child in pattern.children:
        activities = activities.union(get_activities_in_pattern(child))

    return activities


def get_activity_nodes_in_pattern(pattern: TiebreakerPattern):
    nodes = set()

    if len(pattern.labels) > 0:
        nodes.add(pattern)

    for child in pattern.children:
        nodes = nodes.union(get_activity_nodes_in_pattern(child))

    return nodes
