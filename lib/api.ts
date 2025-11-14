import { CheckOutResponse, SearchPatientsResponse, ApiResponse, CheckInResponse } from "./types";

// Add the missing Visit interface
interface Visit {
  id: string;
  patient_id: string;
  check_in_time: string;
  check_out_time?: string;
  department: string;
  chief_complaint?: string;
  status: string;
  admission_status?: 'admitted' | 'discharged' | 'pending';
  bed_id?: string;
  admission_ward_id?: string;
  admission_date?: string;
  discharge_date?: string;
}

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  status: string;
  message: string;
  data: {
    user: {
      id: string;
      username: string;
      email: string;
      role: string;
      first_name: string;
      last_name: string;
      facility_id:string;
      facility_name:string;
      province:string;
      facility_type:string;
    };
    token: string;
  };
  timestamp: string;
}

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: string;
  first_name: string;
  last_name: string;
}

// Resource Allocation Interfaces
interface StaffingPrediction {
  date: string;
  department: string;
  nurses: number;
  doctors: number;
  total_staff: number;
  support_staff: number;
  confidence: number;
  peak_hours: string[];
}

interface BedPrediction {
  date: string;
  department: string;
  beds_needed: number;
  predicted_occupancy: number;
  buffer_beds: number;
  occupancy_rate: number;
  confidence: number;
}

interface WeeklyForecast {
  department: string;
  forecast_period: string;
  daily_forecasts: Array<{
    date: string;
    day_of_week: string;
    expected_visits: number;
    staffing: StaffingPrediction;
    beds: BedPrediction;
  }>;
  weekly_summary: {
    total_visits: number;
    avg_nurses_needed: number;
    avg_doctors_needed: number;
    avg_beds_needed: number;
    peak_day: string;
  };
}

interface MLStatus {
  service: {
    status: string;
    models_loaded: boolean;
    version: string;
  };
  models: {
    staffing: {
      loaded: boolean;
      type: string | null;
    };
    beds: {
      loaded: boolean;
      type: string | null;
    };
  };
}

// Add to your api.ts file
interface CheckInData {
  department: string;
  chief_complaint: string;
  predicted_duration?: number;
}

interface Facility {
  id: string;
  name: string;
  type: string;
  province: string;
  createdAt?: string;
  updatedAt?: string;
  Wards?: Ward[];
}

interface Ward {
  id: string;
  ward_name: string;
  department: string;
  ward_type: string;
  facility_id: string;
  total_beds?: number;
  occupied_beds?: number;
  available_beds?: number;
  Beds?: Bed[];
  Facility?: Facility;
}

interface Bed {
  id: string;
  bed_number: string;
  bed_status: 'available' | 'occupied' | 'maintenance' | 'cleaning';
  bed_type: string;
  ward_id: string;
  maintenance_notes?: string;
  last_cleaned?: string;
  createdAt?: string;
  updatedAt?: string;
  Ward?: Ward;
  Visits?: Visit[];
}

interface BedAssignmentRequest {
  visit_id: string;
  patient_id: string;
}

interface BedStatusUpdateRequest {
  bed_status: 'available' | 'occupied' | 'maintenance' | 'cleaning';
  maintenance_notes?: string;
}

interface FacilityStats {
  department: string;
  total_beds: number;
  occupied_beds: number;
  available_beds: number;
}
// Add this interface with your other interfaces
interface TreatmentData {
  visit_id: string;
  treatment_type: string;
  description: string;
  medications?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>;
  observations?: string;
}

interface TreatmentResponse {
  status: string;
  message: string;
  data: {
    id: string;
    visit_id: string;
    treatment_type: string;
    description: string;
    created_at: string;
  };
}
// ==========================================
// 👇 USER MANAGEMENT METHODS
// ==========================================

interface UserData {
  id: string;
  username: string;
  email: string;
  role: "admin" |"clerk"| "nurse" | "doctor";
  first_name?: string;
  last_name?: string;
  facility_id?: string;
}

interface GetUsersResponse {
  status: string;
  data: UserData[];
}

interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role?: "admin"| "clerk" | "nurse" | "doctor";
  first_name?: string;
  last_name?: string;
  facility_id?: string;
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('authToken');
    }
  }

  /**
   * 🔐 Helper: Handle logout and redirect on token error
   */
  private handleAuthError() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
  }

  /**
   * 🧠 Helper: Check if token is expired (JWT exp claim)
   */
  private isTokenExpired(token: string): boolean {
    try {
      const [, payload] = token.split('.');
      const decoded = JSON.parse(atob(payload));
      if (!decoded.exp) return false;
      return Date.now() >= decoded.exp * 1000;
    } catch {
      return true;
    }
  }

  /**
   * 🧰 Base request method for all API calls
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('authToken');
    }

    if (this.token && this.isTokenExpired(this.token)) {
      console.warn('Token expired locally. Logging out...');
      this.handleAuthError();
      throw new Error('Token expired');
    }

    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 401 || response.status === 403) {
        console.warn('Token expired or invalid from backend. Logging out...');
        this.handleAuthError();
        throw new Error('Invalid or expired token');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // ============================================================================
  // 👇 AUTH METHODS
  // ============================================================================

  async getUsers(): Promise<GetUsersResponse> {
    return this.request<GetUsersResponse>("/auth/users", { method: "GET" });
  }

  async createUser(userData: CreateUserRequest): Promise<{ status: string; message: string }> {
    return this.request<{ status: string; message: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: Partial<CreateUserRequest>): Promise<{ status: string; message: string }> {
    return this.request<{ status: string; message: string }>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string): Promise<{ status: string; message: string }> {
    return this.request<{ status: string; message: string }>(`/users/${id}`, {
      method: "DELETE",
    });
  }

  async getUser(id: string): Promise<{ status: string; data: UserData }> {
    return this.request<{ status: string; data: UserData }>(`/users/${id}`, { method: "GET" });
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.data?.token) {
      this.token = response.data.token;
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userData', JSON.stringify(response.data.user));
      }
    }

    return response;
  }

  async register(userData: RegisterRequest) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getProfile() {
    return this.request('/auth/profile', { method: 'GET' });
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.handleAuthError();
    }
  }

  // ============================================================================
  // 👇 PATIENT METHODS
  // ============================================================================

  async getPatients(params?: {
    page?: number;
    limit?: number;
    search?: string;
    gender?: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });
    }
    return this.request(`/patients${queryParams.toString() ? `?${queryParams}` : ''}`, {
      method: 'GET',
    });
  }

  async registerPatient(patientData: any) {
    return this.request('/patients/register', {
      method: 'POST',
      body: JSON.stringify(patientData),
    });
  }

  async getPatient(id: string) {
    return this.request(`/patients/${id}`, { method: 'GET' });
  }

  async updatePatient(id: string, patientData: any) {
    return this.request(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patientData),
    });
  }

  async getcheckInPatient(patientId: string, visitData: CheckInData): Promise<ApiResponse<CheckInResponse>> {
   const token = localStorage.getItem('authToken');

    return this.request<ApiResponse<CheckInResponse>>(`/visits/checkin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(visitData),
    });
  }

  // Check-in patient - FIXED VERSION
  async checkInPatient(patientId: string, visitData: any): Promise<ApiResponse<CheckInResponse>> {
    const token = localStorage.getItem('authToken');

    return this.request<ApiResponse<CheckInResponse>>(`/patients/${patientId}/checkin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Make sure this is included!
      },
      body: JSON.stringify(visitData),
    });
  }

  async checkOutPatient(patientId: string, visitId?: string): Promise<CheckOutResponse> {
    return this.request<CheckOutResponse>(`/patients/${patientId}/checkout`, {
      method: 'PUT',
      body: JSON.stringify({ visit_id: visitId }),
    });
  }

  async updateVisitStatus(visitId: string, status: string) {
    console.log('API Service: Updating visit status for', visitId, 'to', status);
    
    if (!status) {
      console.error('Status is undefined!');
      throw new Error('Status cannot be undefined');
    }
    
    return this.request(`/visits/${visitId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async saveConsultation(consultationData: any) {
    return this.request('/consultations', {
      method: 'POST',
      body: JSON.stringify(consultationData),
    });
  }

  async saveDiagnosisDraft(visitId: string, draftData: any) {
    return this.request(`/visits/${visitId}/diagnosis/draft`, {
      method: 'POST',
      body: JSON.stringify(draftData),
    });
  }

  
  async searchPatients(query: string): Promise<SearchPatientsResponse> {
    return this.request<SearchPatientsResponse>(`/patients/search/${encodeURIComponent(query)}`);
  }

  // ============================================================================
  // 👇 TRIAGE METHODS
  // ============================================================================

  async createTriage(triageData: {
    patient_id: string | null;
    visit_id: string | null;
    symptoms: string[];
    vital_signs: any;
    triage_notes: string;
    manual_priority: string | undefined;
  }): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/triage/assess', {
      method: 'POST',
      body: JSON.stringify(triageData),
    });
  }

  async getTriageQueue(params?: { department?: string; priority?: string }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => value && queryParams.append(key, value));
    }
    return this.request(`/triage/queue${queryParams.toString() ? `?${queryParams}` : ''}`, {
      method: 'GET',
    });
  }

  async getTriage(id: string): Promise<ApiResponse<any>> {
    const response = await this.request<ApiResponse<any>>(`/triage/${id}`, { method: 'GET' });

    if (response?.data) {
      const triageData = response.data;

      if (typeof triageData.vital_signs === 'string') {
        try {
          triageData.vital_signs = JSON.parse(triageData.vital_signs);
        } catch (err) {
          console.warn('Failed to parse vital_signs JSON:', err);
        }
      }

      if (typeof triageData.symptoms === 'string') {
        try {
          triageData.symptoms = JSON.parse(triageData.symptoms);
        } catch (err) {
          console.warn('Failed to parse symptoms JSON:', err);
        }
      }
    }

    return response;
  }

  async updateTriagePriority(id: string, priority_level: string, triage_notes?: string) {
    return this.request(`/triage/${id}/priority`, {
      method: 'PUT',
      body: JSON.stringify({ priority_level, triage_notes }),
    });
  }

  async getTriageStats(params?: { period?: string; department?: string }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => value && queryParams.append(key, value));
    }
    return this.request(`/triage/stats/summary${queryParams.toString() ? `?${queryParams}` : ''}`, {
      method: 'GET',
    });
  }

  async getPendingTriagePatients(): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/triage/pending', {
      method: 'GET',
    });
  }

  async getTriageByVisit(visitId: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/triage/visit/${visitId}`, {
      method: 'GET',
    });
  }

  // ============================================================================
  // 👇 ANALYTICS & AI METHODS
  // ============================================================================

  async getDashboardStats() {
    return this.request('/analytics/dashboard-metrics', { method: 'GET' });
  }

  async predictTriage(triageData: { symptoms: string[], vital_signs: any }) {
    return this.request('/ai/predict-triage', {
      method: 'POST',
      body: JSON.stringify(triageData),
    });
  }

  async predictPatientFlow(params?: { date?: string; department?: string }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
    }
    return this.request(`/ai/predict-patient-flow${queryParams.toString() ? `?${queryParams}` : ''}`, {
      method: 'GET',
    });
  }

  async predictWaitTime(data: { priority_level: string; department: string; symptoms?: string[] }) {
    return this.request('/ai/predict-wait-time', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

async forecastResources(params?: { date?: string; department?: string }) {
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
  }

  const token = localStorage.getItem('authToken'); // ensure it matches the key you store the token under

  return this.request(`/ai/forecast-resources${queryParams.toString() ? `?${queryParams}` : ''}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

  async assessRisk(riskData: { 
    patient_id?: string;
    symptoms: string[];
    vital_signs: any;
    medical_history?: any;
    age: number;
  }) {
    return this.request('/ai/assess-risk', {
      method: 'POST',
      body: JSON.stringify(riskData),
    });
  }

  // ============================================================================
  // 🤖 RESOURCE ALLOCATION METHODS (NEW - ML SERVICE)
  // ============================================================================

  /**
   * Predict staffing needs for a specific date
   */
  async predictStaffing(
    date: string, 
    department: string, 
    expectedVisits?: number
  ): Promise<{ status: string; data: StaffingPrediction }> {
    return this.request<{ status: string; data: StaffingPrediction }>(
      '/resources/predict/staffing',
      {
        method: 'POST',
        body: JSON.stringify({
          date,
          department,
          expectedVisits
        })
      }
    );
  }

  /**
   * Predict bed requirements for a specific date
   */
  async predictBeds(
    date: string,
    department: string,
    expectedVisits?: number
  ): Promise<{ status: string; data: BedPrediction }> {
    return this.request<{ status: string; data: BedPrediction }>(
      '/resources/predict/beds',
      {
        method: 'POST',
        body: JSON.stringify({
          date,
          department,
          expectedVisits
        })
      }
    );
  }

  /**
   * Get weekly resource forecast
   */
  async getWeeklyForecast(
    startDate: string,
    department: string,
    baseVisits: number = 50
  ): Promise<{ status: string; data: WeeklyForecast }> {
    return this.request<{ status: string; data: WeeklyForecast }>(
      '/resources/forecast/weekly',
      {
        method: 'POST',
        body: JSON.stringify({
          startDate,
          department,
          baseVisits
        })
      }
    );
  }

  /**
   * Train ML models (admin only)
   */
  async trainModels(): Promise<{ 
    status: string; 
    message: string;
    data: {
      staffing: { accuracy: number; mae: number };
      beds: { accuracy: number; mae: number };
    }
  }> {
    return this.request('/resources/train', {
      method: 'POST'
    });
  }

  /**
   * Get prediction accuracy metrics
   */
  async getResourceAccuracy(): Promise<{
    status: string;
    data: Array<{
      department: string;
      total_predictions: number;
      nurse_mae: number;
      doctor_mae: number;
      bed_mae: number;
    }>;
  }> {
    return this.request('/resources/accuracy', {
      method: 'GET'
    });
  }

  /**
   * Check ML service status
   */
  async getMLStatus(): Promise<{ status: string; data: MLStatus }> {
    return this.request<{ status: string; data: MLStatus }>(
      '/resources/ml-status',
      {
        method: 'GET'
      }
    );
  }

  // ============================================================================
  // 👇 VISITS METHODS
  // ============================================================================

  /**
   * Get all visits with optional filtering and pagination
   */
  async getVisits(params?: {
    page?: number;
    limit?: number;
    status?: string;
    department?: string;
    date?: string;
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.status) queryParams.append('status', params.status);
      if (params.department) queryParams.append('department', params.department);
      if (params.date) queryParams.append('date', params.date);
    }
    
    const endpoint = `/visits${queryParams.toString() ? `?${queryParams}` : ''}`;
    
    return this.request<ApiResponse<any>>(endpoint, {
      method: 'GET',
    });
  }

  /**
   * Get a single visit by ID with all related data
   */
  async getVisit(visitId: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/visits/${visitId}`, {
      method: 'GET',
    });
  }

  /**
   * Get visits filtered by status
   */
  async getVisitsByStatus(
    status: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<any>> {
    return this.getVisits({ status, page, limit });
  }

  /**
   * Get checkout visits for today
   */
  async getTodayCheckouts(limit: number = 20): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(
      `/visits/today/checkout?limit=${limit}`,
      { method: 'GET' }
    );
  }

  /**
   * Get visit statistics for a date range
   */
  async getVisitStats(
    startDate: string,
    endDate: string,
    department?: string
  ): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    params.append('startDate', startDate);
    params.append('endDate', endDate);
    if (department) params.append('department', department);
    
    return this.request<ApiResponse<any>>(
      `/visits/stats?${params}`,
      { method: 'GET' }
    );
  }
// ============================================================================
// 👇 TREATMENT METHODS
// ============================================================================

/**
 * Save treatment record
 */
async saveTreatment(treatmentData: {
  visit_id: string;
  treatment_type: string;
  description: string;
  medications?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>;
  observations?: string;
}): Promise<ApiResponse<any>> {
  return this.request<ApiResponse<any>>('/treatments', {
    method: 'POST',
    body: JSON.stringify(treatmentData),
  });
}
  // ============================================================================
  // 👇 FACILITY & BED MANAGEMENT METHODS
  // ============================================================================

  /**
   * Get all facilities with ward and bed information
   */
  async getFacilities(): Promise<ApiResponse<Facility[]>> {
    return this.request<ApiResponse<Facility[]>>('/facilities', {
      method: 'GET',
    });
  }

  /**
   * Get single facility by ID with detailed information
   */
  async getFacility(facilityId: string): Promise<ApiResponse<Facility>> {
    return this.request<ApiResponse<Facility>>(`/facilities/${facilityId}`, {
      method: 'GET',
    });
  }

  /**
   * Create new facility
   */
  async createFacility(facilityData: {
    name: string;
    type: string;
    province: string;
  }): Promise<ApiResponse<Facility>> {
    return this.request<ApiResponse<Facility>>('/facilities', {
      method: 'POST',
      body: JSON.stringify(facilityData),
    });
  }

  /**
   * Get facility statistics
   */
  async getFacilityStats(facilityId: string): Promise<ApiResponse<FacilityStats[]>> {
    return this.request<ApiResponse<FacilityStats[]>>(`/facilities/${facilityId}/stats`, {
      method: 'GET',
    });
  }

  /**
   * Get all beds with optional filtering
   */
  async getBeds(params?: {
    status?: string;
    ward_id?: string;
    bed_type?: string;
  }): Promise<ApiResponse<Bed[]>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
    }
    
    return this.request<ApiResponse<Bed[]>>(
      `/beds${queryParams.toString() ? `?${queryParams}` : ''}`,
      { method: 'GET' }
    );
  }

  /**
   * Get available beds for patient admission
   */
  async getAvailableBeds(params?: {
    department?: string;
    bed_type?: string;
    facility_id?: string;
  }): Promise<ApiResponse<Bed[]>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
    }
    
    return this.request<ApiResponse<Bed[]>>(
      `/beds/available${queryParams.toString() ? `?${queryParams}` : ''}`,
      { method: 'GET' }
    );
  }

  /**
   * Assign patient to bed (admission)
   */
  async assignBed(bedId: string, assignmentData: BedAssignmentRequest): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/beds/${bedId}/assign`, {
      method: 'POST',
      body: JSON.stringify(assignmentData),
    });
  }

  /**
   * Free up a bed (discharge/transfer)
   */
  async freeBed(bedId: string, data: { visit_id: string }): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/beds/${bedId}/free`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update bed status (maintenance, cleaning, etc.)
   */
  async updateBedStatus(bedId: string, statusData: BedStatusUpdateRequest): Promise<ApiResponse<Bed>> {
    return this.request<ApiResponse<Bed>>(`/beds/${bedId}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
    });
  }

  /**
   * Get bed history (which patients used this bed)
   */
  async getBedHistory(bedId: string): Promise<ApiResponse<any[]>> {
    return this.request<ApiResponse<any[]>>(`/beds/${bedId}/history`, {
      method: 'GET',
    });
  }
}

// ============================================================================
// 💡 INSTANTIATE AND EXPORT
// ============================================================================

export const apiService = new ApiService();

// ============================================================================
// 💾 EXPORT TYPES
// ============================================================================

export interface Patient {
  id: string;
  patient_number: string;
  first_name: string;
  last_name: string;
  id_number: string;
  date_of_birth?: string;
  gender?: string;
  phone?: string;
  address?: string;
  medical_history?: any;
  allergies?: string[];
  created_at?: string;
}

export interface PatientRegistrationResponse {
  patient: Patient;
}

export type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  StaffingPrediction,
  BedPrediction,
  WeeklyForecast,
  MLStatus,
  Facility,
  Ward,
  Bed,
  Visit,
  BedAssignmentRequest,
  BedStatusUpdateRequest,
  FacilityStats
};