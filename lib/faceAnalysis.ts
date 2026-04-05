import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import '@tensorflow/tfjs-backend-webgl';
import { FacialMetrics } from '@/types';

export class FaceAnalyzer {
  private detector: faceLandmarksDetection.FaceLandmarksDetector | null = null;
  private video: HTMLVideoElement | null = null;
  private isAnalyzing = false;

  async initialize(video: HTMLVideoElement): Promise<void> {
    this.video = video;
    
    const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
    const detectorConfig = {
      runtime: 'tfjs' as const,
      refineLandmarks: true,
      maxFaces: 1,
    };

    this.detector = await faceLandmarksDetection.createDetector(model, detectorConfig);
  }

  async analyzeFacialMetrics(): Promise<FacialMetrics | null> {
    if (!this.detector || !this.video || this.isAnalyzing) return null;

    this.isAnalyzing = true;

    try {
      const faces = await this.detector.estimateFaces(this.video);
      
      if (faces.length === 0) {
        this.isAnalyzing = false;
        return null;
      }

      const face = faces[0];
      const keypoints = face.keypoints;

      // Calculate eye contact (looking at camera)
      const eyeContact = this.calculateEyeContact(keypoints);
      
      // Calculate head movement
      const headMovement = this.calculateHeadMovement(keypoints);
      
      // Detect facial expression
      const facialExpression = this.detectFacialExpression(keypoints);
      
      // Calculate engagement level
      const engagement = this.calculateEngagement(eyeContact, facialExpression, headMovement);

      this.isAnalyzing = false;
      
      return {
        eyeContact,
        headMovement,
        facialExpression,
        engagement,
      };
    } catch (error) {
      console.error('Face analysis error:', error);
      this.isAnalyzing = false;
      return null;
    }
  }

  private calculateEyeContact(keypoints: any[]): number {
    // Eye landmarks indices for MediaPipe Face Mesh
    const leftEyeIndices = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
    const rightEyeIndices = [362, 398, 384, 385, 386, 387, 388, 466, 263, 249, 390, 373, 374, 380, 381, 382];
    
    // Simple eye contact detection based on eye openness and gaze direction
    const leftEye = keypoints.filter((_, i) => leftEyeIndices.includes(i));
    const rightEye = keypoints.filter((_, i) => rightEyeIndices.includes(i));
    
    // Calculate eye openness (simplified)
    const leftEyeHeight = Math.abs(leftEye[1].y - leftEye[5].y);
    const rightEyeHeight = Math.abs(rightEye[1].y - rightEye[5].y);
    const avgEyeHeight = (leftEyeHeight + rightEyeHeight) / 2;
    
    // Normalize to 0-100 scale (higher is better eye contact)
    const eyeContactScore = Math.min(100, Math.max(0, avgEyeHeight * 10));
    
    return eyeContactScore;
  }

  private calculateHeadMovement(keypoints: any[]): { yaw: number; pitch: number } {
    // Use nose tip and chin to estimate head position
    const noseTip = keypoints[1]; // Nose tip
    const chin = keypoints[175]; // Chin
    
    // Calculate approximate head angles (simplified)
    const centerY = (noseTip.y + chin.y) / 2;
    const pitch = (noseTip.y - centerY) * 2; // Up/down movement
    const yaw = 0; // Would need more complex calculation for left/right
    
    return {
      yaw: Math.max(-30, Math.min(30, yaw)),
      pitch: Math.max(-30, Math.min(30, pitch)),
    };
  }

  private detectFacialExpression(keypoints: any[]): string {
    // Simplified expression detection based on key facial points
    const leftMouth = keypoints[61];
    const rightMouth = keypoints[291];
    const topLip = keypoints[13];
    const bottomLip = keypoints[14];
    const leftEyebrow = keypoints[70];
    const rightEyebrow = keypoints[300];
    
    // Calculate mouth openness (smile vs neutral)
    const mouthWidth = Math.abs(rightMouth.x - leftMouth.x);
    const mouthHeight = Math.abs(bottomLip.y - topLip.y);
    const smileRatio = mouthWidth / (mouthHeight + 1);
    
    // Calculate eyebrow position (surprise vs neutral)
    const avgEyebrowHeight = (leftEyebrow.y + rightEyebrow.y) / 2;
    
    if (smileRatio > 3) return 'happy';
    if (avgEyebrowHeight < 0.3) return 'surprised';
    if (mouthHeight > 0.02) return 'speaking';
    return 'neutral';
  }

  private calculateEngagement(
    eyeContact: number, 
    facialExpression: string, 
    headMovement: { yaw: number; pitch: number }
  ): number {
    let engagementScore = eyeContact * 0.4; // 40% weight on eye contact
    
    // Boost engagement for positive expressions
    if (facialExpression === 'happy') engagementScore += 20;
    if (facialExpression === 'neutral') engagementScore += 10;
    
    // Penalize excessive head movement
    const headMovementAmount = Math.abs(headMovement.yaw) + Math.abs(headMovement.pitch);
    if (headMovementAmount < 10) engagementScore += 15;
    else if (headMovementAmount > 20) engagementScore -= 10;
    
    return Math.min(100, Math.max(0, engagementScore));
  }

  startContinuousAnalysis(
    callback: (metrics: FacialMetrics) => void,
    interval: number = 100
  ): () => void {
    const analyze = async () => {
      const metrics = await this.analyzeFacialMetrics();
      if (metrics) {
        callback(metrics);
      }
    };

    const intervalId = setInterval(analyze, interval);
    
    return () => clearInterval(intervalId);
  }

  cleanup(): void {
    this.detector = null;
    this.video = null;
    this.isAnalyzing = false;
  }
}
