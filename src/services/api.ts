import axios from "axios";
import { KidneyAnalysis, DiagnosisResult, DashboardStats, User, AppSettings, SystemHealth, AuditLogEntry, UserProfile } from "../types";
import { parseClinicalError } from "../utils/errorParser";

// Grab remote API URL. Configured via .env.local or platform secrets.
const DEFAULT_API_URL = `https://kidneyvision-backend-production.up.railway.app/api`;
export const API_URL = ((import.meta as any).env?.VITE_API_URL) || DEFAULT_API_URL;
export const BASE_URL = API_URL.replace(/\/api\/?$/, '');

/**
 * Universal Image URL Sanitizer.
 * Guarantees that whatever backend/mock/file path format is supplied:
 * 1. Backslashes are converted to forward slashes.
 * 2. Redundant /storage/ or double prefixes are stripped.
 * 3. Absolute URLs matching localhost/127.0.0.1 are aligned with the active BASE_URL.
 * 4. Blob and Data URLs are preserved.
 * 5. Empty/null values fallback gracefully to a clean medical placeholder image.
 */
export function sanitizeImageUrl(rawUrl?: string | null): string {
  if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) {
    return "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80";
  }

  const trimmed = rawUrl.trim();

  // Preserved special browser schemes
  if (trimmed.startsWith('blob:') || trimmed.startsWith('data:image/')) {
    return trimmed;
  }

  // Normalize backslashes (Windows filesystem paths)
  let normalized = trimmed.replace(/\\/g, '/');

  // If it's already an absolute URL
  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    try {
      const parsed = new URL(normalized);
      // If it contains /storage/ from local/staging server, align origin with active BASE_URL
      if (parsed.pathname.includes('/storage/')) {
        const storageSubpath = parsed.pathname.substring(parsed.pathname.indexOf('/storage/'));
        return `${BASE_URL}${storageSubpath}`;
      }
      return normalized;
    } catch {
      return normalized;
    }
  }

  // Relative path: strip leading slashes and redundant storage/
  let cleanPath = normalized.replace(/^\/+/, '');
  if (cleanPath.startsWith('storage/')) {
    cleanPath = cleanPath.substring(8);
  }

  return `${BASE_URL}/storage/${cleanPath}`;
}

axios.defaults.withCredentials = true;
axios.defaults.baseURL = API_URL;

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
});

let csrfFetched = false;

export async function fetchCsrfCookie() {
  if (!csrfFetched) {
    await axios.get(`${BASE_URL}/sanctum/csrf-cookie`, {
      withCredentials: true
    });
    csrfFetched = true;
  }
}

