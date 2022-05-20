from typing import List
from tqdm import tqdm

from pm4py.objects.log.obj import EventLog, Trace
from pm4py.objects.process_tree.obj import ProcessTree

from backend_utilities.process_tree_conversion import dict_to_process_tree, process_tree_to_dict
from backend_utilities.variant_trace_conversion import variant_to_trace
from cortado_core.freezing.apply import add_trace_to_pt_language_with_freezing
from cortado_core.lca_approach import add_trace_to_pt_language


def add_variants_to_process_model(pt_dict: dict, fitting_variants, variants_to_add):
    pt: ProcessTree
    frozen_subtrees: List[ProcessTree]
    pt, frozen_subtrees = dict_to_process_tree(pt_dict)
    print("\ntree:", pt)
    print("frozen subtrees", frozen_subtrees, "\n")

    fitting_variants_log: EventLog = EventLog()
    for v in fitting_variants:
        t = variant_to_trace(v)
        fitting_variants_log.append(t)

    traces_to_be_added: List[Trace] = []
    for v in variants_to_add:
        t = variant_to_trace(v)
        traces_to_be_added.append(t)

    frozen_subtrees_are_present = len(frozen_subtrees) > 0

    description = "adding variants to process tree without frozen subtrees"
    if frozen_subtrees_are_present:
        description = "adding variants to process tree including frozen subtrees"

    for t in tqdm(traces_to_be_added, desc=description):
        if not frozen_subtrees_are_present:
            pt = add_trace_to_pt_language(pt, fitting_variants_log, t, try_pulling_lca_down=True)
        else:
            pt, frozen_subtrees = add_trace_to_pt_language_with_freezing(pt, frozen_subtrees, fitting_variants_log, t,
                                                                         try_pulling_lca_down=True)
        fitting_variants_log.append(t)
    res = process_tree_to_dict(pt, frozen_subtrees)
    return res
