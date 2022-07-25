import pickle
from collections import Counter
from typing import List, Mapping, Set, Tuple

import cache.cache as cache
from cortado_core.utils.cgroups_graph import cgroups_graph
from cortado_core.utils.cvariants import get_concurrency_variants, get_detailed_variants
from cortado_core.utils.split_graph import (
    ConcurrencyGroup,
    LeafGroup,
    ParallelGroup,
    SequenceGroup,
)
from pm4py.objects.log.obj import EventLog, Trace
from pm4py.util.xes_constants import DEFAULT_NAME_KEY

from endpoints.load_event_log import compute_log_stats, create_variant_object


def cache_current_data():
    pickle.dump(cache.parameters, open("tmp/parameters_cache.p", "wb"))
    pickle.dump(cache.variants, open("tmp/variants_cache.p", "wb"))


def reset_last_transaction():

    cache.variants = pickle.load(open("tmp/variants_cache.p", "rb"))
    cache.parameters = pickle.load(open("tmp/parameters_cache.p", "rb"))

    total_traces = sum([len(ts) for (_, ts) in cache.variants.values()])
    res_variants = []

    for bid, (v, ts) in cache.variants.items():
        
        variant = create_variant_object(
            cache.parameters["cur_time_granularity"], total_traces, bid, v, ts
        )
        res_variants.append(variant)

    res_variants = sorted(
        res_variants, key=lambda variant: variant["count"], reverse=True
    )
    

    start_activities, end_activities, nActivities = compute_log_stats(cache.variants)
    
    cache.parameters["activites"] = set(nActivities.keys())
    res = {
        "startActivities": start_activities,
        "endActivities": end_activities,
        "activities": nActivities,
        "variants": res_variants,
        "performanceInfoAvailable": cache.parameters["lifecycle_available"],
        "timeGranularity": cache.parameters["cur_time_granularity"],
    }

    return res


def rename_merge_activities_in_graph(
    graph: ConcurrencyGroup, oldActivityName, newActivityName
):

    graph.events[newActivityName] = graph.events.pop(oldActivityName, set()).union(
        graph.events.get(oldActivityName, set())
    )
    graph.start_activities[newActivityName] = graph.start_activities.pop(
        oldActivityName, set()
    ).union(graph.start_activities.get(oldActivityName, set()))
    graph.end_activities[newActivityName] = graph.end_activities.pop(
        newActivityName, set()
    ).union(graph.end_activities.get(oldActivityName, set()))

    new_df = {}

    for x, y in graph.directly_follows:

        if x != oldActivityName and y != oldActivityName:
            new_df[(x, y)] = new_df.get((x, y), set()).union(
                graph.directly_follows.get((x, y))
            )

        else:

            if x == oldActivityName and y == oldActivityName:

                new_df[(newActivityName, newActivityName)] = graph.directly_follows.get(
                    (x, y)
                ).union(
                    graph.directly_follows.get(
                        (newActivityName, newActivityName), set()
                    )
                )

            elif x == oldActivityName:

                new_df[(newActivityName, y)] = graph.directly_follows.get((x, y)).union(
                    graph.directly_follows.get((newActivityName, y), set())
                )

            elif y == oldActivityName:

                new_df[(x, newActivityName)] = graph.directly_follows.get((x, y)).union(
                    graph.directly_follows.get((x, newActivityName), set())
                )

    graph.directly_follows = new_df

    new_ef = {}

    for x, y in graph.follows:

        if x != oldActivityName and y != oldActivityName:
            new_ef[(x, y)] = new_ef.get((x, y), set()).union(graph.follows.get((x, y)))

        else:

            if x == oldActivityName and y == oldActivityName:
                new_ef[(newActivityName, newActivityName)] = graph.follows.get(
                    (x, y)
                ).union(graph.follows.get((newActivityName, newActivityName), set()))

            elif x == oldActivityName:
                new_ef[(newActivityName, y)] = graph.follows.get((x, y)).union(
                    graph.follows.get((newActivityName, y), set())
                )

            elif y == oldActivityName:
                new_ef[(x, newActivityName)] = graph.follows.get((x, y)).union(
                    graph.follows.get((x, newActivityName), set())
                )

    graph.follows = new_ef

    new_cc = {}

    for x, y in graph.concurrency_pairs:

        if x != oldActivityName and y != oldActivityName:
            new_cc[(x, y)] = new_cc.get((x, y), set()).union(
                graph.concurrency_pairs.get((x, y))
            )

        else:

            if x == oldActivityName and y == oldActivityName:
                pair = tuple(newActivityName, newActivityName)

                new_cc[pair] = graph.concurrency_pairs.get((x, y)).union(
                    graph.concurrency_pairs.get(pair, set())
                )

            elif x == oldActivityName:
                pair = tuple(sorted((newActivityName, y)))

                new_cc[pair] = graph.concurrency_pairs.get((x, y)).union(
                    graph.concurrency_pairs.get(pair, set())
                )

            elif y == oldActivityName:
                pair = tuple(sorted((x, newActivityName)))

                new_cc[pair] = graph.concurrency_pairs.get((x, y)).union(
                    graph.concurrency_pairs.get(pair, set())
                )

    graph.concurrency_pairs = new_cc

    return graph


