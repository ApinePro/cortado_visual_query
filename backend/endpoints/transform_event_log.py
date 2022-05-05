
from collections import Counter
import pickle
from cortado_core.utils.cvariants import get_concurrency_variants, get_detailed_variants
from cortado_core.performance.variant_performance import assign_variants_performances
from cortado_core.utils.split_graph import LeafGroup, SequenceGroup, ConcurrencyGroup
from cortado_core.utils.cgroups_graph import cgroups_graph
from pm4py.objects.log.obj import EventLog
from pm4py.util.xes_constants import DEFAULT_NAME_KEY
from endpoints import load_event_log
from pm4py.algo.filtering.log.attributes.attributes_filter import apply_events, Parameters

from pm4py.algo.filtering.log.attributes import attributes_filter
from pm4py.algo.filtering.log.end_activities import end_activities_filter
from pm4py.algo.filtering.log.start_activities import start_activities_filter

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
            
            new_variant_dict[new_variant] = new_variant_dict.get(new_variant, []) + traces

        else: 
            
            new_variant_dict[variant] = new_variant_dict.get(variant, []) + load_event_log.variants[variant]
        
    load_event_log.variants = new_variant_dict
    
    
    
def remove_activity_from_trace(trace, activityName): 
    
    
    
    for event in trace: 
        
        if event["concept:name"] == activityName:
            print('Deleting Event')
            del event
     
    print(trace)
    return trace


def remove_activitiy_from_group(group, activity_name): 
    
    
    fallthrough = False
    
    if isinstance(group, LeafGroup): 
        lst = group[:]
        if activity_name in group and len(group) == 1: 
           
           return None, fallthrough
           
        elif activity_name in group and len(group) > 1: 
            fallthrough = True
            lst.remove(activity_name)
            
        return LeafGroup(lst), fallthrough
        
    else: 
        
        children, fallthroughs = zip(*[remove_activitiy_from_group(child, activity_name) for child in group])
        children = [child for child in children if child]
        
        
        if len(children) > 0: 
            
            if isinstance(group, ConcurrencyGroup):
                return ConcurrencyGroup(sorted(children)), any(fallthroughs)
        
            else: 
                return SequenceGroup(children), any(fallthroughs)
            
        else: 
            
            return None, any(fallthroughs)
    
    
    
def create_new_graph(trace):
    c = Counter()
    activity_map =  {}
    unique_trace = trace.__deepcopy__()
                
    for event in unique_trace:
        activity = event[DEFAULT_NAME_KEY]
        new_name = activity + str(c[activity])
        event[DEFAULT_NAME_KEY] = new_name
        activity_map[new_name] = activity
        c[activity] += 1
                        
    graph = cgroups_graph(unique_trace)                 
    id_name_map = { name : id for id, name in enumerate(activity_map.keys())}         
    graph.restore_names(activity_map, id_name_map)
                
    return graph
    

def recompute_log_statistics(variants, total_traces):
  
  activites = set()
    
  res_variants = []
  for i, v in enumerate(variants):
      
      activites = activites.union(v.graph.events)
      
      variant = {
          'count': len(variants[v]),
          'variant': v.serialize(),
          'bid' : i, 
          'length': len(v),
          'number_of_activities': v.number_of_activities(),
          'percentage': round(len(variants[v]) / total_traces * 100, 2),
          'sub_variants': []}
      sub_variants = get_detailed_variants(variants[v])
      total_sub_traces = sum(len(sub_variants[v]) for v in sub_variants)

      for sub_v in sub_variants:
          variant['sub_variants'].append({
              'variant': sub_v,
              'count': len(sub_variants[sub_v]),
              'percentage': round(len(sub_variants[sub_v]) / total_sub_traces * 100, 2)
          })

      # If the variant is only a single activity leaf, wrap it up as a sequence
      if 'leaf' in variant["variant"].keys() or 'parallel' in variant["variant"].keys():
          variant["variant"] = {'follows': [variant["variant"]]}

      variant['sub_variants'] = sorted(variant['sub_variants'], key=lambda x: x['count'], reverse=True)
      res_variants.append(variant)    
      
  return res_variants    
    
def remove_activities(activityName): 
    
    print('Remove Activity')
    
    new_log = {}
    
    new_variants = []
    
    
    for variant, traces in load_event_log.variants.items(): 

        if activityName in variant.graph.events: 
            
            new_variant, fallthrough = remove_activitiy_from_group(variant, activityName)
            
            # If we detect a Fallthrough, Leaf with multiple Members, we recompute the cuts
            if fallthrough: 

                log = EventLog(traces) 
                log = apply_events(log, values = [activityName], 
                                        parameters = {Parameters.ACTIVITY_KEY  : DEFAULT_NAME_KEY, Parameters.POSITIVE : False})  
            
                c_variants = get_concurrency_variants(log, False) 

                
                for new_c_variant, new_traces in c_variants.items(): 
                  
                    new_log[new_c_variant] = new_log.get(new_c_variant, []) + new_traces
                    new_variants.append(new_c_variant)
            else: 
                print('Deleting Activity, no Fallthrough')
                log = EventLog(traces) 
                print('Traces', traces)
                
                log = apply_events(log, values = [activityName], 
                                        parameters = {Parameters.ACTIVITY_KEY  : DEFAULT_NAME_KEY, Parameters.POSITIVE : False})

                print('Creating Graph')
                new_variant.graph = create_new_graph(log[0])
                new_variants.append(new_variant)
                
                print('Adding Variant to Log')
                new_log[new_variant] = new_log.get(new_variant, []) + list(log)
                
                
            
        else: 
            new_log[variant] = new_log.get(variant, []) + traces

    print('New Variant Log creation')
    new_variants_log = {new_variant : new_log[new_variant] for new_variant in new_variants}
    assign_variants_performances(new_variants_log)


    total_traces = sum([len(v) for _, v in new_log.items()])
    
    res_variants = recompute_log_statistics(new_log, total_traces)
    
    start_activities = set.union(*[set(v.graph.start_activities.keys()) for v in new_log.keys()])
    end_activities = set.union(*[set(v.graph.end_activities.keys()) for v in new_log.keys()])
    activities = set.union(*[set(v.graph.events.keys()) for v in new_log.keys()])
    
    res = {
        "startActivities": start_activities,
        "endActivities": end_activities,
        "activities": activities,
        "variants": res_variants,
        "performanceInfoAvailable": load_event_log.lifecycle_available
    }
        
    print('RES')
    