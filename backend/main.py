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
from pm4py.objects.log.log import EventLog, Trace, Event
from pm4py.objects.process_tree.process_tree import ProcessTree
from pm4py.algo.discovery.inductive.variants.im_clean.algorithm import apply_tree as inductive_miner
from pm4py.objects.process_tree.exporter.variants.ptml import export_tree_as_string as generate_ptml_xml
from pm4py.objects.conversion.process_tree.converter import apply as convert_pt_to_petri_net
from pm4py.objects.petri.exporter.variants.pnml import export_petri_as_string as generate_pnml_xml
from pm4py.objects.process_tree.importer.importer import apply as import_pt_from_ptml

from backend_utilities.process_tree_conversion import process_tree_to_dict
from backend_utilities.process_tree_conversion import dict_to_process_tree
from endpoints.alignments import calculate_alignment as calculate_alignment_endpoint
from endpoints.load_event_log import calculate_event_log_properties
from interactive_process_mining_core.lca_approach import add_trace_to_pt_language

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
    event_log = xes_importer.deserialize(content)
    t1 = time()
    info = calculate_event_log_properties(event_log)
    print(time() - t1)
    return info


class FilePathInput(BaseModel):
    file_path: str

from time import time
@app.post("/loadEventLog")
async def load_event_log_from_file_path(d: FilePathInput):
    event_log = xes_import(d.file_path)
    info = calculate_event_log_properties(event_log)
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
    log = EventLog()
    for v in d.variants:
        t = Trace()
        for e in v["value"]["events"]:
            assert type(e) == str
            event = Event()
            event["concept:name"] = e
            t.append(event)
        log.append(t)
    pt: ProcessTree = inductive_miner(log)
    res = process_tree_to_dict(pt)
    return res


class InputAddVariantsToProcessModel(BaseModel):
    variants_to_add: List[Any]
    pt: dict
    explicitly_added_variants: List[Any]


@app.post("/addVariantsToProcessModel")
async def add_variants_to_process_model(d: InputAddVariantsToProcessModel):
    pt: ProcessTree = dict_to_process_tree(d.pt)
    explicitly_added_variants: EventLog = EventLog()
    for v in d.explicitly_added_variants:
        t = Trace()
        for e in v["events"]:
            assert type(e) == str
            event = Event()
            event["concept:name"] = e
            t.append(event)
        explicitly_added_variants.append(t)

    traces_to_be_added: List[Trace] = []
    for v in d.variants_to_add:
        t = Trace()
        for e in v["events"]:
            assert type(e) == str
            event = Event()
            event["concept:name"] = e
            t.append(event)
        traces_to_be_added.append(t)

    for t in traces_to_be_added:
        pt = add_trace_to_pt_language(pt, explicitly_added_variants, t, try_pulling_lca_down=True)
        explicitly_added_variants.append(t)
    res = process_tree_to_dict(pt)
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


class ConvertPtToX(BaseModel):
    pt: dict


@app.post("/convertPtToPTML")
async def download_ptml(d: ConvertPtToX):
    pt: ProcessTree = dict_to_process_tree(d.pt)
    return Response(content=generate_ptml_xml(pt), media_type="application/xml")


@app.post("/convertPtToPNML")
async def download_pnml(d: ConvertPtToX):
    pt: ProcessTree = dict_to_process_tree(d.pt)
    net, im, fm = convert_pt_to_petri_net(pt)
    return Response(content=generate_pnml_xml(net, im, fm), media_type="application/xml")


class InputCalculateAlignment(BaseModel):
    pt: dict
    variant: dict


@app.post("/calculateAlignment")
async def calculate_alignment(d: InputCalculateAlignment):
    return calculate_alignment_endpoint(d.variant, d.pt)


if __name__ == "__main__":
    freeze_support()
    num_workers = max(1, cpu_count() - 2)
    uvicorn.run("main:app", host="0.0.0.0", port=8000, workers=num_workers, reload=True)

    # dev mode
    # uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
