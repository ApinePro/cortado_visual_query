from typing import List, Mapping, Tuple, Dict, Any
from pm4py.objects.log.obj import EventLog, Trace
from cortado_core.utils.split_graph import ConcurrencyGroup

# raw event log
from api.routes.variants.models import VariantInformation

# raw event log
event_log: EventLog = EventLog()
# performance statistics
pcache: Mapping = {}

parameters: Dict[Any, Any] = {}

variants: Mapping[int, Tuple[ConcurrencyGroup, Trace, List, VariantInformation]] = {}
