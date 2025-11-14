"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Activity, 
  Clock, 
  User, 
  AlertCircle, 
  Loader2, 
  RefreshCw, 
  Stethoscope,
  UserPlus,
  Brain
} from "lucide-react"
import { apiService } from "@/lib/api"

interface TriagePatient {
  id: string
  visit_id: string
  patient_number: string
  name: string
  age: number
  gender: string
  department: string
  chief_complaint: string
  checkedInAt: string
  currentWaitTime: number
  status: "pending_triage" | "triaged" | "in_consultation"
  triage_completed?: boolean
}

export default function TriageQueuePage() {
  const router = useRouter()
  const [patients, setPatients] = useState<TriagePatient[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTriageQueue = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      console.log('🔍 Fetching patients needing triage...')

      // Fetch checked-in patients who haven't been triaged yet
      const response = await apiService.getPendingTriagePatients() as { 
        status: string
        data: any 
      }

      console.log('📦 Triage queue response:', response)

      if (response.status === 'success') {
        // Transform backend data
        const transformedPatients: TriagePatient[] = response.data.map((item: any) => {
          // Calculate age
          const birthDate = new Date(item.Patient.date_of_birth)
          const age = new Date().getFullYear() - birthDate.getFullYear()

          // Calculate wait time
          const checkInTime = new Date(item.check_in_time)
          const now = new Date()
          const waitMinutes = Math.floor((now.getTime() - checkInTime.getTime()) / (1000 * 60))

          return {
            id: item.Patient.id,
            visit_id: item.id,
            patient_number: item.Patient.patient_number,
            name: `${item.Patient.first_name} ${item.Patient.last_name}`,
            age: age,
            gender: item.Patient.gender,
            department: item.department || 'General',
            chief_complaint: item.chief_complaint || 'Not specified',
            checkedInAt: new Date(item.check_in_time).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            currentWaitTime: waitMinutes,
            status: item.triage_completed ? 'triaged' : 'pending_triage',
            triage_completed: item.triage_completed
          }
        })

        console.log('✅ Transformed patients:', transformedPatients)
        setPatients(transformedPatients)
      }
    } catch (error: any) {
      console.error('❌ Error fetching triage queue:', error)
      setError(error.message || 'Failed to load triage queue')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchTriageQueue()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchTriageQueue(true)
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    fetchTriageQueue(true)
  }

  const startTriage = (patient: TriagePatient) => {
    console.log('🩺 Starting triage for:', patient.name)
    console.log('Patient ID:', patient.id)
    console.log('Visit ID:', patient.visit_id)
    
    // Navigate to AI triage page with patient and visit info
    router.push(`/triage/assess?patientId=${patient.id}&visitId=${patient.visit_id}`)
  }

  const viewTriageDetails = (patient: TriagePatient) => {
    console.log('📋 Viewing triage details for:', patient.name)
    // Navigate to view completed triage
    router.push(`/triage/view?patientId=${patient.id}&visitId=${patient.visit_id}`)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_triage":
        return <Badge variant="outline" className="border-orange-500 text-orange-700">
          <AlertCircle className="w-3 h-3 mr-1" />
          Needs Triage
        </Badge>
      case "triaged":
        return <Badge className="bg-green-500 text-white">
          <Activity className="w-3 h-3 mr-1" />
          Triaged
        </Badge>
      case "in_consultation":
        return <Badge className="bg-blue-500 text-white">
          <Stethoscope className="w-3 h-3 mr-1" />
          With Doctor
        </Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getDepartmentColor = (dept: string) => {
    switch (dept.toLowerCase()) {
      case 'emergency':
        return 'text-red-600 bg-red-50'
      case 'surgery':
        return 'text-purple-600 bg-purple-50'
      case 'pediatrics':
        return 'text-pink-600 bg-pink-50'
      case 'cardiology':
        return 'text-blue-600 bg-blue-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const formatWaitTime = (minutes: number): string => {
    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading triage queue...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => fetchTriageQueue()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const pendingPatients = patients.filter(p => p.status === 'pending_triage')
  const triagedPatients = patients.filter(p => p.status === 'triaged')
  const urgentPatients = pendingPatients.filter(p => 
    p.currentWaitTime > 30 || p.department.toLowerCase() === 'emergency'
  )

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="w-8 h-8 text-purple-600" />
            Triage Queue
          </h1>
          <p className="text-muted-foreground mt-1">
            Patients waiting for triage assessment
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {pendingPatients.length} pending • 
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Triage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {pendingPatients.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {urgentPatients.length} urgent cases
            </p>
          </CardContent>
        </Card>

        {/* <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {triagedPatients.length}
            </div>
            <p className="text-xs text-muted-foreground">Assessments completed</p>
          </CardContent>
        </Card> */}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Wait</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingPatients.length > 0
                ? formatWaitTime(
                    Math.round(
                      pendingPatients.reduce((sum, p) => sum + p.currentWaitTime, 0) / 
                      pendingPatients.length
                    )
                  )
                : '0 min'}
            </div>
            <p className="text-xs text-muted-foreground">Current average</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Triage ({pendingPatients.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({triagedPatients.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All Patients ({patients.length})
          </TabsTrigger>
        </TabsList>

        {/* Pending Triage Tab */}
        <TabsContent value="pending" className="space-y-4">
          {urgentPatients.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Urgent Attention Required
                </CardTitle>
                <CardDescription>
                  Patients waiting over 30 minutes or from emergency department
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {urgentPatients.map((patient, index) => (
                    <div
                      key={patient.visit_id}
                      className="flex items-center justify-between p-4 bg-white border-l-4 border-red-500 rounded-lg"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-2xl font-bold text-red-600">#{index + 1}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-semibold text-lg">{patient.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {patient.patient_number}
                            </Badge>
                            <Badge className={getDepartmentColor(patient.department)}>
                              {patient.department}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            {patient.gender} • {patient.age} years • 
                            Checked in: {patient.checkedInAt}
                          </div>
                          <div className="text-sm font-medium text-red-700 mt-1">
                            Chief Complaint: {patient.chief_complaint}
                          </div>
                          <div className="text-xs text-red-600 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Waiting: {formatWaitTime(patient.currentWaitTime)}
                          </div>
                        </div>
                      </div>
                      <Button
                        size="lg"
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => startTriage(patient)}
                      >
                        <Brain className="w-4 h-4 mr-2" />
                        Start Triage Now
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Regular Queue</CardTitle>
              <CardDescription>
                Patients waiting for triage assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingPatients.filter(p => !urgentPatients.includes(p)).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No patients pending triage</p>
                  <p className="text-sm mt-2">
                    Great job! All checked-in patients have been triaged.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingPatients
                    .filter(p => !urgentPatients.includes(p))
                    .map((patient, index) => (
                      <div
                        key={patient.visit_id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="text-2xl font-bold text-gray-400">
                            #{urgentPatients.length + index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="font-semibold">{patient.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {patient.patient_number}
                              </Badge>
                              <Badge className={getDepartmentColor(patient.department)}>
                                {patient.department}
                              </Badge>
                              {getStatusBadge(patient.status)}
                            </div>
                            <div className="text-sm text-gray-600">
                              {patient.gender} • {patient.age} years • 
                              Checked in: {patient.checkedInAt} • 
                              Waiting: {formatWaitTime(patient.currentWaitTime)}
                            </div>
                            <div className="text-sm text-gray-700 mt-1">
                              {patient.chief_complaint}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="default"
                          onClick={() => startTriage(patient)}
                        >
                          <Brain className="w-4 h-4 mr-2" />
                          Start Triage
                        </Button>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Completed Triage Tab */}
        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Triage Assessments</CardTitle>
              <CardDescription>
                Patients who have been triaged and are ready for consultation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {triagedPatients.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No completed triage assessments yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {triagedPatients.map((patient, index) => (
                    <div
                      key={patient.visit_id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-green-50"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-2xl font-bold text-green-600">
                          ✓
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-semibold">{patient.name}</span>
                            <Badge variant="outline">{patient.patient_number}</Badge>
                            <Badge className={getDepartmentColor(patient.department)}>
                              {patient.department}
                            </Badge>
                            {getStatusBadge(patient.status)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {patient.gender} • {patient.age} years
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => viewTriageDetails(patient)}
                      >
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Patients Tab */}
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Patients in Triage System</CardTitle>
            </CardHeader>
            <CardContent>
              {patients.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No patients in triage system</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {patients.map((patient, index) => (
                    <div
                      key={patient.visit_id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold">{patient.name}</span>
                            <Badge variant="outline">{patient.patient_number}</Badge>
                            <Badge className={getDepartmentColor(patient.department)}>
                              {patient.department}
                            </Badge>
                            {getStatusBadge(patient.status)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {patient.gender} • {patient.age} years • 
                            Waiting: {formatWaitTime(patient.currentWaitTime)}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {patient.status === 'pending_triage' ? (
                          <Button onClick={() => startTriage(patient)}>
                            Start Triage
                          </Button>
                        ) : (
                          <Button variant="outline" onClick={() => viewTriageDetails(patient)}>
                            View Details
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}