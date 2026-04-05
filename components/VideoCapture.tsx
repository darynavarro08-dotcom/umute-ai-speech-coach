'use client';

import React, { useRef, useEffect, useState } from 'react';
import { FaceAnalyzer } from '@/lib/faceAnalysis';
import { FacialMetrics } from '@/types';

interface VideoCaptureProps {
  onMetricsUpdate: (metrics: FacialMetrics) => void;
  isActive: boolean;
}

export const VideoCapture: React.FC<VideoCaptureProps> = ({ 
  onMetricsUpdate, 
  isActive 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string>('');
  const faceAnalyzerRef = useRef<FaceAnalyzer | null>(null);
  const analysisIntervalRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (isActive && !isInitialized) {
      initializeVideo();
    }

    return () => {
      cleanup();
    };
  }, [isActive, isInitialized]);

  const initializeVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        videoRef.current.onloadedmetadata = async () => {
          await videoRef.current?.play();
          
          // Initialize face analyzer
          if (videoRef.current) {
            faceAnalyzerRef.current = new FaceAnalyzer();
            await faceAnalyzerRef.current.initialize(videoRef.current);
            setIsInitialized(true);
            startAnalysis();
          }
        };
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please ensure camera permissions are granted.');
    }
  };

  const startAnalysis = () => {
    if (faceAnalyzerRef.current) {
      analysisIntervalRef.current = faceAnalyzerRef.current.startContinuousAnalysis(
        (metrics: FacialMetrics) => {
          onMetricsUpdate(metrics);
        },
        500 // Analyze every 500ms
      );
    }
  };

  const cleanup = () => {
    // Stop video stream
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }

    // Stop face analysis
    if (analysisIntervalRef.current) {
      analysisIntervalRef.current();
      analysisIntervalRef.current = null;
    }

    // Cleanup face analyzer
    if (faceAnalyzerRef.current) {
      faceAnalyzerRef.current.cleanup();
      faceAnalyzerRef.current = null;
    }

    setIsInitialized(false);
  };

  const drawVideoFrame = () => {
    if (videoRef.current && canvasRef.current && isInitialized) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 640, 480);
      }
      requestAnimationFrame(drawVideoFrame);
    }
  };

  useEffect(() => {
    if (isInitialized) {
      drawVideoFrame();
    }
  }, [isInitialized]);

  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden">
      {error ? (
        <div className="flex items-center justify-center h-96 text-white">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            className="hidden"
            autoPlay
            playsInline
            muted
          />
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            className="w-full h-auto"
          />
          
          {!isInitialized && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p>Initializing camera and face detection...</p>
              </div>
            </div>
          )}

          {isInitialized && (
            <div className="absolute top-4 right-4">
              <div className="flex items-center space-x-2 bg-green-500 bg-opacity-75 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-white text-sm font-medium">Live</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
