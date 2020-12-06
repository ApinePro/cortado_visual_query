from typing import Optional, Any, List
import uvicorn
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pm4py.objects.log.importer.xes.importer import apply as xes_import
from pydantic import BaseModel
from pm4py.algo.filtering.log.variants import variants_filter
from pm4py.objects.log.log import EventLog, Trace, Event
from pm4py.objects.process_tree.process_tree import ProcessTree
from pm4py.algo.discovery.inductive.algorithm import apply_tree as inductive_miner

from backend_utilities.process_tree_to_dict import process_tree_to_dict

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


class InputLoadEventLogFromFilePath(BaseModel):
    file_path: str


@app.post("/loadEventLogFromFilePath")
def load_event_log_from_file_path(d: InputLoadEventLogFromFilePath):
    print(d)
    global event_log
    event_log = xes_import(d.file_path)
    return


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


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
