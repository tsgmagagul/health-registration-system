// lib/types.ts
export interface Patient {
  id: string;
  patient_id: string
  patient_number: string;
  first_name: string;
  last_name: string;
  id_number: string;
  date_of_birth: string;
  gender: string;
  phone: string;
  address: string;
  medical_history: any;
  allergies: string[];
  created_at: string;
}

export interface Visit {
  id: string;
  patient_id: string;
  department: string;
  chief_complaint: string;
  status: string;
  check_in_time: string;
  check_out_time?: string;
  Patient: Patient;       // ✅ added
  Triage?: {
    priority_level: string;
    ai_risk_score?: number;
  };
}


export interface ApiResponse<T> {
  status: string;
  message?: string;
  data: T;
  timestamp?: string;
}

// types.ts or inside the component file
export interface SearchPatientsResponse {
  status: 'success' | 'error'
  data: {
    patients: Patient[]
  }
}

// export interface CheckInResponse {
//   visit: Visit;
//   patient: Patient;
// }

export interface CheckInResponse {
  visit: {
    id: string;
    status: string;
    department: string;
    check_in_time: string;
    patient_id: string;
    chief_complaint: string;
    predicted_duration?: number;
    patient: {
      id: string;
      first_name: string;
      last_name: string;
      patient_number: string;
      date_of_birth: string;
      gender: string;
    };
  };
}

export interface TriageResult {
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  priority: number;
  estimatedWaitTime: string;
  recommendedAction: string;
  department: string;
}


// lib/types.ts
export interface CheckOutResponse {
  status: 'success' | 'error';
  message?: string;
  data: {
    visit: Visit; // Using your existing Visit type
  };
  timestamp?: string;
}


// Add to your types.ts file
export interface Facility {
  id: string;
  name: string;
  type: string;
  province: string;
  createdAt?: string;
  updatedAt?: string;
  Wards?: Ward[];
}

export interface Ward {
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

export interface Bed {
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

export interface BedAssignmentRequest {
  visit_id: string;
  patient_id: string;
}

export interface BedStatusUpdateRequest {
  bed_status: 'available' | 'occupied' | 'maintenance' | 'cleaning';
  maintenance_notes?: string;
}

export interface FacilityStats {
  department: string;
  total_beds: number;
  occupied_beds: number;
  available_beds: number;
}

interface TriageQueueResponse {
  status: string;
  data: {
    queue: { priority_level: string }[];
  };
}

interface TriageStatsResponse {
  status: string;
  data: {
    department_stats?: { department: string; avg_wait_time: number }[];
  };
}

interface FlowResponse {
  status: string;
  data: {
    weekly_predictions?: {
      date: string;
      actual_visits?: number;
      predicted_visits: number;
    }[];
  };
}



