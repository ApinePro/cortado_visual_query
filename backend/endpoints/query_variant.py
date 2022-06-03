
from cortado_core.variant_query_language.parse_query import parse_query_to_query_tree
from cortado_core.variant_query_language.error_handling import ParseError, LexerError
from cortado_core.variant_query_language.check_query_tree_against_graph import check_query_tree


def evaluate_query_against_variant_graphs(query, variants, activities): 
    ids = []
    
    try: 
        
        qt = parse_query_to_query_tree(query.queryString)
        
        for i, variant in enumerate(variants): 
            
            b = check_query_tree(qt, variant, activities, True)
            
            if b: 
                ids.append(i)
                    
        
    except ParseError as PE: 
       res = {'error' : PE.msg, 'error_index' : PE.column}
       return res
        
    except LexerError as LE: 
        res = {'error' : LE.msg, 'error_index' : LE.column}
        return res
    
    #print(load_event_log.variants)
    
    return {'ids' : ids}