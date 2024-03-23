import asyncio

from fastapi import APIRouter
from starlette.websockets import WebSocketState, WebSocketDisconnect, WebSocket
from api.routes.conformance.variantConformance import calculate_alignment_intern_with_timeout, alignment_preprocess_result
from api.routes.variants.subvariantMining import mine_repetition_patterns_with_timeout, RepetitionsMiningConfig, \
    repetition_mining_preprocess_result
from backend_utilities.configuration.repository import ConfigurationRepositoryFactory
from backend_utilities.multiprocessing.pool_factory import PoolFactory
from cache import cache
from endpoints.alignments import InfixType

router = APIRouter(tags=["ws"], prefix="/ws")


@router.websocket("/")
async def common_endpoint(websocket: WebSocket):

    config_repository = ConfigurationRepositoryFactory.get_config_repository()
    configuration = config_repository.get_configuration()

    try:
        pool = PoolFactory.instance().get_pool()
        await websocket.accept()

        while True:

            data = await websocket.receive_json()

            if "isCancellationRequested" in data:
                await websocket.close(1000)
                PoolFactory.instance().restart_pool()
                return

            try:
                timeout = configuration.timeout_cvariant_alignment_computation
                if "timeout" in data and data["timeout"] != 0:
                    timeout = data["timeout"]

                if data['name'] == 'repetition_mining':

                    pool.apply_async(
                        mine_repetition_patterns_with_timeout,
                        (
                            RepetitionsMiningConfig(**data),
                            cache.variants,
                            cache.parameters["activites"],
                            timeout,
                        ),
                        callback=callback(
                            websocket, repetition_mining_preprocess_result
                        ),
                    )

                else:

                    pool.apply_async(
                        calculate_alignment_intern_with_timeout,
                        (
                            data["pt"],
                            data["variant"],
                            InfixType(data["infixType"]),
                            timeout,
                        ),
                        callback=callback(
                            websocket, alignment_preprocess_result, (data["id"], data["alignType"])
                        ),
                    )

            except Exception as e:
                if websocket.application_state == WebSocketState.CONNECTED:
                    await websocket.send_json({"error": str(e)})

    except WebSocketDisconnect as d:
        print(d)
        print("websocket disconnected")


def callback(websocket: WebSocket, preprocess_response: callable, args=()):

    def send_response(data):

        result = preprocess_response(data, *args)

        try:
            print('sending response..')

            if websocket.application_state == WebSocketState.CONNECTED:
                asyncio.run(websocket.send_json(result))

        except Exception as e:
            print("Error while sending arc diagrams computation result: ", e)

    return send_response
