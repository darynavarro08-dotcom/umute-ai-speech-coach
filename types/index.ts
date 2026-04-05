export interface SpeechMetrics {
  speakingRate: number;
  volume: number;
  pitchVariation: number;
  emphasis: number;
  stutterCount: number;
  fillerCount: number;
  pauseCount: number;
  emotion: string;
  confidence: number;
}

export interface FacialMetrics {
  eyeContact: number;
  headMovement: {
    yaw: number;
    pitch: number;
  };
  facialExpression: string;
  engagement: number;
}

export interface TranscriptionData {
  text: string;
  timestamp: number;
  confidence: number;
}

export interface FeedbackItem {
  type: 'strength' | 'improvement' | 'correction';
  message: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high';
}

export interface SessionData {
  id: string;
  startTime: Date;
  endTime?: Date;
  scenario: string;
  speechMetrics: SpeechMetrics[];
  facialMetrics: FacialMetrics[];
  transcription: TranscriptionData[];
  feedback: FeedbackItem[];
  overallScore: number;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  type: 'interview' | 'presentation' | 'social';
  duration: number;
  prompts: string[];
}

export interface RealtimeData {
  timestamp: number;
  speechMetrics: Partial<SpeechMetrics>;
  facialMetrics: Partial<FacialMetrics>;
  transcription?: string;
}
