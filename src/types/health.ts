export interface HeartRateZones {
  cardio: number;
  fat_burn: number;
  peak: number;
}

export interface HeartRateData {
  resting: number;
  max: number;
  min: number;
  zones: HeartRateZones;
}

export interface ActivityData {
  steps: number;
  distance_km: number;
  active_minutes: number;
  calories_burned: number;
  heart_rate: HeartRateData;
  floors_climbed: number;
}

export interface SleepStages {
  deep: number;
  light: number;
  rem: number;
}

export interface SleepTimes {
  bedtime: string;
  wakeup: string;
}

export interface SleepData {
  duration_hours: number;
  efficiency: number;
  stages: SleepStages;
  temperature_c: number;
  breathing_rate: number;
  times: SleepTimes;
}

export interface HealthMetrics {
  activity_score: number;
  sleep_score: number;
  stress_level: 'Low' | 'Moderate' | 'High';
  recovery_status: 'Poor' | 'Fair' | 'Good' | 'Excellent';
  temperature_status: 'Normal' | 'Elevated' | 'Fever';
}

export interface HealthRecommendations {
  activity_recommendations: string[];
  sleep_recommendations: string[];
  recovery_recommendations: string[];
  general_recommendations: string[];
}

export interface HealthEvaluation {
  overall_status: string;
  metrics: HealthMetrics;
  concerns: string[];
  improvements: string[];
  recommendations: HealthRecommendations;
}

export interface HealthResponse {
  message: string;
  evaluation?: HealthEvaluation;
  facts: Record<string, string>;
  end_conversation: boolean;
}
