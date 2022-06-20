from collections import Counter
import json
import pickle

from cortado_core.performance.variant_performance import \
    assign_variants_performances
from cortado_core.utils.cvariants import (get_concurrency_variants,
                                          get_detailed_variants)
from cortado_core.utils.split_graph import LeafGroup, SequenceGroup
from cortado_core.utils.timestamp_utils import TimeUnit, get_time_granularity
from pm4py.algo.filtering.log.variants import variants_filter
from pm4py.objects.log.obj import EventLog
from pm4py.objects.log.util.interval_lifecycle import to_interval
from pm4py.util.xes_constants import (DEFAULT_START_TIMESTAMP_KEY,
                                      DEFAULT_TRANSITION_KEY)

variants_store = {}


def calculate_event_log_properties(event_log: EventLog, time_granularity: TimeUnit = None, use_mp: bool = False):
    global lifecycle_available 
    global cur_time_granularity
    global variants
    global nBids
    global activites 
    
    if time_granularity is None:
        time_granularity = get_time_granularity(event_log)
        
    cur_time_granularity = time_granularity
    
    lifecycle_available = False
    # TODO: maybe implement more robust check if lifecycle/interval information is available
    if DEFAULT_TRANSITION_KEY not in event_log[0][0] \
            and DEFAULT_START_TIMESTAMP_KEY not in event_log[0][0]:
        event_log = to_interval(event_log)
    else:
        lifecycle_available = True

    res_variants, variants = get_c_variants(
        event_log, use_mp, time_granularity)    
    
    assign_variants_performances(variants)

    start_activities = set.union(*[set(v.graph.start_activities.keys()) for v in variants.keys()])
    end_activities = set.union(*[set(v.graph.end_activities.keys()) for v in variants.keys()])
    nActivities = dict(sum([Counter({ k : (len(ls) * len(variants[v])) for k, ls in v.graph.events.items()}) for v in variants], Counter()))

    activites = set(nActivities.keys())

    #sorted_variants = sorted(variants.keys(), key=lambda v: len(
    #    variants[v]), reverse=True)
    
    #for res, v in zip(res_variants, sorted_variants):
    #   res['variant'] = v.serialize()


    res = {
        "startActivities": start_activities,
        "endActivities": end_activities,
        "activities": nActivities,
        "variants": res_variants,
        "performanceInfoAvailable": lifecycle_available,
        "timeGranularity": time_granularity
    }
    
    variants = {bid : (variant, traces) for bid, (variant, traces) in enumerate(variants.items())}
    
    nBids = len(variants.keys())
    
    return res


def get_simple_variants(event_log: EventLog):
    
    variants = variants_filter.get_variants(event_log)
    total_traces = len(event_log)
    res_variants = []
    for v in variants:
        events = v.split(',')
        variant = SequenceGroup([LeafGroup([e]) for e in events])
        res_variants.append({
            'count': len(variants[v]),
            'length': len(variant),
            'number_of_activities': variant.number_of_activities(),
            'events': events,
            'variant': variant.serialize(),
            'percentage': round(len(variants[v]) / total_traces * 100, 2),
            'sub_variants': []
        })

    variants = {
        SequenceGroup([LeafGroup([e]) for e in v.split(",")]): variants[v]
        for v in variants
    }
    return sorted(res_variants, key=lambda variant: variant['count'], reverse=True), variants

def get_c_variants(event_log: EventLog, use_mp: bool = False, time_granularity: TimeUnit = min(TimeUnit)):
    
    variants = get_concurrency_variants(event_log, use_mp, time_granularity)
    
    total_traces = len(event_log)
    res_variants = []
    for i, v in enumerate(variants):

        variant = {
            'count': len(variants[v]),
            'variant': v.serialize(),
            'bid': i,
            'length': len(v),
            'number_of_activities': v.number_of_activities(),
            'percentage': round(len(variants[v]) / total_traces * 100, 2),
            'sub_variants': []}
        sub_variants = get_detailed_variants(
            variants[v], time_granularity=time_granularity)
        
        total_sub_traces = sum(len(sub_variants[v]) for v in sub_variants)

        for sub_v in sub_variants:
            variant['sub_variants'].append({
                'variant': sub_v,
                'count': len(sub_variants[sub_v]),
                'percentage': round(len(sub_variants[sub_v]) / total_sub_traces * 100, 2)
            })

        # If the variant is only a single activity leaf, wrap it up as a sequence
        if 'leaf' in variant["variant"].keys() or 'parallel' in variant["variant"].keys():
            variant["variant"] = {'follows': [variant["variant"]]}

        variant['sub_variants'] = sorted(
            variant['sub_variants'], key=lambda x: x['count'], reverse=True)
        res_variants.append(variant)
        
    return sorted(res_variants, key=lambda variant: variant['count'], reverse=True), variants
