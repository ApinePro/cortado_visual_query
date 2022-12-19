from collections import defaultdict

from cortado_core.tiebreaker.algorithm import apply_tiebreaker_on_variants
from cortado_core.tiebreaker.pattern import parse_tiebreaker_pattern
from fastapi import APIRouter
from pydantic import BaseModel

import cache.cache
from api.routes.variants.variants import VariantInformation
from endpoints.alignments import InfixType
from endpoints.load_event_log import create_variant_object

router = APIRouter(tags=['Tiebreaker'], prefix="/tiebreaker")


class TiebreakerPatterns(BaseModel):
    sourcePattern: str
    targetPattern: str


@router.post("/apply")
def apply_tiebreaker(payload: TiebreakerPatterns):
    variants = cache.cache.variants
    new_variants = defaultdict(list)
    n_traces = 0

    for _, (variant, traces, _, _) in variants.items():
        new_variants[variant] += traces
        n_traces += len(traces)

    source_pattern = parse_tiebreaker_pattern(payload.sourcePattern)
    target_pattern = parse_tiebreaker_pattern(payload.targetPattern)

    new_variants = apply_tiebreaker_on_variants(new_variants, source_pattern, target_pattern)
    res_variants = []

    cache_variants = dict()

    for bid, (v, ts) in enumerate(sorted(list(new_variants.items()), key=lambda e: len(e[1]), reverse=True)):
        info = VariantInformation(infix_type=InfixType.NOT_AN_INFIX, is_user_defined=False)
        variant, sub_vars = create_variant_object(cache.cache.parameters["cur_time_granularity"], n_traces, bid, v, ts,
                                                  info)

        res_variants.append(variant)
        cache_variants[bid] = (
            v, ts, sub_vars, info)

    cache.cache.variants = cache_variants

    return sorted(res_variants, key=lambda variant: variant["count"], reverse=True)
