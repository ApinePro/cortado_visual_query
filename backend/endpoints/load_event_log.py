import json
import pickle
from collections import Counter
from typing import Mapping, Tuple

import cache.cache as cache
from cortado_core.performance.variant_performance import assign_variants_performances
from cortado_core.utils.cvariants import get_concurrency_variants, get_detailed_variants
from cortado_core.utils.split_graph import Group, LeafGroup, SequenceGroup
from cortado_core.utils.timestamp_utils import TimeUnit, get_time_granularity
from pm4py.algo.filtering.log.variants import variants_filter
from pm4py.objects.log.obj import EventLog, Trace
from pm4py.objects.log.util.interval_lifecycle import to_interval
from pm4py.util.xes_constants import DEFAULT_START_TIMESTAMP_KEY, DEFAULT_TRANSITION_KEY


def calculate_event_log_properties(
    event_log: EventLog, time_granularity: TimeUnit = None, use_mp: bool = False
):

    if time_granularity is None:
        time_granularity = get_time_granularity(event_log)

    cache.parameters["cur_time_granularity"] = time_granularity

    cache.parameters["log_info"] = {
        "extensions": event_log._get_extensions(),
        #'omni_present' : event_log._get_omni(),
        #'attributes' : event_log._get_attributes(),
        "classifiers": event_log._get_classifiers(),
        "properties": event_log._get_properties(),
    }

    cache.parameters["lifecycle_available"] = False

    # TODO: maybe implement more robust check if lifecycle/interval information is available
    if (
        DEFAULT_TRANSITION_KEY not in event_log[0][0]
        and DEFAULT_START_TIMESTAMP_KEY not in event_log[0][0]
    ):
        event_log = to_interval(event_log)
    else:
        cache.parameters["lifecycle_available"] = True

    res_variants, cache.variants = get_c_variants(event_log, use_mp, time_granularity)

    assign_variants_performances(cache.variants)

    cache.variants = {
        bid: (variant, traces)
        for bid, (variant, traces) in enumerate(cache.variants.items())
    }

    start_activities, end_activities, nActivities = compute_log_stats(cache.variants)

    cache.parameters["activites"] = set(nActivities.keys())

    res = {
        "startActivities": start_activities,
        "endActivities": end_activities,
        "activities": nActivities,
        "variants": res_variants,
        "performanceInfoAvailable": cache.parameters["lifecycle_available"],
        "timeGranularity": time_granularity,
    }

    cache.parameters["nBids"] = len(cache.variants.keys())

    # pickle.dump(cache.variants,  open( "./resources/variants.p", "wb" ))
    # pickle.dump(cache.parameters,  open( "./resources/parameters.p", "wb" ))

    return res


def compute_log_stats(variants: Mapping[int, Tuple[Group, Trace]]):
    start_activities = set.union(
        *[set(v.graph.start_activities.keys()) for (v, _) in variants.values()]
    )
    end_activities = set.union(
        *[set(v.graph.end_activities.keys()) for (v, _) in variants.values()]
    )
    nActivities = dict(
        sum(
            [
                Counter({k: (len(ls) * len(ts)) for k, ls in v.graph.events.items()})
                for (v, ts) in variants.values()
            ],
            Counter(),
        )
    )

    return start_activities, end_activities, nActivities


def get_simple_variants(event_log: EventLog):

    variants = variants_filter.get_variants(event_log)
    total_traces = len(event_log)
    res_variants = []
    for v in variants:
        events = v.split(",")
        variant = SequenceGroup([LeafGroup([e]) for e in events])
        res_variants.append(
            {
                "count": len(variants[v]),
                "length": len(variant),
                "number_of_activities": variant.number_of_activities(),
                "events": events,
                "variant": variant.serialize(),
                "percentage": round(len(variants[v]) / total_traces * 100, 2),
                "sub_variants": [],
            }
        )

    variants = {
        SequenceGroup([LeafGroup([e]) for e in v.split(",")]): variants[v]
        for v in variants
    }
    return (
        sorted(res_variants, key=lambda variant: variant["count"], reverse=True),
        variants,
    )


def get_c_variants(
    event_log: EventLog,
    use_mp: bool = False,
    time_granularity: TimeUnit = min(TimeUnit),
):

    variants = get_concurrency_variants(event_log, use_mp, time_granularity)

    total_traces = len(event_log)
    res_variants = []
    for bid, (v, ts) in enumerate(variants.items()):

        variant = create_variant_object(time_granularity, total_traces, bid, v, ts)
        res_variants.append(variant)

    return (
        sorted(res_variants, key=lambda variant: variant["count"], reverse=True),
        variants,
    )


def create_variant_object(time_granularity, total_traces, bid, v, ts):
    variant = {
        "count": len(ts),
        "variant": v.serialize(),
        "bid": bid,
        "length": len(v),
        "number_of_activities": v.number_of_activities(),
        "percentage": round(len(ts) / total_traces * 100, 2),
        "sub_variants": [],
    }
    sub_variants = get_detailed_variants(ts, time_granularity=time_granularity)

    total_sub_traces = sum(len(sub_variants[v]) for v in sub_variants)

    for sub_v in sub_variants:
        variant["sub_variants"].append(
            {
                "variant": sub_v,
                "count": len(sub_variants[sub_v]),
                "percentage": round(
                    len(sub_variants[sub_v]) / total_sub_traces * 100, 2
                ),
            }
        )

        # If the variant is only a single activity leaf, wrap it up as a sequence
    if "leaf" in variant["variant"].keys() or "parallel" in variant["variant"].keys():
        variant["variant"] = {"follows": [variant["variant"]]}

    variant["sub_variants"] = sorted(
        variant["sub_variants"], key=lambda x: x["count"], reverse=True
    )

    return variant
