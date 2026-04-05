'use client';

import React from 'react';
import { Line } from 'react-chartjs-2';

export const SpeechVolumeChart = ({ data }: any) => (
  <Line data={{ labels: ['1', '2', '3'], datasets: [{ data: data.map((d: any) => d.volume || 0) }] }} />
);

export const PitchVariationChart = ({ data }: any) => (
  <Line data={{ labels: ['1', '2', '3'], datasets: [{ data: data.map((d: any) => d.pitchVariation || 0) }] }} />
);

export const FacialEngagementChart = ({ data }: any) => (
  <Line data={{ labels: ['1', '2', '3'], datasets: [{ data: data.map((d: any) => d.eyeContact || 0) }] }} />
);

export const EmotionDistributionChart = ({ data }: any) => (
  <Line data={{ labels: ['1', '2', '3'], datasets: [{ data: data.map((d: any) => d.emotion || 'neutral') }] }} />
);

export const HeadMovementScatterChart = ({ data }: any) => (
  <Line data={{ labels: ['1', '2', '3'], datasets: [{ data: data.map((d: any) => d.headMovement?.yaw || 0) }] }} />
);

export const OverallScoreChart = ({ score }: any) => (
  <Line data={{ labels: ['You', 'Target'], datasets: [{ data: [score, 85] }] }} />
);