apiClient.interceptors.request.use(async (config) => {
  const token = localStorage.getItem("kv_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Only fetch CSRF for specific endpoints to avoid unnecessary calls
  if (config.url?.match(/^\/?(auth\/login|auth\/register|predict|guest-predict|auth\/password\/email|auth\/password\/reset)/)) {
    await fetchCsrfCookie();
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// --- ACTUAL API LAYER METHOD IMPLEMENTATION ---

/**
 * 1. POST /auth/login
 */
export async function loginUser(email: string, password: string):Promise<{token: string, user: User}> {
  try {
    await fetchCsrfCookie();
    const response = await apiClient.post('/auth/login', { email, password });
    
    if (!response.data.success) {
      throw new Error(response.data.message || "Invalid credentials.");
    }

    return {
      token: response.data.data.token,
      user: response.data.data.user
    };
  } catch (e: any) {
    throw new Error(e.response?.data?.message || e.message || "Failed to connect to authentication server.");
  }
}

/**
 * 2. POST /auth/register
 */
export async function registerUser(email: string, fullName: string, hospital: string, password: string, password_confirmation: string):Promise<{token: string, user: User}> {
  try {
    await fetchCsrfCookie();
    const response = await apiClient.post('/auth/register', {
      name: fullName,
      email,
      hospital,
      password,
      password_confirmation
    });

    if (!response.data.success) {
      throw new Error(response.data.message || "Registration failed.");
    }

    return {
      token: response.data.data.token,
      user: response.data.data.user
    };
  } catch (e: any) {
    throw new Error(e.response?.data?.message || e.message || "Failed to connect to authentication server.");
  }
}

/**
 * 3. GET /analyses
 */
export async function getAnalyses(page: number = 1, perPage: number = 10): Promise<{data: KidneyAnalysis[], meta: any}> {
  try {
    const response = await apiClient.get(`/analyses?page=${page}&per_page=${perPage}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("kv_token") || ""}`
      }
    });
    
    if (response.status === 200) {
      const json = response.data;
      return {
        data: (json.data || []).map((item: any) => {
          const isUncertain = item.status === 'review' || (item.confidence && item.confidence < 70) || item.ai_response_payload?.is_uncertain;
          const diagnosis = isUncertain
            ? DiagnosisResult.REVIEW_REQUIRED
            : (item.prediction === 'Stone' ? DiagnosisResult.ANOMALY_DETECTED : DiagnosisResult.NORMAL_FINDINGS);
          const finding = item.prediction === 'Stone' ? 'Kidney Stone' : 'Normal Renal Parenchyma';

          return {
            id: String(item.id),
            patientId: item.patient_id || `PT-${item.id || "0000"}`,
            patientName: item.patient_name || item.original_filename || "Unknown Patient",
            patientAge: item.patient_age !== null && item.patient_age !== undefined ? Number(item.patient_age) : undefined,
            patientGender: item.patient_gender || "Unspecified",
            createdAt: item.created_at || new Date().toISOString(),
            diagnosis,
            confidence: item.confidence !== null && item.confidence !== undefined ? Number(item.confidence) : 0,
            imageUrl: sanitizeImageUrl(item.image_url),
            heatmapUrl: item.heatmap_url || undefined,
            peakCoordinates: item.peak_coordinates || undefined,
            location: item.anatomical_location || "Left Kidney",
            recommendation: item.report?.summary || "Pending clinical review.",
            clinicianNotes: item.clinician_notes || item.report?.clinician_notes,
            pathologyFinding: finding,
            cystType: finding,
            isUncertain,
          };
        }),
        meta: json.meta || { current_page: 1, last_page: 1, total: json.data?.length || 0 }
      };
    }
  } catch (e) {
    console.warn("[API Error] Fetch analyses failed", e);
  }
  return { data: [], meta: { current_page: 1, last_page: 1, total: 0 } };
}

/**
 * 4. GET /statistics
 */
export async function getStatistics(): Promise<DashboardStats> {
  try {
    const response = await apiClient.get('/statistics', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("kv_token") || ""}`
      }
    });
    if (response.status === 200 && response.data.success) {
      const stats = response.data.data;
      const distribution = Object.entries(stats.condition_distribution || {}).map(([key, value]) => ({
        name: key.toLowerCase() === 'stone' ? 'Kidney Stone' : key.toLowerCase() === 'review' ? 'Under Review' : 'Normal Renal Parenchyma',
        value: value as number,
        color: key.toLowerCase() === 'stone' ? '#ef4444' : key.toLowerCase() === 'review' ? '#f59e0b' : '#0d9488'
      }));

      const monthlyScans = (stats.scans_by_month || []).map((item: any) => ({
        month: item.month || item.short_month || item.month_key || "Month",
        total: Number(item.total) || 0,
        anomalies: Number(item.anomalies) || 0,
        normals: Number(item.normals) || 0,
      }));

      const total = stats.total_analyses || 0;
      const stones = stats.stone_count ?? (stats.condition_distribution?.['Stone'] || 0);
      const normals = stats.normal_count ?? (stats.condition_distribution?.['Normal'] || 0);
      const anomalyPercent = total > 0 ? Math.round((stones / total) * 100) : 0;
      const avgConfidence = stats.average_confidence ? Math.round(Number(stats.average_confidence) * 10) / 10 : 0;

      return {
        totalScans: total,
        normalCount: normals,
        stoneCount: stones,
        anomalyRate: anomalyPercent,
        pendingReviews: (stats.pending || 0) + (stats.review || 0),
        accuracyRate: avgConfidence,
        currentMonthCount: stats.current_month_count || 0,
        lastMonthCount: stats.last_month_count || 0,
        monthGrowthPercentage: stats.month_growth_percentage ?? null,
        scansByMonth: monthlyScans,
        conditionDistribution: distribution,
        cystDistribution: distribution,
      };
    }
  } catch (e) {
    console.warn("[API Error] Fetch statistics failed", e);
  }
  
  // Return empty fallback structure if failed to prevent UI crash
  return {
    totalScans: 0,
    normalCount: 0,
    stoneCount: 0,
    anomalyRate: 0,
    pendingReviews: 0,
    accuracyRate: 0,
    currentMonthCount: 0,
    lastMonthCount: 0,
    monthGrowthPercentage: null,
    scansByMonth: [],
    conditionDistribution: [],
    cystDistribution: []
  };
}

/**
 * 5. POST /predict
 * Submit standard image or DICOM slice, get AI prediction
 */
export async function createPrediction(
  imageFile: File | null,
  patientData: {
    patientId?: string;
    patientName: string;
    patientAge: number;
    patientGender: "Male" | "Female" | "Other";
    location?: "Left Kidney" | "Right Kidney" | "Unspecified";
    imageUrl?: string; // Preselected sample fallback
    clinicianNotes?: string;
  }
): Promise<KidneyAnalysis> {
  const formData = new FormData();
  if (imageFile) {
    formData.append("image", imageFile); // Laravel validation requires 'image'
  }
  if (patientData.patientId) {
    formData.append("patientId", patientData.patientId);
  }
  formData.append("patientName", patientData.patientName);
  formData.append("patientAge", String(patientData.patientAge));
  formData.append("patientGender", patientData.patientGender);
  formData.append("location", patientData.location || "Unspecified");
  if (patientData.clinicianNotes) {
    formData.append("clinicianNotes", patientData.clinicianNotes);
  }
  if (patientData.imageUrl) {
    formData.append("sampleImageUrl", patientData.imageUrl);
  }

  try {
    const response = await apiClient.post('/predict', formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("kv_token") || ""}`,
        "Content-Type": "multipart/form-data"
      }
    });

    if (response.status === 201) {
      const result = response.data.data;
      
      const isUncertain = result.status === 'review' || (result.confidence && result.confidence < 70) || result.ai_response_payload?.is_uncertain;
      const diagnosis = isUncertain 
        ? DiagnosisResult.REVIEW_REQUIRED 
        : (result.prediction === 'Stone' ? DiagnosisResult.ANOMALY_DETECTED : DiagnosisResult.NORMAL_FINDINGS);
      const finding = result.prediction === 'Stone' ? 'Kidney Stone' : 'Normal Renal Parenchyma';

      // Transform response to match KidneyAnalysis interface
      return {
        id: result.id.toString(),
        patientId: result.patient_id || patientData.patientId || `PT-${result.id}`,
        patientName: result.patient_name || patientData.patientName,
        patientAge: result.patient_age || patientData.patientAge,
        patientGender: result.patient_gender || patientData.patientGender,
        createdAt: result.created_at,
        diagnosis,
        confidence: result.confidence,
        imageUrl: sanitizeImageUrl(result.image_url),
        heatmapUrl: result.heatmap_url || undefined,
        peakCoordinates: result.peak_coordinates || undefined,
        location: result.anatomical_location || patientData.location || "Left Kidney",
        recommendation: result.report?.summary || "Pending review",
        clinicianNotes: result.clinician_notes || result.report?.clinician_notes || patientData.clinicianNotes,
        pathologyFinding: finding,
        cystType: finding,
        isUncertain,
      };
    }
  } catch (e: any) {
    const clinicalErr = parseClinicalError(e);
    const err = new Error(clinicalErr.message);
    (err as any).clinicalError = clinicalErr;
    throw err;
  }
  
  const fallbackErr = parseClinicalError(null);
  const err = new Error(fallbackErr.message);
  (err as any).clinicalError = fallbackErr;
  throw err;
}

