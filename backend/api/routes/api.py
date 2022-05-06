"""Import routes here
"""

from fastapi import APIRouter

from api.routes.log import log

router = APIRouter()
router.include_router(log.router)
