'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Doughnut, Scatter } from 'react-chartjs-2';
import { SpeechMetrics, FacialMetrics } from '@/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface MetricsChartProps {
  speechData: SpeechMetrics[];
  facialData: FacialMetrics[];
  currentTime: number;
}

export const SpeechVolumeChart: React.FC<{ data: SpeechMetrics[] }> = ({ data }) => {
  const chartData = {
    labels: data.map((_, index) => `${index}s`),
    datasets: [
      {
        label: 'Volume',
        data: data.map(d => d.volume),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Speaking Rate',
        data: data.map(d => d.speakingRate),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Speech Volume & Rate Over Time',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export const PitchVariationChart: React.FC<{ data: SpeechMetrics[] }> = ({ data }) => {
  const chartData = {
    labels: data.map((_, index) => `${index}s`),
    datasets: [
      {
        label: 'Pitch Variation',
        data: data.map(d => d.pitchVariation),
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Emphasis',
        data: data.map(d => d.emphasis),
        borderColor: 'rgb(251, 146, 60)',
        backgroundColor: 'rgba(251, 146, 60, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Pitch Variation & Emphasis',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export const FacialEngagementChart: React.FC<{ data: FacialMetrics[] }> = ({ data }) => {
  const chartData = {
    labels: data.map((_, index) => `${index}s`),
    datasets: [
      {
        label: 'Eye Contact',
        data: data.map(d => d.eyeContact),
        borderColor: 'rgb(14, 165, 233)',
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Engagement',
        data: data.map(d => d.engagement),
        borderColor: 'rgb(236, 72, 153)',
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Facial Engagement Metrics',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export const EmotionDistributionChart: React.FC<{ data: SpeechMetrics[] }> = ({ data }) => {
  const emotionCounts = data.reduce((acc, curr) => {
    acc[curr.emotion] = (acc[curr.emotion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = {
    labels: Object.keys(emotionCounts),
    datasets: [
      {
        data: Object.values(emotionCounts),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'Emotion Distribution',
      },
    },
  };

  return <Doughnut data={chartData} options={options} />;
};

export const HeadMovementScatterChart: React.FC<{ data: FacialMetrics[] }> = ({ data }) => {
  const chartData = {
    datasets: [
      {
        label: 'Head Movement',
        data: data.map((d, index) => ({
          x: d.headMovement.yaw,
          y: d.headMovement.pitch,
        })),
        backgroundColor: 'rgba(99, 102, 241, 0.6)',
        borderColor: 'rgb(99, 102, 241)',
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Head Movement Pattern (Yaw vs Pitch)',
      },
    },
    scales: {
      x: {
        type: 'linear' as const,
        position: 'bottom' as const,
        title: {
          display: true,
          text: 'Yaw (Left-Right)',
        },
        min: -30,
        max: 30,
      },
      y: {
        title: {
          display: true,
          text: 'Pitch (Up-Down)',
        },
        min: -30,
        max: 30,
      },
    },
  };

  return <Scatter data={chartData} options={options} />;
};

export const OverallScoreChart: React.FC<{ score: number }> = ({ score }) => {
  const chartData = {
    labels: ['Score'],
    datasets: [
      {
        data: [score],
        backgroundColor: score >= 80 ? 'rgba(34, 197, 94, 0.8)' : 
                       score >= 60 ? 'rgba(251, 146, 60, 0.8)' : 
                                     'rgba(239, 68, 68, 0.8)',
        borderColor: score >= 80 ? 'rgb(34, 197, 94)' : 
                     score >= 60 ? 'rgb(251, 146, 60)' : 
                                   'rgb(239, 68, 68)',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: `Overall Performance Score: ${score}/100`,
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  return <Doughnut data={chartData} options={options} />;
};
