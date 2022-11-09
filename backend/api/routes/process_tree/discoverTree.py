import multiprocessing
from typing import Any, List

from backend_utilities.multiprocessing.pool_factory import PoolFactory
from backend_utilities.process_tree_conversion import (
    dict_to_process_tree,
    process_tree_to_dict,
)
from backend_utilities.variant_trace_conversion import variant_to_trace
from cortado_core.utils.alignment_utils import trace_fits_process_tree
from cortado_core.utils.cvariants import generate_variants
from endpoints.add_variants_to_process_model import add_variants_to_process_model
from fastapi import APIRouter
from pm4py.algo.discovery.inductive.variants.im_clean.algorithm import (
    apply_tree as inductive_miner,
)
from pm4py.objects.log.obj import Event, EventLog, Trace
from pm4py.objects.process_tree.obj import ProcessTree
from pydantic import BaseModel

router = APIRouter(tags=["discoverTree"], prefix="/discoverTree")


class InputDiscoverProcessModelFromVariants(BaseModel):
    variants: List[Any]


@router.post("/discoverProcessModelFromVariants")
async def discover_process_model(d: InputDiscoverProcessModelFromVariants):
    variants = [v["value"]["events"] for v in d.variants]
    return discover_process_model_from_variants(variants)


def discover_process_model_from_variants(variants):
    log = EventLog()
    for v in variants:
        t = Trace()
        for e in v:
            assert type(e) == str
            event = Event()
            event["concept:name"] = e
            t.append(event)
        log.append(t)
    pt: ProcessTree = inductive_miner(log)
    res = process_tree_to_dict(pt)
    return res


@router.post("/discoverProcessModelFromConcurrencyVariants")
async def discover_process_model_from_cvariants(
        d: InputDiscoverProcessModelFromVariants,
):
    all_variants = set(
        [
            tuple(variant)
            for cvariant in d.variants
            for variant in generate_variants(cvariant)
        ]
    )
    print(f"nVariants: {len(all_variants)}")
    res = discover_process_model_from_variants(all_variants)
    return res


class InputAddVariantsToProcessModel(BaseModel):
    fitting_variants: List[Any]
    variants_to_add: List[Any]
    pt: dict


# TODO this endpoint is currently unused, we have to decide if we want to delete it
@router.post("/addVariantsToProcessModel")
async def add_simple_variants_to_process_model(d: InputAddVariantsToProcessModel):
    fitting_variants = [v["events"] for v in d.fitting_variants]
    to_add = [v["events"] for v in d.variants_to_add]
    return add_variants_to_process_model(d.pt, fitting_variants, to_add, PoolFactory.instance().get_pool())


@router.post("/addConcurrencyVariantsToProcessModel")
async def add_cvariants_to_process_model(d: InputAddVariantsToProcessModel):
    fitting_variants = set(
        [
            tuple(variant)
            for cvariant in d.fitting_variants
            for variant in generate_variants(cvariant)
        ]
    )
    to_add = set(
        [
            tuple(variant)
            for cvariant in d.variants_to_add
            for variant in generate_variants(cvariant)
        ]
    )
    return add_variants_to_process_model(d.pt, fitting_variants, to_add, PoolFactory.instance().get_pool())


class InputAddVariantsToProcessModelUnknownConformance(BaseModel):
    selected_variants: List[Any]
    pt: dict


@router.post("/addConcurrencyVariantsToProcessModelUnknownConformance")
async def add_cvariants_to_process_model_unknown_conformance(
        d: InputAddVariantsToProcessModelUnknownConformance,
):
    selected_variants = set(
        [
            tuple(variant)
            for cvariant in d.selected_variants
            for variant in generate_variants(cvariant)
        ]
    )

    fitting_variants = set()
    variants_to_add = set()
    process_tree, _ = dict_to_process_tree(d.pt)
    for selected_variant in selected_variants:
        t = variant_to_trace(selected_variant)
        if trace_fits_process_tree(t, process_tree):
            fitting_variants.add(selected_variant)
        else:
            variants_to_add.add(selected_variant)

    return add_variants_to_process_model(d.pt, fitting_variants, variants_to_add, PoolFactory.instance().get_pool())
