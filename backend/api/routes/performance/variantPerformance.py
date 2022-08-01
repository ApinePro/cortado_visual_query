from cortado_core.performance.variant_performance import assign_variants_performances
from fastapi import APIRouter
from pydantic import BaseModel

from backend.cache import cache
from backend.endpoints import load_event_log

router = APIRouter(tags=["variantPerformance"], prefix="/variantPerformance")


class InputLogBasedVariantPerformance(BaseModel):
    start: int
    end: int


@router.post("/logBasedVariantPerformance")
async def calculate_log_based_performance(data: InputLogBasedVariantPerformance):
    # TODO niklas check if this works
    variants = cache.variants

    variants = {k: variants[k] for i, k in enumerate(variants) if data.start <= i <= data.end}
    assign_variants_performances(variants)

    return {i + data.start: v.serialize(include_performance=True) for i, v in
            enumerate(variants)}
