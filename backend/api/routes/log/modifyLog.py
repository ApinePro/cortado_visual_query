from fastapi import APIRouter
from pydantic import BaseModel

from endpoints.transform_event_log import cache_current_data, remove_activities, rename_activities

router = APIRouter(
    tags=["Log"],
    prefix="/modifylog"
)


class ChangeActivityName(BaseModel):
    activityName: str
    newActivityName : str

@router.post("/changeActivityName")
async def change_activity_name_in_log(d : ChangeActivityName):  
    
    cache_current_data()
    
    rename_activities(d.activityName, d.newActivityName)

    # TODO Return an Error if needed
    return True

class removeActivityName(BaseModel):
    activityName: str
    
@router.post("/deleteActivity")
async def remove_activity_name_in_log(d : removeActivityName):  
    
    
    print('Delete Request', d)
    
    cache_current_data()
    
    res = remove_activities(d.activityName)

    return res