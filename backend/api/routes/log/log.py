import pickle

import cache.log_cache as log_cache
from cortado_core.utils.timestamp_utils import TimeUnit
from endpoints.load_event_log import (calculate_event_log_properties,
                                      get_time_granularity)
from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter(
    tags=["Log"],
    prefix="/log"
)


class PropertiesParams(BaseModel):
    time_granularity: TimeUnit = Field(alias='timeGranularity')


@router.post("/properties")
async def get_event_log_properties(params: PropertiesParams):
    properties = calculate_event_log_properties(
        log_cache.event_log, params.time_granularity)
    return properties


@router.get("/")
async def get_event_log():
    return log_cache.event_log


@router.get("/granularity")
async def get_event_log():
    return get_time_granularity(log_cache.event_log)
