from abc import ABC, abstractmethod
from typing import List
from schemas.document import DocumentInput
from schemas.summarization import SummaryOutput, FIRInput
from schemas.extraction import ExtractionOutput
from schemas.timeline import TimelineOutput
from schemas.contradiction import ContradictionOutput
from schemas.scoring import ScoringOutput

class ISummarizationService(ABC):
    @abstractmethod
    async def summarize(self, document: FIRInput) -> SummaryOutput:
        pass

class IExtractionService(ABC):
    @abstractmethod
    async def extract_entities(self, document: DocumentInput) -> ExtractionOutput:
        pass

class ITimelineService(ABC):
    @abstractmethod
    async def generate_timeline(self, document: DocumentInput) -> TimelineOutput:
        pass

class IContradictionService(ABC):
    @abstractmethod
    async def detect_contradictions(self, documents: List[DocumentInput]) -> ContradictionOutput:
        pass

class IScoringService(ABC):
    @abstractmethod
    async def score_evidence(self, document: DocumentInput) -> ScoringOutput:
        pass

from schemas.processor import ProcessorInput, ProcessorOutput

class IProcessorService(ABC):
    @abstractmethod
    async def process_all(self, input_data: ProcessorInput) -> ProcessorOutput:
        pass
