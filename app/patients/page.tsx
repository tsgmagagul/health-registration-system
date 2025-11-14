"use client"

import { useState, useEffect, ReactNode } from 'react';
import { ChevronDown, ChevronUp, Calendar, Clock, User, AlertCircle, Download, Filter } from 'lucide-react';

interface TriageData {
  id: string;
  priority_level: string;
  ai_risk_score: number;
  current_wait_time?: number;
  predicted_wait_time?: number;
}

interface PatientData {
  id: string;
  first_name: string;
  last_name: string;
  patient_number: string;
  date_of_birth?: string;
  gender?: string;
}

interface VisitData {
  id: string;
  status: string;
  department: string;
  check_in_time: string;
  check_out_time?: string;
  patient_id: string;
  chief_complaint?: string;
  Patient?: PatientData;
  Triage?: TriageData;
}

interface PaginationData {
  current_page: number;
  total_pages: number;
  total_records: number;
}

interface VisitsResponse {
  visits: VisitData[];
  pagination: PaginationData;
}

export default function PatientCheckoutDashboard(): ReactNode {
  const [visits, setVisits] = useState<VisitData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<string>('today');
  const limit = 10;

  useEffect(() => {
    fetchVisits();
  }, [currentPage, statusFilter, departmentFilter, dateRange]);

  const fetchVisits = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const { apiService } = await import('@/lib/api');

      const response = await apiService.getVisits({
        page: currentPage,
        limit,
        status: statusFilter || undefined,
        department: departmentFilter || undefined,
      });

      if (response?.data) {
        const data = response.data as VisitsResponse;
        setVisits(data.visits || []);
        if (data.pagination) {
          setTotalPages(data.pagination.total_pages);
          setTotalRecords(data.pagination.total_records);
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load patient data';
      setError(errorMessage);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const calculateWaitTime = (checkIn: string | undefined, checkOut: string | undefined): string => {
    if (!checkIn || !checkOut) return 'N/A';
    const minutes = Math.round(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 60000
    );
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getRiskBadgeColor = (score: number | undefined): string => {
    const numScore = score ?? 0;
    if (numScore >= 7) return 'bg-red-100 text-red-800 border border-red-300';
    if (numScore >= 5) return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
    return 'bg-green-100 text-green-800 border border-green-300';
  };

  const getPriorityBadgeColor = (level: string | undefined): string => {
    const colors: Record<string, string> = {
      critical: 'bg-red-100 text-red-800 border border-red-300',
      high: 'bg-orange-100 text-orange-800 border border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
      low: 'bg-green-100 text-green-800 border border-green-300',
    };
    return colors[level?.toLowerCase() ?? ''] || 'bg-gray-100 text-gray-800 border border-gray-300';
  };

  const getStatusBadge = (status: string | undefined): string => {
    const colors: Record<string, string> = {
      completed: 'bg-green-100 text-green-800 border border-green-300',
      cancelled: 'bg-red-100 text-red-800 border border-red-300',
      in_progress: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
      waiting: 'bg-blue-100 text-blue-800 border border-blue-300',
    };
    return colors[status ?? ''] || 'bg-gray-100 text-gray-800 border border-gray-300';
  };

  const downloadCSV = (): void => {
    if (visits.length === 0) return;

    const headers = ['Patient Name', 'Patient #', 'Check-In', 'Check-Out', 'Wait Time', 'Priority', 'Risk Score', 'Department', 'Status'];
    const rows = visits.map(v => [
      `${v.Patient?.first_name ?? ''} ${v.Patient?.last_name ?? ''}`,
      v.Patient?.patient_number ?? 'N/A',
      formatTime(v.check_in_time),
      formatTime(v.check_out_time),
      calculateWaitTime(v.check_in_time, v.check_out_time),
      v.Triage?.priority_level ?? 'N/A',
      (v.Triage?.ai_risk_score ?? 0).toFixed(1),
      v.department ?? 'N/A',
      v.status,
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patients-checkout-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Patient Checkout Dashboard
          </h1>
          <p className="text-slate-600">
            Manage and track patient visits for today
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <p className="text-slate-600 text-sm font-medium">Total Seen Today</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{totalRecords}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <p className="text-slate-600 text-sm font-medium">Current Page</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{currentPage} of {totalPages}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <p className="text-slate-600 text-sm font-medium">Showing</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{visits.length} patients</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-slate-700" />
            <h3 className="text-lg font-semibold text-slate-900">Filters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="in_progress">In Progress</option>
                <option value="waiting">Waiting</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Department
              </label>
              <select
                value={departmentFilter}
                onChange={(e) => {
                  setDepartmentFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">All Departments</option>
                <option value="emergency">Emergency</option>
                <option value="outpatient">Outpatient</option>
                <option value="inpatient">Inpatient</option>
                <option value="specialist">Specialist</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => {
                  setDateRange(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={fetchVisits}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Refresh
              </button>
              <button
                onClick={downloadCSV}
                disabled={visits.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition"
                title="Download as CSV"
              >
                <Download size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="inline-block">
              <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <p className="text-slate-600 mt-4">Loading patient data...</p>
          </div>
        )}

        {/* Table */}
        {!loading && visits.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Patient</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Patient #</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Check-In</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Check-Out</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Wait Time</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Priority</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Risk Score</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {visits.map((visit) => (
                    <tr key={visit.id} className="border-b border-slate-200 hover:bg-slate-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User size={18} className="text-slate-400" />
                          <span className="font-medium text-slate-900">
                            {visit.Patient?.first_name ?? ''} {visit.Patient?.last_name ?? ''}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-sm">{visit.Patient?.patient_number ?? 'N/A'}</td>
                      <td className="px-6 py-4 text-slate-600 text-sm">{formatTime(visit.check_in_time)}</td>
                      <td className="px-6 py-4 text-slate-600 text-sm">
                        {visit.check_out_time ? formatTime(visit.check_out_time) : '—'}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {calculateWaitTime(visit.check_in_time, visit.check_out_time)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityBadgeColor(visit.Triage?.priority_level)}`}>
                          {visit.Triage?.priority_level ?? 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskBadgeColor(visit.Triage?.ai_risk_score)}`}>
                          {(visit.Triage?.ai_risk_score ?? 0).toFixed(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(visit.status)}`}>
                          {visit.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setExpandedRow(expandedRow === visit.id ? null : visit.id)}
                          className="text-blue-600 hover:text-blue-800 transition"
                        >
                          {expandedRow === visit.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Expanded Details */}
            {expandedRow && (
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
                {visits
                  .filter((v) => v.id === expandedRow)
                  .map((visit) => (
                    <div key={visit.id} className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-slate-600 font-medium">Visit ID</p>
                          <p className="font-mono text-sm text-slate-900">{visit.id}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600 font-medium">Department</p>
                          <p className="font-semibold text-slate-900">{visit.department ?? 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600 font-medium">Gender</p>
                          <p className="font-semibold text-slate-900">{visit.Patient?.gender ?? 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600 font-medium">DOB</p>
                          <p className="font-semibold text-slate-900">{formatDate(visit.Patient?.date_of_birth)}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 font-medium mb-1">Chief Complaint</p>
                        <p className="text-slate-900">{visit.chief_complaint ?? 'Not recorded'}</p>
                      </div>
                      {visit.Triage?.predicted_wait_time && (
                        <div>
                          <p className="text-xs text-slate-600 font-medium">Predicted Wait Time</p>
                          <p className="font-semibold text-slate-900">{visit.Triage.predicted_wait_time} minutes</p>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!loading && visits.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Calendar className="mx-auto text-slate-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No patients found</h3>
            <p className="text-slate-600">Try adjusting your filters or refresh the page</p>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-slate-200 text-slate-900 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 transition font-medium"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5 && currentPage > 3) pageNum = currentPage - 2 + i;
                if (pageNum > totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 rounded-lg transition font-medium ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-slate-200 text-slate-900 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 transition font-medium"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}