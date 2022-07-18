
from fastapi import APIRouter
import pm4pycvxopt
from pydantic import BaseModel
from backend.endpoints.query_variant import evaluate_query_against_variant_graphs
import cache.cache as cache


router = APIRouter(
    tags=["variantQuery"],
    prefix="/variantQuery"
)

class variantQuery(BaseModel):
    queryString: str


@app.post("/variant-query")
def variant_query(query: variantQuery):
    res = evaluate_query_against_variant_graphs(
        query, cache.variants, cache.parameters['activites'])

    return res