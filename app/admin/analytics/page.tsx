"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Hospital, 
  Users, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Ambulance,
  Building2,
  Calendar,
  Loader2,
  Bed,
  UserCheck
} from "lucide-react"
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { 
  useDashboardMetrics,
  useTriageStatistics,
  useBedOccupancyReport,
  useQueueStatus 
} from "@/hooks/useAdminAnalytics"
import { apiService } from "@/lib/api"

export default function FacilityDashboard() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [facilityInfo, setFacilityInfo] = useState<any>(null)
  const [visitTrends, setVisitTrends] = useState<any[]>([])
  const [isMounted, setIsMounted] = useState(false)

  // Only fetch after mounting (client-side)
  useEffect(() => {
    setIsMounted(true)
    
    // Get current user from localStorage
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        setCurrentUser(user)
      }
    }
  }, [])

  // Fetch real-time data using custom hooks (only after mounted)
  const { 
    data: dashboardMetrics, 
    loading: metricsLoading,
    refetch: refetchMetrics 
  } = useDashboardMetrics(isMounted, 30000)

  const { 
    data: triageStats, 
    loading: triageLoading 
  } = useTriageStatistics('today', isMounted)

  const { 
    data: bedOccupancy, 
    loading: bedLoading 
  } = useBedOccupancyReport(isMounted)

  const { 
    data: queueData, 
    loading: queueLoading 
  } = useQueueStatus(undefined, undefined, isMounted, 15000)

  // Fetch facility information
  useEffect(() => {
    if (!isMounted || !currentUser?.facility_id) return

    const fetchFacilityInfo = async () => {
      try {
        // ✅ FIXED: Use correct method name
        const response = await apiService.getFacility(currentUser.facility_id)
        if (response.data) {
          setFacilityInfo(response.data)
        }
      } catch (error) {
        console.error('Error fetching facility info:', error)
      }
    }

    fetchFacilityInfo()
  }, [isMounted, currentUser])

  // Fetch visit trends for this facility
  useEffect(() => {
    if (!isMounted) return

    const fetchVisitTrends = async () => {
      try {
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - 7)

        const response = await apiService.getVisitStats(
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        )

        if (response.data?.trends) {
          setVisitTrends(response.data.trends)
        }
      } catch (error) {
        console.error('Error fetching visit trends:', error)
      }
    }

    fetchVisitTrends()
  }, [isMounted])

  // Department Distribution from triage stats
  const departmentData = triageStats?.department_breakdown?.map((dept: any) => ({
    name: dept.department,
    value: dept.count,
    color: getDepartmentColor(dept.department)
  })) || []

  function getDepartmentColor(department: string): string {
    const colors: Record<string, string> = {
      'emergency': '#ef4444',
      'outpatient': '#3b82f6',
      'surgery': '#8b5cf6',
      'pediatrics': '#ec4899',
      'inpatient': '#f59e0b',
      'maternity': '#10b981'
    }
    return colors[department.toLowerCase()] || '#6b7280'
  }

  // Calculate facility statistics
  const facilityStats = {
    totalPatients: dashboardMetrics?.today.total_visits || 0,
    activeVisits: dashboardMetrics?.today.waiting_patients || 0,
    completedToday: dashboardMetrics?.today.completed_visits || 0,
    criticalCases: dashboardMetrics?.today.critical_cases || 0,
    bedsOccupied: bedOccupancy?.occupied_beds || 0,
    totalBeds: bedOccupancy?.total_beds || 0,
    availableBeds: bedOccupancy?.available_beds || 0,
    occupancyRate: bedOccupancy?.occupancy_rate || 0,
    avgWaitTime: triageStats?.average_wait_time || 0,
    queueSize: queueData?.queue_size || 0
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <AlertCircle className="w-5 h-5 text-red-600" />
      case "warning":
        return <Clock className="w-5 h-5 text-orange-600" />
      default:
        return <CheckCircle className="w-5 h-5 text-blue-600" />
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case "critical":
        return "bg-red-50 border-red-200"
      case "warning":
        return "bg-orange-50 border-orange-200"
      default:
        return "bg-blue-50 border-blue-200"
    }
  }

  // Generate alerts from real data
  const alerts = []
  
  if (bedOccupancy && bedOccupancy.occupancy_rate > 90) {
    alerts.push({
      id: 1,
      type: "critical",
      message: `Bed capacity at ${bedOccupancy.occupancy_rate.toFixed(0)}% - Consider overflow protocols`,
      time: "Now",
      department: "All Departments"
    })
  }

  if (facilityStats.criticalCases > 10) {
    alerts.push({
      id: 2,
      type: "warning",
      message: `${facilityStats.criticalCases} critical cases requiring immediate attention`,
      time: "Now",
      department: "Emergency"
    })
  }

  if (facilityStats.queueSize > 50) {
    alerts.push({
      id: 3,
      type: "warning",
      message: `High queue volume: ${facilityStats.queueSize} patients waiting`,
      time: "Now",
      department: "Multiple"
    })
  }

  if (!isMounted || metricsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="w-8 h-8 text-blue-600" />
            {facilityInfo?.facility_name || 'Facility'} Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time overview of facility operations
          </p>
          {facilityInfo && (
            <p className="text-sm text-muted-foreground mt-1">
              {facilityInfo.address} • {facilityInfo.province}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetchMetrics()}>
            <Activity className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Calendar className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Visits</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{facilityStats.totalPatients}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Activity className="w-3 h-3 text-blue-600" />
              <span>{facilityStats.completedToday} completed</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{facilityStats.activeVisits}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3 text-orange-600" />
              <span>{facilityStats.queueSize} in queue</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Critical Cases</CardTitle>
            <Ambulance className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{facilityStats.criticalCases}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3 text-red-600" />
              <span className="text-red-600">Immediate attention needed</span>
            </p>
          </CardContent>
        </Card>

        
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
    
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Patient Flow Trend */}
            
            {/* Department Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Patient Distribution by Department</CardTitle>
                <CardDescription>Current active patients</CardDescription>
              </CardHeader>
              <CardContent>
                {departmentData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={departmentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {departmentData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    {triageLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'No department data available'}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Priority Level Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Triage Priority Distribution</CardTitle>
                <CardDescription>Patients by priority level</CardDescription>
              </CardHeader>
              <CardContent>
                {triageStats?.priority_breakdown && triageStats.priority_breakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={triageStats.priority_breakdown}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="priority" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#3b82f6" name="Patients" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    {triageLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'No triage data available'}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Departments Tab */}
        <TabsContent value="departments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Department Activity</CardTitle>
              <CardDescription>Current status by department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {triageStats?.department_breakdown?.map((dept: any) => (
                  <div
                    key={dept.department}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getDepartmentColor(dept.department) }} />
                      <div className="flex-1">
                        <div className="font-semibold capitalize">{dept.department}</div>
                        <div className="text-sm text-muted-foreground">
                          {dept.count} active patients
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {dept.count} patients
                    </Badge>
                  </div>
                )) || (
                  <div className="text-center py-8 text-muted-foreground">
                    No department data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>





      </Tabs>
    </div>
  )
}