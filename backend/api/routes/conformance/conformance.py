import asyncio
from collections import defaultdict
from multiprocessing import Pool

import pm4pycvxopt
from backend_utilities.configuration.repository import ConfigurationRepositoryFactory
from backend_utilities.multiprocessing.pool_factory import PoolFactory
from backend_utilities.timeout.helper_functions import (
    TimeoutException,
    execute_with_timeout,
)
from cortado_core.utils.cvariants import generate_variants
from endpoints.alignments import InfixType
from endpoints.alignments import calculate_alignment as calculate_alignment_endpoint
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(tags=["conformance"], prefix="/conformance")


def calculate_alignment_intern_with_timeout(
    pt: dict, c_variant: dict, infix_type: InfixType, timeout: int
):
    try:
        return execute_with_timeout(
            calculate_alignment_intern, timeout, args=(
                pt, c_variant, infix_type)
        )
    except TimeoutException:
        return {"isTimeout": True}


def calculate_alignment_intern(pt: dict, c_variant: dict, infix_type: InfixType):
    def index_leafs(variant, start_index=0):
        if 'follows' in variant:
            res = {'follows': []}
            index = start_index
            for v in variant['follows']:
                childs, index = index_leafs(v, index)
                res['follows'].append(childs)
            return res, index
        elif 'parallel' in variant:
            res = {'parallel': []}
            index = start_index
            for v in variant['parallel']:
                childs, index = index_leafs(v, index)
                res['parallel'].append(childs)
            return res, index
        else:
            return {'leaf': [(act, index + start_index) for index, act in enumerate(variant['leaf'])]}, start_index + len(variant['leaf'])

    c_variant_indexed = index_leafs(c_variant)[0]
    all_variants = generate_variants(c_variant_indexed)
    index_alignments_mapping = defaultdict(lambda: 0)
    total_cost = 0
    deviations = 0
    for variant in all_variants:
        alignment = calculate_alignment_endpoint(
            list(map(lambda x: x[0], variant)), pt, infix_type)
        total_cost = alignment["cost"]
        deviations += alignment["deviation"]
        index_alignments_mapping.update(
            {variant[i][1]: index_alignments_mapping[i] + (move[0] == str(move[1]))
             for i, move in enumerate([move for move in alignment['alignment'] if move[0] != '>>'])})

    index_alignments_mapping.update(
        {k: v/len(all_variants) for k, v in index_alignments_mapping.items()})
    return {
        "cost": total_cost/len(all_variants),
        "deviations": deviations/len(all_variants),
        "alignment": project_alignments_on_cvariant(index_alignments_mapping, c_variant_indexed),
        "pt": pt
    }


def project_alignments_on_cvariant(mapping, variant):
    if 'follows' in variant:
        res = {'follows': []}
        for v in variant['follows']:
            childs = project_alignments_on_cvariant(mapping, v)
            res['follows'].append(childs)
        return res
    elif 'parallel' in variant:
        res = {'parallel': []}
        for v in variant['parallel']:
            childs = project_alignments_on_cvariant(mapping, v)
            res['parallel'].append(childs)
        return res
    else:
        return {'leaf': [(act, mapping[index]) for act, index in variant['leaf']]}


def get_alignment_callback(idx: str, alignType, websocket: WebSocket):
    def callback(result):
        data = {
            "id": idx,
            "isTimeout": False,
            "cost": 0,
            "type" : alignType,
            "deviation": False,
        }
        for key, value in result.items():
            data[key] = value

        asyncio.run(websocket.send_json(data))

    return callback


@router.websocket("/conformancews")
async def websocket_endpoint(websocket: WebSocket):
    config_repository = ConfigurationRepositoryFactory.get_config_repository()
    configuration = config_repository.get_configuration()

    try:
        pool = PoolFactory.instance().get_pool()
        await websocket.accept()
        while True:
            data = await websocket.receive_json()

            if "isCancellationRequested" in data:
                await websocket.close(1000)
                return

            timeout = configuration.timeout_cvariant_alignment_computation
            if data["timeout"] != 0:
                timeout = data["timeout"]
            pool.apply_async(
                calculate_alignment_intern_with_timeout,
                (
                    data["pt"],
                    data["variant"],
                    InfixType(data["infixType"]),
                    timeout,
                ),
                callback=get_alignment_callback(data["id"], data['alignType'], websocket),
            )
    except WebSocketDisconnect:
        print("websocket disconnected")
