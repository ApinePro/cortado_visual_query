from fastapi import APIRouter
import pm4pycvxopt
from cortado_core.utils.timestamp_utils import TimeUnit
from cortado_core.utils.cvariants import get_detailed_variants
from cortado_core.performance.subvariant_performance import calculate_subvariant_performance
from pydantic import BaseModel, Field
import cache.cache as cache

router = APIRouter(
    tags=["subvariantPerformance"],
    prefix="/subvariantPerformance"
)

class InputPerformanceSubvariant(BaseModel):
    bid: int 
    time_granularity: TimeUnit = Field(alias='timeGranularity')

@router.post("/subvariants")
async def get_subvariants(data: InputPerformanceSubvariant):

    variant_traces = cache.variants[data.bid][1]
    sub_variants = get_detailed_variants(variant_traces, data.time_granularity)

    result = []

    total_sub_traces = sum(len(sub_variants[v]) for v in sub_variants)

    for subvariant, traces in sub_variants.items():
        subvariant_performance = calculate_subvariant_performance(subvariant, traces, data.time_granularity)
        subvariant_response = {
            'variant': subvariant_performance,
            'count': len(traces),
            'percentage': round(len(traces) / total_sub_traces * 100, 2)
        }
        result.append(subvariant_response)

    return sorted(result, key=lambda x: x['count'], reverse=True)