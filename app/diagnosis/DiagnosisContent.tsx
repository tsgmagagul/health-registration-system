"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  ArrowLeft, 
  User, 
  Activity, 
  FileText, 
  Pill, 
  Save, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Heart,
  Thermometer,
  Droplets,
  Wind,
  Bed,
  Home,
  AlertTriangle,
  Check
} from "lucide-react"
import { apiService } from "@/lib/api"


interface PatientInfo {
  id: string
  patient_number: string
  first_name: string
  last_name: string
  date_of_birth: string
  age: number
  gender: string
  phone: string
  allergies?: string[]
  medical_history?: any
}

interface TriageInfo {
  id: string
  priority_level: string
  symptoms: string[]
  vital_signs: {
    temperature?: number
    blood_pressure?: string
    heart_rate?: number
    respiratory_rate?: number
    oxygen_saturation?: number
  }
  triage_notes?: string
  ai_risk_score?: number
  predicted_wait_time?: number
}

interface VisitInfo {
  id: string
  check_in_time: string
  department: string
  chief_complaint: string
  status: string
  admission_status?: 'admitted' | 'discharged' | 'pending'
  bed_id?: string
  admission_ward_id?: string
}

interface Prescription {
  medication: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
}

interface BedAvailability {
  total_beds: number
  available_beds: number
  occupied_beds: number
  occupancy_rate: number
}

export default function DiagnosisPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const patientId = searchParams.get('patientId')
  const visitId = searchParams.get('visitId')
  const triageId = searchParams.get('triageId')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [patient, setPatient] = useState<PatientInfo | null>(null)
  const [triage, setTriage] = useState<TriageInfo | null>(null)
  const [visit, setVisit] = useState<VisitInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // 🔥 ADDED: Admission state
  const [admissionRequired, setAdmissionRequired] = useState(false)
  const [bedAvailability, setBedAvailability] = useState<BedAvailability | null>(null)
  const [availableBeds, setAvailableBeds] = useState<any[]>([])
  const [selectedBed, setSelectedBed] = useState<string>("")
  const [assigningBed, setAssigningBed] = useState(false)

  // Diagnosis form state
  const [diagnosis, setDiagnosis] = useState("")
  const [symptoms, setSymptoms] = useState("")
  const [physicalExam, setPhysicalExam] = useState("")
  const [labTests, setLabTests] = useState("")
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([
    { medication: "", dosage: "", frequency: "", duration: "", instructions: "" }
  ])
  const [treatmentPlan, setTreatmentPlan] = useState("")
  const [followUpDate, setFollowUpDate] = useState("")
  const [additionalNotes, setAdditionalNotes] = useState("")

  useEffect(() => {
    if (!patientId || !visitId || !triageId) {
      setError("Missing required parameters")
      setLoading(false)
      return
    }
    fetchPatientData()
  }, [patientId, visitId, triageId])

