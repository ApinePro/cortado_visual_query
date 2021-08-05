from pm4py.objects.log.obj import EventLog
from pm4py.algo.filtering.log.start_activities import start_activities_filter
from pm4py.algo.filtering.log.end_activities import end_activities_filter
from pm4py.algo.filtering.log.attributes import attributes_filter
from pm4py.algo.filtering.log.variants import variants_filter
from interactive_process_mining_core.utils.variants import get_concurrency_variants_opt, get_detailled_variants
from pm4py.objects.log.exporter.xes import exporter as xes_exporter

def calculate_event_log_properties(event_log: EventLog):
    event_log = attributes_filter.apply_events(event_log, ["Job"],
                                          parameters={attributes_filter.Parameters.ATTRIBUTE_KEY: "concept:name", attributes_filter.Parameters.POSITIVE: False})
    # event_log = EventLog(event_log[:1000])

    # t = min(event_log, key=lambda x: len(x))
    # event_log = EventLog([t])

    variants = get_concurrency_variants_opt(event_log)
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

    res_variants = sorted(res_variants, key=lambda variant: variant['count'], reverse=True)
    # res_variants = res_variants[:100]
    res = {
        "startActivities": start_activities_filter.get_start_activities(event_log),
        "endActivities": end_activities_filter.get_end_activities(event_log),
        "activities": attributes_filter.get_attribute_values(event_log, "concept:name"),
        "variants": res_variants
    }
    return res
