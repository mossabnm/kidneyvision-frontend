/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum DiagnosisResult {
  ANOMALY_DETECTED = "Anomaly Detected",
  NORMAL_FINDINGS = "Normal findings",
  REVIEW_REQUIRED = "Review Required",
  ANALYZING = "Analyzing..."
}

export interface KidneyAnalysis {
  id: string; // e.g., PT-2024-8841
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: "Male" | "Female" | "Other";
  createdAt: string; // ISO String or PST representation
  diagnosis: DiagnosisResult;
  confidence: number; // e.g., 94
  imageUrl: string;
  heatmapUrl?: string; // Grad-CAM overlay
  peakCoordinates?: { x: number; y: number };
  dimensions?: {
    length: number; // in mm
    width: number; // in mm
    volume: number; // in cm3
  };
  location?: "Left Kidney" | "Right Kidney" | "Unspecified";
  pathologyFinding?: "Kidney Stone" | "Normal Renal Parenchyma" | string;
  cystType?: string; // Backwards-compatible alias for pathologyFinding
  isUncertain?: boolean;
  recommendation: string;
  clinicianNotes?: string;
  isDraft?: boolean;
}

export interface DashboardStats {
  totalScans: number;
  normalCount: number;
  stoneCount: number;
  anomalyRate: number; // in %
  pendingReviews: number;
  accuracyRate: number; // in %
  currentMonthCount: number;
  lastMonthCount: number;
  monthGrowthPercentage: number | null;
  scansByMonth: {
    month: string;
    total: number;
    anomalies: number;
    normals: number;
  }[];
  conditionDistribution: {
    name: string;
    value: number;
    color: string;
  }[];
  cystDistribution: {
    name: string;
    value: number;
    color: string;
  }[];
}

export interface User {
  email: string;
  name: string;
  role: string;
  hospital: string;
  avatarUrl: string;
  token?: string;
}

export interface APIConfig {
  apiUrl: string;
  isCustomServer: boolean;
}

export interface AppSettings {
  ai_confidence_threshold: number;
  alert_kidney_stone: boolean;
  alert_low_confidence: boolean;
  alert_system_errors: boolean;
  demo_mode: boolean;
  audit_logging_enabled: boolean;
  session_timeout_minutes: number;
  auto_logout_enabled: boolean;
  data_retention_days: number;
}

export interface ServiceHealthItem {
  name: string;
  status: 'online' | 'connected' | 'offline' | 'degraded';
  version?: string;
  php_version?: string;
  environment?: string;
  driver?: string;
  endpoint?: string;
  model_status?: 'loaded' | 'unloaded';
  model_version?: string;
  error?: string | null;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded';
  timestamp: string;
  services: {
    laravel_api: ServiceHealthItem;
    database: ServiceHealthItem;
    ai_service: ServiceHealthItem;
  };
  system_info: {
    application: string;
    version: string;
    environment: string;
    frontend: string;
    backend: string;
    ai_runtime: string;
    model_name: string;
    api_endpoint: string;
  };
}

export interface AuditLogEntry {
  id: number;
  user_id: number | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  ip_address: string;
  user_agent: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  hospital: string;
  signature_configured: boolean;
  is_admin: boolean;
  created_at?: string;
}
