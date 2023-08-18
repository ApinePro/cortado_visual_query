import functools
import operator
from typing import List, Mapping, Tuple

import numpy as np
from cortado_core.clustering.clusterer import Clusterer
from cortado_core.clustering.variant_clusterer_adapter import calculate_clusters
from cortado_core.models.infix_type import InfixType
from cortado_core.utils.split_graph import ConcurrencyGroup, Group
from fastapi import APIRouter
from pm4py.objects.log.obj import Trace

import cache.cache as cache
from api.routes.variants.models import (
    ClusteringParameters,
    VariantFragment,
    VariantInformation,
)
from api.routes.variants.utils import (
    get_clusterer,
    get_fragment_counts,
    get_trace_counts,
    map_clusters,
)
from cache import cache_util

# i think its better to have one prefix for everything which
# is related to variants instead of defining a prefix for
# every endpoint.
# e.g. /variantQuery should be /variant/query
# because otherwise the generated api docs are not really convenient
router = APIRouter(tags=["Variants"], prefix="/variant")


@router.post("/countFragmentOccurrences")
def count_fragment_occurrences(payload: VariantFragment):
    fragment: Group = Group.deserialize(payload.fragment)

    variants: Mapping[
        int, Tuple[ConcurrencyGroup, Trace, List, VariantInformation]
    ] = cache.variants
    variants = {k: v for k, v in variants.items() if not v[3].is_user_defined}

    infixType = InfixType[payload.infixType]

    trace_counts = get_trace_counts(variants)
    fragment_counts = get_fragment_counts(variants, fragment, infixType)

    # number of pattern occurrences among all variants
    total_variant_occurrences = functools.reduce(operator.add, fragment_counts)
    # number of variants having at least once the pattern
    variant_occurrences = np.count_nonzero(fragment_counts)
    # number traces having at least once the pattern
    trace_occurrences = np.sum(
        np.array(trace_counts)[np.nonzero(fragment_counts)]
    ).item()

    # number of pattern occurrences among all traces
    total_trace_occurrences = np.sum(
        np.array(trace_counts) * np.array(fragment_counts)
    ).item()

    return {
        "totalOccurrences": total_variant_occurrences,
        "variantOccurrences": variant_occurrences,
        "traceOccurrences": trace_occurrences,
        "totalTraceOccurrences": total_trace_occurrences,
        "variantOccurrencesFraction": round(variant_occurrences / len(variants), 4),
        "traceOccurrencesFraction": round(trace_occurrences / np.sum(trace_counts), 4),
    }


@router.post("/cluster")
def cluster(params: ClusteringParameters):
    variants: List[Group] = cache_util.get_variant_list(True)
    clusterer: Clusterer = get_clusterer(params)
    clusters: List[List[Group]] = calculate_clusters(
        variants=variants, clusterer=clusterer
    )
    result = map_clusters(clusters)
    return result
