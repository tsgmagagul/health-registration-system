// components/predictive-dashboard.tsx
"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, TrendingUp, Users, Clock, AlertTriangle } from "lucide-react"

interface ForecastData {
  hour: string
  predicted_patient_volume: number
  confidence: number
  is_peak_hour: boolean
}

interface StaffingRecommendation {
  hour: string
  recommended_nurses: number
  recommended_doctors: number
  predicted_volume: number
}

export function PredictiveDashboard() {
  const [forecasts, setForecasts] = useState<ForecastData[]>([])
  const [staffing, setStaffing] = useState<StaffingRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchPredictiveData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/analytics/predictive/forecast')
      const data = await response.json()
      
      if (data.status === 'success') {
        setForecasts(data.data.forecasts)
        setStaffing(data.data.staffing_recommendations)
        setLastUpdated(new Date(data.data.generated_at))
      }
    } catch (error) {
      console.error('Failed to fetch predictive data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPredictiveData()
    // Refresh every 15 minutes
    const interval = setInterval(fetchPredictiveData, 15 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const currentHourForecast = forecasts[0]
  const maxVolume = Math.max(...forecasts.map(f => f.predicted_patient_volume))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Predictive Analytics</h2>
          <p className="text-muted-foreground">
            AI-powered forecasts for patient volume and staffing needs
          </p>
        </div>
        <Button onClick={fetchPredictiveData} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {lastUpdated && (
        <p className="text-sm text-muted-foreground">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Current Hour Prediction */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Current Hour Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentHourForecast ? (
              <>
                <div className="text-2xl font-bold">
                  {Math.round(currentHourForecast.predicted_patient_volume)} patients
                </div>
                <div className="flex items-center mt-2">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    currentHourForecast.predicted_patient_volume > 15 
                      ? 'bg-red-500' 
                      : currentHourForecast.predicted_patient_volume > 10
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`} />
                  <span className="text-sm text-muted-foreground">
                    {currentHourForecast.predicted_patient_volume > 15 
                      ? 'High Volume' 
                      : currentHourForecast.predicted_patient_volume > 10
                      ? 'Moderate Volume'
                      : 'Low Volume'}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Confidence: {(currentHourForecast.confidence * 100).toFixed(0)}%
                </div>
              </>
            ) : (
              <div className="text-muted-foreground">Loading...</div>
            )}
          </CardContent>
        </Card>

        {/* Peak Hours Alert */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Peak Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {forecasts.filter(f => f.is_peak_hour).length} hours
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Next peak: {forecasts.find(f => f.is_peak_hour)?.hour.split('T')[1].substring(0, 5) || 'None'}
            </p>
          </CardContent>
        </Card>

        {/* Staffing Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Staffing Needs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {staffing[0] ? (
              <>
                <div className="text-2xl font-bold">
                  {staffing[0].recommended_doctors} doctors
                </div>
                <div className="text-sm text-muted-foreground">
                  {staffing[0].recommended_nurses} nurses recommended
                </div>
              </>
            ) : (
              <div className="text-muted-foreground">Loading...</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Forecast Table */}
      <Card>
        <CardHeader>
          <CardTitle>8-Hour Patient Volume Forecast</CardTitle>
          <CardDescription>
            Predicted patient arrivals and recommended staffing levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Time</th>
                  <th className="text-right py-2">Predicted Patients</th>
                  <th className="text-right py-2">Confidence</th>
                  <th className="text-right py-2">Doctors Needed</th>
                  <th className="text-right py-2">Nurses Needed</th>
                  <th className="text-center py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {forecasts.map((forecast, index) => {
                  const staff = staffing[index]
                  return (
                    <tr key={forecast.hour} className="border-b">
                      <td className="py-2">
                        {new Date(forecast.hour).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </td>
                      <td className="text-right py-2">
                        {Math.round(forecast.predicted_patient_volume)}
                      </td>
                      <td className="text-right py-2">
                        {(forecast.confidence * 100).toFixed(0)}%
                      </td>
                      <td className="text-right py-2">
                        {staff?.recommended_doctors || '-'}
                      </td>
                      <td className="text-right py-2">
                        {staff?.recommended_nurses || '-'}
                      </td>
                      <td className="text-center py-2">
                        {forecast.is_peak_hour ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Peak
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Normal
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}