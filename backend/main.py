import os
import re
import json
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

app = FastAPI(title="LuminaRead MVP API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Pydantic schemas ─────────────────────────────────────────────────
class AnalyzeRequest(BaseModel):
    text: str

class NodePosition(BaseModel):
    x: float
    y: float

class NodeData(BaseModel):
    label: str

class Node(BaseModel):
    id: str
    data: NodeData
    position: NodePosition
    type: str = "default"

class Edge(BaseModel):
    id: str
    source: str
    target: str

class AnalyzeResponse(BaseModel):
    simplified_text: str
    bullets: List[str] = Field(..., min_items=3, max_items=3)
    nodes: List[Node]
    edges: List[Edge]

# ── System Prompt ────────────────────────────────────────────────────
SYSTEM_PROMPT = """
You are an expert in Neurodiversity and Special Education. 
Task: Convert complex text into ADHD-friendly content.
Requirements:
1. Simplified Text: Use Grade 6 vocabulary. Short sentences.
2. Bullets: Exactly 3 high-impact takeaways.
3. Mind Map: Create a hierarchy of nodes and edges for React Flow. 
   - Root node at (0,0).
   - Child nodes spread out.
   - Use 'default' type for nodes.
Format: Return strictly JSON.

Output ONLY valid JSON. Structure: {"simplified_text": "...", "bullets": ["...", "...", "..."], "nodes": [{"id": "1", "data": {"label": "Main Idea"}, "position": {"x": 0, "y": 0}}], "edges": []}.
"""

# ── Smart Demo Mode ──────────────────────────────────────────────────
# Common English stop-words to filter out when extracting keywords
STOP_WORDS = {
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "shall",
    "should", "may", "might", "must", "can", "could", "of", "in", "to",
    "for", "with", "on", "at", "from", "by", "about", "as", "into",
    "through", "during", "before", "after", "above", "below", "between",
    "out", "off", "over", "under", "again", "further", "then", "once",
    "and", "but", "or", "nor", "not", "so", "yet", "both", "either",
    "neither", "each", "every", "all", "any", "few", "more", "most",
    "other", "some", "such", "no", "only", "own", "same", "than", "too",
    "very", "just", "because", "if", "when", "while", "where", "how",
    "what", "which", "who", "whom", "this", "that", "these", "those",
    "it", "its", "he", "she", "they", "them", "his", "her", "their",
    "we", "us", "our", "you", "your", "my", "me", "i", "also",
    "however", "therefore", "thus", "hence", "although", "though",
}

def _extract_keywords(text: str, max_keywords: int = 5) -> List[str]:
    """Extract the most frequent meaningful words from the input text."""
    words = re.findall(r"[a-zA-Z]{3,}", text.lower())
    # Filter stop words
    meaningful = [w for w in words if w not in STOP_WORDS]
    # Count frequency
    freq: Dict[str, int] = {}
    for w in meaningful:
        freq[w] = freq.get(w, 0) + 1
    # Sort by frequency descending, take top N, capitalize
    sorted_words = sorted(freq.items(), key=lambda x: x[1], reverse=True)
    return [w.capitalize() for w, _ in sorted_words[:max_keywords]]

def _get_first_sentences(text: str, count: int = 3) -> str:
    """Return the first N sentences of the text, simplified."""
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    chosen = sentences[:count]
    return " ".join(chosen)

def generate_smart_mock(input_text: str) -> dict:
    """
    Build a context-aware mock response from the user's actual input text.
    Extracts keywords to build mind-map nodes and first sentences for the
    simplified text, so the output always matches the input topic.
    """
    keywords = _extract_keywords(input_text, max_keywords=5)

    # Fallback if the text is too short to extract anything
    if len(keywords) < 3:
        keywords = ["Main Idea", "Key Detail", "Summary", "Context", "Takeaway"]

    # Build simplified text from the first few sentences
    first_few = _get_first_sentences(input_text, 3)
    simplified = (
        first_few if len(first_few) > 30
        else "This text discusses key concepts that are important to understand. The main ideas are broken down into simpler parts below."
    )

    # Build 3 bullet takeaways from keywords
    bullets = [
        f"The main topic is about {keywords[0]}.",
        f"Key concepts include {keywords[1]} and {keywords[2]}.",
        f"Understanding {keywords[0]} helps connect {keywords[-1]} to the bigger picture.",
    ]

    # Build mind-map nodes: root + children from keywords
    root_label = keywords[0] if keywords else "Main Topic"
    nodes = [
        {"id": "1", "data": {"label": root_label}, "position": {"x": 0, "y": 0}, "type": "default"},
    ]
    edges = []

    child_positions = [
        {"x": -300, "y": 130},
        {"x": -100, "y": 130},
        {"x": 100, "y": 130},
        {"x": 300, "y": 130},
    ]

    for idx, kw in enumerate(keywords[1:5]):
        node_id = str(idx + 2)
        pos = child_positions[idx % len(child_positions)]
        nodes.append({
            "id": node_id,
            "data": {"label": kw},
            "position": pos,
            "type": "default",
        })
        edges.append({
            "id": f"e1-{node_id}",
            "source": "1",
            "target": node_id,
        })

    return {
        "simplified_text": simplified,
        "bullets": bullets,
        "nodes": nodes,
        "edges": edges,
    }

# ── Hardcoded fallback (only used when input text is empty) ──────────
FALLBACK_DEMO = {
    "simplified_text": "Space is incredibly huge and mostly empty. It has billions of galaxies, and each galaxy has billions of stars. Earth is just a tiny dot in this giant universe, floating around our sun.",
    "bullets": [
        "Space is vast and mostly empty.",
        "There are billions of galaxies and stars.",
        "Earth is just a tiny part of the universe."
    ],
    "nodes": [
        {"id": "1", "data": {"label": "The Universe"}, "position": {"x": 0, "y": 0}, "type": "default"},
        {"id": "2", "data": {"label": "Galaxies"}, "position": {"x": -200, "y": 100}, "type": "default"},
        {"id": "3", "data": {"label": "Stars"}, "position": {"x": 0, "y": 100}, "type": "default"},
        {"id": "4", "data": {"label": "Earth"}, "position": {"x": 200, "y": 100}, "type": "default"}
    ],
    "edges": [
        {"id": "e1-2", "source": "1", "target": "2"},
        {"id": "e1-3", "source": "1", "target": "3"},
        {"id": "e1-4", "source": "1", "target": "4"}
    ]
}

# ── API Endpoints ────────────────────────────────────────────────────
@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_text(request: AnalyzeRequest):
    api_key = os.getenv("OPENAI_API_KEY")
    input_text = request.text.strip()

    # Step 1: If we have an API key, try the real AI call
    if api_key and api_key.strip() != "":
        client = OpenAI(api_key=api_key)
        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": input_text}
                ]
            )
            response_content = response.choices[0].message.content
            parsed_json = json.loads(response_content)
            return parsed_json
        except Exception as e:
            print(f"[LuminaRead] OpenAI API Error: {e}")
            # Fall through to smart mock below

    # Step 2: No API key OR API failed — generate a context-aware mock
    if input_text:
        print("[LuminaRead] Demo Mode: Generating smart mock from input text")
        return generate_smart_mock(input_text)

    # Step 3: No input text at all — return the hardcoded Space fallback
    print("[LuminaRead] Demo Mode: No input text, returning default fallback")
    return FALLBACK_DEMO

@app.get("/")
def read_root():
    return {"status": "ok", "message": "LuminaRead MVP API is running!"}
