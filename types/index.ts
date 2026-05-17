export type TransportMode = 'bus' | 'train' | 'car' | 'walking';

export type TripStatus =
  | 'idle'
  | 'setup'
  | 'active'
  | 'prealarm'
  | 'alarm'
  | 'overshoot'
  | 'arrived';

export type GpsConfidence = 'high' | 'medium' | 'low';

export interface Stop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  line: string;
  distanceKm: number;
  sub?: string;
}

export interface Trip {
  id: string;
  startedAt: number;
  status: TripStatus;
  destination: Stop;
  stops: Stop[];
  transportMode: TransportMode;
  wakeOffsetMinutes: number;
  smsEnabled: boolean;
  events: TripEvent[];
}

export interface TripEvent {
  type:
    | 'boarded'
    | 'asleep'
    | 'warmup'
    | 'alarm'
    | 'dismiss'
    | 'overshoot'
    | 'sms-sent'
    | 'cancel'
    | 'arrived';
  timestamp: number;
  position?: { lat: number; lng: number };
}

export interface TripRecord {
  id: string;
  startedAt: number;
  endedAt: number;
  destination: Stop;
  transportMode: TransportMode;
  outcome: 'arrived' | 'overshoot' | 'cancelled';
  minutesSlept: number;
}

export interface EmergencyContact {
  name: string;
  phone: string;
}

export interface Settings {
  onboardingComplete: boolean;
  defaultWakeOffsetMinutes: number;
  hapticEnabled: boolean;
  smsEnabled: boolean;
  smsGraceSeconds: number;
  batterySaverEnabled: boolean;
  emergencyContact: EmergencyContact | null;
}
