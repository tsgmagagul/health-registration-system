// services/adminAnalytics.ts
import { apiService } from '@/lib/api';

/**
 * Admin Analytics Service
 * Handles all analytics and reporting for admin dashboard
 */

// ==================== TYPE DEFINITIONS ====================

export interface DashboardMetrics {
  today: {
    total_visits: number;
    waiting_patients: number;
    completed_visits: number;
    critical_cases: number;
  };
  last_updated: string;
}

export interface PatientFlowPrediction {
  prediction_date: string;
  predicted_volume: number;
  confidence_interval: {
    lower: number;
    upper: number;
  };
  hourly_distribution: Array<{
    hour: string;
    predicted_patients: number;
  }>;
  peak_hours: string[];
  model_accuracy: number;
  historical_average: number;
}

export interface ResourceForecast {
  forecast_date: string;
  staffing: {
    nurses: number;
    doctors: number;
    admin_staff: number;
  };
  equipment: {
    beds: number;
    examination_rooms: number;
    medical_equipment: {
      vital_sign_monitors: number;
      examination_equipment: number;
    };
  };
  hourly_breakdown: Array<{
    hour: string;
    predicted_patients: number;
    nurses_needed: number;
    doctors_needed: number;
  }>;
  peak_demand_hours: string[];
  confidence: number;
  recommendations: string[];
}

export interface TriageStatistics {
  total_assessments: number;
  by_priority: {
    critical: number;
    urgent: number;
    semi_urgent: number;
    standard: number;
    non_urgent: number;
  };
  average_wait_time: number;
  department_breakdown: Array<{
    department: string;
    count: number;
    avg_wait_time: number;
  }>;
}

export interface VisitStatistics {
  total_visits: number;
  by_status: {
    waiting: number;
    in_progress: number;
    completed: number;
    cancelled: number;
    admitted: number;
  };
  by_department: Array<{
    department: string;
    count: number;
    avg_duration: number;
  }>;
  trends: Array<{
    date: string;
    visits: number;
  }>;
}

export interface BedOccupancyReport {
  total_beds: number;
  occupied_beds: number;
  available_beds: number;
  occupancy_rate: number;
  by_ward: Array<{
    ward_name: string;
    department: string;
    total_beds: number;
    occupied: number;
    available: number;
    occupancy_rate: number;
  }>;
  by_bed_type: Array<{
    bed_type: string;
    total: number;
    occupied: number;
    available: number;
  }>;
}

export interface StaffingReport {
  current_staff: {
    nurses: number;
    doctors: number;
    admin: number;
    total: number;
  };
  required_staff: {
    nurses: number;
    doctors: number;
    admin: number;
    total: number;
  };
  staffing_gap: {
    nurses: number;
    doctors: number;
    admin: number;
  };
  by_department: Array<{
    department: string;
    current: number;
    required: number;
    gap: number;
  }>;
}

export interface ComprehensiveReport {
  generated_at: string;
  period: { start: string; end: string };
  department?: string;
  metrics: {
    dashboard: DashboardMetrics;
    patient_flow: PatientFlowPrediction;
    resources: ResourceForecast;
    triage: TriageStatistics;
    visits: VisitStatistics;
    beds: BedOccupancyReport;
  };
}

export interface WaitTimePrediction {
  priority: string;
  predicted_wait_time: number;
  confidence: number;
  factors: string[];
}

// ==================== CONSTANTS ====================

const PRIORITY_LEVELS = ['critical', 'urgent', 'semi_urgent', 'standard', 'non_urgent'] as const;
type PriorityLevel = typeof PRIORITY_LEVELS[number];

const DEFAULT_PERIOD = 'today' as const;

// ==================== SERVICE CLASS ====================

