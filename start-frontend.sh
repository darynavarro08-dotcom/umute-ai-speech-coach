#!/bin/bash

# Umute Frontend Startup Script

echo "🚀 Starting Umute AI Speech Coach Frontend..."

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local file not found. Creating from template..."
    cat > .env.local << EOL
# OpenAI API Key for feedback generation
OPENAI_API_KEY=your_openai_api_key_here

# Next.js Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000

# Supabase Configuration (optional for session storage)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
EOL
    echo "✅ Created .env.local - please add your OpenAI API key"
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the development server
echo "🌐 Starting Next.js development server on http://localhost:3000"
npm run dev
