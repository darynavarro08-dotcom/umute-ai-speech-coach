# 🚀 Get Your App Working NOW!

## ⚡ Quick Setup (5 minutes)

### 1. Add Your OpenAI API Key
```bash
# Add to backend
echo "OPENAI_API_KEY=sk-your-actual-key-here" >> backend/.env

# Add to frontend
echo "OPENAI_API_KEY=sk-your-actual-key-here" >> .env.local
```

### 2. Start Both Services

**Terminal 1 - Backend:**
```bash
cd /Users/dariananavarrogalindo/CascadeProjects/umute/backend
./start.sh
```
Wait until you see: `INFO:     Uvicorn running on http://0.0.0.0:8000`

**Terminal 2 - Frontend:**
```bash
cd /Users/dariananavarrogalindo/CascadeProjects/umute
./start-frontend.sh
```
Wait until you see: `ready - started server on 0.0.0.0:3000`

### 3. Open Your App
Go to: **http://localhost:3000**

## 🎯 Test the Features

### 1. Allow Permissions
- Camera permission ✅
- Microphone permission ✅

### 2. Try a Practice Session
1. Select "Job Interview" scenario
2. Click "Start Practice Session"
3. Speak for 30 seconds
4. Watch real-time metrics
5. Click "Stop Recording"
6. View your AI feedback

### 3. What You Should See:
- 🎥 Live video with facial analysis
- 📊 Real-time speech metrics (volume, eye contact, engagement)
- 📈 Interactive charts after recording
- 🤖 AI-generated feedback
- 📝 Full transcription

## 🔧 Troubleshooting

### If Backend Fails:
```bash
# Check Python version
python --version  # Should be 3.8+

# Install manually
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

### If Frontend Fails:
```bash
# Check Node version
node --version  # Should be 18+

# Install manually
npm install
npm run dev
```

### If Camera/Mic Don't Work:
1. Refresh the page
2. Check browser permissions
3. Try Chrome/Edge browser
4. Ensure no other app is using camera/mic

### If No AI Feedback:
1. Check OpenAI API key is set correctly
2. Verify backend is running on port 8000
3. Check browser console for errors

## 📱 Quick Test Checklist

Before Demo:
- [ ] Backend running on http://localhost:8000
- [ ] Frontend running on http://localhost:3000
- [ ] Camera permission granted
- [ ] Microphone permission granted
- [ ] OpenAI API key configured
- [ ] Test recording works
- [ ] AI feedback appears

## 🎉 Success Indicators

You'll know it's working when:
- ✅ Video feed shows your face with landmarks
- ✅ Real-time metrics update while speaking
- ✅ Charts appear after recording
- ✅ AI feedback generates with insights
- ✅ Transcription shows your speech

## 🚨 Common Issues & Fixes

### "Backend connection failed"
→ Ensure backend is running on port 8000
→ Check OPENAI_API_KEY is set in backend/.env

### "Camera not found"
→ Try different browser (Chrome/Edge)
→ Check system camera permissions
→ Close other video apps

### "No audio analysis"
→ Check microphone permissions
→ Ensure backend is running
→ Verify audio levels are adequate

---

**🚀 Your Umute AI Speech Coach will be running in 5 minutes!**