def rename_activities_in_trace(trace, oldActivityName, newActivityName):

    for event in trace:
        if event["concept:name"] == oldActivityName:
            event["concept:name"] = newActivityName

    return trace


def rename_activities_in_variant_group(group, oldActivityName, newActivityName):

    if isinstance(group, LeafGroup):
        lst = group[:]
        if oldActivityName in group:
            lst.remove(oldActivityName)
            lst.append(newActivityName)
            lst.sort()

        return LeafGroup(lst)

    else:
        children = [
            rename_activities_in_variant_group(child, oldActivityName, newActivityName)
            for child in group
        ]

        if isinstance(group, ParallelGroup):
            return ParallelGroup(sorted(children))

        else:
            return SequenceGroup(children)


def rename_activities(mergeList, renameList, activityName, newActivityName):

    if cache.parameters["activites"].discard(activityName):
        cache.parameters["activites"].add(newActivityName)

    new_variant_dict = {}

    for bid in renameList:

        (variant, traces) = cache.variants[bid]

        renamed_variant = rename_activities_in_variant_group(
            variant, activityName, newActivityName
        )
        renamed_variant.graph = rename_merge_activities_in_graph(
            variant.graph, activityName, newActivityName
        )

        renamed_traces = [
            rename_activities_in_trace(trace, activityName, newActivityName)
            for trace in traces
        ]

        new_variant_dict[bid] = (renamed_variant, renamed_traces)

    for ls in mergeList:

        (variant, _) = cache.variants[ls[0]]
        renamed_variant = rename_activities_in_variant_group(
            variant, activityName, newActivityName
        )
        renamed_variant.graph = rename_merge_activities_in_graph(
            variant.graph, activityName, newActivityName
        )

        renamed_traces = []

        for bid in ls:

            (_, traces) = cache.variants[bid]

            renamed_traces += [
                rename_activities_in_trace(trace, activityName, newActivityName)
                for trace in traces
            ]

        new_variant_dict[min(ls)] = (renamed_variant, renamed_traces)

    flat_list = lambda lss: [x for ls in lss for x in ls]

    no_update = set(cache.variants.keys()).difference(
        set(flat_list(mergeList) + renameList)
    )

    for bid in no_update:
        new_variant_dict[bid] = cache.variants[bid]

    cache.variants = new_variant_dict
    
    activities : Set = cache.parameters["activites"]
    activities.discard(activityName)
    activities.add(newActivityName)
    
    cache.parameters["activites"] = activities


def remove_activity_from_trace(trace, activityName):

    for event in trace:

        if event["concept:name"] == activityName:
            del event

    return trace


def remove_activitiy_from_group(group, activity_name):

    if isinstance(group, LeafGroup):
        lst = group[:]
        if activity_name in group and len(group) == 1:

            return None

        elif activity_name in group and len(group) > 1:
            lst.remove(activity_name)

        return LeafGroup(lst)

    else:

        children = [
            remove_activitiy_from_group(child, activity_name) for child in group
        ]
        children = [child for child in children if child]

        tmp = []

        for child in children:

            if type(child) == type(group):

                for cchild in child:
                    tmp.append(cchild)

            else:
                tmp.append(child)

        children = tmp

        if len(children) > 1:

            if isinstance(group, ParallelGroup):
                return ParallelGroup(sorted(children))

            else:
                return SequenceGroup(children)

        elif len(children) == 1:
            return children[0]

        else:

            return None


def create_new_graph(trace):
    c = Counter()
    activity_map = {}
    unique_trace = trace.__deepcopy__()

    for event in unique_trace:
        activity = event[DEFAULT_NAME_KEY]
        new_name = activity + str(c[activity])
        event[DEFAULT_NAME_KEY] = new_name
        activity_map[new_name] = activity
        c[activity] += 1

    graph = cgroups_graph(unique_trace, cache.parameters["cur_time_granularity"])
    id_name_map = {name: id for id, name in enumerate(activity_map.keys())}
    graph.restore_names(activity_map, id_name_map)

    return graph


def apply_filter_copy(trace, activityName):

    new_attributes = {}
    for k, v in trace.attributes.items():
        new_attributes[k] = v

    ctrace = Trace(attributes=new_attributes)
    for ev in trace._list:

        if ev["concept:name"] != activityName:
            ctrace.append(ev)

    return ctrace


