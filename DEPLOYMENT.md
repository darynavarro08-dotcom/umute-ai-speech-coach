# 🚀 Deployment Guide

## 🌐 Production Deployment

### Frontend (Vercel - Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod

# Add environment variables in Vercel dashboard:
# OPENAI_API_KEY=your_key_here
# BACKEND_URL=your_backend_url_here
```

### Backend (Railway/Render/Heroku)
```bash
# Using Railway
npm install -g @railway/cli
railway login
railway init
railway up

# Add environment variables:
# OPENAI_API_KEY=your_key_here
# PORT=8000
```

## 🐳 Docker Deployment

### Frontend Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Backend Dockerfile
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - BACKEND_URL=http://backend:8000
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
```

## 🔒 Security Considerations

### API Keys
- Store in environment variables (never commit to git)
- Use different keys for development/production
- Rotate keys regularly

### CORS Configuration
```python
# In production, limit origins to your domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

### Rate Limiting
```python
# Add to backend
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/transcribe")
@limiter.limit("10/minute")
async def transcribe_audio(request: Request, audio: UploadFile = File(...)):
    # Your code here
```

## 📊 Monitoring & Analytics

### Frontend Analytics (Vercel)
- Built-in Vercel Analytics
- Add Google Analytics if needed

### Backend Monitoring
```python
# Add logging
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.post("/api/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    logger.info(f"Transcription request: {audio.filename}")
    # Your code here
```

## 🎯 Performance Optimization

### Frontend
```javascript
// Next.js optimization
module.exports = {
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['chart.js', 'react-chartjs-2']
  },
  images: {
    domains: ['yourdomain.com']
  }
}
```

### Backend
```python
# Add caching
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend

FastAPICache.init(RedisBackend("redis://localhost"), prefix="umute-cache")

@app.post("/api/transcribe")
@cache(expire=300)  # 5 minutes
async def transcribe_audio(audio: UploadFile = File(...)):
    # Your code here
```

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
name: Deploy Umute
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 📱 Mobile App Considerations

### PWA Configuration
```json
// next.config.js
module.exports = {
  pwa: {
    dest: 'public',
    register: true,
    skipWaiting: true
  }
}
```

### React Native Bridge
```javascript
// For future mobile app
import { NativeModules } from 'react-native';

const { UmuteBridge } = NativeModules;

// Access native camera/microphone
const stream = await UmuteBridge.getMediaStream();
```

## 💰 Scaling & Costs

### Estimated Monthly Costs (1000 users)
- **Vercel Pro**: $20/month
- **Backend Hosting**: $50/month
- **OpenAI API**: $100-500/month (depending on usage)
- **Total**: $170-570/month

### Optimization Strategies
- Client-side processing reduces server costs
- Batch processing for transcriptions
- Caching frequently used responses
- Optimize audio quality vs file size

## 🔮 Future Roadmap

### Phase 1 (Post-Hackathon)
- [ ] User authentication system
- [ ] Session history storage
- [ ] Progress tracking dashboard
- [ ] Mobile app development

### Phase 2 (3 months)
- [ ] Team collaboration features
- [ ] Advanced emotion detection
- [ ] Integration with Zoom/Teams
- [ ] Corporate training packages

### Phase 3 (6 months)
- [ ] AI avatar coach
- [ ] Virtual reality practice
- [ ] Advanced analytics
- [ ] Enterprise features

## 🎉 Production Launch Checklist

### Pre-Launch
- [ ] Domain name registered
- [ ] SSL certificates configured
- [ ] Monitoring tools set up
- [ ] Error tracking implemented
- [ ] Performance testing completed
- [ ] Security audit passed

### Launch Day
- [ ] DNS configured
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Cache warmed up
- [ ] Monitoring alerts configured

### Post-Launch
- [ ] User feedback collection
- [ ] Performance monitoring
- [ ] Cost optimization
- [ ] Feature prioritization

---

**🚀 Your Umute AI Speech Coach is ready for production deployment!**
