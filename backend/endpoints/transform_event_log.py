
from collections import Counter
import pickle
from cortado_core.utils.cvariants import get_concurrency_variants, get_detailed_variants
from cortado_core.performance.variant_performance import assign_variants_performances
from cortado_core.utils.split_graph import LeafGroup, SequenceGroup, ConcurrencyGroup, ParallelGroup
from cortado_core.utils.cgroups_graph import cgroups_graph
from pm4py.objects.log.obj import EventLog, Trace
from pm4py.util.xes_constants import DEFAULT_NAME_KEY
from endpoints import load_event_log
from pm4py.algo.filtering.log.attributes.attributes_filter import apply_events, Parameters

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
    
    if isinstance(group, LeafGroup): 
        lst = group[:]
        if oldActivityName in group: 
            lst.remove(oldActivityName)
            lst.append(newActivityName)
            lst.sort()
           
        return LeafGroup(lst)
        
    else: 
        children = [rename_activities_in_variant_group(child, oldActivityName, newActivityName) for child in group]
 
        if isinstance(group, ParallelGroup):
            return ParallelGroup(sorted(children))
        
        
        else: 
            return SequenceGroup(children)
    
            
    
def rename_activities(mergeList, renameList, activityName, newActivityName): 
    
    if load_event_log.activites.discard(activityName):
        load_event_log.activites.add(newActivityName)  
    
    new_variant_dict = {}
    
    
    for bid in renameList: 
        
        (variant, traces)  = load_event_log.variants[bid]

        renamed_variant = rename_activities_in_variant_group(variant, activityName, newActivityName)
        renamed_variant.graph = rename_merge_activities_in_graph(variant.graph, activityName, newActivityName) 
        
        renamed_traces = [rename_activities_in_trace(trace, activityName, newActivityName) for trace in traces]   
       
        new_variant_dict[bid] = (renamed_variant, renamed_traces)
        
        
    for ls in mergeList: 
        
        (variant, _)  = load_event_log.variants[ls[0]]
        renamed_variant = rename_activities_in_variant_group(variant, activityName, newActivityName)
        renamed_variant.graph = rename_merge_activities_in_graph(variant.graph, activityName, newActivityName) 
        
        renamed_traces = []
        
        for bid in ls: 
            
            (_, traces)  = load_event_log.variants[bid]
            
            renamed_traces += [rename_activities_in_trace(trace, activityName, newActivityName) for trace in traces]   
        
        
        new_variant_dict[min(ls)] = (renamed_variant, renamed_traces)
            
    flat_list = lambda lss : [x for ls in lss for x in ls]
    
    no_update = set(load_event_log.variants.keys()).difference(set(flat_list(mergeList) + renameList))

    print('No Update', no_update)

    for bid in no_update: 
        new_variant_dict[bid] = load_event_log.variants[bid]
        
    for bid, (variant, traces) in new_variant_dict.items(): 
        print(variant)
    
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
        
        tmp = []
        
        for child in children: 
           
          if type(child) == type(group): 
            
            for cchild in child: 
              tmp.append(cchild)
          
          else: 
            tmp.append(child)
            
        children = tmp 
              
        if len(children) > 1: 
            
            if isinstance(group, ParallelGroup):
                return ParallelGroup(sorted(children)), any(fallthroughs)
        
            else: 
                return SequenceGroup(children), any(fallthroughs)
              
        elif len(children) == 1: 
            return children[0], any(fallthroughs)
            
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
                        
    graph = cgroups_graph(unique_trace, load_event_log.cur_time_granularity)                 
    id_name_map = { name : id for id, name in enumerate(activity_map.keys())}         
    graph.restore_names(activity_map, id_name_map)
                
    return graph
    
def apply_filter_copy(trace, activityName):
    
    new_attributes = {}
    for k, v in trace.attributes.items():
        new_attributes[k] = v

    ctrace = Trace(attributes=new_attributes)
    for ev in trace._list:
        
        if ev['concept:name'] != activityName: 
            ctrace.append(ev)
            
    return ctrace


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
    
    for bid, (variant, traces) in enumerate(load_event_log.variants.items()): 

        if activityName in variant.graph.events: 
            
            new_variant, fallthrough = remove_activitiy_from_group(variant, activityName)
            # If we detect a Fallthrough, Leaf with multiple Members, we recompute the cuts
            if fallthrough: 
 
                log = EventLog([apply_filter_copy(trace, activityName) for trace in traces])
            
                c_variants = get_concurrency_variants(log, False) 
                
                for new_c_variant, new_traces in c_variants.items(): 
                  
                    new_log[new_c_variant] = new_log.get(new_c_variant, []) + new_traces
                    new_variants.append(new_c_variant)
            
            else: 
              
                log = EventLog([apply_filter_copy(trace, activityName) for trace in traces])
                
                new_variant.graph = create_new_graph(log[0])
                new_variants.append(new_variant)
                
                new_log[new_variant] = new_log.get(new_variant, []) + list(log)
                
                
            
        else: 
            new_log[variant] = new_log.get(variant, []) + traces
            
    print('New Variant Log creation')
    new_variants_log = {new_variant : new_log[new_variant] for new_variant in new_variants}
    assign_variants_performances(new_variants_log)

    print('Computing Log Statistics')
    total_traces = sum([len(v) for _, v in new_log.items()])
    
    res_variants = recompute_log_statistics(new_log, total_traces)
    
    start_activities = set.union(*[set(v.graph.start_activities.keys()) for v in new_log.keys()])
    end_activities = set.union(*[set(v.graph.end_activities.keys()) for v in new_log.keys()])
    activities = dict(sum([Counter({ k : (len(ls) * len(new_log[v])) for k, ls in v.graph.events.items()}) for v in new_log], Counter()))
    
    res = {
        "startActivities": list(start_activities),
        "endActivities": list(end_activities),
        "activities": activities,
        "variants": res_variants,
        "performanceInfoAvailable": load_event_log.lifecycle_available
    }
    
    
    load_event_log.variants = new_log
         
    return res
    