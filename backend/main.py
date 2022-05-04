import asyncio
import json
import pickle
from multiprocessing import Pool, cpu_count, freeze_support
from typing import Any, List, Optional
from endpoints.transform_event_log import cache_current_data, rename_activities

import pm4py.objects.log.importer.xes.importer as xes_importer
import pm4pycvxopt
import uvicorn
from cortado_core.freezing.reinsert_frozen_subtrees import post_process_tree
from cortado_core.performance import tree_performance
from cortado_core.performance import utils as performance_utils
from cortado_core.performance.aggregators import avg, noop, stats
from cortado_core.utils.alignment_utils import trace_fits_process_tree
from cortado_core.utils.cvariants import generate_variants
from cortado_core.utils.process_tree import CortadoProcessTree, convert_tree
from fastapi import (Depends, FastAPI, File, HTTPException, UploadFile,
                     WebSocket, WebSocketDisconnect)
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.requests import Request
from fastapi.responses import Response
from pm4py.algo.conformance.alignments.petri_net import \
    algorithm as net_alignment
from pm4py.algo.discovery.inductive.variants.im_clean.algorithm import \
    apply_tree as inductive_miner
from pm4py.algo.filtering.log.variants import variants_filter
from pm4py.objects.bpmn.exporter.variants.etree import \
    get_xml_string as generate_bpmn_xml
from pm4py.objects.conversion.process_tree.converter import \
    Variants as ptConverterVariant
from pm4py.objects.conversion.process_tree.converter import apply as convert_pt
from pm4py.objects.log.importer.xes.importer import apply as xes_import
from pm4py.objects.log.obj import Event, EventLog, Trace
from pm4py.objects.petri_net.exporter.variants.pnml import \
    export_petri_as_string as generate_pnml_xml
from pm4py.objects.process_tree.exporter.variants.ptml import \
    export_tree_as_string as generate_ptml_xml
from pm4py.objects.process_tree.importer.importer import \
    apply as import_pt_from_ptml
from pm4py.objects.process_tree.obj import ProcessTree
from pm4py.objects.process_tree.utils import generic as tree_util
from pm4py.objects.process_tree.utils.generic import parse
from pydantic import BaseModel, Field

from backend_utilities.configuration.repository import \
    Configuration as DomainConfiguration
from backend_utilities.configuration.repository import (
    ConfigurationRepository, ConfigurationRepositoryFactory)
from backend_utilities.process_tree_conversion import (dict_to_process_tree,
                                                       process_tree_to_dict)
from backend_utilities.timeout.helper_functions import (TimeoutException,
                                                        execute_with_timeout)
from backend_utilities.variant_trace_conversion import variant_to_trace
from endpoints import load_event_log
from endpoints.add_variants_to_process_model import \
    add_variants_to_process_model
from endpoints.alignments import \
    calculate_alignment as calculate_alignment_endpoint
from endpoints.load_event_log import calculate_event_log_properties
from endpoints.query_variant import evaluate_query_against_variant_graphs
from error_handlers import (exception_handler, http_exception_handler,
                            validation_exception_handler)

app = FastAPI()
origins = [
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:4444"
]


# see https://github.com/tiangolo/fastapi/issues/775
# Without this middleware, fastapi does not return the CORS headers if there is an uncaught exception.
# Without the CORS headers, the browser does not forward the correct HTTP status code to the angular application.
async def catch_exceptions_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except:
        return Response("Internal server error", status_code=500)


