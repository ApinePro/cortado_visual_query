from cortado_core.eventually_follows_pattern_mining.local_process_models.clustering.edit_dist_aggl_with_preclustering import \
    EditDistanceAgglomerativeClustererWithPreclustering
from cortado_core.eventually_follows_pattern_mining.local_process_models.discovery.inductive_miner import InductiveMiner
from cortado_core.eventually_follows_pattern_mining.local_process_models.lpm_discoverer import LpmDiscoverer
from cortado_core.eventually_follows_pattern_mining.obj import group_to_ef_pattern
from cortado_core.utils.split_graph import Group
from fastapi import APIRouter
from pydantic import BaseModel

from api.routes.variants.subvariantMining import serialize_pattern
from backend_utilities.process_tree_conversion import process_tree_to_dict

router = APIRouter(tags=["lpmMiner"], prefix="/lpmMining")


class LpmMiningInput(BaseModel):
    patterns: list


@router.post("/lpmMining")
def mineLocalProcessModels(config: LpmMiningInput):
    patterns = __deserialize_patterns(config.patterns)
    lpm_discoverer = LpmDiscoverer(
        EditDistanceAgglomerativeClustererWithPreclustering(max_distance=2, preclustering_type='label_vector',
                                                            precalculated_distance_matrix=None),
        discoverer=InductiveMiner())
    local_process_models = lpm_discoverer.discover_lpms(patterns)

    res = []
    for lpm, patterns in local_process_models:
        res.append({
            'lpm': process_tree_to_dict(lpm),
            'patterns': [serialize_pattern(p) for p in patterns]
        })

    return res

def __deserialize_patterns(patterns):
    return [group_to_ef_pattern(Group.deserialize(p)) for p in patterns]