/**
 * 5b. PATCH /analyses/:id
 * Update patient metadata or clinician notes
 */
export async function updateAnalysis(
  id: string,
  data: {
    patientId?: string;
    patientName?: string;
    patientAge?: number;
    patientGender?: string;
    location?: string;
    clinicianNotes?: string;
  }
): Promise<KidneyAnalysis> {
  const cleanId = id.toString().replace(/^PT-/, "");
  const response = await apiClient.patch(`/analyses/${cleanId}`, data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("kv_token") || ""}`
    }
  });

  if (response.status === 200 && response.data.success) {
    const result = response.data.data;
    const isUncertain = result.status === 'review' || (result.confidence && result.confidence < 70) || result.ai_response_payload?.is_uncertain;
    const diagnosis = isUncertain 
      ? DiagnosisResult.REVIEW_REQUIRED 
      : (result.prediction === 'Stone' ? DiagnosisResult.ANOMALY_DETECTED : DiagnosisResult.NORMAL_FINDINGS);
    const finding = result.prediction === 'Stone' ? 'Kidney Stone' : 'Normal Renal Parenchyma';

    return {
      id: result.id.toString(),
      patientId: result.patient_id || `PT-${result.id}`,
      patientName: result.patient_name || "Unknown Patient",
      patientAge: result.patient_age !== null && result.patient_age !== undefined ? Number(result.patient_age) : undefined,
      patientGender: result.patient_gender || "Unspecified",
      createdAt: result.created_at,
      diagnosis,
      confidence: result.confidence,
      imageUrl: sanitizeImageUrl(result.image_url),
      heatmapUrl: result.heatmap_url || undefined,
      peakCoordinates: result.peak_coordinates || undefined,
      location: result.anatomical_location || "Left Kidney",
      recommendation: result.report?.summary || "Pending review",
      clinicianNotes: result.clinician_notes || result.report?.clinician_notes,
      pathologyFinding: finding,
      cystType: finding,
      isUncertain,
    };
  }
  throw new Error(response.data?.message || "Failed to update clinical analysis.");
}

/**
 * 6. POST /guest-predict
 * Guest access unauthenticated prediction endpoint
 */
export async function guestPredict(imageFile: File | null): Promise<{prediction: string, confidence: number, imageUrl: string, heatmapUrl?: string, peakCoordinates?: { x: number; y: number }, usageCount?: number, usageLimit?: number}> {
  if (!imageFile) throw new Error("Image file is required.");
  
  const formData = new FormData();
  formData.append("image", imageFile);

  try {
    const response = await apiClient.post('/guest-predict', formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });

    const result = response.data;
    if (response.status === 200 && result.success) {
      return {
        prediction: result.data.prediction,
        confidence: result.data.confidence,
        imageUrl: sanitizeImageUrl(result.data.image_url),
        heatmapUrl: result.data.heatmap_url || undefined,
        peakCoordinates: result.data.peak_coordinates || undefined,
        usageCount: result.data.usage_count,
        usageLimit: result.data.usage_limit
      };
    } else {
      throw new Error(result.message || "Failed to process image.");
    }
  } catch (e: any) {
    throw new Error(e.response?.data?.message || e.message || "Failed to process image.");
  }
}

export async function deleteAnalysis(id: string): Promise<boolean> {
  const cleanId = id.toString().replace(/^PT-/, "");
  try {
    const response = await apiClient.delete(`/analyses/${cleanId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("kv_token") || ""}`
      }
    });
    if (response.status === 200 || response.status === 204) {
      return true;
    }
    return false;
  } catch (e) {
    const clinicalErr = parseClinicalError(e);
    const err = new Error(clinicalErr.message);
    (err as any).clinicalError = clinicalErr;
    throw err;
  }
}

/**
 * 8. GET /analyses/:id/report/pdf
 * Download PDF Report
 */
export async function downloadReport(id: string): Promise<void> {
  const cleanId = id.toString().replace(/^PT-/, "");
  try {
    const response = await apiClient.get(`/analyses/${cleanId}/report/pdf`, {
      responseType: 'blob',
      headers: {
        Authorization: `Bearer ${localStorage.getItem("kv_token") || ""}`
      }
    });
    
    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `kidneyvision_report_${cleanId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    setTimeout(() => window.URL.revokeObjectURL(url), 10000);
  } catch (e) {
    const clinicalErr = parseClinicalError(e);
    const err = new Error(clinicalErr.message);
    (err as any).clinicalError = clinicalErr;
    throw err;
  }
}

