from pm4py.objects.process_tree import obj as pt
from pm4py.objects.process_tree import obj as pt_op
from pm4py.objects.process_tree import state as pt_st
from pm4py.objects.process_tree.obj import ProcessTree
from pm4py.util import constants

def parse(string_rep):
    """
    Parse a string provided by the user to a process tree
    (initialization method)

    Parameters
    ------------
    string_rep
        String representation of the process tree

    Returns
    ------------
    node
        Process tree object
    """
    depth_cache = dict()
    depth = 0
    print(string_rep)
    return parse_recursive(string_rep, depth_cache, depth)

def parse_recursive(string_rep, depth_cache, depth):
    """
    Parse a string provided by the user to a process tree
    (recursive method)

    Parameters
    ------------
    string_rep
        String representation of the process tree
    depth_cache
        Depth cache of the algorithm
    depth
        Current step depth

    Returns
    -----------
    node
        Process tree object
    """
    string_rep = string_rep.strip()
    node = None
    operator = None
    if string_rep.startswith(pt_op.Operator.LOOP.value):
        operator = pt_op.Operator.LOOP
        string_rep = string_rep[len(pt_op.Operator.LOOP.value):]
    elif string_rep.startswith(pt_op.Operator.PARALLEL.value):
        operator = pt_op.Operator.PARALLEL
        string_rep = string_rep[len(pt_op.Operator.PARALLEL.value):]
    elif string_rep.startswith(pt_op.Operator.XOR.value):
        operator = pt_op.Operator.XOR
        string_rep = string_rep[len(pt_op.Operator.XOR.value):]
    elif string_rep.startswith(pt_op.Operator.OR.value):
        operator = pt_op.Operator.OR
        string_rep = string_rep[len(pt_op.Operator.OR.value):]
    elif string_rep.startswith(pt_op.Operator.SEQUENCE.value):
        operator = pt_op.Operator.SEQUENCE
        string_rep = string_rep[len(pt_op.Operator.SEQUENCE.value):]
    if operator is not None:
        parent = None if depth == 0 else depth_cache[depth - 1]
        node = pt.ProcessTree(operator=operator, parent=parent)
        depth_cache[depth] = node
        if parent is not None:
            parent.children.append(node)
        depth += 1
        string_rep = string_rep.strip()
        assert (string_rep[0] == '(')
        parse_recursive(string_rep[1:], depth_cache, depth)
    else:
        label = None
        if string_rep.startswith('\''):
            string_rep = string_rep[1:]
            escape_ext = string_rep.find('\'')
            label = string_rep[0:escape_ext]
            string_rep = string_rep[escape_ext + 1:]
        else:
            assert (string_rep.startswith('tau') or string_rep.startswith('τ') or string_rep.startswith(u'\u03c4'))
            if string_rep.startswith('tau'):
                string_rep = string_rep[len('tau'):]
            elif string_rep.startswith('τ'):
                string_rep = string_rep[len('τ'):]
            elif string_rep.startswith(u'\u03c4'):
                string_rep = string_rep[len(u'\u03c4'):]
        parent = None if depth == 0 else depth_cache[depth - 1]
        node = pt.ProcessTree(operator=operator, parent=parent, label=label)
        if parent is not None:
            parent.children.append(node)

        while string_rep.strip().startswith(')'):
            depth -= 1
            string_rep = (string_rep.strip())[1:]
        if len(string_rep.strip()) > 0:
            parse_recursive((string_rep.strip())[1:], depth_cache, depth)
    return node