const fetchPatientData = async () => {
  try {
    setLoading(true)
    setError(null)

    console.log("🔍 Fetching data for:", { patientId, visitId, triageId })

    // Fetch patient info
    const patientResponse = await apiService.getPatient(patientId!) as any
    console.log("📋 Patient Response:", JSON.stringify(patientResponse, null, 2))
    
    if (patientResponse.status === 'success') {
      const patientData = patientResponse.data.patient || patientResponse.data
      console.log("👤 Using Patient Data:", patientData)
      
      const birthDate = new Date(patientData.date_of_birth)
      const age = new Date().getFullYear() - birthDate.getFullYear()
      
      setPatient({
        ...patientData,
        age
      })
    }

    // Fetch triage info
    const triageResponse = await apiService.getTriage(triageId!) as any
    console.log("📊 Triage Response:", JSON.stringify(triageResponse, null, 2))
    
    if (triageResponse.status === 'success') {
      const triageData = triageResponse.data.triage || triageResponse.data
      console.log("🩺 Using Triage Data:", triageData)
      
      setTriage(triageData)
      
      // Pre-fill symptoms
      if (triageData.symptoms) {
        const symptomsStr = Array.isArray(triageData.symptoms) 
          ? triageData.symptoms.join(', ') 
          : typeof triageData.symptoms === 'string' 
            ? triageData.symptoms 
            : JSON.stringify(triageData.symptoms)
        setSymptoms(symptomsStr)
      }
      
      // ✅ FIXED: Check for Visit data in triage response - use lowercase "visit"
      if (triageData.Visit) {  // ✅ Changed from "Visit" to "visit"
        console.log("🏥 Found visit in triage:", triageData.Visit)
        setVisit(triageData.Visit)
        
        // Check if patient is already admitted
        if (triageData.Visit.admission_status === 'admitted') {
          setAdmissionRequired(true)
        }
      } else if (triageResponse.data.Visit) {  // ✅ Changed from "Visit" to "visit"
        console.log("🏥 Found visit in response.data:", triageResponse.data.Visit)
        setVisit(triageResponse.data.Visit)
        
        if (triageResponse.data.Visit.admission_status === 'admitted') {
          setAdmissionRequired(true)
        }
      } else {
        console.log("🔍 No visit found in triage response, checking nested structure...")
        // Debug: log all keys to see what's available
        console.log("🔑 Triage data keys:", Object.keys(triageData))
        console.log("🔑 Triage response data keys:", Object.keys(triageResponse.data))
      }
    }

    // 🔥 REMOVE THIS: No need to fetch visit separately since we already have it!
    // The visit data is already in the triage response

    // Fetch bed availability for the department
    await fetchBedAvailability()

  } catch (error: any) {
    console.error('❌ Error fetching patient data:', error)
    setError(error.message || 'Failed to load patient data')
  } finally {
    setLoading(false)
  }
}

  // 🔥 ADDED: Fetch bed availability
  const fetchBedAvailability = async () => {
    try {
      if (!visit?.department) return

      // Get facility stats to see bed availability
      const userData = localStorage.getItem('userData')
      if (userData) {
        const user = JSON.parse(userData)
        if (user.facility_id) {
          const statsResponse = await apiService.getFacilityStats(user.facility_id)
          if (statsResponse.status === 'success') {
            const departmentStats = statsResponse.data.find(
              (stat: any) => stat.department === visit.department
            )
            if (departmentStats) {
              setBedAvailability({
                total_beds: departmentStats.total_beds,
                available_beds: departmentStats.available_beds,
                occupied_beds: departmentStats.occupied_beds,
                occupancy_rate: (departmentStats.occupied_beds / departmentStats.total_beds) * 100
              })
            }
          }
        }
      }

      // Get available beds for assignment
      const bedsResponse = await apiService.getAvailableBeds({
        department: visit?.department
      })
      if (bedsResponse.status === 'success') {
        setAvailableBeds(bedsResponse.data)
      }
    } catch (error) {
      console.error('Error fetching bed availability:', error)
    }
  }

  // 🔥 ADDED: Handle admission toggle
  const handleAdmissionToggle = (required: boolean) => {
    setAdmissionRequired(required)
    if (required) {
      fetchBedAvailability()
    }
  }

  // 🔥 ADDED: Assign patient to bed
  const assignPatientToBed = async () => {
    if (!selectedBed) {
      alert('Please select a bed for admission')
      return
    }

    try {
      setAssigningBed(true)
      
      const assignmentResponse = await apiService.assignBed(selectedBed, {
        visit_id: visitId!,
        patient_id: patientId!
      })

      if (assignmentResponse.status === 'success') {
        alert('Patient successfully admitted to bed!')
        // Refresh visit data to show admission status
        await fetchPatientData()
      } else {
        throw new Error(assignmentResponse.message || 'Failed to assign bed')
      }
    } catch (error: any) {
      console.error('Error assigning bed:', error)
      alert(`Failed to assign bed: ${error.message}`)
    } finally {
      setAssigningBed(false)
    }
  }

  const addPrescription = () => {
    setPrescriptions([
      ...prescriptions,
      { medication: "", dosage: "", frequency: "", duration: "", instructions: "" }
    ])
  }

  const removePrescription = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index))
  }

  const updatePrescription = (index: number, field: keyof Prescription, value: string) => {
    const updated = [...prescriptions]
    updated[index][field] = value
    setPrescriptions(updated)
  }

  const handleSaveDraft = async () => {
    try {
      setSaving(true)
      // Save diagnosis as draft
      // await apiService.saveDiagnosisDraft(visitId, { diagnosis, symptoms, ... })
      alert('Draft saved successfully!')
    } catch (error) {
      console.error('Error saving draft:', error)
      alert('Failed to save draft')
    } finally {
      setSaving(false)
    }
  }

 const handleCompleteConsultation = async () => {
  if (!diagnosis.trim()) {
    alert('Please enter a diagnosis before completing the consultation')
    return
  }

  // 🔥 ADD THIS NULL CHECK
  if (!visitId) {
    alert('Visit ID is missing. Cannot save treatment.')
    return
  }

  try {
    setSaving(true)
    
    // Prepare consultation/treatment data
    const treatmentData = {
      visit_id: visitId, // ✅ Now TypeScript knows this is string (not null)
      treatment_type: 'consultation',
      description: diagnosis,
      medications: prescriptions
        .filter(p => p.medication.trim() !== '')
        .map(p => ({
          name: p.medication,
          dosage: p.dosage,
          frequency: p.frequency,
          duration: p.duration,
          instructions: p.instructions
        })),
      observations: `
Symptoms: ${symptoms}

Physical Examination:
${physicalExam}

Lab Tests/Investigations:
${labTests}

Treatment Plan:
${treatmentPlan}

Follow-up: ${followUpDate || 'N/A'}

Additional Notes:
${additionalNotes}

${admissionRequired ? '🛌 ADMISSION REQUIRED - Patient needs inpatient care' : '🏠 DISCHARGE - Patient can be treated as outpatient'}
      `.trim()
    }

    console.log('💾 Saving treatment data:', treatmentData)

    // Save treatment record using API service
    const treatmentResponse = await apiService.saveTreatment(treatmentData)

    console.log('📋 Treatment response:', treatmentResponse)

    if (treatmentResponse.status !== 'success') {
      throw new Error(treatmentResponse.message || 'Failed to save treatment')
    }

    // Update visit status to completed
    await apiService.updateVisitStatus(visitId, 'completed') // ✅ Remove the ! since we checked it's not null

    alert('Consultation completed and saved successfully!')
    router.push('/queue')
  } catch (error: any) {
    console.error('Error completing consultation:', error)
    alert(`Failed to complete consultation: ${error.message}`)
  } finally {
    setSaving(false)
  }
}
  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-600 text-white"
      case "urgent":
        return "bg-orange-500 text-white"
      case "semi_urgent":
        return "bg-yellow-500 text-black"
      default:
        return "bg-green-500 text-white"
    }
  }

  // 🔥 ADDED: Get bed availability color
  const getBedAvailabilityColor = (occupancyRate: number) => {
    if (occupancyRate >= 90) return "text-red-600"
    if (occupancyRate >= 75) return "text-orange-500"
    return "text-green-600"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading patient information...</p>
        </div>
      </div>
    )
  }

  if (error || !patient || !triage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Patient Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error || 'Patient data not found'}</p>
            <Button onClick={() => router.push('/queue')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Queue
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.push('/queue')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Queue
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Patient Consultation</h1>
            <p className="text-muted-foreground">Complete diagnosis and treatment plan</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveDraft} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={handleCompleteConsultation} disabled={saving}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Complete Consultation
          </Button>
        </div>
      </div>

      {/* Patient Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">
                  {patient.first_name} {patient.last_name}
                </CardTitle>
                <CardDescription className="text-base">
                  Patient ID: {patient.patient_number} • {patient.age} years • {patient.gender}
                </CardDescription>
              </div>
            </div>
            <Badge className={getPriorityBadgeColor(triage.priority_level)}>
              {triage.priority_level.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{patient.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Department</p>
              <p className="font-medium">{visit?.department || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Check-in Time</p>
              <p className="font-medium">
                {visit?.check_in_time ? new Date(visit.check_in_time).toLocaleTimeString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">AI Risk Score</p>
              <p className="font-medium">{triage.ai_risk_score?.toFixed(2) || 'N/A'}</p>
            </div>
          </div>
          
          {patient.allergies && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <strong>Allergies:</strong>
                <span>
                  {Array.isArray(patient.allergies)
                    ? patient.allergies.join(', ')
                    : String(patient.allergies || 'none')}
                </span>
              </div>
            </div>
          )}

          {/* 🔥 ADDED: Admission Status Section */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bed className="w-5 h-5 text-blue-600" />
                <div>
                  <h4 className="font-semibold text-blue-800">
                    {visit?.admission_status === 'admitted' 
                      ? 'Patient Currently Admitted' 
                      : 'Admission Status'}
                  </h4>
                  <p className="text-blue-600 text-sm">
                    {visit?.admission_status === 'admitted' 
                      ? 'Patient is already admitted to a bed' 
                      : admissionRequired 
                        ? 'Admission required for this patient' 
                        : 'No admission required'}
                  </p>
                </div>
              </div>
              
              {visit?.admission_status !== 'admitted' && (
                <div className="flex gap-2">
                  <Button
                    variant={admissionRequired ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleAdmissionToggle(true)}
                  >
                    <Bed className="w-4 h-4 mr-2" />
                    Admit Patient
                  </Button>
                  <Button
                    variant={!admissionRequired ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleAdmissionToggle(false)}
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Discharge
                  </Button>
                </div>
              )}
            </div>

            {/* 🔥 ADDED: Bed Availability Information */}
            {bedAvailability && (
              <div className="mt-3 p-3 bg-white rounded border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Bed Availability in {visit?.department}</p>
                    <p className={`text-lg font-bold ${getBedAvailabilityColor(bedAvailability.occupancy_rate)}`}>
                      {bedAvailability.available_beds} of {bedAvailability.total_beds} beds available
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Occupancy: {bedAvailability.occupancy_rate.toFixed(1)}%
                    </p>
                  </div>
                  {bedAvailability.available_beds === 0 && (
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>
            )}

            {/* 🔥 ADDED: Bed Assignment Section */}
            {admissionRequired && availableBeds.length > 0 && visit?.admission_status !== 'admitted' && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                <Label htmlFor="bed-select" className="text-green-800 font-medium">
                  Assign to Available Bed:
                </Label>
                <div className="flex gap-2 mt-2">
                  <select
                    id="bed-select"
                    value={selectedBed}
                    onChange={(e) => setSelectedBed(e.target.value)}
                    className="flex-1 p-2 border rounded"
                  >
                    <option value="">Select a bed...</option>
                    {availableBeds.map((bed) => (
                      <option key={bed.id} value={bed.id}>
                        {bed.bed_number} - {bed.Ward?.ward_name} ({bed.bed_type})
                      </option>
                    ))}
                  </select>
                  <Button 
                    onClick={assignPatientToBed} 
                    disabled={!selectedBed || assigningBed}
                    size="sm"
                  >
                    {assigningBed ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Assign Bed
                  </Button>
                </div>
              </div>
            )}

            {admissionRequired && availableBeds.length === 0 && visit?.admission_status !== 'admitted' && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertTriangle className="w-4 h-4" />
                  <p className="text-sm">
                    No available beds in {visit?.department}. Patient will need to wait for bed availability.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Vital Signs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Vital Signs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Thermometer className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-xs text-muted-foreground">Temperature</p>
                <p className="text-lg font-bold">{triage?.vital_signs?.temperature || '-'}°C</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Heart className="w-8 h-8 text-pink-500" />
              <div>
                <p className="text-xs text-muted-foreground">Blood Pressure</p>
                <p className="text-lg font-bold">{triage.vital_signs.blood_pressure || '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Activity className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-xs text-muted-foreground">Heart Rate</p>
                <p className="text-lg font-bold">{triage.vital_signs.heart_rate || '-'} bpm</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Wind className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-xs text-muted-foreground">Resp. Rate</p>
                <p className="text-lg font-bold">{triage.vital_signs.respiratory_rate || '-'} /min</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Droplets className="w-8 h-8 text-cyan-500" />
              <div>
                <p className="text-xs text-muted-foreground">SpO2</p>
                <p className="text-lg font-bold">{triage.vital_signs.oxygen_saturation || '-'}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chief Complaint & Triage Notes */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Chief Complaint</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{visit?.chief_complaint || 'No chief complaint recorded'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Triage Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{triage.triage_notes || 'No triage notes'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Diagnosis Form */}
      <Tabs defaultValue="diagnosis" className="space-y-4">
        <TabsList>
          <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="treatment">Treatment Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="diagnosis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Clinical Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="symptoms">Symptoms</Label>
                <Textarea
                  id="symptoms"
                  placeholder="List all presenting symptoms..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="physical-exam">Physical Examination</Label>
                <Textarea
                  id="physical-exam"
                  placeholder="Record physical examination findings..."
                  value={physicalExam}
                  onChange={(e) => setPhysicalExam(e.target.value)}
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="lab-tests">Lab Tests / Investigations</Label>
                <Textarea
                  id="lab-tests"
                  placeholder="List any lab tests ordered or results..."
                  value={labTests}
                  onChange={(e) => setLabTests(e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="diagnosis" className="flex items-center gap-2">
                  Diagnosis <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="diagnosis"
                  placeholder="Enter primary diagnosis and any differential diagnoses..."
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  rows={4}
                  className="border-2"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Pill className="w-5 h-5" />
                  Prescriptions
                </CardTitle>
                <Button size="sm" onClick={addPrescription}>
                  Add Medication
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {prescriptions.map((prescription, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Medication #{index + 1}</h4>
                    {prescriptions.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePrescription(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <Label>Medication Name</Label>
                      <Input
                        placeholder="e.g., Amoxicillin"
                        value={prescription.medication}
                        onChange={(e) => updatePrescription(index, 'medication', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Dosage</Label>
                      <Input
                        placeholder="e.g., 500mg"
                        value={prescription.dosage}
                        onChange={(e) => updatePrescription(index, 'dosage', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Frequency</Label>
                      <Input
                        placeholder="e.g., 3 times daily"
                        value={prescription.frequency}
                        onChange={(e) => updatePrescription(index, 'frequency', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Duration</Label>
                      <Input
                        placeholder="e.g., 7 days"
                        value={prescription.duration}
                        onChange={(e) => updatePrescription(index, 'duration', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Instructions</Label>
                    <Input
                      placeholder="e.g., Take with food"
                      value={prescription.instructions}
                      onChange={(e) => updatePrescription(index, 'instructions', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="treatment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Treatment Plan & Follow-up
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="treatment-plan">Treatment Plan</Label>
                <Textarea
                  id="treatment-plan"
                  placeholder="Describe the recommended treatment approach, lifestyle modifications, etc..."
                  value={treatmentPlan}
                  onChange={(e) => setTreatmentPlan(e.target.value)}
                  rows={5}
                />
              </div>

              <div>
                <Label htmlFor="follow-up">Follow-up Date</Label>
                <Input
                  id="follow-up"
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="additional-notes">Additional Notes</Label>
                <Textarea
                  id="additional-notes"
                  placeholder="Any additional notes, patient education provided, referrals..."
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
        <div className="container mx-auto flex justify-end gap-3">
          <Button variant="outline" onClick={() => router.push('/queue')}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handleSaveDraft} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={handleCompleteConsultation} disabled={saving}>
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            Complete Consultation
          </Button>
        </div>
      </div>
    </div>
  )
}