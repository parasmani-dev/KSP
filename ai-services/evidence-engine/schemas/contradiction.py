from pydantic import BaseModel, RootModel
from typing import List

class ContradictionItem(BaseModel):
    type: str
    field: str
    statement_1: str
    statement_2: str

class ContradictionOutput(RootModel[List[ContradictionItem]]):
    pass

