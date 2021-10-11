from pm4py.objects.log.obj import EventLog
from pm4py.algo.filtering.log.start_activities import start_activities_filter
from pm4py.algo.filtering.log.end_activities import end_activities_filter
from pm4py.algo.filtering.log.attributes import attributes_filter
from pm4py.algo.filtering.log.variants import variants_filter
from pm4py.util.xes_constants import DEFAULT_START_TIMESTAMP_KEY, DEFAULT_TRANSITION_KEY

from cortado_core.utils.split_graph import LeafGroup, SequenceGroup
from cortado_core.utils.cvariants import get_concurrency_variants, get_detailled_variants


def calculate_event_log_properties(event_log: EventLog):
    if not DEFAULT_TRANSITION_KEY in event_log[0][0] \
            and not DEFAULT_START_TIMESTAMP_KEY in event_log[0][0]:
        res_variants = get_simple_variants(event_log)
    else:
        res_variants = get_c_variants(event_log)

    res = {
        "startActivities": start_activities_filter.get_start_activities(event_log),
        "endActivities": end_activities_filter.get_end_activities(event_log),
        "activities": attributes_filter.get_attribute_values(event_log, "concept:name"),
        "variants": res_variants
    }
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
            'events': events,
            'variant': variant.serialize(),
            'percentage': round(len(variants[v]) / total_traces * 100, 2)
        })
    return sorted(res_variants, key=lambda variant: variant['count'], reverse=True)


def get_c_variants(event_log: EventLog):
    variants = get_concurrency_variants(event_log)
    total_traces = len(event_log)
    res_variants = []
    for v in variants:
        variant = {
            'count': len(variants[v]),
            'variant': v.serialize(),
            'percentage': round(len(variants[v]) / total_traces * 100, 2),
            'sub_variants': []}
        sub_variants = get_detailled_variants(variants[v])
        total_sub_traces = sum(len(sub_variants[v]) for v in sub_variants)

        for sub_v in sub_variants:
            variant['sub_variants'].append({
                'variant': sub_v,
                'count': len(sub_variants[sub_v]),
                'percentage': round(len(sub_variants[sub_v]) / total_sub_traces * 100, 2)
            })
        variant['sub_variants'] = sorted(variant['sub_variants'], key=lambda x: x['count'], reverse=True)
        res_variants.append(variant)
    return sorted(res_variants, key=lambda variant: variant['count'], reverse=True)
