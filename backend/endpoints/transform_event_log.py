
from pm4py.algo.filtering.log.attributes import attributes_filter
from pm4py.algo.filtering.log.end_activities import end_activities_filter
from pm4py.algo.filtering.log.start_activities import start_activities_filter
from cortado_core.performance.variant_performance import assign_variants_performances
from cortado_core.utils.split_graph import LeafGroup, SequenceGroup, ConcurrencyGroup

from pm4py.util.xes_constants import DEFAULT_START_TIMESTAMP_KEY, DEFAULT_TRANSITION_KEY
from endpoints import load_event_log

def cache_current_data(): 
        
    pass
    
    
    
def rename_activities_in_trace(trace, oldActivityName, newActivityName): 

    for event in trace:   
        if event["concept:name"] == oldActivityName:
            event["concept:name"] = newActivityName
        
       
            
    
def rename_activities(oldActivityName, newActivityName): 
    
    
    load_event_log.variants_store
    load_event_log.variants
    load_event_log.activites 
    
    #print('Variants_store', load_event_log.variants_store.keys())
    
    print('Variants', load_event_log.variants)
    print('Activities', load_event_log.activites)
    
    new_storage = {}
    
    
    
    res = None
    
    return res