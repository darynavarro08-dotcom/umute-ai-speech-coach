from fastapi import FastAPI, File, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import asyncio
import json
import numpy as np
import librosa
import whisper
import openai
from typing import Dict, List, Optional
import io
import wave
import tempfile
import os
from pydantic import BaseModel
import opensmile
import parselmouth
from sklearn.preprocessing import StandardScaler
import pickle

app = FastAPI(title="Umute AI Speech Coach Backend")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize models
whisper_model = None
smile_extractor = None
emotion_model = None

class SpeechMetrics(BaseModel):
    speaking_rate: float
    volume: float
    pitch_variation: float
    emphasis: float
    stutter_count: int
    filler_count: int
    pause_count: int
    emotion: str
    confidence: float

class TranscriptionSegment(BaseModel):
    text: str
    timestamp: float
    confidence: float

class FeedbackRequest(BaseModel):
    transcription: str
    speech_metrics: SpeechMetrics
    scenario: str

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

manager = ConnectionManager()

async def initialize_models():
    global whisper_model, smile_extractor, emotion_model
    
    # Load Whisper model
    whisper_model = whisper.load_model("base")
    
    # Initialize OpenSmile extractor
    smile_extractor = opensmile.Smile(
        feature_set=opensmile.FeatureSet.eGeMAPSv02,
        feature_level=opensmile.FeatureLevel.Functionals,
        num_workers=4
    )
    
    # Load or create emotion classification model
    # In production, you would load a pre-trained model
    emotion_model = None  # Placeholder for emotion detection model

@app.on_event("startup")
async def startup_event():
    await initialize_models()

@app.get("/")
async def root():
    return {"message": "Umute AI Speech Coach Backend"}

@app.post("/api/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    try:
        # Read audio file
        audio_data = await audio.read()
        
        # Save to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
            temp_file.write(audio_data)
            temp_file_path = temp_file.name
        
        try:
            # Transcribe with Whisper
            result = whisper_model.transcribe(temp_file_path, word_timestamps=True)
            
            # Process segments
            segments = []
            for segment in result["segments"]:
                segments.append({
                    "text": segment["text"],
                    "timestamp": segment["start"],
                    "confidence": 0.95  # Whisper doesn't provide confidence, using placeholder
                })
            
            return {"segments": segments, "full_text": result["text"]}
        
        finally:
            # Clean up temporary file
            os.unlink(temp_file_path)
            
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Transcription failed: {str(e)}"}
        )

@app.post("/api/analyze-speech")
async def analyze_speech_features(audio: UploadFile = File(...)):
    try:
        # Read audio file
        audio_data = await audio.read()
        
        # Save to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
            temp_file.write(audio_data)
            temp_file_path = temp_file.name
        
        try:
            # Load audio with librosa
            y, sr = librosa.load(temp_file_path, sr=16000)
            
            # Extract features with OpenSmile
            features = smile_extractor.process_file(temp_file_path)
            
            # Convert to dictionary
            feature_dict = features.iloc[0].to_dict()
            
            # Calculate additional metrics
            speaking_rate = calculate_speaking_rate(y, sr)
            volume = calculate_volume(y)
            pitch_variation = calculate_pitch_variation(temp_file_path)
            
            # Detect fillers and stutters (simplified)
            transcription = whisper_model.transcribe(temp_file_path)
            filler_count = count_fillers(transcription["text"])
            stutter_count = detect_stutters(transcription["text"])
            
            # Detect emotion (placeholder)
            emotion = detect_emotion_from_features(feature_dict)
            
            metrics = {
                "speaking_rate": speaking_rate,
                "volume": volume,
                "pitch_variation": pitch_variation,
                "emphasis": feature_dict.get("F0semitoneFrom27.5Hz_sma3nz_amean", 0),
                "stutter_count": stutter_count,
                "filler_count": filler_count,
                "pause_count": count_pauses(transcription["segments"]),
                "emotion": emotion,
                "confidence": 0.85
            }
            
            return metrics
        
        finally:
            # Clean up temporary file
            os.unlink(temp_file_path)
            
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Speech analysis failed: {str(e)}"}
        )

