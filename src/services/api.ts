import axios from "axios";
import { KidneyAnalysis, DashboardStats, User, DiagnosisResult } from "../types";

// Grab remote API URL. Configured via .env.local or platform secrets.
const DEFAULT_API_URL = `http://localhost:8000/api`;
export const API_URL = ((import.meta as any).env?.VITE_API_URL) || DEFAULT_API_URL;
const BASE_URL = API_URL.replace('/api', '');

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
        data: (json.data || []).map((item: any) => ({
          id: item.id ? item.id.toString() : Math.random().toString(),
          patientId: `PT-${item.id || "0000"}`,
          patientName: item.original_filename || "Unknown Patient",
          patientAge: 45,
          patientGender: "Unspecified",
          createdAt: item.created_at || new Date().toISOString(),
          diagnosis: item.prediction === 'Stone' ? "Anomaly Detected" : item.prediction === 'Review' ? "Review Required" : "Normal findings",
          confidence: item.confidence || Math.floor(80 + Math.random() * 20),
          imageUrl: item.image_url ? `${BASE_URL}/storage/${item.image_url}` : "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
          recommendation: item.report?.summary || "Pending clinical review.",
        })),
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
      
      return {
        totalScans: stats.total_analyses || 0,
        anomalyRate: stats.condition_distribution?.['Stone'] ? Math.round((stats.condition_distribution['Stone'] / Math.max(1, stats.total_analyses)) * 100) : 0,
        pendingReviews: stats.pending || 0,
        accuracyRate: stats.average_confidence || 0,
        scansByMonth: [], // Not implemented in backend yet, UI will handle empty
        cystDistribution: Object.entries(stats.condition_distribution || {}).map(([key, value]) => ({
          name: key === 'Stone' ? 'Kidney Stone' : key === 'Review' ? 'Simple Cyst' : 'Normal Structure',
          value: value as number,
          color: key === 'Stone' ? '#ef4444' : key === 'Review' ? '#3b82f6' : '#0d9488'
        }))
      };
    }
  } catch (e) {
    console.warn("[API Error] Fetch statistics failed", e);
  }
  
  // Return empty fallback structure if failed to prevent UI crash
  return {
    totalScans: 0,
    anomalyRate: 0,
    pendingReviews: 0,
    accuracyRate: 0,
    scansByMonth: [],
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
  }
): Promise<KidneyAnalysis> {
  const formData = new FormData();
  if (imageFile) {
    formData.append("image", imageFile); // Laravel validation requires 'image'
  }
  formData.append("patientName", patientData.patientName);
  formData.append("patientAge", String(patientData.patientAge));
  formData.append("patientGender", patientData.patientGender);
  formData.append("location", patientData.location || "Unspecified");
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
      
      // Transform response to match KidneyAnalysis interface
      return {
        id: result.id.toString(),
        patientId: `PT-${result.id}`,
        patientName: patientData.patientName,
        patientAge: patientData.patientAge,
        patientGender: patientData.patientGender,
        createdAt: result.created_at,
        diagnosis: result.prediction === 'Stone' ? DiagnosisResult.ANOMALY_DETECTED : result.prediction === 'Review' ? DiagnosisResult.REVIEW_REQUIRED : DiagnosisResult.NORMAL_FINDINGS,
        confidence: result.confidence,
        imageUrl: `${BASE_URL}/storage/${result.image_url}`,
        location: patientData.location || "Left Kidney",
        recommendation: result.report?.summary || "Pending review",
        cystType: result.prediction === 'Stone' ? 'Kidney Stone' : 'Normal Structure',
      };
    }
  } catch (e: any) {
    throw new Error(e.response?.data?.message || e.message || "Failed to analyze image with API.");
  }
  
  throw new Error("Failed to return a valid analysis.");
}

/**
 * 6. POST /guest-predict
 * Guest access unauthenticated prediction endpoint
 */
export async function guestPredict(imageFile: File | null): Promise<{prediction: string, confidence: number, imageUrl: string, usageCount?: number, usageLimit?: number}> {
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
        imageUrl: `${BASE_URL}/storage/${result.data.image_url}`,
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

/**
 * 7. DELETE /analyses/:id
 * Delete a specific record
 */
export async function deleteAnalysis(id: string): Promise<boolean> {
  try {
    const response = await apiClient.delete(`/analyses/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("kv_token") || ""}`
      }
    });
    if (response.status === 200) {
      return true;
    }
  } catch (e) {
    console.warn("[API Error] Delete record server call failed", e);
  }
  return false;
}

/**
 * 8. GET /analyses/:id/report/pdf
 * Download PDF Report
 */
export async function downloadReport(id: string): Promise<void> {
  try {
    const response = await apiClient.get(`/analyses/${id}/report/pdf`, {
      responseType: 'blob',
      headers: {
        Authorization: `Bearer ${localStorage.getItem("kv_token") || ""}`
      }
    });
    
    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `kidneyvision_report_${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  } catch (e) {
    console.error("Failed to download PDF report", e);
    throw new Error("Failed to download PDF report");
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
