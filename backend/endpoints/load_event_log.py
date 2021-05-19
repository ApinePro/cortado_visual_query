from pm4py.objects.log.obj import EventLog
from pm4py.algo.filtering.log.start_activities import start_activities_filter
from pm4py.algo.filtering.log.end_activities import end_activities_filter
from pm4py.algo.filtering.log.attributes import attributes_filter
from pm4py.algo.filtering.log.variants import variants_filter


def calculate_event_log_properties(event_log: EventLog):
    variants = variants_filter.get_variants(event_log)
    total_traces = len(event_log)
    res_variants = []
    for v in variants:
        res_variants.append({
            'count': len(variants[v]),
            'events': v.split(','),
            'percentage': round(len(variants[v]) / total_traces * 100, 2)
        })
    res_variants = sorted(res_variants, key=lambda variant: variant['count'], reverse=True)

    res = {
        "startActivities": start_activities_filter.get_start_activities(event_log),
        "endActivities": end_activities_filter.get_end_activities(event_log),
        "activities": attributes_filter.get_attribute_values(event_log, "concept:name"),
        "variants": res_variants
    }
    return res
