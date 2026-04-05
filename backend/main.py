from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import os
from pydantic import BaseModel

app = FastAPI(title="Umute AI Speech Coach API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock data for demo
@app.post("/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    return {
        "full_text": "This is a sample transcription of your speech. You spoke clearly and confidently about your experience and skills.",
        "segments": [
            {"start": 0.0, "end": 3.0, "text": "This is a sample"},
            {"start": 3.0, "end": 6.0, "text": "transcription of your speech"},
            {"start": 6.0, "end": 9.0, "text": "You spoke clearly and confidently"}
        ]
    }

@app.post("/analyze-speech")
async def analyze_speech(audio: UploadFile = File(...)):
    return {
        "speaking_rate": 145.2,
        "volume": 75.8,
        "pitch_variation": 68.4,
        "emphasis": 82.1,
        "stutter_count": 0,
        "filler_count": 2,
        "pause_count": 3,
        "emotion": "confident",
        "confidence": 0.85
    }

class FeedbackRequest(BaseModel):
    transcription: str
    speech_metrics: dict
    scenario: str

@app.post("/generate-feedback")
async def generate_feedback(request: FeedbackRequest):
    return {
        "strengths": [
            "Clear speech patterns and good articulation",
            "Confident tone of voice",
            "Appropriate speaking pace"
        ],
        "improvements": [
            "Try to reduce filler words like 'um' and 'ah'",
            "Vary your pitch more for engagement",
            "Add more pauses for emphasis"
        ],
        "corrections": [
            "Speak slightly slower during key points",
            "Maintain consistent volume throughout"
        ],
        "overall_score": 85
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
