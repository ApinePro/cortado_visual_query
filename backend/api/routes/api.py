"""Import routes here
"""

from fastapi import APIRouter
from api.routes.log import log, modifyLog
from api.routes.input_output import exporting, importing
from api.routes.configuration import configuration
from api.routes.conformance import conformance
from api.routes.performance import variantPerformance, subvariantPerformance
from api.routes.process_tree import discoverTree, modifyTree, treeString
from api.routes.variants import queryVariant

router = APIRouter()
router.include_router(log.router)
router.include_router(modifyLog.router)
router.include_router(exporting.router)
router.include_router(importing.router)
router.include_router(configuration.router)

router.include_router(conformance.router)
router.include_router(variantPerformance.router)
router.include_router(subvariantPerformance.router)
router.include_router(discoverTree.router)
router.include_router(modifyTree.router)
router.include_router(treeString.router)
router.include_router(queryVariant.router)