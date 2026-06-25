import logging
import asyncio
from typing import List
from services.interfaces import (
    ISummarizationService, IExtractionService, ITimelineService, 
    IContradictionService, IScoringService
)
from schemas.document import DocumentInput
from schemas.summarization import SummaryOutput, FIRInput
from schemas.extraction import ExtractionOutput
from schemas.timeline import TimelineOutput
from schemas.contradiction import ContradictionOutput
from schemas.scoring import ScoringOutput

logger = logging.getLogger(__name__)

MAX_RETRIES = 3
RETRY_DELAY = 2  # seconds

async def _call_gemini_with_retry(client, contents, response_schema, retries=MAX_RETRIES):
    """Call Gemini API with automatic retry on 503/transient errors."""
    for attempt in range(1, retries + 1):
        try:
            response = await client.aio.models.generate_content(
                model='gemini-2.5-flash',
                contents=contents,
                config={
                    'response_mime_type': 'application/json',
                    'response_schema': response_schema,
                    'temperature': 0.0
                }
            )
            return response
        except Exception as e:
            error_str = str(e)
            if ('503' in error_str or 'UNAVAILABLE' in error_str or '429' in error_str) and attempt < retries:
                wait = RETRY_DELAY * attempt
                logger.warning(f"Gemini API transient error (attempt {attempt}/{retries}), retrying in {wait}s: {e}")
                await asyncio.sleep(wait)
            else:
                raise

class SummarizationService(ISummarizationService):
    def __init__(self, gemini_client):
        self.client = gemini_client

    async def summarize(self, document: FIRInput) -> SummaryOutput:
        from core.prompts import FIR_SUMMARIZATION_PROMPT
        try:
            response = await _call_gemini_with_retry(
                self.client,
                f"{FIR_SUMMARIZATION_PROMPT}\n\nHere is the FIR text:\n\n{document.fir_text}",
                SummaryOutput
            )
            return SummaryOutput.model_validate_json(response.text)
        except Exception as e:
            logger.error(f"Error during summarization: {e}")
            raise Exception(f"Failed to summarize FIR: {str(e)}")

class ExtractionService(IExtractionService):
    def __init__(self, gemini_client):
        self.client = gemini_client

    async def extract_entities(self, document: DocumentInput) -> ExtractionOutput:
        from core.prompts import ENTITY_EXTRACTION_PROMPT
        try:
            response = await _call_gemini_with_retry(
                self.client,
                f"{ENTITY_EXTRACTION_PROMPT}\n\nDocument ID: {document.document_id}\n\nText:\n{document.text_content}",
                ExtractionOutput
            )
            return ExtractionOutput.model_validate_json(response.text)
        except Exception as e:
            logger.error(f"Error during entity extraction: {e}")
            raise Exception(f"Failed to extract entities: {str(e)}")

class TimelineService(ITimelineService):
    def __init__(self, gemini_client):
        self.client = gemini_client

    async def generate_timeline(self, document: DocumentInput) -> TimelineOutput:
        from core.prompts import TIMELINE_GENERATION_PROMPT
        try:
            response = await _call_gemini_with_retry(
                self.client,
                f"{TIMELINE_GENERATION_PROMPT}\n\nDocument ID: {document.document_id}\n\nText:\n{document.text_content}",
                TimelineOutput
            )
            return TimelineOutput.model_validate_json(response.text)
        except Exception as e:
            logger.error(f"Error during timeline generation: {e}")
            raise Exception(f"Failed to generate timeline: {str(e)}")

class ContradictionService(IContradictionService):
    def __init__(self, gemini_client):
        self.client = gemini_client

    async def detect_contradictions(self, documents: List[DocumentInput]) -> ContradictionOutput:
        from core.prompts import CONTRADICTION_DETECTION_PROMPT
        try:
            docs_text = "\n\n---\n\n".join(
                [f"Document ID: {d.document_id}\nText: {d.text_content}" for d in documents]
            )
            response = await _call_gemini_with_retry(
                self.client,
                f"{CONTRADICTION_DETECTION_PROMPT}\n\nHere are the documents to analyze:\n\n{docs_text}",
                ContradictionOutput
            )
            return ContradictionOutput.model_validate_json(response.text)
        except Exception as e:
            logger.error(f"Error during contradiction detection: {e}")
            raise Exception(f"Failed to detect contradictions: {str(e)}")

class ScoringService(IScoringService):
    def __init__(self, gemini_client):
        self.client = gemini_client

    async def score_evidence(self, document: DocumentInput) -> ScoringOutput:
        from core.prompts import EVIDENCE_SCORING_PROMPT
        try:
            response = await _call_gemini_with_retry(
                self.client,
                f"{EVIDENCE_SCORING_PROMPT}\n\nStatement/Document to score:\n\n{document.text_content}",
                ScoringOutput
            )
            return ScoringOutput.model_validate_json(response.text)
        except Exception as e:
            logger.error(f"Error during evidence scoring: {e}")
            raise Exception(f"Failed to score evidence: {str(e)}")

from schemas.processor import ProcessorInput, ProcessorOutput
from services.interfaces import IProcessorService

class ProcessorService(IProcessorService):
    def __init__(self, summarization_service: ISummarizationService, 
                 extraction_service: IExtractionService,
                 timeline_service: ITimelineService,
                 contradiction_service: IContradictionService,
                 scoring_service: IScoringService):
        self.summarization_service = summarization_service
        self.extraction_service = extraction_service
        self.timeline_service = timeline_service
        self.contradiction_service = contradiction_service
        self.scoring_service = scoring_service

    async def process_all(self, input_data: ProcessorInput) -> ProcessorOutput:
        # Combine texts for context-heavy operations
        combined_text = f"FIR: {input_data.fir_text}"
        if input_data.witness_statements:
            combined_text += "\n\nWitness Statements:\n" + "\n".join([f"{i+1}. {ws}" for i, ws in enumerate(input_data.witness_statements)])
            
        from core.prompts import (
            FIR_SUMMARIZATION_PROMPT, ENTITY_EXTRACTION_PROMPT, 
            TIMELINE_GENERATION_PROMPT, CONTRADICTION_DETECTION_PROMPT, EVIDENCE_SCORING_PROMPT
        )
        
        mega_prompt = f"""You are an advanced Police Intelligence Evidence Engine. Execute all 5 analysis tasks on the provided evidence simultaneously.

EVIDENCE TEXT:
{combined_text}

TASK 1: Summarization
{FIR_SUMMARIZATION_PROMPT}

TASK 2: Entity Extraction
{ENTITY_EXTRACTION_PROMPT}

TASK 3: Timeline Generation
{TIMELINE_GENERATION_PROMPT}

TASK 4: Contradiction Detection
{CONTRADICTION_DETECTION_PROMPT}

TASK 5: Evidence Scoring
{EVIDENCE_SCORING_PROMPT}

IMPORTANT: Provide the output strictly as a valid JSON object matching the requested schema. Ensure all 5 tasks are completed comprehensively.
"""
        try:
            # We use a single call with gemini-2.5-flash to bypass the 5 RPM rate limit completely while keeping it blazing fast.
            response = await _call_gemini_with_retry(
                self.summarization_service.client, # Reuse client
                mega_prompt,
                ProcessorOutput
            )
            return ProcessorOutput.model_validate_json(response.text)
        except Exception as e:
            import logging
            logging.error(f"Error in unified processor execution: {e}")
            raise Exception(f"Unified Processing Failed: {e}")
