from typing import Optional, Any, List
import uvicorn

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from pm4py.objects.log.importer.xes.importer import apply as xes_import
from pydantic import BaseModel
from pm4py.algo.filtering.log.variants import variants_filter
from pm4py.objects.log.log import EventLog, Trace, Event
from pm4py.objects.process_tree.process_tree import ProcessTree
from pm4py.algo.discovery.inductive.algorithm import apply_tree as inductive_miner
import pm4py.visualization.process_tree.visualizer as pt_vis
from pm4py.objects.process_tree.exporter.variants.ptml import export_tree_as_string as generate_ptml_xml
from pm4py.objects.conversion.process_tree.converter import apply as convert_pt_to_petri_net
from pm4py.objects.petri.exporter.variants.pnml import export_petri_as_string as generate_pnml_xml
from pm4py.objects.process_tree.importer.importer import apply as import_pt_from_ptml

from backend_utilities.process_tree_conversion import process_tree_to_dict
from backend_utilities.process_tree_conversion import dict_to_process_tree


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

event_log = None


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Optional[str] = None):
    print("test")
    return {"item_id": item_id, "q": q}


@app.post("/uploadfile")
async def create_upload_file(file: UploadFile = File(...)):
    print("test")
    return {"filename": file.filename}


class filePathInput(BaseModel):
    file_path: str


@app.post("/loadEventLogFromFilePath")
def load_event_log_from_file_path(d: filePathInput):
    print(d)
    global event_log
    event_log = xes_import(d.file_path)
    return


@app.post("/loadProcessTreeFromPtmlFile")
def load_process_tree_from_file_path(d: filePathInput):
    print(d)
    pt = import_pt_from_ptml(d.file_path)
    res = process_tree_to_dict(pt)
    return res


class InputDiscoverProcessModelFromVariants(BaseModel):
    variants: List[Any]


@app.post("/discoverProcessModelFromVariants")
def load_process_tree(d: InputDiscoverProcessModelFromVariants):
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
    print(pt)
    res = process_tree_to_dict(pt)
    return res


@app.get("/variants")
def get_variants_from_event_log():
    variants = variants_filter.get_variants(event_log)
    total_traces = len(event_log)
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
def download_test(d: ConvertPtToX):
    pt: ProcessTree = dict_to_process_tree(d.pt)
    return Response(content=generate_ptml_xml(pt), media_type="application/xml")


@app.post("/convertPtToPNML")
def download_test(d: ConvertPtToX):
    pt: ProcessTree = dict_to_process_tree(d.pt)
    net, im, fm = convert_pt_to_petri_net(pt)
    return Response(content=generate_pnml_xml(net, im, fm), media_type="application/xml")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
