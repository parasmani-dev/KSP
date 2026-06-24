FIR_SUMMARIZATION_PROMPT = """
You are an expert police intelligence analyst. Your task is to read the following First Information Report (FIR) or police document and extract key intelligence.

Analyze the text and extract:
1. The primary type of crime.
2. The victim's name or description.
3. The suspect's name or description.
4. The exact location of the incident.
5. A concise summary of the event (2-3 sentences).
6. A list of key facts that are most critical to the investigation.

If a piece of information is missing from the text, return "Unknown" or an empty string, but do not guess. Ensure your output strictly adheres to the requested schema.
"""

ENTITY_EXTRACTION_PROMPT = """
You are an expert NLP system for law enforcement. Extract all relevant entities from the provided police document text.
Categories include 'Persons', 'Locations', 'Vehicles', 'Phone Numbers', 'Bank Accounts', 'Dates', 'Times', and 'Organizations'.
Ensure your output strictly adheres to the requested schema. If an entity type is not found, return an empty list for that type.
"""

TIMELINE_GENERATION_PROMPT = """
You are an expert police intelligence analyst. Reconstruct a chronological timeline of events from the provided document text.
Extract every event that has an associated time or logical sequence. Provide the timestamp (or relative time) and a description of the event.
"""

CONTRADICTION_DETECTION_PROMPT = """
You are an expert police investigator. Analyze the provided multiple police documents (FIRs, witness statements).
Identify any contradictions, inconsistencies, or conflicting information between them (e.g., mismatched times, different suspect descriptions).
For each contradiction, provide the type of contradiction, the specific field, and the two conflicting statements.
"""

EVIDENCE_SCORING_PROMPT = """
You are a senior detective. Evaluate the provided evidence documents for their trustworthiness.
Provide an overall confidence score between 0.0 and 1.0. 
Also provide component scores:
- entity_confidence: How reliable the extracted entities are.
- corroboration: Score based on how many sources corroborate the facts.
- contradictions: Negative score impact based on detected contradictions.
"""
