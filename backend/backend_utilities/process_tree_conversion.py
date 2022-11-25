from typing import List, Tuple

from cortado_core.process_tree_utils.miscellaneous import (
    subtree_is_part_of_tree_based_on_obj_id,
)
from pm4py.objects.process_tree.obj import Operator, ProcessTree

SEQUENCE_CHAR = "\u2794"
CHOICE_CHAR = "\u2715"
LOOP_CHAR = "\u21BA"
PARALLELISM_CHAR = "\u2227"
TAU_CHAR = "\u03C4"


def process_tree_to_dict(
    pt: ProcessTree, frozen_subtrees: List[ProcessTree] = [], performance={}, conformance=None
) -> dict:
    return process_tree_to_dict_rec(
        pt, frozen_subtrees=frozen_subtrees, performance=performance, conformance=conformance
    )


def process_tree_to_dict_rec(
    pt: ProcessTree, frozen_subtrees: List[ProcessTree] = [], performance={}, conformance=None
) -> dict:
    pt_frozen = False
    for frozen_subtree in frozen_subtrees:
        if subtree_is_part_of_tree_based_on_obj_id(pt, frozen_subtree):
            pt_frozen = True
    res = {
        "operator": __get_root_operator_string_for_frontend(pt),
        "label": __get_root_node_label(pt),
        "id": id(pt),
        "children": [],
        "frozen": pt_frozen,
        "performance": performance.get(str(pt), None),
        "conformance": None
    }
    for c in pt.children:
        res["children"].append(
            process_tree_to_dict_rec(
                c, frozen_subtrees, performance, conformance)
        )
    if conformance:
        if res['children']:
            child_conformance = [child['conformance']
                                 for child in res['children'] if child['conformance'] is not None]
            if len(child_conformance) > 0:
                if pt.operator == Operator.XOR:
                    # max of childrens conformance
                    res['conformance'] = max(
                        child_conformance, key=lambda conf: conf['value'])
                else:
                    # mean of childrens conformance
                    freq_sum = sum(
                        list(map(lambda conf: conf['weight'], child_conformance)))
                    res['conformance'] = {
                        'value': sum(list(map(lambda conf: conf['value'] * conf['weight'], child_conformance))) / freq_sum,
                        'weight': freq_sum

                    }
        elif str(pt) in conformance and conformance[str(pt)]['value'] is not None:
            res['conformance'] = conformance[str(pt)]
    return res


def __get_root_operator_string_for_frontend(pt: ProcessTree) -> str:
    if pt.operator == Operator.XOR:
        return CHOICE_CHAR
    if pt.operator == Operator.SEQUENCE:
        return SEQUENCE_CHAR
    if pt.operator == Operator.LOOP:
        return LOOP_CHAR
    if pt.operator == Operator.PARALLEL:
        return PARALLELISM_CHAR
    return None


def __convert_operator_string_from_frontend_for_pm4py_core(operator: str) -> str:
    if operator == CHOICE_CHAR:
        return Operator.XOR
    if operator == SEQUENCE_CHAR:
        return Operator.SEQUENCE
    if operator == LOOP_CHAR:
        return Operator.LOOP
    if operator == PARALLELISM_CHAR:
        return Operator.PARALLEL
    return None


def __convert_label_string_from_frontend_for_pm4py_core(label: str) -> str:
    if label == TAU_CHAR:
        return None
    else:
        return label


def __get_root_node_label(pt: ProcessTree) -> str:
    if not pt.label and not pt.operator:
        return TAU_CHAR
    else:
        return pt.label


def dict_to_process_tree(
    pt: dict, res=None, frozen_subtrees=None
) -> Tuple[ProcessTree, List[ProcessTree]]:
    if frozen_subtrees is None:
        frozen_subtrees = []
    if not res:
        res = ProcessTree(
            operator=__convert_operator_string_from_frontend_for_pm4py_core(
                pt["operator"]
            ),
            label=__convert_label_string_from_frontend_for_pm4py_core(
                pt["label"]),
        )
    else:
        subtree = ProcessTree(
            operator=__convert_operator_string_from_frontend_for_pm4py_core(
                pt["operator"]
            ),
            label=__convert_label_string_from_frontend_for_pm4py_core(
                pt["label"]),
            parent=res,
        )
        res.children.append(subtree)
        res = subtree
        if pt["frozen"]:
            current_node_already_considered = False
            for frozen_tree in frozen_subtrees:
                if subtree_is_part_of_tree_based_on_obj_id(subtree, frozen_tree):
                    current_node_already_considered = True
                    break
            if not current_node_already_considered:
                frozen_subtrees.append(subtree)
    if pt["children"]:
        for c in pt["children"]:
            dict_to_process_tree(c, res, frozen_subtrees)

    return res, frozen_subtrees


if __name__ == "__main__":
    test = {
        "label": None,
        "operator": "➔",
        "children": [
            {"label": "A_SUBMITTED", "operator": None,
                "children": [], "frozen": False},
            {
                "label": "A_PARTLYSUBMITTED",
                "operator": None,
                "children": [],
                "frozen": False,
            },
            {
                "label": None,
                "operator": "✕",
                "children": [
                    {"label": "τ", "operator": None,
                        "children": [], "frozen": True},
                    {
                        "label": "A_Completeren aanvraag",
                        "operator": None,
                        "children": [],
                        "frozen": True,
                    },
                ],
                "frozen": True,
            },
            {
                "label": None,
                "operator": "✕",
                "children": [
                    {"label": "τ", "operator": None,
                        "children": [], "frozen": True},
                    {
                        "label": "W_Completeren aanvraag",
                        "operator": None,
                        "children": [],
                        "frozen": True,
                    },
                ],
                "frozen": True,
            },
        ],
        "frozen": False,
    }

    res_tree, res_frozen_subtrees = dict_to_process_tree(test)