/**
 * 8b. GET /analyses/:id/report/preview (Blob URL for in-app preview modal/iframe)
 */
export async function getReportPdfBlobUrl(id: string): Promise<string> {
  const cleanId = id.toString().replace(/^PT-/, "");
  try {
    const response = await apiClient.get(`/analyses/${cleanId}/report/preview`, {
      responseType: 'blob',
      headers: {
        Authorization: `Bearer ${localStorage.getItem("kv_token") || ""}`
      }
    });
    return window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  } catch (e) {
    const clinicalErr = parseClinicalError(e);
    const err = new Error(clinicalErr.message);
    (err as any).clinicalError = clinicalErr;
    throw err;
  }
}

/**
 * 9. POST /password/email
 * Send password reset link
 */
export async function sendPasswordResetLink(email: string): Promise<string> {
  try {
    await fetchCsrfCookie();
    const response = await apiClient.post('/auth/password/email', { email });
    return response.data.message || "Reset link sent.";
  } catch (e: any) {
    throw new Error(e.response?.data?.message || "Failed to send reset link.");
  }
}

/**
 * 10. POST /password/reset
 * Reset the password with token
 */
export async function resetPassword(data: {email: string, token: string, password: string, password_confirmation: string}): Promise<string> {
  try {
    await fetchCsrfCookie();
    const response = await apiClient.post('/auth/password/reset', data);
    return response.data.message || "Password has been successfully reset.";
  } catch (e: any) {
    throw new Error(e.response?.data?.message || "Failed to reset password.");
  }
}

