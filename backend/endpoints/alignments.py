from functools import lru_cache

from pm4py.algo.conformance.alignments.algorithm import apply_trace as get_alignment
from pm4py.objects.conversion.process_tree.converter import apply as convert_pt_to_petri_net
from pm4py.objects.log.log import Trace, Event
from pm4py.objects.process_tree.process_tree import ProcessTree
from pm4py.utils import constants
from backend.backend_utilities.process_tree_conversion import dict_to_process_tree
from pm4py.objects.petri.align_utils import STD_MODEL_LOG_MOVE_COST, SKIP


# @lru_cache(maxsize=None)
def calculate_alignment(variant, pt):
    pt: ProcessTree = dict_to_process_tree(pt)
    net, im, fm = convert_pt_to_petri_net(pt)
    trace = Trace()
    for a in variant["events"]:
        e = Event()
        e["concept:name"] = a
        trace.append(e)
    print(trace)
    align = get_alignment(trace, net, im, fm)
    print(align)
    # remove non essential information
    res = {k: align[k] for k in ['alignment', 'cost']}
    res['deviation'] = res['cost'] >= STD_MODEL_LOG_MOVE_COST
    return res
