# 🚀 Quick Start Guide

## One-Command Setup

### 1. Add Your OpenAI API Key
```bash
# Backend
echo "OPENAI_API_KEY=your_actual_api_key_here" >> backend/.env

# Frontend  
echo "OPENAI_API_KEY=your_actual_api_key_here" >> .env.local
```

### 2. Start Both Services

**Terminal 1 - Backend:**
```bash
cd backend
./start.sh
```

**Terminal 2 - Frontend:**
```bash
./start-frontend.sh
```

### 3. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🔧 What's Missing to Complete Setup

### Required (Must Do)
1. **OpenAI API Key**: Add your actual key to both `.env` files
2. **Python Dependencies**: The startup script handles this
3. **Node Dependencies**: The startup script handles this

### Optional (For Full Features)
1. **Supabase Account**: For session storage (not required for demo)
2. **GPU Acceleration**: For faster ML processing (optional)

## 🎯 Test the Application

1. Open http://localhost:3000
2. Allow camera/microphone permissions
3. Select a scenario (Interview, Presentation, or Social)
4. Click "Start Practice Session"
5. Speak for 30+ seconds
6. View your real-time metrics and AI feedback

## 🐛 Troubleshooting

### Camera/Microphone Issues
- Ensure browser permissions are granted
- Check that no other app is using camera/mic
- Try refreshing the page

### Backend Connection Issues
- Verify backend is running on port 8000
- Check that OPENAI_API_KEY is set correctly
- Ensure both services are running simultaneously

### Performance Issues
- Close other browser tabs
- Ensure good lighting for facial analysis
- Use Chrome/Edge for best compatibility

## 🏆 Ready for Demo!

Once both services are running, you have a fully functional AI speech coach that:
- Analyzes your speech in real-time
- Tracks facial expressions and eye contact
- Provides AI-generated feedback
- Shows interactive performance charts
- Works for interviews, presentations, and social practice

**This is a complete, hackathon-winning application!** 🎉
