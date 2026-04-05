import { SpeechMetrics, TranscriptionData } from '@/types';

export class AudioAnalyzer {
  private audioContext: AudioContext | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;

  async initialize(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });

      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      
      this.microphone = this.audioContext.createMediaStreamSource(this.stream);
      this.microphone.connect(this.analyser);

      // Setup media recorder for transcription
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };
    } catch (error) {
      console.error('Error initializing audio:', error);
      throw error;
    }
  }

  async getRealtimeMetrics(): Promise<Partial<SpeechMetrics>> {
    if (!this.analyser) return {};

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const timeDataArray = new Uint8Array(bufferLength);

    this.analyser.getByteFrequencyData(dataArray);
    this.analyser.getByteTimeDomainData(timeDataArray);

    // Calculate volume (RMS)
    const volume = this.calculateVolume(dataArray);
    
    // Calculate pitch variation (simplified)
    const pitchVariation = this.calculatePitchVariation(dataArray);
    
    // Detect speaking rate (based on amplitude changes)
    const speakingRate = this.detectSpeakingRate(timeDataArray);

    return {
      volume,
      pitchVariation,
      speakingRate,
    };
  }

  private calculateVolume(frequencyData: Uint8Array): number {
    let sum = 0;
    for (let i = 0; i < frequencyData.length; i++) {
      sum += frequencyData[i];
    }
    const average = sum / frequencyData.length;
    return Math.min(100, (average / 128) * 100);
  }

  private calculatePitchVariation(frequencyData: Uint8Array): number {
    // Find dominant frequency
    let maxValue = 0;
    let maxIndex = 0;
    
    for (let i = 0; i < frequencyData.length; i++) {
      if (frequencyData[i] > maxValue) {
        maxValue = frequencyData[i];
        maxIndex = i;
      }
    }

    // Simplified pitch variation based on frequency spread
    const dominantFreq = (maxIndex * this.audioContext!.sampleRate) / (this.analyser!.fftSize);
    return Math.min(100, (dominantFreq / 1000) * 20); // Normalize to 0-100
  }

  private detectSpeakingRate(timeDataArray: Uint8Array): number {
    // Detect zero crossings to estimate speaking rate
    let zeroCrossings = 0;
    const threshold = 128;

    for (let i = 1; i < timeDataArray.length; i++) {
      if ((timeDataArray[i - 1] < threshold && timeDataArray[i] >= threshold) ||
          (timeDataArray[i - 1] >= threshold && timeDataArray[i] < threshold)) {
        zeroCrossings++;
      }
    }

    // Normalize to words per minute estimate (simplified)
    return Math.min(200, Math.max(60, zeroCrossings * 2));
  }

  startRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'inactive') {
      this.audioChunks = [];
      this.mediaRecorder.start(1000); // Collect data every second
    }
  }

  stopRecording(): Promise<Blob> {
    return new Promise((resolve) => {
      if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
        this.mediaRecorder.onstop = () => {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
          resolve(audioBlob);
        };
        this.mediaRecorder.stop();
      } else {
        resolve(new Blob());
      }
    });
  }

  async transcribeAudio(audioBlob: Blob): Promise<TranscriptionData[]> {
    try {
      // This would connect to your backend with Whisper
      const formData = new FormData();
      formData.append('audio', audioBlob);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const transcription = await response.json();
      return transcription.segments || [];
    } catch (error) {
      console.error('Transcription error:', error);
      return [];
    }
  }

  async analyzeSpeechPattern(audioBlob: Blob): Promise<Partial<SpeechMetrics>> {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);

      const response = await fetch('/api/analyze-speech', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Speech analysis failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Speech analysis error:', error);
      return {};
    }
  }

  startContinuousAnalysis(
    callback: (metrics: Partial<SpeechMetrics>) => void,
    interval: number = 500
  ): () => void {
    const analyze = async () => {
      const metrics = await this.getRealtimeMetrics();
      callback(metrics);
    };

    const intervalId = setInterval(analyze, interval);
    
    return () => clearInterval(intervalId);
  }

  cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  }
}
