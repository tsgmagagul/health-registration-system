"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, Clock, User, Heart, CheckCircle, Loader2, RefreshCw, FileText } from "lucide-react"
import { apiService } from "@/lib/api"

interface QueuePatient {
  id: string
  triage_id: string
  visit_id: string
  patient_number: string
  name: string
  age: number
  gender: string
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  priority: number
  department: string
  estimatedWaitTime: number
  currentWaitTime: number
  checkedInAt: string
  status: "waiting" | "in-progress" | "completed"
  chief_complaint?: string
  ai_risk_score?: number
}

interface QueueSummary {
  total_waiting: number
  critical: number
  urgent: number
  semi_urgent: number
  standard: number
  non_urgent: number
}

export default function QueuePage() {
  const router = useRouter()
  const [queueData, setQueueData] = useState<QueuePatient[]>([])
  const [queueSummary, setQueueSummary] = useState<QueueSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchQueueData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      // Fetch queue data from backend
      const response = await apiService.getTriageQueue() as { status: string; data: any }

      if (response.status === 'success') {
        // Transform backend data to frontend format
    // In your QueuePage component - Update the transformation logic
const transformedQueue: QueuePatient[] = response.data.queue.map((item: any) => {
  // Calculate age from date of birth
  const birthDate = new Date(item.Patient.date_of_birth);
  const age = new Date().getFullYear() - birthDate.getFullYear();

  // Map priority level to risk level
  let riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  switch (item.priority_level) {
    case 'critical':
      riskLevel = 'CRITICAL'
      break
    case 'urgent':
      riskLevel = 'HIGH'
      break
    case 'semi_urgent':
      riskLevel = 'MEDIUM'
      break
    default:
      riskLevel = 'LOW'
  }

  // Map priority level to numeric priority
  const priorityMap: { [key: string]: number } = {
    'critical': 1,
    'urgent': 2,
    'semi_urgent': 3,
    'standard': 4,
    'non_urgent': 5
  }

  // ✅ FIXED: Better status mapping with fallbacks
  let frontendStatus: "waiting" | "in-progress" | "completed"
  const visitStatus = item.Visit?.status || 'waiting' // Default to 'waiting' if undefined
  
  console.log('Visit status mapping:', {
    rawStatus: item.Visit?.status,
    patient: `${item.Patient?.first_name} ${item.Patient?.last_name}`,
    finalStatus: visitStatus
  })

  switch (visitStatus.toLowerCase()) {
    case 'waiting':
    case 'checked_in':
    case 'pending':
    case 'checked_in': // Handle different backend statuses
      frontendStatus = 'waiting'
      break
    case 'in_progress':
    case 'in_consultation':
    case 'in-progress':
      frontendStatus = 'in-progress'
      break
    case 'completed':
    case 'discharged':
    case 'finished':
      frontendStatus = 'completed'
      break
    default:
      console.warn(`Unknown visit status: "${visitStatus}", defaulting to waiting`)
      frontendStatus = 'waiting' // Safe default
  }

  // Ensure we have a patient ID
  const patientId = item.Patient?.id || item.Visit?.patient_id || item.patient_id

  if (!patientId) {
    console.error('❌ No patient ID found for visit:', item.patient_id, 'Full item:', JSON.stringify(item, null, 2))
  }

  return {
    id: patientId,
    triage_id: item.id,
    visit_id: item.Visit?.id,
    patient_number: item.Patient.patient_number,
    name: `${item.Patient.first_name} ${item.Patient.last_name}`,
    age: age,
    gender: item.Patient.gender,
    riskLevel: riskLevel,
    priority: priorityMap[item.priority_level] || 4,
    department: item.Visit?.department || 'emergency', // Default department
    estimatedWaitTime: item.predicted_wait_time || 0,
    currentWaitTime: item.current_wait_time || 0,
    checkedInAt: item.Visit?.check_in_time 
      ? new Date(item.Visit.check_in_time).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      : new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
    status: frontendStatus,
    chief_complaint: item.Visit?.chief_complaint,
    ai_risk_score: item.ai_risk_score
  }
})

        setQueueData(transformedQueue)
        setQueueSummary(response.data.queue_summary)
      }
    } catch (error: any) {
      console.error('Error fetching queue:', error)
      setError(error.message || 'Failed to load queue data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchQueueData()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchQueueData(true)
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    fetchQueueData(true)
  }

  const callPatient = async (patient: QueuePatient) => {
    try {
      console.log('Calling patient:', patient.name, 'Visit ID:', patient.visit_id)
      
      // Update status to in-progress
      await updatePatientStatus(patient.visit_id, "in-progress")
      
      // Navigate to diagnosis page with patient information
      console.log('Navigating to diagnosis page...')
      router.push(`/diagnosis?patientId=${patient.id}&visitId=${patient.visit_id}&triageId=${patient.triage_id}`)
    } catch (error) {
      console.error('Error calling patient:', error)
      alert('Failed to call patient. Please try again.')
    }
  }

  const viewPatientDiagnosis = (patient: QueuePatient) => {
    console.log('Viewing diagnosis for patient:', patient.name)
    // Navigate to diagnosis page for patients already in progress
    router.push(`/diagnosis?patientId=${patient.id}&visitId=${patient.visit_id}&triageId=${patient.triage_id}`)
  }

  const updatePatientStatus = async (visitId: string, newStatus: "waiting" | "in-progress" | "completed") => {
    try {
      console.log('Updating visit status:', visitId, 'to', newStatus)
      
      // Update local state immediately for better UX
      setQueueData((prev) =>
        prev.map((patient) => 
          patient.visit_id === visitId ? { ...patient, status: newStatus } : patient
        )
      )

      // Map frontend status to backend status
      let backendStatus: string
      switch (newStatus) {
        case 'waiting':
          backendStatus = 'waiting'
          break
        case 'in-progress':
          backendStatus = 'in_progress'
          break
        case 'completed':
          backendStatus = 'completed'
          break
      }

      console.log('Calling API with backend status:', backendStatus)
      
      // Call backend API to update the visit status
      await apiService.updateVisitStatus(visitId, backendStatus)
      
      console.log('Status updated successfully')

    } catch (error) {
      console.error('Error updating patient status:', error)
      alert('Failed to update patient status')
      // Revert on error by fetching fresh data
      fetchQueueData(true)
    }
  }

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case "CRITICAL":
        return "bg-red-600 text-white hover:bg-red-700"
      case "HIGH":
        return "bg-orange-500 text-white hover:bg-orange-600"
      case "MEDIUM":
        return "bg-yellow-500 text-black hover:bg-yellow-600"
      default:
        return "bg-green-500 text-white hover:bg-green-600"
    }
  }

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "CRITICAL":
        return <AlertTriangle className="w-4 h-4" />
      case "HIGH":
        return <Heart className="w-4 h-4" />
      case "MEDIUM":
        return <Clock className="w-4 h-4" />
      default:
        return <User className="w-4 h-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "waiting":
        return <Badge variant="outline" className="border-blue-500 text-blue-700">Waiting</Badge>
      case "in-progress":
        return <Badge className="bg-blue-500 text-white">In Progress</Badge>
      case "completed":
        return <Badge className="bg-green-500 text-white">Completed</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const formatWaitTime = (minutes: number): string => {
    if (minutes === 0) return "Immediate"
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
          <p className="text-muted-foreground">Loading queue data...</p>
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
            <Button onClick={() => fetchQueueData()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const sortedQueue = [...queueData].sort((a, b) => a.priority - b.priority)
  const emergencyQueue = sortedQueue.filter((p) => p.department === "emergency")
  const outpatientQueue = sortedQueue.filter((p) => p.department === "outpatient")
  const inpatientQueue = sortedQueue.filter((p) => p.department === "inpatient")
  const specialistQueue = sortedQueue.filter((p) => p.department === "specialist")

  const waitingPatients = queueData.filter((p) => p.status === "waiting")
  const criticalHighPriority = queueData.filter((p) => p.riskLevel === "CRITICAL" || p.riskLevel === "HIGH")

  // Calculate average wait time
  const avgWaitTime = waitingPatients.length > 0 
    ? Math.round(waitingPatients.reduce((sum, p) => sum + p.currentWaitTime, 0) / waitingPatients.length)
    : 0

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Patient Queue Management</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Total patients in queue: {waitingPatients.length}
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

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Critical/High Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {criticalHighPriority.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {queueSummary ? `${queueSummary.critical} critical, ${queueSummary.urgent} urgent` : 'Immediate attention needed'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Wait Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatWaitTime(avgWaitTime)}</div>
            <p className="text-xs text-muted-foreground">Current average</p>
          </CardContent>
        </Card>

        {/* <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Patients Seen Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {queueData.filter(p => p.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">Completed consultations</p>
          </CardContent>
        </Card> */}
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Patients ({queueData.length})</TabsTrigger>
          <TabsTrigger value="emergency">Emergency ({emergencyQueue.length})</TabsTrigger>
          <TabsTrigger value="outpatient">Outpatient ({outpatientQueue.length})</TabsTrigger>
          <TabsTrigger value="inpatient">Inpatient ({inpatientQueue.length})</TabsTrigger>
          <TabsTrigger value="specialist">Specialist ({specialistQueue.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Complete Patient Queue</CardTitle>
              <CardDescription>All patients sorted by priority level</CardDescription>
            </CardHeader>
            <CardContent>
              {sortedQueue.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No patients in queue
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedQueue.map((patient, index) => (
                    <div key={patient.triage_id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-2xl font-bold text-muted-foreground">#{index + 1}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{patient.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {patient.patient_number}
                            </Badge>
                            <Badge className={getRiskBadgeColor(patient.riskLevel)}>
                              {getRiskIcon(patient.riskLevel)}P{patient.priority}
                            </Badge>
                            {getStatusBadge(patient.status)}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {patient.department.charAt(0).toUpperCase() + patient.department.slice(1)} • 
                            Checked in: {patient.checkedInAt} • 
                            Waiting: {formatWaitTime(patient.currentWaitTime)} • 
                            Est: {formatWaitTime(patient.estimatedWaitTime)}
                          </div>
                          {patient.chief_complaint && (
                            <div className="text-sm text-gray-600 mt-1">
                              {patient.chief_complaint}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {patient.status === "waiting" && (
                          <Button 
                            size="sm" 
                            onClick={() => callPatient(patient)}
                            className={patient.riskLevel === "CRITICAL" ? "bg-red-600 hover:bg-red-700" : ""}
                          >
                            {patient.riskLevel === "CRITICAL" ? "Call URGENT" : "Call Patient"}
                          </Button>
                        )}
                        {patient.status === "in-progress" && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => viewPatientDiagnosis(patient)}
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              View Diagnosis
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updatePatientStatus(patient.visit_id, "completed")}
                            >
                              Mark Complete
                            </Button>
                          </>
                        )}
                        {patient.status === "completed" && (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">Done</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emergency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Emergency Department Queue</CardTitle>
              <CardDescription>High priority and critical patients</CardDescription>
            </CardHeader>
            <CardContent>
              {emergencyQueue.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No emergency patients in queue
                </div>
              ) : (
                <div className="space-y-4">
                  {emergencyQueue.map((patient, index) => (
                    <div
                      key={patient.triage_id}
                      className="flex items-center justify-between p-4 border-l-4 border-red-500 bg-red-50 rounded-lg"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-2xl font-bold text-red-600">#{index + 1}</div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{patient.name}</span>
                            <Badge className={getRiskBadgeColor(patient.riskLevel)}>
                              {getRiskIcon(patient.riskLevel)}
                              {patient.riskLevel}
                            </Badge>
                            {getStatusBadge(patient.status)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Checked in: {patient.checkedInAt} • Waiting: {formatWaitTime(patient.currentWaitTime)}
                          </div>
                          {patient.chief_complaint && (
                            <div className="text-sm font-medium text-red-700 mt-1">
                              {patient.chief_complaint}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {patient.status === "waiting" && (
                          <Button
                            size="sm"
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => callPatient(patient)}
                          >
                            Call Now
                          </Button>
                        )}
                        {patient.status === "in-progress" && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => viewPatientDiagnosis(patient)}
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              View Diagnosis
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updatePatientStatus(patient.visit_id, "completed")}
                            >
                              Complete
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {[
          { value: "outpatient", queue: outpatientQueue, title: "Outpatient Department" },
          { value: "inpatient", queue: inpatientQueue, title: "Inpatient Department" },
          { value: "specialist", queue: specialistQueue, title: "Specialist Department" }
        ].map(({ value, queue, title }) => (
          <TabsContent key={value} value={value} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{title} Queue</CardTitle>
                <CardDescription>Patients by priority</CardDescription>
              </CardHeader>
              <CardContent>
                {queue.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No patients in {value} queue
                  </div>
                ) : (
                  <div className="space-y-4">
                    {queue.map((patient, index) => (
                      <div key={patient.triage_id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="text-2xl font-bold text-muted-foreground">#{index + 1}</div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{patient.name}</span>
                              <Badge className={getRiskBadgeColor(patient.riskLevel)}>
                                {getRiskIcon(patient.riskLevel)}P{patient.priority}
                              </Badge>
                              {getStatusBadge(patient.status)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Checked in: {patient.checkedInAt} • Waiting: {formatWaitTime(patient.currentWaitTime)}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {patient.status === "waiting" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => callPatient(patient)}
                            >
                              Call Patient
                            </Button>
                          )}
                          {patient.status === "in-progress" && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => viewPatientDiagnosis(patient)}
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updatePatientStatus(patient.visit_id, "completed")}
                              >
                                Complete
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}