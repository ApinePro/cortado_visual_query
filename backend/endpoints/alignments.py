from functools import lru_cache

from pm4py.algo.conformance.alignments.petri_net.algorithm import apply_trace as get_alignment
from pm4py.objects.conversion.process_tree.converter import apply as convert_pt_to_petri_net
from pm4py.objects.log.obj import Trace, Event
from pm4py.objects.petri_net.utils.align_utils import STD_MODEL_LOG_MOVE_COST
from pm4py.objects.process_tree.obj import ProcessTree
from backend_utilities.process_tree_conversion import dict_to_process_tree
from pm4py.algo.conformance.alignments.process_tree.variants import search_graph_pt as tree_alignment

# @lru_cache(maxsize=None)
def _calculate_alignment(variant, pt):
    # this function uses the standard alignment calculation (a star based search)
    pt: ProcessTree = dict_to_process_tree(pt)
    net, im, fm = convert_pt_to_petri_net(pt)
    trace = Trace()
    for a in variant:
        e = Event()
        e["concept:name"] = a
        trace.append(e)
    align = get_alignment(trace, net, im, fm)
    # remove non essential information
    res = {k: align[k] for k in ['alignment', 'cost']}
    res['deviation'] = res['cost'] >= STD_MODEL_LOG_MOVE_COST
    return res


# @lru_cache(maxsize=None)
def calculate_alignment(variant, pt):
    # this function uses the specific tree alignment calculation
    pt: ProcessTree = dict_to_process_tree(pt)
    trace = Trace()
    for a in variant:
        e = Event()
        e["concept:name"] = a
        trace.append(e)
    align = tree_alignment.apply_from_variants_list([tuple(variant)], pt)
    align = align[0]
    # remove non essential information
    res = {k: align[k] for k in ['alignment', 'cost']}
    res['deviation'] = res['cost'] > 0
    del res["alignment"]
    return res
