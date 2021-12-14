from endpoints.add_variants_to_process_model import add_variants_to_process_model
from cortado_core.utils.cvariants import generate_variants
from cortado_core.utils.alignment_utils import trace_fits_process_tree
from multiprocessing import freeze_support, cpu_count
from typing import Any, List
import uvicorn
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from pm4py.objects.log.importer.xes.importer import apply as xes_import
import pm4py.objects.log.importer.xes.importer as xes_importer

from pydantic import BaseModel
from pm4py.algo.filtering.log.variants import variants_filter
from pm4py.objects.log.obj import EventLog, Trace, Event
from pm4py.objects.process_tree.obj import ProcessTree
from pm4py.algo.discovery.inductive.variants.im_clean.algorithm import apply_tree as inductive_miner
from pm4py.objects.process_tree.exporter.variants.ptml import export_tree_as_string as generate_ptml_xml
from pm4py.objects.conversion.process_tree.converter import apply as convert_pt_to_petri_net
from pm4py.objects.petri_net.exporter.variants.pnml import export_petri_as_string as generate_pnml_xml
from pm4py.objects.process_tree.importer.importer import apply as import_pt_from_ptml

from backend_utilities.process_tree_conversion import process_tree_to_dict
from backend_utilities.process_tree_conversion import dict_to_process_tree
from backend_utilities.variant_trace_conversion import variant_to_trace
from endpoints.alignments import calculate_alignment as calculate_alignment_endpoint
from endpoints.load_event_log import calculate_event_log_properties

app = FastAPI()
origins = [
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:4444"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/uploadfile")
async def create_upload_file(file: UploadFile = File(...)):
    content = "".join([line.decode("UTF-8") for line in file.file])
    info = calculate_event_log_properties(xes_importer.deserialize(content))
    return info


class FilePathInput(BaseModel):
    file_path: str


@app.post("/loadEventLog")
async def load_event_log_from_file_path(d: FilePathInput):
    info = calculate_event_log_properties(xes_import(d.file_path))
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

    return discover_process_model_from_variants(all_variants)


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
    pt : dict

@app.post("/computeTreeStringFromTree")
async def computeTreeStringFromTree(d: InputTreeStringFromTree): 
    return str(dict_to_process_tree(d.pt)[0])

class InputTreeFromTreeString(BaseModel): 
    pt_string : str

@app.post("/renderStringToPT")
async def renderStringToPT(d: InputTreeFromTreeString): 
    return {"tree" : None, "errors" : ["Parse Error in Line 12"]}

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


class ConvertPtToX(BaseModel):
    pt: dict


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
    net, im, fm = convert_pt_to_petri_net(pt)
    return Response(content=generate_pnml_xml(net, im, fm), media_type="application/xml")


class InputCalculateAlignment(BaseModel):
    pt: dict
    variant: dict


@app.post("/calculateAlignment")
async def calculate_alignment(d: InputCalculateAlignment):
    variant = d.variant['events']
    return calculate_alignment_endpoint(variant, d.pt)


class InputCalculateAlignmentCVariant(BaseModel):
    pt: dict
    variant: dict


@app.post("/calculateAlignmentsCVariant")
async def calculate_alignment(d: InputCalculateAlignmentCVariant):
    all_variants = generate_variants(d.variant)
    for variant in all_variants:
        alignment = calculate_alignment_endpoint(variant, d.pt)
        if alignment['deviation']:
            return {'cost': alignment['cost'],
                    'deviation': alignment['deviation']}

    return {'cost': 0,
            'deviation': False}


# Using FastAPI instance
@app.get("/url-list")
def get_all_urls():
    url_list = [{"path": route.path, "name": route.name} for route in app.routes]
    return url_list


if __name__ == "__main__":
    freeze_support()
    num_workers = max(1, cpu_count() - 2)
    uvicorn.run("main:app", host="0.0.0.0", port=8000, workers=num_workers, reload=True)

    # dev mode
    # uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