def recompute_log_statistics(variants, total_traces):

    activites = set()

    res_variants = []
    for i, v in enumerate(variants):

        activites = activites.union(v.graph.events)

        variant = {
            "count": len(variants[v]),
            "variant": v.serialize(),
            "bid": i,
            "length": len(v),
            "number_of_activities": v.number_of_activities(),
            "percentage": round(len(variants[v]) / total_traces * 100, 2),
            "sub_variants": [],
        }
        sub_variants = get_detailed_variants(variants[v])
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
        if (
            "leaf" in variant["variant"].keys()
            or "parallel" in variant["variant"].keys()
        ):
            variant["variant"] = {"follows": [variant["variant"]]}

        variant["sub_variants"] = sorted(
            variant["sub_variants"], key=lambda x: x["count"], reverse=True
        )
        res_variants.append(variant)

    return res_variants


def remove_activities(
    activityName, fallthrough, delete_member_list, merge_list, delete_variant_list
):

    new_variants: Mapping[int, Tuple[ConcurrencyGroup, List]] = {}

    for bid in delete_member_list:

        (variant, traces) = cache.variants[bid]

        new_variant = remove_activitiy_from_group(variant, activityName)
        log = [apply_filter_copy(trace, activityName) for trace in traces]
        new_variant.graph = create_new_graph(log[0])
        new_variants[bid] = (new_variant, log)

    for ls in merge_list:

        (variant, _) = cache.variants[ls[0]]
        new_variant = remove_activitiy_from_group(variant, activityName)

        new_traces = []

        for bid in ls:

            (_, traces) = cache.variants[bid]
            new_traces += [apply_filter_copy(trace, activityName) for trace in traces]

        new_variant.graph = create_new_graph(new_traces[0])

        new_variants[min(ls)] = (new_variant, new_traces)

    flat_list = lambda lss: [x for ls in lss for x in ls]

    no_update = set(cache.variants.keys()).difference(
        set(
            flat_list(merge_list)
            + fallthrough
            + delete_member_list
            + delete_variant_list
        )
    )

    for bid in no_update:
        new_variants[bid] = cache.variants[bid]

    mergeVariants = []
    newVariants = []

    if len(fallthrough) > 0:

        cLog = []
        for bid in fallthrough:
            (_, traces) = cache.variants[bid]
            cLog.extend([apply_filter_copy(trace, activityName) for trace in traces])

        log = EventLog(cLog)

        c_variants = get_concurrency_variants(
            log, False, cache.parameters["cur_time_granularity"]
        )

        for c_variant, c_traces in c_variants.items():

            foundMatch = False
            for n_bid, (n_variant, n_traces) in new_variants.items():

                if str(n_variant) == str(c_variant):
                    mergeVariants.append((n_bid, c_variant, n_traces + c_traces))
                    foundMatch = True
                    break

            if foundMatch:
                new_variants[n_bid] = (n_variant, n_traces + c_traces)

            else:
                new_variants[cache.parameters["nBids"] + 1] = (c_variant, c_traces)
                newVariants.append((cache.parameters["nBids"] + 1, c_variant, c_traces))
                cache.parameters["nBids"] = cache.parameters["nBids"] + 1

    new_res_variants = []

    for bid, v, ts in newVariants:
        variant = create_variant_object(
            cache.parameters["cur_time_granularity"], 1, bid, v, ts
        )
        new_res_variants.append(variant)

    update_res_variants = {}

    for bid, v, ts in mergeVariants:

        sub_variants = get_detailed_variants(
            ts, time_granularity=cache.parameters["cur_time_granularity"]
        )

        total_sub_traces = sum(len(sub_variants[v]) for v in sub_variants)

        sub_ls = []
        for sub_v in sub_variants:
            sub_ls.append(
                {
                    "variant": sub_v,
                    "count": len(sub_variants[sub_v]),
                    "percentage": round(
                        len(sub_variants[sub_v]) / total_sub_traces * 100, 2
                    ),
                }
            )

        sub_ls = sorted(sub_ls, key=lambda x: x["count"], reverse=True)
        update_res_variants[bid] = {"count": len(ts), "sub_variants": sub_ls}

    start_activities, end_activities, _ = compute_log_stats(new_variants)

    res = {
        "startActivities": list(start_activities),
        "endActivities": list(end_activities),
        "new_variants": new_res_variants,
        "update_variants": update_res_variants,
    }

    cache.variants = new_variants
    
    
    activities : Set = cache.parameters["activites"]
    activities.discard(activityName)
    
    cache.parameters["activites"] = activities

    return res

def remove_variant(bids):
    
    cache.variants = {
        bid: (v, t) for bid, (v, t) in cache.variants.items() if bid not in bids
    }

    start_activities, end_activities, nActivities = compute_log_stats(cache.variants)

    res = {
        "startActivities": list(start_activities),
        "endActivities": list(end_activities),
        "activities": nActivities,
    }
    
    cache.parameters["activites"] = set(nActivities.keys())

    return res
