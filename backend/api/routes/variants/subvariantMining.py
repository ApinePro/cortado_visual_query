import cache.cache as cache
import pm4pycvxopt
from fastapi import APIRouter
from pydantic import BaseModel

from cortado_core.subprocess_discovery.subtree_mining.treebank import (
    create_treebank_from_cv_variants,
)
from cortado_core.subprocess_discovery.subtree_mining.right_most_path_extension.min_sub_mining import (
    min_sub_mining,
)
from cortado_core.subprocess_discovery.subtree_mining.freq_counting import (
    FrequencyCountingStrategy,
)
from cortado_core.subprocess_discovery.subtree_mining.maximal_connected_components.maximal_connected_check import (
    set_maximaly_closed_patterns,
)
from cortado_core.subprocess_discovery.subtree_mining.output import (
    dataframe_from_k_patterns,
    add_confidence_information_to_df,
)
from cortado_core.subprocess_discovery.subtree_mining.blanket_mining.cm_grow import (
    cm_min_sub_mining,
)

import cache.cache as cache
import numpy as np

router = APIRouter(tags=["subvariantMining"], prefix="/subvariantMining")


class VariantMinerConfig(BaseModel):
    k: int
    min_sup: int
    strat: int
    algo: int
    loop: int
    algo_type: int
    artifical_start: bool


freq_strat_mapping = {
    1: FrequencyCountingStrategy.TraceTransaction,
    2: FrequencyCountingStrategy.VariantTransaction,
    3: FrequencyCountingStrategy.TraceOccurence,
    4: FrequencyCountingStrategy.VariantOccurence,
}


@router.post("/frequentSubtreeMining")
def mineFrequentSubtrees(config: VariantMinerConfig):
    
    print()
    
    print("K:", config.k)
    print("min_sup:", config.min_sup)
    print("Strat:", freq_strat_mapping[config.strat])
    print("Mining Algo:", config.algo)
    print("Loop", config.loop)
    print("Artif. Start", config.artifical_start)
    
    variants = { v : ts for _, (v, ts , _ ) in cache.variants.items()}

    treeBank = create_treebank_from_cv_variants(variants, config.artifical_start)
    
    print()

    if config.algo == 1:
        print("Mining K Patterns...")
        k_patterns = min_sub_mining(
            treeBank,
            variants,
            frequency_counting_strat=freq_strat_mapping[config.strat],
            k_it=config.k,
            min_sup=config.min_sup,
            artifical_start=config.artifical_start,
            loop=config.loop,
        )

    else:

        print("Mining CM K Patterns...")
        k_patterns = cm_min_sub_mining(
            treeBank,
            variants,
            frequency_counting_strat=freq_strat_mapping[config.strat],
            k_it=config.k,
            min_sup=config.min_sup,
            artifical_start=config.artifical_start,
            loop=config.loop,
        )
    
    print()
    print('Post-Processing...')
    print('DEV:  CURRENTLY NOT SETTING CLOSED')
    #set_maximaly_closed_patterns(k_patterns) 
        
    df = dataframe_from_k_patterns(k_patterns)

    if not df.empty: 
            
        df = df[df.valid] 
        
        df['bids'] = df.obj.apply(lambda x : set(x.rmo.keys()))
        
        print("Adding Confidence Information...")
        df = add_confidence_information_to_df(k_patterns, df)
        print("Finished Confidence...")
        
        df.obj = df.obj.apply(
            lambda x: x.to_concurrency_group().serialize(include_performance=False)
        )
        df = df.replace({np.nan: None})
        
        df_dict = df.to_dict(orient="records")

    else: 
        df_dict = False

    print("Sending Results")
    return df_dict
