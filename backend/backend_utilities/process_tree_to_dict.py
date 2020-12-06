from pm4py.objects.process_tree.process_tree import ProcessTree
from pm4py.objects.process_tree.pt_operator import Operator

SEQUENCE_CHAR = "\u2794"
CHOICE_CHAR = "\u2715"
LOOP_CHAR = "\u21BA"
PARALLELISM_CHAR = "\u2227"


def process_tree_to_dict(pt: ProcessTree) -> dict:
    res = {"operator": __get_operator_string(pt), "label": pt.label, "id": id(pt), "children": []}
    for c in pt.children:
        res["children"].append(process_tree_to_dict(c))
    return res


def __get_operator_string(pt: ProcessTree) -> str:
    if pt.operator == Operator.XOR:
        return CHOICE_CHAR
    if pt.operator == Operator.SEQUENCE:
        return SEQUENCE_CHAR
    if pt.operator == Operator.LOOP:
        return LOOP_CHAR
    if pt.operator == Operator.PARALLEL:
        return PARALLELISM_CHAR
    return None
