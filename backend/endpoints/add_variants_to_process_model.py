from typing import List

from pm4py.objects.log.obj import EventLog, Trace, Event
from pm4py.objects.process_tree.obj import ProcessTree

from backend.backend_utilities.process_tree_conversion import dict_to_process_tree, process_tree_to_dict
from backend.interactive_process_mining_core.freezing.apply import add_trace_to_pt_language_with_freezing
from backend.interactive_process_mining_core.lca_approach import add_trace_to_pt_language


def add_variants_to_process_model(pt_dict: ProcessTree, explicitly_added_variants, variants_to_add):
    pt: ProcessTree
    frozen_subtrees: List[ProcessTree]
    pt, frozen_subtrees = dict_to_process_tree(pt_dict)
    print("\ntree:", pt)
    print("frozen subtrees", frozen_subtrees, "\n")

    explicitly_added_log: EventLog = EventLog()
    for v in explicitly_added_variants:
        t = Trace()
        for e in v:
            assert type(e) == str
            event = Event()
            event["concept:name"] = e
            t.append(event)
        explicitly_added_log.append(t)

    traces_to_be_added: List[Trace] = []
    for v in variants_to_add:
        t = Trace()
        for e in v:
            assert type(e) == str
            event = Event()
            event["concept:name"] = e
            t.append(event)
        traces_to_be_added.append(t)

    for t in traces_to_be_added:
        if len(frozen_subtrees) == 0:
            print("ADDING VARIANTS TO PROCESS TREE WITHOUT FROZEN SUBTREES")
            pt = add_trace_to_pt_language(pt, explicitly_added_log, t, try_pulling_lca_down=True)
        else:
            print("ADDING VARIANTS TO PROCESS TREE INCLUDING FROZEN SUBTREES")
            print(type(pt))
            pt, frozen_subtrees = add_trace_to_pt_language_with_freezing(pt, frozen_subtrees, explicitly_added_log, t,
                                                                         try_pulling_lca_down=True)
        explicitly_added_log.append(t)
    res = process_tree_to_dict(pt, frozen_subtrees)
    return res
