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
        cache.pcache = pickle.load(open("pcache.p", "rb"))
        load_event_log.variants_store = pickle.load(
            open("variants_store.p", "rb"))
        load_event_log.variants = pickle.load(open("variants.p", "rb"))
        load_event_log.activites = pickle.load(open("activities.p", "rb"))
        load_event_log.log_info = pickle.load(open("logInfo.p", "rb"))
        cache.event_log = pickle.load(
            open("./resources/sample_log.p", "rb"))
    return start_app


def create_stop_app_handler(app: FastAPI) -> Callable:
    async def stop_app() -> None:
        logger.info("-------- Handling application stop -----------")
    return stop_app