app.middleware('http')(catch_exceptions_middleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_config_repo():
    return ConfigurationRepositoryFactory.get_config_repository()


app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(Exception, exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)


@app.on_event("startup")
async def startup_event():
    global pcache
    pcache = {} #pickle.load(open( "pcache.p", "rb" ))
    load_event_log.variants_store = pickle.load(open( "variants_store.p", "rb" ))
    load_event_log.variants = pickle.load(open( "variants.p", "rb" ))
    load_event_log.activites = pickle.load(open( "activities.p", "rb" ))
    load_event_log.lifecycle_available = True

@app.post("/uploadfile")
async def create_upload_file(file: UploadFile = File(...),
                             config_repo: ConfigurationRepository = Depends(get_config_repo)):
    global pcache
    pcache = {}

    content = "".join([line.decode("UTF-8") for line in file.file])
    event_log = xes_importer.deserialize(content)
    use_mp = len(event_log) > config_repo.get_configuration().min_traces_variant_detection_mp
    info = calculate_event_log_properties(event_log, use_mp)
    return info

class FilePathInput(BaseModel):
    file_path: str

@app.post("/loadEventLog")
async def load_event_log_from_file_path(d: FilePathInput,
                                        config_repo: ConfigurationRepository = Depends(get_config_repo)):
    global event_log
    global pcache
    pcache = {}

    event_log = xes_import(d.file_path)
    use_mp = len(event_log) > config_repo.get_configuration().min_traces_variant_detection_mp
    info = calculate_event_log_properties(event_log, use_mp)
    return info


@app.post("/loadProcessTreeFromPtmlFile")
async def load_process_tree_from_file_path(d: FilePathInput):
    pt = import_pt_from_ptml(d.file_path)
    res = process_tree_to_dict(pt)
    return res


class InputDiscoverProcessModelFromVariants(BaseModel):
    variants: List[Any]


@app.post("/discoverProcessModelFromVariants")
async def discover_process_model(d: InputDiscoverProcessModelFromVariants):
    variants = [v['value']['events'] for v in d.variants]
    return discover_process_model_from_variants(variants)


def discover_process_model_from_variants(variants):
    log = EventLog()
    for v in variants:
        t = Trace()
        for e in v:
            assert type(e) == str
            event = Event()
            event["concept:name"] = e
            t.append(event)
        log.append(t)
    pt: ProcessTree = inductive_miner(log)
    res = process_tree_to_dict(pt)
    return res


@app.post("/discoverProcessModelFromConcurrencyVariants")
async def discover_process_model_from_cvariants(d: InputDiscoverProcessModelFromVariants):
    all_variants = set([tuple(variant) for cvariant in d.variants for variant in generate_variants(cvariant)])
    print(f"nVariants: {len(all_variants)}")
    res = discover_process_model_from_variants(all_variants)
    return res


class InputAddVariantsToProcessModel(BaseModel):
    fitting_variants: List[Any]
    variants_to_add: List[Any]
    pt: dict


# TODO this endpoint is currently unused, we have to decide if we want to delete it
@app.post("/addVariantsToProcessModel")
async def add_simple_variants_to_process_model(d: InputAddVariantsToProcessModel):
    fitting_variants = [v['events'] for v in d.fitting_variants]
    to_add = [v['events'] for v in d.variants_to_add]
    return add_variants_to_process_model(d.pt, fitting_variants, to_add)


@app.post("/addConcurrencyVariantsToProcessModel")
async def add_cvariants_to_process_model(d: InputAddVariantsToProcessModel):
    fitting_variants = set(
        [tuple(variant) for cvariant in d.fitting_variants for variant in generate_variants(cvariant)])
    to_add = set([tuple(variant) for cvariant in d.variants_to_add for variant in generate_variants(cvariant)])
    return add_variants_to_process_model(d.pt, fitting_variants, to_add)


class InputAddVariantsToProcessModelUnknownConformance(BaseModel):
    selected_variants: List[Any]
    pt: dict


@app.post("/addConcurrencyVariantsToProcessModelUnknownConformance")
async def add_cvariants_to_process_model_unknown_conformance(d: InputAddVariantsToProcessModelUnknownConformance):
    selected_variants = set(
        [tuple(variant) for cvariant in d.selected_variants for variant in generate_variants(cvariant)])

    fitting_variants = set()
    variants_to_add = set()
    process_tree, _ = dict_to_process_tree(d.pt)
    for selected_variant in selected_variants:
        t = variant_to_trace(selected_variant)
        if trace_fits_process_tree(t, process_tree):
            fitting_variants.add(selected_variant)
        else:
            variants_to_add.add(selected_variant)

    return add_variants_to_process_model(d.pt, fitting_variants, variants_to_add)


class InputTreeStringFromTree(BaseModel):
    pt: dict


@app.post("/computeTreeStringFromTree")
async def computeTreeStringFromTree(d: InputTreeStringFromTree):
    res = str(dict_to_process_tree(d.pt)[0])
    return res


class InputTreeFromTreeString(BaseModel):
    pt_string: str


@app.post("/parseStringToPT")
async def parseStringToPT(d: InputTreeFromTreeString):
    res = dict()
    try:
        d.pt_string = d.pt_string.replace('*tau*', 'τ')
        pt = parse(d.pt_string)
        res["tree"] = process_tree_to_dict(pt)
        res["errors"] = None
    except:
        res["tree"] = None
        res["errors"] = "Error occurred during backend parsing"

    return res


@app.get("/variants")
async def get_variants_from_event_log():
    log = await meta.get_event_log()
    variants = variants_filter.get_variants(log)
    total_traces = len(log)
    res = {"variants": [], "activities": set()}
    for v in variants:
        res["variants"].append({
            'count': len(variants[v]),
            'events': v.split(','),
            'percentage': round(len(variants[v]) / total_traces * 100, 2)
        })
        for a in v.split(','):
            res["activities"].add(a)

    res['variants'] = sorted(res['variants'], key=lambda variant: variant['count'], reverse=True)
    return res

class ChangeActivityName(BaseModel):
    activityName: str
    newActivityName : str

@app.post("/changeActivityName")
async def change_activity_name_in_log(d : ChangeActivityName):  
    
    print(d)
    print(d.activityName)
    print(d.newActivityName)
    
    
    cache_current_data()
    
    rename_activities(d.activityName, d.newActivityName)

    # Return an Error if any thing did change
    return True

class ConvertPtToX(BaseModel):
    pt: dict

@app.post("/convertPtToBPMN")
async def download_ptml(d: ConvertPtToX):
    pt: ProcessTree
    frozen_subtree: List[ProcessTree]

    pt, frozen_subtrees = dict_to_process_tree(d.pt)
    bpmn = convert_pt(pt, variant=ptConverterVariant.TO_BPMN)

    return Response(content=generate_bpmn_xml(bpmn), media_type="application/xml")


@app.post("/convertPtToPTML")
async def download_ptml(d: ConvertPtToX):
    pt: ProcessTree
    frozen_subtree: List[ProcessTree]
    pt, frozen_subtrees = dict_to_process_tree(d.pt)

    return Response(content=generate_ptml_xml(pt), media_type="application/xml")


@app.post("/convertPtToPNML")
async def download_pnml(d: ConvertPtToX):
    pt: ProcessTree
    frozen_subtree: List[ProcessTree]
    pt, frozen_subtrees = dict_to_process_tree(d.pt)
    net, im, fm = convert_pt(pt)
    return Response(content=generate_pnml_xml(net, im, fm), media_type="application/xml")


@app.post("/applyReductionRulesToTree")
async def applyTreeReductionRules(d: ConvertPtToX):
    pt, frozen_subtrees = dict_to_process_tree(d.pt)
    return process_tree_to_dict(post_process_tree(pt, frozen_subtrees), frozen_subtrees)


class InputCalculatePerformance(BaseModel):
    pt: dict
    variants: List[int]
    delete: Optional[List[int]]


pcache = {}


def tau_0_values(tree_nodes, perf_stats):
    for t in [t for t in tree_nodes if tree_util.is_tau_leaf(t)]:
        perf_stats[str(t)] = {
            "service_time": stats([0]),
            "cycle_time": stats([0]),
            "waiting_time": stats([0]),
            "idle_time": stats([0]),
        }


def get_merged_performances(pt: CortadoProcessTree):
    tree_nodes = performance_utils.get_all_nodes(pt)
    tree_cache_key = str(pt)

    all_service_times = [pcache[tree_cache_key][k]["service_times"] for k in pcache[tree_cache_key]]
    all_waiting_times = [pcache[tree_cache_key][k]["waiting_times"] for k in pcache[tree_cache_key]]
    all_cycle_times = [pcache[tree_cache_key][k]["cycle_times"] for k in pcache[tree_cache_key]]
    all_idle_times = [pcache[tree_cache_key][k]["idle_times"] for k in pcache[tree_cache_key]]

    merged_service_times = merge_performance(all_service_times)
    merged_waiting_times = merge_performance(all_waiting_times)
    merged_cycle_times = merge_performance(all_cycle_times)
    merged_idle_times = merge_performance(all_idle_times)

    merged_performances = {str(t): {
        "service_time": stats(merged_service_times[t]) if t in merged_service_times else None,
        "cycle_time": stats(merged_cycle_times[t]) if t in merged_cycle_times else None,
        "waiting_time": stats(merged_waiting_times[t]) if t in merged_waiting_times else None,
        "idle_time": stats(merged_idle_times[t]) if t in merged_idle_times else None,
    } for t in tree_nodes}
    tau_0_values(tree_nodes, merged_performances)
    pt_dict = process_tree_to_dict(pt, performance=merged_performances)
    return pt_dict


@app.post("/calculateVariantsPerformance")
async def calculate_variant_performance(d: InputCalculatePerformance):
    global pcache
    
    pt, _ = dict_to_process_tree(d.pt)
    pt = convert_tree(pt)
    tree_nodes = performance_utils.get_all_nodes(pt)
    variants_tree_performance = []

    tree_cache_key = str(pt)
    variants_fitness = []
    
    for bid, variant in enumerate(load_event_log.variants.keys()): 
      
      if d.delete and bid in d.delete:

        if tree_cache_key in pcache and bid in pcache[tree_cache_key]:
          del pcache[tree_cache_key][bid]
    
      elif bid in d.variants:
        
        print('Computing Performance', bid, variant)
        
        if tree_cache_key in pcache and bid in pcache[tree_cache_key]:
              
            p_values = pcache[tree_cache_key][bid]
            service_times_aggregated = p_values["service_times"]
            idle_times_aggregated = p_values["idle_times"]
            waiting_times_aggregated = p_values["waiting_times"]
            cycle_times_aggregated = p_values["cycle_times"]
            mean_fitness = p_values["mean_fitness"]
            
        else:

            test_log = load_event_log.variants[variant]
            test_log = EventLog(test_log)
            
            (service_times, idle_times, waiting_times, cycle_times), mean_fitness \
                = tree_performance.get_tree_performance_intervals(pt, test_log,
                                                                  alignment_variant=net_alignment.Variants.VERSION_STATE_EQUATION_A_STAR)

            service_times_aggregated = tree_performance.apply_aggregation(service_times, noop, avg, avg)
            idle_times_aggregated = tree_performance.apply_aggregation(idle_times, noop, avg, avg)
            waiting_times_aggregated = tree_performance.apply_aggregation(waiting_times, noop, avg, avg)
            cycle_times_aggregated = tree_performance.apply_aggregation(cycle_times, noop, avg, avg)

        perf_stats = {str(t): {
                "service_time": stats(service_times_aggregated[t]) if t in service_times_aggregated else None,
                "cycle_time": stats(cycle_times_aggregated[t]) if t in cycle_times_aggregated else None,
                "waiting_time": stats(waiting_times_aggregated[t]) if t in waiting_times_aggregated else None,
                "idle_time": stats(idle_times_aggregated[t]) if t in idle_times_aggregated else None,
        } for t in tree_nodes}

        tau_0_values(tree_nodes, perf_stats)

        pt_dict_variant = process_tree_to_dict(pt, performance=perf_stats)
        variants_tree_performance.append(pt_dict_variant)
        variants_fitness.append(mean_fitness)

        if tree_cache_key not in pcache:
                
            pcache[tree_cache_key] = {}
                
        pcache[tree_cache_key][bid] = {"service_times": service_times_aggregated,
                                       "idle_times": idle_times_aggregated,
                                       "cycle_times": cycle_times_aggregated,
                                       "waiting_times": waiting_times_aggregated,
                                       "mean_fitness": mean_fitness}

      else: 
        continue

    # pickle.dump( pcache, open( "pcache.p", "wb" ))
    # pickle.dump(load_event_log.variants_store,  open( "variants_store.p", "wb" ))

    pt_dict = get_merged_performances(pt)
    
    return {'merged_performance_tree': pt_dict, 'variants_tree_performance': variants_tree_performance,
            'fitness_values': variants_fitness}


def calculate_alignment_intern_with_timeout(pt: dict, c_variant: dict, timeout: int):
    try:
        return execute_with_timeout(calculate_alignment_intern, timeout, args=(pt, c_variant))
    except TimeoutException:
        return {'isTimeout': True}


def calculate_alignment_intern(pt: dict, c_variant: dict):
    all_variants = generate_variants(c_variant)
    for variant in all_variants:
        alignment = calculate_alignment_endpoint(variant, pt)
        if alignment['deviation']:
            return {'cost': alignment['cost'],
                    'deviation': alignment['deviation']}

    return {'cost': 0, 'deviation': False}


def get_alignment_callback(idx: str, websocket: WebSocket):
    def callback(result):
        data = {
            'id': idx,
            'isTimeout': False,
            'cost': 0,
            'deviation': False,
        }

        for key, value in result.items():
            data[key] = value

        asyncio.run(websocket.send_json(data))

    return callback


@app.websocket("/conformancews")
async def websocket_endpoint(websocket: WebSocket):
    config_repository = ConfigurationRepositoryFactory.get_config_repository()
    configuration = config_repository.get_configuration()

    try:
        with Pool() as pool:
            await websocket.accept()
            while True:
                data = await websocket.receive_json()

                if 'isCancellationRequested' in data:
                    pool.terminate()
                    await websocket.close(1000)
                    return

                timeout = configuration.timeout_cvariant_alignment_computation
                if data['timeout'] != 0:
                    timeout = data['timeout']
                pool.apply_async(calculate_alignment_intern_with_timeout,
                                 (data['pt'], data['variant'], timeout,),
                                 callback=get_alignment_callback(data['id'], websocket))
    except WebSocketDisconnect:
        print('websocket disconnected')


class Configuration(BaseModel):
    timeout_cvariant_alignment_computation: int = Field(alias='timeoutCVariantAlignmentComputation')
    min_traces_variant_detection_mp: int = Field(alias="minTracesVariantDetectionMultiprocessing")

    class Config:
        allow_population_by_field_name = True


@app.post("/saveConfiguration")
async def save_configuration(config_dto: Configuration,
                             config_repository: ConfigurationRepository = Depends(get_config_repo)):
    config = DomainConfiguration(
        timeout_cvariant_alignment_computation=config_dto.timeout_cvariant_alignment_computation,
        min_traces_variant_detection_mp=config_dto.min_traces_variant_detection_mp)
    config_repository.save_configuration(config)


@app.get("/getConfiguration")
async def get_configuration(config_repo: ConfigurationRepository = Depends(get_config_repo)):
    config = config_repo.get_configuration()
    config_dto = Configuration(timeout_cvariant_alignment_computation=config.timeout_cvariant_alignment_computation,
                               min_traces_variant_detection_mp=config.min_traces_variant_detection_mp)
    return config_dto


@app.get("/info")
async def get_info():
    return {}


# Using FastAPI instance
@app.get("/url-list")
def get_all_urls():
    url_list = [{"path": route.path, "name": route.name} for route in app.routes]
    return url_list


class variantQuery(BaseModel):
    queryString: str

@app.post("/variant-query")
def variant_query(query : variantQuery): 
    
    res = evaluate_query_against_variant_graphs(query, load_event_log.variants, load_event_log.activites) 
    
    return res

if __name__ == "__main__":
    # print(DEFAULT_LP_SOLVER_VARIANT)
    freeze_support()
    num_workers = max(1, cpu_count() - 2)
    uvicorn.run("main:app", host="0.0.0.0", port=41211, workers=num_workers, reload=True)
    # dev mode
    # uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)


def merge_performance(all_performances):
    merged = {}
    for performance in all_performances:
        for tree in performance:
            p = merged.get(tree, [])
            if performance[tree]:
                p.extend(performance[tree])
            merged[tree] = p
    return merged
