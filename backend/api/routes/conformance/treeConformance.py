from typing import List, Optional
from collections import defaultdict
from fastapi import APIRouter
from pydantic import BaseModel
from cortado_core.utils.process_tree import convert_tree
from cortado_core.utils.cvariants import generate_variants

from cache import cache

from backend_utilities.process_tree_conversion import dict_to_process_tree, process_tree_to_dict
from endpoints.alignments import InfixType, calculate_alignment

router = APIRouter(tags=["treeConformance"], prefix="/treeConformance")


class InputCalculateConformance(BaseModel):
    pt: dict
    variants: List[int]
    delete: Optional[List[int]]
    infix_type: InfixType


@router.post("/calculateVariantsConformance")
async def calculate_tree_conformance(d: InputCalculateConformance):
    pt, _ = dict_to_process_tree(d.pt)
    pt = convert_tree(pt)
    variants_tree_conformance = {}
    all_conf_stats = []

    for bid in d.variants:
        (variant, _, _) = cache.variants[bid]
        # calc alignment
        variants = generate_variants(variant.serialize())
        variant_tree_conformances = []
        for variant in variants:
            alignment = calculate_alignment(variant, d.pt, d.infix_type, True)

            conf_stats = defaultdict(lambda: {'value': None, 'weight': 0})
            for (log_move, model_move) in alignment['alignment']:
                model_move = str(model_move)

                if(model_move == '>>'):
                    continue

                if conf_stats[model_move]['value'] is None:
                    conf_stats[model_move]['value'] = 0

                conf_stats[model_move]['weight'] += 1

                # when move is properly aligned
                if(
                    log_move == model_move.rsplit('_', 1)[0] or
                    (
                        log_move == '>>' and
                        model_move.rsplit('_', 1)[0] == 'tau'
                    )
                ):
                    conf_stats[model_move]['value'] += 1

            for conf_stat in conf_stats.values():
                conf_stat['value'] = conf_stat['value'] / conf_stat['weight']

            variant_tree_conformances.append(conf_stats)

        variant_conf_stats = merge_conf_stats(variant_tree_conformances)
        all_conf_stats.append(variant_conf_stats)
        variants_tree_conformance[bid] = process_tree_to_dict(
            pt, conformance=variant_conf_stats)

    merged_conf_stat = merge_conf_stats(all_conf_stats)
    pt_dict = process_tree_to_dict(pt, conformance=merged_conf_stat)

    return {
        "merged_conformance_tree": pt_dict,
        "variants_tree_conformance": variants_tree_conformance,
    }


def merge_conf_stats(conf_stats: List[dict]):
    if len(conf_stats) == 1:
        return conf_stats[0]
    merged_stats = {}
    if len(conf_stats) > 1:
        for key in conf_stats[0].keys():
            values = [stats[key]['value']
                      for stats in conf_stats if stats[key]['value'] is not None]
            weights = [stats[key]['weight']
                       for stats in conf_stats if stats[key]['value'] is not None]
            merged_stats[key] = {
                'value': sum(values) / len(values) if len(values) > 0 else None,
                'weight': sum(weights)
            }
        return merged_stats
    return None
