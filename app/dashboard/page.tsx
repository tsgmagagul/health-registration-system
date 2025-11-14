"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, Bar, BarChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { Button } from "@/components/ui/button"
import { Users, Hourglass, AlertTriangle, CheckCircle, Settings, Activity, TrendingUp, Clock, Brain, MapPin, Building, Loader2 } from "lucide-react"
import { apiService } from "@/lib/api"

interface DashboardStats {
  total_visits: number
  waiting_patients: number
  completed_visits: number
  critical_cases: number
}

interface Facility {
  id: string
  name: string
  province: string
  type: string
}
interface TriageQueueResponse {
  status: string;
  data: {
    queue: {
      priority_level: string;
    }[];
  };
}


interface TriageStatsResponse {
  status: string;
  data: {
    department_stats?: {
      department: string;
      avg_wait_time: number;
    }[];
  };
}



export default function DashboardPage() {
  const [userData, setUserData] = useState<any>(null)
  
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [facilityLoading, setFacilityLoading] = useState(false)
  
 
const [facilityData, setFacilityData] = useState<Facility | null>(null);
const [patientFlowData, setPatientFlowData] = useState<{date: string, registrations: number, predicted: number}[]>([]);
const [waitTimesData, setWaitTimesData] = useState<{department: string, avgWait: number, target: number}[]>([]);
const [priorityData, setPriorityData] = useState<{priority: string, count: number, percentage: number}[]>([]);
 const [chartsLoading, setChartsLoading] = useState(true)
  const router = useRouter()

  // Fetch facility data
  const fetchFacilityData = async (facilityId: string) => {
    if (!facilityId) {
      console.log('No facility ID available')
      return
    }

    setFacilityLoading(true)
    try {
      console.log('🏥 Fetching facility data for ID:', facilityId)
      const response = await apiService.getFacility(facilityId)
      
      if (response.status === "success" && response.data.name) {
        console.log('✅ Facility data received:', response.data.name)
        setFacilityData(response.data)
        
        // Update localStorage with facility info for future use
        const currentUserData = JSON.parse(localStorage.getItem("userData") || '{}')
        const updatedUserData = {
          ...currentUserData,
          facility_name: response.data.name,
          province: response.data.province,
          facility_type: response.data.type
        }
        localStorage.setItem("userData", JSON.stringify(updatedUserData))
        setUserData(updatedUserData)
      } else {
        console.log('❌ No facility data in response')
      }
    } catch (error) {
      console.error("❌ Failed to fetch facility data:", error)
    } finally {
      setFacilityLoading(false)
    }
  }

  useEffect(() => {
    const storedData = localStorage.getItem("userData")
    if (storedData) {
      const data = JSON.parse(storedData)
      setUserData(data)

      // If we have facility_id but no facility details, fetch them
      if (data.facility_id && (!data.facility_name || !data.province)) {
        console.log('🔄 Fetching facility details...')
        fetchFacilityData(data.facility_id)
      }

      if (data.isAdmin) {
        router.push("/admin")
        return
      }
    } else {
      router.push("/login")
    }
  }, [router])

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      try {
        const response = await apiService.getDashboardStats() as any
        if (response.status === "success") {
          setStats(response.data.today)
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 60000)
    return () => clearInterval(interval)
  }, [])

  // Fetch real-time analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setChartsLoading(true)
      try {
        // Fetch patient flow prediction data
        const flowResponse = await apiService.predictPatientFlow() as FlowResponse;
        if (flowResponse.status === "success" && flowResponse.data) {
          // Transform the data for the chart
          const transformedFlow = flowResponse.data.weekly_predictions?.map((item: any) => ({
            date: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
            registrations: item.actual_visits || item.predicted_visits,
            predicted: item.predicted_visits
          })) || []
          setPatientFlowData(transformedFlow)
        }

        // Fetch triage queue data for priority distribution
       const triageResponse = await apiService.getTriageQueue() as TriageQueueResponse;
        if (triageResponse.status === "success" && triageResponse.data?.queue) {
          const queue = triageResponse.data.queue
          
          // Calculate priority distribution
          const priorityCounts: any = {
            'Critical': 0,
            'Urgent': 0,
            'Semi-Urgent': 0,
            'Standard': 0,
            'Non-Urgent': 0
          }
          
          queue.forEach((item: any) => {
            const priority = item.priority_level || 'Standard'
            if (priorityCounts.hasOwnProperty(priority)) {
              priorityCounts[priority]++
            }
          })
          
          const total = queue.length
          const priorityDist = Object.keys(priorityCounts).map(key => ({
            priority: key,
            count: priorityCounts[key],
            percentage: total > 0 ? Math.round((priorityCounts[key] / total) * 100) : 0
          }))
          
          setPriorityData(priorityDist)
        }

        // Fetch triage stats for wait times by department
        const statsResponse = await apiService.getTriageStats({ period: 'today' }) as TriageStatsResponse;
        if (statsResponse.status === "success" && statsResponse.data) {
          // Transform wait time data
          const waitTimes = statsResponse.data.department_stats?.map((dept: any) => ({
            department: dept.department,
            avgWait: dept.avg_wait_time || 0,
            target: dept.department === 'Emergency' ? 30 : 
                   dept.department === 'Outpatient' ? 20 : 
                   dept.department === 'Inpatient' ? 15 : 45
          })) || []
          setWaitTimesData(waitTimes)
        }

      } catch (error) {
        console.error("Failed to fetch analytics data:", error)
        // Set empty arrays on error to prevent UI issues
        setPatientFlowData([])
        setWaitTimesData([])
        setPriorityData([])
      } finally {
        setChartsLoading(false)
      }
    }

    fetchAnalyticsData()
    // Refresh analytics every 5 minutes
    const interval = setInterval(fetchAnalyticsData, 300000)
    return () => clearInterval(interval)
  }, [])

  // Get display values for facility and province
  const getFacilityDisplay = () => {
    // Priority: 1. facilityData (freshly fetched), 2. userData (from localStorage), 3. defaults
    return {
      name: facilityData?.name || userData?.facility_name || "Healthcare Facility",
      province: facilityData?.province || userData?.province || "South Africa",
      type: facilityData?.type || userData?.facility_type || null
    }
  }

  const displayFacility = getFacilityDisplay()

  if (!userData) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <Users className="w-12 h-12 animate-pulse mx-auto text-blue-600" />
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Building className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold">
              {displayFacility.name}
              {facilityLoading && (
                <Loader2 className="w-5 h-5 animate-spin text-blue-500 ml-2 inline" />
              )}
            </h1>
          </div>
          
          <p className="text-muted-foreground flex items-center gap-1 mt-1">
            <MapPin className="w-4 h-4" />
            {displayFacility.province} • Real-time Analytics Dashboard
            {displayFacility.type && (
              <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                {displayFacility.type}
              </span>
            )}
          </p>
          
          {/* Debug info - remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-500 mt-1">
              User: {userData.first_name} {userData.last_name} | 
              Facility ID: {userData.facility_id || 'None'} | 
              Role: {userData.role}
              {facilityLoading && ' | Loading facility...'}
            </div>
          )}
        </div>
        {userData.isAdmin && (
          <Button onClick={() => router.push("/admin")} variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Admin Dashboard
          </Button>
        )}
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Patients Today</CardTitle>
            <Users className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats?.total_visits || 0}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="inline-block w-3 h-3 mr-1 text-green-600" />
              <span className="text-green-600">+12%</span> from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Currently Waiting</CardTitle>
            <Hourglass className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats?.waiting_patients || 0}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <Clock className="inline-block w-3 h-3 mr-1" />
              Avg wait: 23 minutes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats?.completed_visits || 0}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <Activity className="inline-block w-3 h-3 mr-1 text-green-600" />
              <span className="text-green-600">94%</span> completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Critical Cases</CardTitle>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {loading ? "..." : stats?.critical_cases || 0}
            </div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <AlertTriangle className="inline-block w-3 h-3 mr-1 text-red-600" />
              Requires immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Patient Flow Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Flow Analysis</CardTitle>
            <CardDescription>
              {chartsLoading ? 'Loading real-time data...' : 'Weekly registration trends with AI predictions'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {chartsLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : patientFlowData.length > 0 ? (
              <ChartContainer
                config={{
                  registrations: { label: "Actual", color: "hsl(var(--chart-1))" },
                  predicted: { label: "AI Predicted", color: "hsl(var(--chart-3))" },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={patientFlowData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="registrations" 
                      stroke="hsl(var(--chart-1))" 
                      strokeWidth={2}
                      name="Actual"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="predicted" 
                      stroke="hsl(var(--chart-3))" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="AI Prediction"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No patient flow data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Department Wait Times */}
        <Card>
          <CardHeader>
            <CardTitle>Department Wait Times</CardTitle>
            <CardDescription>
              {chartsLoading ? 'Loading real-time data...' : 'Average wait time vs target (minutes)'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {chartsLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : waitTimesData.length > 0 ? (
              <ChartContainer
                config={{
                  avgWait: { label: "Current", color: "hsl(var(--chart-2))" },
                  target: { label: "Target", color: "hsl(var(--chart-4))" },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={waitTimesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="avgWait" fill="hsl(var(--chart-2))" name="Current" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="target" fill="hsl(var(--chart-4))" name="Target" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No wait time data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>AI Triage Priority Distribution</CardTitle>
            <CardDescription>
              {chartsLoading ? 'Loading real-time data...' : 'Current patient queue by priority level'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {chartsLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : priorityData.length > 0 && priorityData.some(item => item.count > 0) ? (
              <div className="space-y-3">
                {priorityData.map((item) => (
                  <div key={item.priority} className="flex items-center gap-4">
                    <div className="w-24 text-sm font-medium">{item.priority}</div>
                    <div className="flex-1">
                      <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
                        {item.count > 0 && (
                          <div 
                            className={`h-full flex items-center px-3 text-xs font-medium text-white ${
                              item.priority === 'Critical' ? 'bg-red-600' :
                              item.priority === 'Urgent' ? 'bg-orange-500' :
                              item.priority === 'Semi-Urgent' ? 'bg-yellow-500 text-black' :
                              item.priority === 'Standard' ? 'bg-blue-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${Math.max(item.percentage, 5)}%` }}
                          >
                            {item.count} ({item.percentage}%)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No patients currently in triage queue
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Insights Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              AI Insights
            </CardTitle>
            <CardDescription>
              Smart predictions and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Peak Hours Prediction</h4>
                <p className="text-sm text-blue-600">Expected peak: 2:00 PM - 4:00 PM</p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">Staffing Suggestion</h4>
                <p className="text-sm text-green-600">Optimal nurse-to-patient ratio maintained</p>
              </div>
              
              <Button 
                onClick={() => router.push('/resource-allocation')} 
                variant="outline" 
                className="w-full"
              >
                View Detailed Resource Allocation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/registration')}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Patient Registration</h3>
                <p className="text-sm text-muted-foreground">Register new patients</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/queue')}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Hourglass className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold">Patient Queue</h3>
                <p className="text-sm text-muted-foreground">Manage waiting patients</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/triage')}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold">Triage Assessment</h3>
                <p className="text-sm text-muted-foreground">AI-powered triage</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}