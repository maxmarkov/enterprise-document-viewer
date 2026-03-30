import os
import json
from openai import AzureOpenAI

# ---------------------------------------------------------------------------
# Placeholder schema — replace with your target schema before going to prod.
# The assistant is instructed to return ONLY valid JSON matching this shape.
# ---------------------------------------------------------------------------
SYSTEM_PROMPT = """You are a document data-extraction assistant.
Extract information from the provided document markdown and return a single JSON object
that strictly matches the following schema (use null for any field that is not found):

{
  "title": "string",
  "document_type": "string",
  "date": "string (ISO 8601 if found, otherwise as written)",
  "author": "string",
  "summary": "string (2-3 sentences)",
  "key_points": ["string"],
  "action_items": ["string"],
  "entities": {
    "people": ["string"],
    "organizations": ["string"],
    "locations": ["string"]
  }
}

Return ONLY the JSON object — no markdown fences, no extra text."""


def extract_json(markdown: str) -> dict:
    """Send markdown to Azure OpenAI and return extracted JSON as a Python dict."""
    client = AzureOpenAI(
        azure_endpoint=os.environ["AZURE_OPENAI_ENDPOINT"],
        api_key=os.environ["AZURE_OPENAI_KEY"],
        api_version=os.environ.get("AZURE_OPENAI_API_VERSION", "2024-02-01"),
    )

    response = client.chat.completions.create(
        model=os.environ["AZURE_OPENAI_DEPLOYMENT"],
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": markdown},
        ],
        temperature=0,
        response_format={"type": "json_object"},
    )

    raw = response.choices[0].message.content
    return json.loads(raw)
