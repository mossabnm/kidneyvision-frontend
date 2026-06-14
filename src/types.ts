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
  dimensions?: {
    length: number; // in mm
    width: number; // in mm
    volume: number; // in cm3
  };
  location?: "Left Kidney" | "Right Kidney" | "Unspecified";
  cystType?: "Simple Cyst" | "Complex Cyst" | "Polycystic" | "Normal Structure" | "Indeterminate";
  recommendation: string;
  clinicianNotes?: string;
  isDraft?: boolean;
}

export interface DashboardStats {
  totalScans: number;
  anomalyRate: number; // in %
  pendingReviews: number;
  accuracyRate: number; // in %
  scansByMonth: {
    month: string;
    total: number;
    anomalies: number;
    normals: number;
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
