// hooks/useAdminAnalytics.ts - Fixed with all missing exports
"use client"

import { useState, useEffect } from 'react'

// ✅ Helper to safely get auth token only on client
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('authToken')
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api'


// ✅ Helper for API requests with proper error handling
async function apiRequest(endpoint: string, options: RequestInit = {}) {
 const token = getAuthToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  }

  // add Authorization only when token present
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const url = `${API_URL}${endpoint}`
  // helpful debug print so you can watch traffic in the browser console
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line no-console
    console.debug('[apiRequest]', options.method ?? 'GET', url, token ? 'with token' : 'no token')
  }

  const res = await fetch(url, {
    ...options,
    headers
  })

  // try read response json safely
  const text = await res.text()
  let json: any = null
  try {
    json = text ? JSON.parse(text) : {}
  } catch (err) {
    json = { message: text }
  }

  if (!res.ok) {
    const message = json?.message || json?.error || `Request failed: ${res.status}`
    throw new Error(message)
  }

  return json
}

export function useDashboardMetrics(enabled = true, refreshInterval?: number) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = async () => {
    if (!enabled || typeof window === 'undefined') return

    try {
      setLoading(true)
      const response = await apiRequest('/analytics/dashboard-metrics')
      setData(response.data)
      setError(null)
    } catch (err: any) {
      console.error('Dashboard metrics error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()

    if (refreshInterval) {
      const interval = setInterval(fetchMetrics, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [enabled, refreshInterval])

  return { data, loading, error, refetch: fetchMetrics }
}

// ✅ NEW: useTriageStatistics
export function useTriageStatistics(period: string = 'today', enabled = true) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await apiRequest(`/analytics/triage-statistics?period=${period}`)
        setData(response.data)
        setError(null)
      } catch (err: any) {
        console.error('Triage statistics error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [period, enabled])

  return { data, loading, error }
}

// ✅ NEW: useQueueStatus
export function useQueueStatus(
  department?: string, 
  priority?: string, 
  enabled = true, 
  refreshInterval?: number
) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchQueue = async () => {
    if (!enabled || typeof window === 'undefined') return

    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (department) params.append('department', department)
      if (priority) params.append('priority', priority)
      
      const response = await apiRequest(`/analytics/queue-status?${params}`)
      setData(response.data)
      setError(null)
    } catch (err: any) {
      console.error('Queue status error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQueue()

    if (refreshInterval) {
      const interval = setInterval(fetchQueue, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [department, priority, enabled, refreshInterval])

  return { data, loading, error }
}

export function useResourceForecast(date: string, department: string, enabled = true) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchForecast = async () => {
    if (!enabled || typeof window === 'undefined') return

    try {
      setLoading(true)
      const params = new URLSearchParams({ date, department })
      const response = await apiRequest(`/ai/forecast-resources?${params}`)
      setData(response.data)
      setError(null)
    } catch (err: any) {
      console.error('Resource forecast error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchForecast()
  }, [date, department, enabled])

  return { data, loading, error, refetch: fetchForecast }
}

export function useBedOccupancyReport(enabled = true) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    const fetchReport = async () => {
      try {
        setLoading(true)
        const response = await apiRequest('/analytics/bed-occupancy')
        setData(response.data)
        setError(null)
      } catch (err: any) {
        console.error('Bed occupancy error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [enabled])

  return { data, loading, error }
}

export function useWeeklyForecast(
  startDate: string,
  department: string,
  baseVisits: number,
  enabled = true
) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // <-- declare here
  const fetchForecast = async () => {
    if (!enabled || typeof window === 'undefined') return
    try {
      setLoading(true)
      const response = await apiRequest('/ml/forecast/weekly', {
        method: 'POST',
        body: JSON.stringify({
          start_date: startDate,
          department,
          base_visits: baseVisits
        })
      })
      setData(response.data)
      setError(null)
    } catch (err: any) {
      console.error('Weekly forecast error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchForecast()
  }, [startDate, department, baseVisits, enabled])

  return { data, loading, error, refetch: fetchForecast } // ✅ now in scope
}

export function useStaffingReport(date: string, department: string, enabled = true) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    const fetchReport = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams({ date, department })
        const response = await apiRequest(`/analytics/staffing-report?${params}`)
        setData(response.data)
        setError(null)
      } catch (err: any) {
        console.error('Staffing report error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [date, department, enabled])

  return { data, loading, error }
}

export function useMLServiceStatus(enabled = true) {
  const [data, setData] = useState<{
    service: any
    models: { staffing: any; beds: any }
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    const fetchStatus = async () => {
      try {
        setLoading(true)
        const response = await apiRequest('/ml/models/status')
        setData(response)
        setError(null)
      } catch (err: any) {
        console.error('ML service status error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
  }, [enabled])

  return { data, loading, error }
}

export function useTrainMLModels() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const trainModels = async () => {
    if (typeof window === 'undefined') return

    try {
      setLoading(true)
      setSuccess(false)
      
      // First, get training data from backend
      const trainingDataResponse = await apiRequest('/analytics/training-data')
      
      // Send to ML service for training
      const response = await apiRequest('/ml/train', {
        method: 'POST',
        body: JSON.stringify({ data: trainingDataResponse.data })
      })
      
      setSuccess(true)
      setError(null)
      console.log('✅ Models trained successfully:', response)
    } catch (err: any) {
      console.error('❌ Training failed:', err)
      setError(err.message)
      setSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  return { trainModels, loading, success, error }
}