@app.post("/api/generate-feedback")
async def generate_feedback(request: FeedbackRequest):
    try:
        # Use OpenAI to generate personalized feedback
        openai.api_key = os.getenv("OPENAI_API_KEY")
        
        prompt = f"""
        As an expert communication coach, analyze this speech performance and provide constructive feedback:
        
        Scenario: {request.scenario}
        Transcription: {request.transcription}
        
        Speech Metrics:
        - Speaking Rate: {request.speech_metrics.speaking_rate} words/min
        - Volume: {request.speech_metrics.volume}/100
        - Pitch Variation: {request.speech_metrics.pitch_variation}/100
        - Emphasis: {request.speech_metrics.emphasis}/100
        - Stutter Count: {request.speech_metrics.stutter_count}
        - Filler Words: {request.speech_metrics.filler_count}
        - Pauses: {request.speech_metrics.pause_count}
        - Detected Emotion: {request.speech_metrics.emotion}
        
        Provide feedback in JSON format with:
        {{
            "strengths": ["strength1", "strength2"],
            "improvements": ["improvement1", "improvement2"], 
            "corrections": ["correction1", "correction2"],
            "overall_score": 85,
            "next_steps": ["step1", "step2"]
        }}
        
        Be encouraging but specific. Focus on actionable advice.
        """
        
        response = await openai.ChatCompletion.acreate(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        
        feedback_text = response.choices[0].message.content
        
        try:
            feedback_json = json.loads(feedback_text)
            return feedback_json
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            return {
                "strengths": ["Clear speech detected"],
                "improvements": ["Work on pacing"],
                "corrections": ["Reduce filler words"],
                "overall_score": 75,
                "next_steps": ["Practice breathing exercises"]
            }
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Feedback generation failed: {str(e)}"}
        )

@app.websocket("/ws/realtime")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Process real-time data and send back analysis
            await manager.send_personal_message("Analysis complete", websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Helper functions
def calculate_speaking_rate(y, sr):
    # Estimate speaking rate using zero crossing rate
    zero_crossings = librosa.feature.zero_crossing_rate(y)[0]
    avg_zcr = np.mean(zero_crossings)
    # Map to approximate words per minute
    return min(200, max(60, int(avg_zcr * 1000)))

def calculate_volume(y):
    # Calculate RMS energy
    rms = librosa.feature.rms(y=y)[0]
    avg_rms = np.mean(rms)
    # Normalize to 0-100 scale
    return min(100, int(avg_rms * 1000))

def calculate_pitch_variation(audio_path):
    try:
        # Use parselmouth for detailed pitch analysis
        snd = parselmouth.Sound(audio_path)
        pitch = snd.to_pitch()
        pitch_values = pitch.selected_array['frequency']
        pitch_values = pitch_values[pitch_values > 0]  # Remove unvoiced frames
        
        if len(pitch_values) > 0:
            pitch_std = np.std(pitch_values)
            # Normalize to 0-100 scale
            return min(100, int(pitch_std / 10))
        return 50
    except:
        return 50

def count_fillers(text):
    fillers = ["um", "uh", "like", "you know", "actually", "basically", "literally"]
    text_lower = text.lower()
    count = 0
    for filler in fillers:
        count += text_lower.count(filler)
    return count

def detect_stutters(text):
    # Simple stutter detection (repeated words)
    words = text.lower().split()
    stutter_count = 0
    for i in range(1, len(words)):
        if words[i] == words[i-1]:
            stutter_count += 1
    return stutter_count

def count_pauses(segments):
    if not segments:
        return 0
    
    pause_count = 0
    for i in range(1, len(segments)):
        gap = segments[i]["start"] - segments[i-1]["end"]
        if gap > 0.5:  # Pause longer than 0.5 seconds
            pause_count += 1
    return pause_count

def detect_emotion_from_features(features):
    # Simplified emotion detection based on acoustic features
    # In production, use a trained ML model
    
    energy = features.get("energy_sma3nz_amean", 0)
    pitch_mean = features.get("F0semitoneFrom27.5Hz_sma3nz_amean", 0)
    pitch_std = features.get("F0semitoneFrom27.5Hz_sma3nz_stddev", 0)
    
    if energy > 0.7 and pitch_std > 10:
        return "excited"
    elif energy < 0.3:
        return "calm"
    elif pitch_mean > 60:
        return "anxious"
    else:
        return "neutral"

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
