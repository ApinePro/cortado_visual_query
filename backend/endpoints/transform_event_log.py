
from msilib import change_sequence
import pickle
from sqlite3 import enable_shared_cache
from cortado_core.utils.cvariants import get_concurrency_variants, get_detailed_variants
from cortado_core.performance.variant_performance import assign_variants_performances
from cortado_core.utils.split_graph import LeafGroup, SequenceGroup, ConcurrencyGroup
from pm4py.objects.log.obj import EventLog
from pm4py.util.xes_constants import DEFAULT_START_TIMESTAMP_KEY, DEFAULT_TRANSITION_KEY
from endpoints import load_event_log
from pm4py.filtering import filter_event_attribute_values
from pm4py.algo.filtering.log.attributes import attributes_filter

def cache_current_data(): 
        
    pickle.dump(load_event_log.activites, open( "tmp/activities_cache.p", "wb" ))
    pickle.dump(load_event_log.variants,  open( "tmp/variants_cache.p", "wb" ))
    

def rename_merge_activities_in_graph(graph : ConcurrencyGroup, oldActivityName, newActivityName): 
    
    graph.events[newActivityName] = graph.events.pop(oldActivityName, set()).union(graph.events.get(oldActivityName, set()))
    graph.start_activities[newActivityName] =  graph.start_activities.pop(oldActivityName, set()).union(graph.start_activities.get(oldActivityName, set()))
    graph.end_activities[newActivityName] = graph.end_activities.pop(newActivityName, set()).union(graph.end_activities.get(oldActivityName, set()))
    
    new_df = {}
    
    for x, y in graph.directly_follows: 
        
        
        if x != oldActivityName and y != oldActivityName: 
            new_df[(x, y)] = new_df.get((x, y), set()).union(graph.directly_follows.get((x,y)))
            
        else: 
            
            if x == oldActivityName and y == oldActivityName: 
                
                new_df[(newActivityName, newActivityName)] = graph.directly_follows.get((x,y)).union(graph.directly_follows.get((newActivityName, newActivityName), set()))
                
            elif x == oldActivityName:
                
                new_df[(newActivityName, y)] = graph.directly_follows.get((x,y)).union(graph.directly_follows.get((newActivityName, y), set()))
                
            elif y == oldActivityName: 
                
                new_df[(x, newActivityName)] = graph.directly_follows.get((x,y)).union(graph.directly_follows.get((x, newActivityName), set()))
                
    
    graph.directly_follows = new_df
    
    new_ef = {} 
    
    for x, y in graph.follows: 
        
        if x != oldActivityName and y != oldActivityName: 
            new_ef[(x, y)] = new_ef.get((x, y), set()).union(graph.follows.get((x,y)))
            
        else: 
            
            if x == oldActivityName and y == oldActivityName: 
                new_ef[(newActivityName, newActivityName)] = graph.follows.get((x,y)).union(graph.follows.get((newActivityName, newActivityName), set()))
                
            elif x == oldActivityName:
                new_ef[(newActivityName, y)] = graph.follows.get((x,y)).union(graph.follows.get((newActivityName, y), set()))
                
            elif y == oldActivityName: 
                new_ef[(x, newActivityName)] = graph.follows.get((x,y)).union(graph.follows.get((x, newActivityName), set()))
 
    graph.follows = new_ef
    
    new_cc= {} 
    
    for x, y in graph.concurrency_pairs: 
        
        if x != oldActivityName and y != oldActivityName: 
            new_cc[(x, y)] = new_cc.get((x, y), set()).union(graph.concurrency_pairs.get((x,y)))
            
        else: 
            
            if x == oldActivityName and y == oldActivityName:
                pair = tuple(newActivityName, newActivityName)

                new_cc[pair] = graph.concurrency_pairs.get((x,y)).union(graph.concurrency_pairs.get(pair, set()))
                
            elif x == oldActivityName:
                pair = tuple(sorted((newActivityName, y)))

                new_cc[pair] = graph.concurrency_pairs.get((x,y)).union(graph.concurrency_pairs.get(pair, set()))
                
            elif y == oldActivityName: 
                pair =  tuple(sorted((x, newActivityName)))

                new_cc[pair] = graph.concurrency_pairs.get((x,y)).union(graph.concurrency_pairs.get(pair, set()))
    
    
    graph.concurrency_pairs = new_cc
    
    return graph 
            
    
def rename_activities_in_trace(trace, oldActivityName, newActivityName): 

    for event in trace:   
        if event["concept:name"] == oldActivityName:
            event["concept:name"] = newActivityName
    
    return trace

def rename_activities_in_variant_group(group, oldActivityName, newActivityName): 

    change = False
    
    if isinstance(group, LeafGroup): 
        lst = group[:]
        if oldActivityName in group: 
            change = True
            lst.remove(oldActivityName)
            lst.append(newActivityName)
            lst.sort()
           
        return LeafGroup(lst), change
        
    else: 
        children, changes = zip(*[rename_activities_in_variant_group(child, oldActivityName, newActivityName) for child in group])
 
        
        if isinstance(group, ConcurrencyGroup):
            return ConcurrencyGroup(sorted(children)), any(changes)
        
        
        else: 
            return SequenceGroup(children), any(changes)
    
            
    
def rename_activities(oldActivityName, newActivityName): 
    
    if oldActivityName in load_event_log.activites:
        load_event_log.activites.remove(oldActivityName)
        load_event_log.activites.add(newActivityName)  
    
    new_variant_dict = {}
    
    for variant in load_event_log.variants: 

        new_variant, changed = rename_activities_in_variant_group(variant, oldActivityName, newActivityName)
        
        if changed: 
            
            traces = [rename_activities_in_trace(trace, oldActivityName, newActivityName) for trace in load_event_log.variants[variant]]  
            new_variant.graph = rename_merge_activities_in_graph(variant.graph, oldActivityName, newActivityName) 
            
            full_traces = new_variant_dict.get(new_variant, [])
            full_traces.extend(traces)
            
            new_variant_dict[new_variant] = traces

        else: 
            
            traces = new_variant_dict.get(variant, [])
            traces.extend(load_event_log.variants[variant])
            
            new_variant_dict[variant] = traces
        
    load_event_log.variants = new_variant_dict
    
    
    
def remove_activity_from_trace(trace, activityName): 
    
    
    
    for event in trace: 
        
        if event["concept:name"] == activityName:
            print('Deleting Event')
            del event
     
    print(trace)
    return trace
    
    
def remove_activities(activityName): 
    
    print('Remove Activity')
    for variant, traces in load_event_log.variants.items(): 

        if activityName in variant.graph.events: 
            
            print('Creating Log')
            
            log = EventLog(traces) 
            
            print('Filtering')
            
            print(log)
            
            
            log = filter_event_attribute_values.apply(log, level = 'event', values = [activityName], 
                                                      attribute_key = "concept:name", retain = False) 
            
            print('Log', log)
            
            c_variants = get_concurrency_variants(log, False) 
            
            print(c_variants.keys())
            
            
            

        
        
        
    