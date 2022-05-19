"""Import routes here
"""

from fastapi import APIRouter
from api.routes.log import log
from api.routes.log import modifyLog

router = APIRouter()
router.include_router(log.router)
router.include_router(modifyLog.router)