class AdminAnalyticsService {
  /**
   * Get real-time dashboard metrics
   */
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      const response = await apiService.getDashboardStats();
      return response.data;
    } catch (error) {
      console.error('Failed to fetch dashboard metrics:', error);
      throw new Error('Unable to load dashboard metrics');
    }
  }

  /**
   * Get patient flow predictions for planning
   */
  async getPatientFlowPrediction(
    date?: string,
    department?: string
  ): Promise<PatientFlowPrediction> {
    try {
      const response = await apiService.predictPatientFlow({ date, department });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch patient flow prediction:', error);
      throw new Error('Unable to generate patient flow predictions');
    }
  }

  /**
   * Get resource forecasting (staffing, beds, equipment)
   */
  async getResourceForecast(
    date?: string,
    department?: string
  ): Promise<ResourceForecast> {
    try {
      const response = await apiService.forecastResources({ date, department });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch resource forecast:', error);
      throw new Error('Unable to generate resource forecast');
    }
  }

  /**
   * Get comprehensive triage statistics
   */
  async getTriageStatistics(
    period: 'today' | 'week' | 'month' = DEFAULT_PERIOD,
    department?: string
  ): Promise<TriageStatistics> {
    try {
      const response = await apiService.getTriageStats({ period, department });
      return this.formatTriageStats(response.data);
    } catch (error) {
      console.error('Failed to fetch triage statistics:', error);
      throw new Error('Unable to load triage statistics');
    }
  }

  /**
   * Get visit statistics and trends
   */
  async getVisitStatistics(
    startDate: string,
    endDate: string,
    department?: string
  ): Promise<VisitStatistics> {
    try {
      const response = await apiService.getVisitStats(startDate, endDate, department);
      return this.formatVisitStats(response.data);
    } catch (error) {
      console.error('Failed to fetch visit statistics:', error);
      throw new Error('Unable to load visit statistics');
    }
  }

  /**
   * Get bed occupancy report across all facilities
   */
  async getBedOccupancyReport(facilityId?: string): Promise<BedOccupancyReport> {
    try {
      if (facilityId) {
        const facilityResponse = await apiService.getFacilityStats(facilityId);
        return this.formatBedOccupancy([facilityResponse.data]);
      }
      
      const facilitiesResponse = await apiService.getFacilities();
      return this.aggregateBedOccupancy(facilitiesResponse.data);
    } catch (error) {
      console.error('Failed to fetch bed occupancy report:', error);
      throw new Error('Unable to load bed occupancy data');
    }
  }

  /**
   * Get staffing analysis and requirements
   */
  async getStaffingReport(date?: string, department?: string): Promise<StaffingReport> {
    try {
      const forecast = await this.getResourceForecast(date, department);
      return this.formatStaffingReport(forecast);
    } catch (error) {
      console.error('Failed to generate staffing report:', error);
      throw new Error('Unable to generate staffing report');
    }
  }

  /**
   * Get ML model accuracy metrics
   */
  async getMLAccuracyMetrics() {
    try {
      return await apiService.getResourceAccuracy();
    } catch (error) {
      console.error('Failed to fetch ML accuracy metrics:', error);
      throw new Error('Unable to load ML accuracy metrics');
    }
  }

  /**
   * Get weekly resource forecast for planning
   */
  async getWeeklyResourceForecast(
    startDate: string,
    department: string,
    baseVisits: number = 50
  ) {
    try {
      return await apiService.getWeeklyForecast(startDate, department, baseVisits);
    } catch (error) {
      console.error('Failed to fetch weekly resource forecast:', error);
      throw new Error('Unable to generate weekly forecast');
    }
  }

  /**
   * Get ML service status
   */
  async getMLServiceStatus() {
    try {
      return await apiService.getMLStatus();
    } catch (error) {
      console.error('Failed to fetch ML service status:', error);
      throw new Error('Unable to check ML service status');
    }
  }

  /**
   * Train ML models (admin only)
   */
  async trainMLModels() {
    try {
      return await apiService.trainModels();
    } catch (error) {
      console.error('Failed to train ML models:', error);
      throw new Error('Unable to train ML models');
    }
  }

  /**
   * Get comprehensive analytics report (all metrics combined)
   */
  async getComprehensiveReport(
    startDate: string,
    endDate: string,
    department?: string
  ): Promise<ComprehensiveReport> {
    try {
      const [
        dashboardMetrics,
        patientFlow,
        resourceForecast,
        triageStats,
        visitStats,
        bedOccupancy,
      ] = await Promise.all([
        this.getDashboardMetrics(),
        this.getPatientFlowPrediction(undefined, department),
        this.getResourceForecast(undefined, department),
        this.getTriageStatistics('today', department),
        this.getVisitStatistics(startDate, endDate, department),
        this.getBedOccupancyReport(),
      ]);

      return {
        generated_at: new Date().toISOString(),
        period: { start: startDate, end: endDate },
        department,
        metrics: {
          dashboard: dashboardMetrics,
          patient_flow: patientFlow,
          resources: resourceForecast,
          triage: triageStats,
          visits: visitStats,
          beds: bedOccupancy,
        },
      };
    } catch (error) {
      console.error('Failed to generate comprehensive report:', error);
      throw new Error('Unable to generate comprehensive analytics report');
    }
  }

  /**
   * Get real-time queue status
   */
  async getQueueStatus(department?: string, priority?: string) {
    try {
      return await apiService.getTriageQueue({ department, priority });
    } catch (error) {
      console.error('Failed to fetch queue status:', error);
      throw new Error('Unable to load queue status');
    }
  }

  /**
   * Get wait time predictions for different priority levels
   */
  async getWaitTimePredictions(department: string): Promise<WaitTimePrediction[]> {
    try {
      const predictions = await Promise.all(
        PRIORITY_LEVELS.map(async (priority) => {
          try {
            const response = await apiService.predictWaitTime({
              priority_level: priority,
              department,
              symptoms: [],
            });
            return {
              priority,
              ...response.data,
            };
          } catch (error) {
            console.warn(`Failed to predict wait time for ${priority}:`, error);
            return this.createFallbackWaitTimePrediction(priority);
          }
        })
      );

      return predictions.filter((pred): pred is WaitTimePrediction => pred !== null);
    } catch (error) {
      console.error('Failed to fetch wait time predictions:', error);
      throw new Error('Unable to generate wait time predictions');
    }
  }

  /**
   * Get patient registration trends
   */
  async getRegistrationTrends(months: number = 6) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      const response = await apiService.getVisitStats(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );

      return this.formatRegistrationTrends(response.data);
    } catch (error) {
      console.error('Failed to fetch registration trends:', error);
      throw new Error('Unable to load registration trends');
    }
  }

  // ==================== PRIVATE HELPER METHODS ====================

  private formatTriageStats(data: any): TriageStatistics {
    return {
      total_assessments: data.total || 0,
      by_priority: {
        critical: data.by_priority?.critical || 0,
        urgent: data.by_priority?.urgent || 0,
        semi_urgent: data.by_priority?.semi_urgent || 0,
        standard: data.by_priority?.standard || 0,
        non_urgent: data.by_priority?.non_urgent || 0,
      },
      average_wait_time: data.avg_wait_time || 0,
      department_breakdown: data.by_department || [],
    };
  }

  private formatVisitStats(data: any): VisitStatistics {
    return {
      total_visits: data.total || 0,
      by_status: {
        waiting: data.by_status?.waiting || 0,
        in_progress: data.by_status?.in_progress || 0,
        completed: data.by_status?.completed || 0,
        cancelled: data.by_status?.cancelled || 0,
        admitted: data.by_status?.admitted || 0,
      },
      by_department: data.by_department || [],
      trends: data.trends || [],
    };
  }

  private formatBedOccupancy(stats: any[]): BedOccupancyReport {
    const totals = stats.reduce(
      (acc, dept) => ({
        total: acc.total + dept.total_beds,
        occupied: acc.occupied + dept.occupied_beds,
        available: acc.available + dept.available_beds,
      }),
      { total: 0, occupied: 0, available: 0 }
    );

    const occupancyRate = totals.total > 0 ? (totals.occupied / totals.total) * 100 : 0;

    return {
      total_beds: totals.total,
      occupied_beds: totals.occupied,
      available_beds: totals.available,
      occupancy_rate: Number(occupancyRate.toFixed(2)),
      by_ward: stats.map((dept) => ({
        ward_name: dept.department,
        department: dept.department,
        total_beds: dept.total_beds,
        occupied: dept.occupied_beds,
        available: dept.available_beds,
        occupancy_rate: dept.total_beds > 0 
          ? Number(((dept.occupied_beds / dept.total_beds) * 100).toFixed(2))
          : 0,
      })),
      by_bed_type: [],
    };
  }

  private aggregateBedOccupancy(facilities: any[]): BedOccupancyReport {
    const allWards = facilities.flatMap((f) => f.Wards || []);
    
    const totals = allWards.reduce(
      (acc, ward) => ({
        total: acc.total + (ward.total_beds || 0),
        occupied: acc.occupied + (ward.occupied_beds || 0),
        available: acc.available + (ward.available_beds || 0),
      }),
      { total: 0, occupied: 0, available: 0 }
    );

    const occupancyRate = totals.total > 0 ? (totals.occupied / totals.total) * 100 : 0;

    return {
      total_beds: totals.total,
      occupied_beds: totals.occupied,
      available_beds: totals.available,
      occupancy_rate: Number(occupancyRate.toFixed(2)),
      by_ward: allWards.map((ward) => ({
        ward_name: ward.ward_name,
        department: ward.department,
        total_beds: ward.total_beds || 0,
        occupied: ward.occupied_beds || 0,
        available: ward.available_beds || 0,
        occupancy_rate: ward.total_beds > 0 
          ? Number((((ward.occupied_beds || 0) / ward.total_beds) * 100).toFixed(2))
          : 0,
      })),
      by_bed_type: [],
    };
  }

  private formatStaffingReport(forecast: ResourceForecast): StaffingReport {
    const requiredTotal = forecast.staffing.nurses + forecast.staffing.doctors + forecast.staffing.admin_staff;

    return {
      current_staff: {
        nurses: 0, // Would need actual staff data
        doctors: 0,
        admin: 0,
        total: 0,
      },
      required_staff: {
        nurses: forecast.staffing.nurses,
        doctors: forecast.staffing.doctors,
        admin: forecast.staffing.admin_staff,
        total: requiredTotal,
      },
      staffing_gap: {
        nurses: forecast.staffing.nurses,
        doctors: forecast.staffing.doctors,
        admin: forecast.staffing.admin_staff,
      },
      by_department: [],
    };
  }

  private formatRegistrationTrends(data: any) {
    const trends = data.trends || [];
    return {
      period: 'last_6_months',
      trends,
      total_registrations: data.total || 0,
      growth_rate: this.calculateGrowthRate(trends),
    };
  }

  private calculateGrowthRate(trends: Array<{ visits: number }>): number {
    if (trends.length < 2) return 0;
    
    const first = trends[0].visits || 0;
    const last = trends[trends.length - 1].visits || 0;
    
    return first > 0 ? Number((((last - first) / first) * 100).toFixed(2)) : 0;
  }

  private createFallbackWaitTimePrediction(priority: string): WaitTimePrediction {
    const baseWaitTimes: Record<string, number> = {
      critical: 0,
      urgent: 15,
      semi_urgent: 30,
      standard: 45,
      non_urgent: 60,
    };

    return {
      priority,
      predicted_wait_time: baseWaitTimes[priority] || 30,
      confidence: 0.5,
      factors: ['fallback_estimation'],
    };
  }
}

// ==================== EXPORTS ====================

// Export singleton instance
export const adminAnalyticsService = new AdminAnalyticsService();