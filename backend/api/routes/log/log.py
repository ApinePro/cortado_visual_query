import pickle
from typing import Optional
import cache.cache as cache
from cortado_core.utils.timestamp_utils import TimeUnit, get_time_granularity
from endpoints.load_event_log import calculate_event_log_properties
from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter(
    tags=["Log"],
    prefix="/log"
)


class PropertiesParams(BaseModel):
    time_granularity: Optional[TimeUnit] = Field(alias="timeGranularity");


@router.post("/properties")
async def get_event_log_properties(params: PropertiesParams):
    properties = calculate_event_log_properties(
        cache.event_log, params.time_granularity)
    return properties


@router.get("/")
async def get_event_log():
    return cache.event_log


@router.get("/granularity")
async def get_event_log():
    return get_time_granularity(cache.event_log)


@router.get("/resetLogCache")
async def reset_log_cache():
    cache.event_log = pickle.load(
            open("./resources/sample_log.p", "rb"))