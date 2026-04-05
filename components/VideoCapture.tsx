'use client';

import React from 'react';

interface VideoCaptureProps {
  onMetricsUpdate: (metrics: any) => void;
  isActive: boolean;
}

export const VideoCapture: React.FC<VideoCaptureProps> = ({ onMetricsUpdate, isActive }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">🎥</div>
          <p className="text-lg">Video Feed</p>
          <p className="text-sm text-gray-400 mt-2">
            {isActive ? "Analyzing facial metrics..." : "Camera ready"}
          </p>
        </div>
      </div>
      {isActive && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            Recording Active
          </div>
        </div>
      )}
    </div>
  );
};
