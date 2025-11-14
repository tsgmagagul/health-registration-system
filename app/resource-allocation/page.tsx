"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Brain, Users, Stethoscope, Bed, Clock } from "lucide-react"
import { apiService } from "@/lib/api"

interface ResourceForecast {
  forecast_date: string
  staffing: {
    nurses: number
    doctors: number
    admin_staff: number
  }
  equipment: {
    beds: number
    examination_rooms: number
    medical_equipment: {
      vital_sign_monitors: number
      examination_equipment: number
    }
  }
  hourly_breakdown: Array<{
    hour: string
    predicted_patients: number
    nurses_needed: number
    doctors_needed: number
  }>
  peak_demand_hours: string[]
  confidence: number
  recommendations: string[]
}

export default function ResourceAllocationPage() {
  const [userData, setUserData] = useState<any>(null)
  const [resourceForecast, setResourceForecast] = useState<ResourceForecast | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedData = localStorage.getItem("userData")
    if (storedData) {
      const data = JSON.parse(storedData)
      setUserData(data)
    } else {
      router.push("/login")
    }
  }, [router])

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        setLoading(true)

        // Get tomorrow's date
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        const tomorrowStr = tomorrow.toISOString().split('T')[0]

        // Get weekly forecast
        const today = new Date().toISOString().split('T')[0]
        const forecastResult = await apiService.getWeeklyForecast(
          today,
          'emergency',
          50
        )
        setResourceForecast(forecastResult.data)

      } catch (error) {
        console.error('Failed to fetch predictions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPredictions()
  }, [])

  if (!userData) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <Users className="w-12 h-12 animate-pulse mx-auto text-blue-600" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">AI Resource Allocation</h1>
            <p className="text-muted-foreground">Smart staffing and equipment forecasting</p>
          </div>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Brain className="w-12 h-12 animate-pulse mx-auto text-blue-600" />
              <p className="text-muted-foreground mt-4">Loading AI predictions...</p>
            </div>
          </CardContent>
        </Card>
      ) : resourceForecast ? (
        <div className="space-y-6">
          {/* Forecast Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                AI Resource Forecast for {resourceForecast.forecast_date}
              </CardTitle>
              <CardDescription>
                Predicted staffing and equipment needs based on patient flow analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Staffing Requirements */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Staffing Requirements
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <span className="text-gray-700">Nurses</span>
                      <span className="font-bold text-blue-600 text-xl">{resourceForecast.staffing.nurses}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <span className="text-gray-700">Doctors</span>
                      <span className="font-bold text-green-600 text-xl">{resourceForecast.staffing.doctors}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <span className="text-gray-700">Admin Staff</span>
                      <span className="font-bold text-purple-600 text-xl">{resourceForecast.staffing.admin_staff}</span>
                    </div>
                  </div>
                </div>

                {/* Equipment Requirements */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Bed className="w-5 h-5 text-orange-600" />
                    Equipment Requirements
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <span className="text-gray-700">Beds</span>
                      <span className="font-bold text-orange-600 text-xl">{resourceForecast.equipment.beds}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <span className="text-gray-700">Examination Rooms</span>
                      <span className="font-bold text-yellow-600 text-xl">{resourceForecast.equipment.examination_rooms}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hourly Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                Hourly Patient Flow & Staffing Needs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {resourceForecast.hourly_breakdown.map((hour, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-center font-semibold text-gray-800 mb-3">{hour.hour}</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Patients:</span>
                        <span className="font-medium">{hour.predicted_patients}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nurses:</span>
                        <span className="font-medium text-blue-600">{hour.nurses_needed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Doctors:</span>
                        <span className="font-medium text-green-600">{hour.doctors_needed}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Peak Hours & Confidence */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Peak Hours */}
            <Card>
              <CardHeader>
                <CardTitle>Peak Demand Hours</CardTitle>
                <CardDescription>Hours requiring maximum resources</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {resourceForecast.peak_demand_hours.map((hour, index) => (
                    <span key={index} className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg text-sm font-medium border border-yellow-200">
                      {hour}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Confidence Level */}
            <Card>
              <CardHeader>
                <CardTitle>Prediction Confidence</CardTitle>
                <CardDescription>AI model confidence level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-green-600 h-3 rounded-full transition-all duration-500" 
                        style={{ width: `${resourceForecast.confidence * 100}%` }}
                      ></div>
                    </div>
                    <span className="font-bold text-green-700 text-lg whitespace-nowrap">
                      {(resourceForecast.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Based on historical data patterns and current trends
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>AI Recommendations</CardTitle>
              <CardDescription>Optimization suggestions for resource allocation</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {resourceForecast.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Stethoscope className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-blue-800">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Unable to load resource forecast data.</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}