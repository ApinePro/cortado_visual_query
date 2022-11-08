import asyncio
from multiprocessing import Pool

import pm4pycvxopt
from backend_utilities.configuration.repository import ConfigurationRepositoryFactory
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
            calculate_alignment_intern, timeout, args=(pt, c_variant, infix_type)
        )
    except TimeoutException:
        return {"isTimeout": True}


def calculate_alignment_intern(pt: dict, c_variant: dict, infix_type: InfixType):
    all_variants = generate_variants(c_variant)
    for variant in all_variants:
        alignment = calculate_alignment_endpoint(variant, pt, infix_type)
        if alignment["deviation"]:
            return {"cost": alignment["cost"], "deviation": alignment["deviation"]}

    return {"cost": 0, "deviation": False}


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
        with Pool() as pool:
            await websocket.accept()
            while True:
                data = await websocket.receive_json()

                if "isCancellationRequested" in data:
                    pool.terminate()
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
