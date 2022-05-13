import json

from cortado_core.performance.variant_performance import assign_variants_performances
from cortado_core.utils.cvariants import get_concurrency_variants, get_detailed_variants
from cortado_core.utils.split_graph import LeafGroup, SequenceGroup
from cortado_core.utils.timestamp_utils import TimeUnit
from pm4py import sample_cases
from pm4py.algo.filtering.log.attributes import attributes_filter
from pm4py.algo.filtering.log.end_activities import end_activities_filter
from pm4py.algo.filtering.log.start_activities import start_activities_filter
from pm4py.algo.filtering.log.variants import variants_filter
from pm4py.objects.log.obj import EventLog
from pm4py.objects.log.util.interval_lifecycle import to_interval
from pm4py.util.xes_constants import DEFAULT_START_TIMESTAMP_KEY, DEFAULT_TRANSITION_KEY, DEFAULT_TIMESTAMP_KEY

variants_store = {}


def calculate_event_log_properties(event_log: EventLog, time_granularity: TimeUnit = None, use_mp: bool = False):

    if time_granularity is None:
        time_granularity = get_time_granularity(event_log)

    lifecycle_available = False
    # TODO: maybe implement more robust check if lifecycle/interval information is available
    if DEFAULT_TRANSITION_KEY not in event_log[0][0] \
            and DEFAULT_START_TIMESTAMP_KEY not in event_log[0][0]:
        event_log = to_interval(event_log)
    else:
        lifecycle_available = True

    res_variants, variants = get_c_variants(
        event_log, use_mp, time_granularity)
    # assign_variants_performances(variants)

    variants = sorted(variants.keys(), key=lambda v: len(
        variants[v]), reverse=True)
    for res, v in zip(res_variants, variants):
        res['variant'] = v.serialize()

    res = {
        "startActivities": start_activities_filter.get_start_activities(event_log),
        "endActivities": end_activities_filter.get_end_activities(event_log),
        "activities": attributes_filter.get_attribute_values(event_log, "concept:name"),
        "variants": res_variants,
        "performanceInfoAvailable": lifecycle_available,
        "timeGranularity": time_granularity
    }

    return res


def get_simple_variants(event_log: EventLog):
    global variants_store
    global logVariants
    
    variants = variants_filter.get_variants(event_log)
    logVariants = variants
    
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
    variants_store = {json.dumps(v.serialize(
        include_performance=False)): t for v, t in variants.items()}
    return sorted(res_variants, key=lambda variant: variant['count'], reverse=True), variants


def get_c_variants(event_log: EventLog, use_mp: bool = False, time_granularity: TimeUnit = min(TimeUnit)):
    global variants_store
    global log_info
    global variants
    global activites

    variants = get_concurrency_variants(event_log, use_mp, time_granularity)

    activites = set()

    total_traces = len(event_log)
    res_variants = []
    for i, v in enumerate(variants):

        activites = activites.union(v.graph.events)

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

    variants_store = {json.dumps(v.serialize(include_performance=False)): t for v, t in variants.items()}
    
    return sorted(res_variants, key=lambda variant: variant['count'], reverse=True), variants


def get_time_granularity(event_log: EventLog):
    sample = sample_cases(event_log, 500)
    timestamps = [event[DEFAULT_TIMESTAMP_KEY]
                  for trace in sample for event in trace]

    if not all_non_zero(timestamps, 'microsecond'):
        return TimeUnit.MS
    elif not all_non_zero(timestamps, 'second'):
        return TimeUnit.SEC
    elif not all_non_zero(timestamps, 'minute'):
        return TimeUnit.MIN
    elif not all_non_zero(timestamps, 'hour'):
        return TimeUnit.HOUR
    elif not all_non_zero(timestamps, 'day'):
        return TimeUnit.DAY


def all_non_zero(timestamps, time_unit_key):
    return all(getattr(timestamp, time_unit_key) == 0 for timestamp in timestamps)
