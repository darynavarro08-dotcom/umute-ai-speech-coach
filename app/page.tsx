'use client';

import React, { useState, useEffect, useRef } from 'react';
import { VideoCapture } from '@/components/VideoCapture';
import { AudioAnalyzer } from '@/lib/audioAnalysis';
import { 
  SpeechVolumeChart, 
  PitchVariationChart, 
  FacialEngagementChart,
  EmotionDistributionChart,
  HeadMovementScatterChart,
  OverallScoreChart
} from '@/components/MetricsChart';
import { SpeechMetrics, FacialMetrics, FeedbackItem, Scenario } from '@/types';

const scenarios: Scenario[] = [
  {
    id: 'interview',
    title: 'Job Interview',
    description: 'Practice answering common interview questions',
    type: 'interview',
    duration: 300,
    prompts: [
      'Tell me about yourself',
      'What are your greatest strengths?',
      'Why do you want to work here?'
    ]
  },
  {
    id: 'presentation',
    title: 'Product Presentation',
    description: 'Present a new product or idea',
    type: 'presentation',
    duration: 180,
    prompts: [
      'Introduce your product',
      'Explain the key benefits',
      'Call to action'
    ]
  },
  {
    id: 'social',
    title: 'Network Conversation',
    description: 'Practice small talk and networking',
    type: 'social',
    duration: 120,
    prompts: [
      'Introduce yourself',
      'Find common interests',
      'Exchange contact information'
    ]
  }
];

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(scenarios[0]);
  const [speechData, setSpeechData] = useState<SpeechMetrics[]>([]);
  const [facialData, setFacialData] = useState<FacialMetrics[]>([]);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [transcription, setTranscription] = useState('');
  
  const audioAnalyzerRef = useRef<AudioAnalyzer | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (audioAnalyzerRef.current) {
        audioAnalyzerRef.current.cleanup();
      }
    };
  }, []);

  const handleFacialMetricsUpdate = (metrics: FacialMetrics) => {
    if (isRecording) {
      setFacialData(prev => [...prev, metrics]);
    }
  };

  const handleSpeechMetricsUpdate = (metrics: Partial<SpeechMetrics>) => {
    if (isRecording) {
      const fullMetrics: SpeechMetrics = {
        speakingRate: metrics.speakingRate || 0,
        volume: metrics.volume || 0,
        pitchVariation: metrics.pitchVariation || 0,
        emphasis: metrics.emphasis || 0,
        stutterCount: metrics.stutterCount || 0,
        fillerCount: metrics.fillerCount || 0,
        pauseCount: metrics.pauseCount || 0,
        emotion: metrics.emotion || 'neutral',
        confidence: metrics.confidence || 0.5,
      };
      setSpeechData(prev => [...prev, fullMetrics]);
    }
  };

  const startRecording = async () => {
    try {
      // Initialize audio analyzer
      if (!audioAnalyzerRef.current) {
        audioAnalyzerRef.current = new AudioAnalyzer();
        await audioAnalyzerRef.current.initialize();
      }

      // Start recording
      audioAnalyzerRef.current.startRecording();
      setIsRecording(true);
      setTimeRemaining(selectedScenario.duration);
      setSpeechData([]);
      setFacialData([]);
      setFeedback([]);
      setTranscription('');

      // Start timer
      timerIntervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Start continuous analysis
      recordingIntervalRef.current = audioAnalyzerRef.current.startContinuousAnalysis(
        handleSpeechMetricsUpdate,
        500
      );

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);

      // Stop intervals
      if (recordingIntervalRef.current) {
        recordingIntervalRef.current();
        recordingIntervalRef.current = null;
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      // Stop recording and get audio
      if (audioAnalyzerRef.current) {
        const audioBlob = await audioAnalyzerRef.current.stopRecording();
        
        // Transcribe and analyze
        if (audioBlob.size > 0) {
          await analyzeRecording(audioBlob);
        }
      }

    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const analyzeRecording = async (audioBlob: Blob) => {
    try {
      // Transcribe audio
      const formData = new FormData();
      formData.append('audio', audioBlob);

      const transcriptionResponse = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (transcriptionResponse.ok) {
        const transcriptionData = await transcriptionResponse.json();
        setTranscription(transcriptionData.full_text);
      }

      // Analyze speech features
      const analysisResponse = await fetch('/api/analyze-speech', {
        method: 'POST',
        body: formData,
      });

      if (analysisResponse.ok) {
        const speechAnalysis = await analysisResponse.json();
        // Update the latest speech data with detailed analysis
        if (speechData.length > 0) {
          const updatedData = [...speechData];
          updatedData[updatedData.length - 1] = { ...updatedData[updatedData.length - 1], ...speechAnalysis };
          setSpeechData(updatedData);
        }
      }

      // Generate feedback
      if (speechData.length > 0) {
        await generateFeedback();
      }

    } catch (error) {
      console.error('Error analyzing recording:', error);
    }
  };

  const generateFeedback = async () => {
    try {
      const latestMetrics = speechData[speechData.length - 1];
      
      const response = await fetch('/api/generate-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcription,
          speech_metrics: latestMetrics,
          scenario: selectedScenario.title,
        }),
      });

      if (response.ok) {
        const feedbackData = await response.json();
        
        // Convert feedback to our format
        const feedbackItems: FeedbackItem[] = [];
        
        feedbackData.strengths?.forEach((strength: string, index: number) => {
          feedbackItems.push({
            type: 'strength',
            message: strength,
            timestamp: Date.now() + index,
            severity: 'low',
          });
        });

        feedbackData.improvements?.forEach((improvement: string, index: number) => {
          feedbackItems.push({
            type: 'improvement',
            message: improvement,
            timestamp: Date.now() + index + 100,
            severity: 'medium',
          });
        });

        feedbackData.corrections?.forEach((correction: string, index: number) => {
          feedbackItems.push({
            type: 'correction',
            message: correction,
            timestamp: Date.now() + index + 200,
            severity: 'high',
          });
        });

        setFeedback(feedbackItems);
        setOverallScore(feedbackData.overall_score || 75);
      }

    } catch (error) {
      console.error('Error generating feedback:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Umute</h1>
              <span className="ml-2 text-sm text-gray-500">AI Speech Coach</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {isRecording && (
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></span>
                    Recording: {formatTime(timeRemaining)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Scenario Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Choose Your Scenario</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {scenarios.map((scenario) => (
              <div
                key={scenario.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedScenario.id === scenario.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => !isRecording && setSelectedScenario(scenario)}
              >
                <h3 className="font-semibold mb-2">{scenario.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{scenario.description}</p>
                <p className="text-xs text-gray-500">Duration: {formatTime(scenario.duration)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Recording Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Video Capture */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Facial Analysis</h3>
            <VideoCapture 
              onMetricsUpdate={handleFacialMetricsUpdate}
              isActive={isRecording}
            />
          </div>

          {/* Controls and Prompts */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Practice Prompts</h3>
            <div className="bg-white rounded-lg shadow p-6 mb-4">
              <div className="space-y-3">
                {selectedScenario.prompts.map((prompt, index) => (
                  <div key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <p className="ml-3 text-gray-700">{prompt}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recording Controls */}
            <div className="bg-white rounded-lg shadow p-6">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isRecording && timeRemaining === 0}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-blue-500 hover:bg-blue-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isRecording ? 'Stop Recording' : 'Start Practice Session'}
              </button>
            </div>
          </div>
        </div>

        {/* Real-time Metrics */}
        {isRecording && (speechData.length > 0 || facialData.length > 0) && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Real-time Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="metric-card">
                <h4 className="font-medium mb-2">Speech Volume</h4>
                <div className="text-2xl font-bold text-blue-600">
                  {speechData.length > 0 ? speechData[speechData.length - 1].volume.toFixed(1) : '0'}%
                </div>
              </div>
              <div className="metric-card">
                <h4 className="font-medium mb-2">Eye Contact</h4>
                <div className="text-2xl font-bold text-green-600">
                  {facialData.length > 0 ? facialData[facialData.length - 1].eyeContact.toFixed(1) : '0'}%
                </div>
              </div>
              <div className="metric-card">
                <h4 className="font-medium mb-2">Engagement</h4>
                <div className="text-2xl font-bold text-purple-600">
                  {facialData.length > 0 ? facialData[facialData.length - 1].engagement.toFixed(1) : '0'}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        {!isRecording && speechData.length > 0 && (
          <div className="space-y-8">
            <h3 className="text-lg font-semibold">Performance Analysis</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <SpeechVolumeChart data={speechData} />
              <PitchVariationChart data={speechData} />
              <FacialEngagementChart data={facialData} />
              <EmotionDistributionChart data={speechData} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <HeadMovementScatterChart data={facialData} />
              <OverallScoreChart score={overallScore} />
            </div>
          </div>
        )}

        {/* Feedback */}
        {!isRecording && feedback.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">AI Feedback</h3>
            <div className="space-y-3">
              {feedback.map((item, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    item.type === 'strength' ? 'feedback-positive' :
                    item.type === 'improvement' ? 'feedback-neutral' :
                    'feedback-negative'
                  }`}
                >
                  <div className="flex items-start">
                    <span className="flex-shrink-0">
                      {item.type === 'strength' && '✅'}
                      {item.type === 'improvement' && '💡'}
                      {item.type === 'correction' && '⚠️'}
                    </span>
                    <p className="ml-3">{item.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transcription */}
        {!isRecording && transcription && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Transcription</h3>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-700 whitespace-pre-wrap">{transcription}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