/**
 * 11. GET /settings
 * Retrieve real system and clinical configuration
 */
export async function fetchSettings(): Promise<AppSettings> {
  try {
    const response = await apiClient.get('/settings');
    return response.data.data;
  } catch (e: any) {
    console.error("Failed to fetch settings:", e);
    // Clinical default fallback
    return {
      ai_confidence_threshold: 85,
      alert_kidney_stone: true,
      alert_low_confidence: true,
      alert_system_errors: true,
      demo_mode: false,
      audit_logging_enabled: true,
      session_timeout_minutes: 30,
      auto_logout_enabled: true,
      data_retention_days: 365,
    };
  }
}

/**
 * 12. PUT /settings
 * Persist clinical and system configuration
 */
export async function saveSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
  try {
    const response = await apiClient.put('/settings', settings);
    return response.data.data;
  } catch (e: any) {
    const msg = e.response?.data?.message || "Failed to update settings.";
    throw new Error(msg);
  }
}

/**
 * 13. GET /system/health
 * Live telemetry check of Laravel, DB, Flask AI, and model
 */
export async function fetchSystemHealth(): Promise<SystemHealth> {
  try {
    const response = await apiClient.get('/system/health');
    return response.data.data;
  } catch (e: any) {
    console.error("Failed to fetch system health:", e);
    return {
      status: 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        laravel_api: { name: 'Laravel API', status: 'online' },
        database: { name: 'Database', status: 'offline', error: 'Connection failed' },
        ai_service: { name: 'AI / Flask Service', status: 'offline', model_status: 'unloaded', error: 'Service unreachable' },
      },
      system_info: {
        application: 'KidneyVision AI',
        version: '1.2.0-clinical',
        environment: 'development',
        frontend: 'React 18 + Vite + TypeScript',
        backend: 'Laravel',
        ai_runtime: 'Flask + TensorFlow',
        model_name: 'Kidney Stone Classifier (best_model.keras)',
        api_endpoint: API_URL,
      }
    };
  }
}

/**
 * 14. GET /profile
 * Authenticated user profile data
 */
export async function fetchUserProfile(): Promise<UserProfile> {
  try {
    const response = await apiClient.get('/profile');
    return response.data.data;
  } catch (e: any) {
    console.error("Failed to fetch user profile:", e);
    throw new Error(e.response?.data?.message || "Failed to load profile.");
  }
}

/**
 * 15. PUT /profile
 * Update clinician profile and digital signature status
 */
export async function saveUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
  try {
    const response = await apiClient.put('/profile', profile);
    return response.data.data;
  } catch (e: any) {
    throw new Error(e.response?.data?.message || "Failed to update profile.");
  }
}

/**
 * 16. POST /profile/password
 * Change password requiring current password
 */
export async function changePassword(currentPassword: string, password: string, passwordConfirmation: string): Promise<string> {
  try {
    const response = await apiClient.post('/profile/password', {
      current_password: currentPassword,
      password: password,
      password_confirmation: passwordConfirmation,
    });
    return response.data.message || "Password updated successfully.";
  } catch (e: any) {
    throw new Error(e.response?.data?.message || "Failed to update password.");
  }
}

/**
 * 17. POST /profile/revoke-sessions
 * Invalidate all other active sessions/tokens
 */
export async function revokeOtherSessions(): Promise<string> {
  try {
    const response = await apiClient.post('/profile/revoke-sessions');
    return response.data.message || "Other active sessions revoked.";
  } catch (e: any) {
    throw new Error(e.response?.data?.message || "Failed to revoke sessions.");
  }
}

/**
 * 18. GET /audit-logs
 * Fetch real audit trail with pagination and filters
 */
export async function fetchAuditLogs(params?: {
  page?: number;
  action?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
}): Promise<{ logs: AuditLogEntry[]; meta: any }> {
  try {
    const response = await apiClient.get('/audit-logs', { params });
    return {
      logs: response.data.data,
      meta: response.data.meta,
    };
  } catch (e: any) {
    console.error("Failed to fetch audit logs:", e);
    return {
      logs: [],
      meta: { current_page: 1, last_page: 1, total: 0 }
    };
  }
}

