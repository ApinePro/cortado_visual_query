import logging
import pickle
from typing import Callable

import cache.cache as cache

from endpoints import load_event_log
from fastapi import FastAPI

logger = logging.getLogger("uvicorn")


def create_start_app_handler(
    app: FastAPI,
) -> Callable:
    async def start_app() -> None:
        logger.info("---------- Handling startup ----------")
        cache.pcache = {}
        cache.variants = pickle.load(open("./resources/variants.p", "rb"))
        cache.parameters = pickle.load(open("./resources/parameters.p", "rb"))
        
        print('loaded parameters', cache.parameters)
        
        cache.event_log = pickle.load(
            open("./resources/sample_log.p", "rb"))
    return start_app


def create_stop_app_handler(app: FastAPI) -> Callable:
    async def stop_app() -> None:
        logger.info("-------- Handling application stop -----------")
    return stop_app