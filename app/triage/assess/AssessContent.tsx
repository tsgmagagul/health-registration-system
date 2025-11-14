"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Brain, 
  AlertTriangle, 
  Activity, 
  Heart, 
  Thermometer, 
  Droplets, 
  Wind,
  Clock,
  CheckCircle,
  Loader2,
  Sparkles
} from "lucide-react"
import { apiService } from "@/lib/api"

interface VitalSigns {
  temperature: number
  blood_pressure: string
  heart_rate: number
  respiratory_rate: number
  oxygen_saturation: number
}

interface AIPrediction {
  priority_level: string
  confidence: number
  risk_score: number
  recommended_actions: string[]
  estimated_wait_time?: number
}

interface Patient {
  id: string
  first_name: string
  last_name: string
  patient_number: string
  age: number
  gender: string
  medical_history?: any
}

export default function AITriagePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const patientId = searchParams.get('patientId')
  const visitId = searchParams.get('visitId')

  const [loading, setLoading] = useState(false)
  const [predicting, setPredicting] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [searching, setSearching] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  
  const [patient, setPatient] = useState<Patient | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [symptomInput, setSymptomInput] = useState("")
  const [vitalSigns, setVitalSigns] = useState<VitalSigns>({
    temperature: 37.0,
    blood_pressure: "120/80",
    heart_rate: 80,
    respiratory_rate: 16,
    oxygen_saturation: 98
  })
  const [triageNotes, setTriageNotes] = useState("")
  const [manualPriority, setManualPriority] = useState("")
  
  const [aiPrediction, setAiPrediction] = useState<AIPrediction | null>(null)
  const [riskAssessment, setRiskAssessment] = useState<any>(null)
  const [waitTimePrediction, setWaitTimePrediction] = useState<any>(null)

  useEffect(() => {
    if (patientId) {
      fetchPatientData()
    }
  }, [patientId])

  const fetchPatientData = async () => {
    try {
      setLoading(true)
      const response = await apiService.getPatient(patientId!) as any
      if (response.status === 'success') {
        setPatient(response.data)
        
      }
    } catch (error) {
      console.error('Error fetching patient:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchPatients = async () => {
    try {
      setSearching(true)
      const response = await apiService.searchPatients(searchTerm) as any
      if (response.status === "success") {
        setPatients(response.data)
      } else {
        setPatients([])
      }
    } catch (error) {
      console.error("Error searching patients:", error)
    } finally {
      setSearching(false)
    }
  }

  const handleSelectPatient = (patient: Patient) => {
    setPatient(patient)
    router.push(`/triage?patientId=${patient.id}`)
  }

  const addSymptom = () => {
    if (symptomInput.trim() && !symptoms.includes(symptomInput.trim())) {
      setSymptoms([...symptoms, symptomInput.trim()])
      setSymptomInput("")
    }
  }

  const removeSymptom = (symptom: string) => {
    setSymptoms(symptoms.filter(s => s !== symptom))
  }

  const handleVitalSignChange = (field: keyof VitalSigns, value: string | number) => {
    setVitalSigns(prev => ({ ...prev, [field]: value }))
  }

  const runAIPrediction = async () => {
    if (symptoms.length === 0) {
      alert('Please add at least one symptom')
      return
    }

    try {
      setPredicting(true)

      const triagePrediction = await apiService.predictTriage({
        symptoms,
        vital_signs: vitalSigns
      }) as any

      if (triagePrediction.status === 'success') {
        setAiPrediction(triagePrediction.data)
      }

      const riskResponse = await apiService.assessRisk({
        patient_id: patientId || undefined,
        symptoms,
        vital_signs: vitalSigns,
        medical_history: patient?.medical_history,
        age: patient?.age || 0
      }) as any

      if (riskResponse.status === 'success') {
        setRiskAssessment(riskResponse.data)
      }

      if (triagePrediction.status === 'success') {
        const waitResponse = await apiService.predictWaitTime({
          priority_level: triagePrediction.data.priority_level,
          department: 'emergency',
          symptoms
        }) as any

        if (waitResponse.status === 'success') {
          setWaitTimePrediction(waitResponse.data)
        }
      }

    } catch (error) {
      console.error('AI prediction error:', error)
      alert('Failed to get AI predictions')
    } finally {
      setPredicting(false)
    }
  }


  const submitTriage = async () => {
    if (!aiPrediction && !manualPriority) {
      alert('Please run AI prediction or select manual priority')
      return
    }

    try {
      setSubmitting(true)

      const triageData = {
        patient_id: patientId,
        visit_id: visitId,
        symptoms,
        vital_signs: vitalSigns,
        triage_notes: triageNotes,
        manual_priority: manualPriority || aiPrediction?.priority_level
      }

      const response = await apiService.createTriage(triageData) as any

     if (response.status === 'success') {
      setSuccessMessage(`✅ Triage completed successfully! Redirecting to triage queue...`)

      setTimeout(() => {
        router.push('/triage') // <--- Redirect to /triage
      }, 1500)
    }
 

    } catch (error) {
      console.error('Triage submission error:', error)
      alert('Failed to submit triage assessment')
    } finally {
      setSubmitting(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'bg-red-600 text-white'
      case 'urgent': return 'bg-orange-500 text-white'
      case 'semi_urgent': return 'bg-yellow-500 text-black'
      case 'standard': return 'bg-blue-500 text-white'
      default: return 'bg-green-500 text-white'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'critical': return 'text-red-600'
      case 'high': return 'text-orange-600'
      case 'moderate': return 'text-yellow-600'
      default: return 'text-green-600'
    }
  }

  if (!patientId && !patient) {
    return (
      <div className="space-y-6 pb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Brain className="w-8 h-8 text-purple-600" />
          Search Patient for Triage
        </h1>
        <p className="text-muted-foreground">
          Enter name, ID, or patient number to find a patient.
        </p>

        <div className="flex gap-2 max-w-md">
          <Input
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchPatients()}
          />
          <Button onClick={searchPatients} disabled={searching || !searchTerm}>
            {searching ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Searching...
              </>
            ) : (
              "Search"
            )}
          </Button>
        </div>

        {patients.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {patients.map((patient) => (
                  <div
                    key={patient.id}
                    className="py-3 flex justify-between items-center cursor-pointer hover:bg-gray-50 rounded px-2"
                    onClick={() => handleSelectPatient(patient)}
                  >
                    <div>
                      <p className="font-medium">{patient.first_name} {patient.last_name}</p>
                      <p className="text-sm text-muted-foreground">
                        #{patient.patient_number} • {patient.gender} • {patient.age || "N/A"} years
                      </p>
                    </div>
                    <Badge variant="outline">Select</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          searchTerm && !searching && (
            <p className="text-muted-foreground">No patients found.</p>
          )
        )}
      </div>
    )
  }

  if (loading && !patient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Brain className="w-8 h-8 text-purple-600" />
          AI-Powered Triage Assessment
        </h1>
        <p className="text-muted-foreground">Intelligent patient prioritization with machine learning</p>
      </div>

      {/* {patient && (
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{patient.first_name} {patient.last_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Patient Number</p>
                <p className="font-medium">{patient.patient_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Age</p>
                <p className="font-medium">{patient.age || 'N/A'} years</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gender</p>
                <p className="font-medium">{patient.gender}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )} */}

      <Tabs defaultValue="assessment" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assessment">Triage Assessment</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="assessment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Symptoms</CardTitle>
              <CardDescription>Record patient's presenting symptoms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter symptom (e.g., chest pain, fever)"
                  value={symptomInput}
                  onChange={(e) => setSymptomInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSymptom()}
                />
                <Button onClick={addSymptom}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {symptoms.map((symptom) => (
                  <Badge key={symptom} variant="secondary" className="text-sm">
                    {symptom}
                    <button
                      onClick={() => removeSymptom(symptom)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Vital Signs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-red-500" />
                    Temperature (°C)
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={vitalSigns.temperature}
                    onChange={(e) => handleVitalSignChange('temperature', parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-500" />
                    Blood Pressure
                  </Label>
                  <Input
                    placeholder="120/80"
                    value={vitalSigns.blood_pressure}
                    onChange={(e) => handleVitalSignChange('blood_pressure', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    Heart Rate (bpm)
                  </Label>
                  <Input
                    type="number"
                    value={vitalSigns.heart_rate}
                    onChange={(e) => handleVitalSignChange('heart_rate', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-green-500" />
                    Respiratory Rate (/min)
                  </Label>
                  <Input
                    type="number"
                    value={vitalSigns.respiratory_rate}
                    onChange={(e) => handleVitalSignChange('respiratory_rate', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-cyan-500" />
                    SpO2 (%)
                  </Label>
                  <Input
                    type="number"
                    value={vitalSigns.oxygen_saturation}
                    onChange={(e) => handleVitalSignChange('oxygen_saturation', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Triage Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Additional observations and notes..."
                rows={4}
                value={triageNotes}
                onChange={(e) => setTriageNotes(e.target.value)}
              />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">AI-Powered Analysis</h3>
                    <p className="text-sm text-muted-foreground">
                      Get instant priority prediction with 90%+ accuracy
                    </p>
                  </div>
                </div>
                <Button 
                  size="lg"
                  onClick={runAIPrediction}
                  disabled={predicting || symptoms.length === 0}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {predicting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Run AI Analysis
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-insights" className="space-y-4">
          {!aiPrediction && !riskAssessment ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Brain className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-muted-foreground">Run AI analysis to see predictions</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {aiPrediction && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-600" />
                      AI Priority Prediction
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Predicted Priority Level</p>
                        <Badge className={`${getPriorityColor(aiPrediction.priority_level)} text-lg px-4 py-2`}>
                          {aiPrediction.priority_level.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Confidence Score</p>
                        <p className="text-3xl font-bold text-purple-600">
                          {(aiPrediction.confidence * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <p className="text-sm font-medium mb-2">Risk Score</p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              aiPrediction.risk_score > 0.7 ? 'bg-red-600' :
                              aiPrediction.risk_score > 0.5 ? 'bg-orange-500' :
                              aiPrediction.risk_score > 0.3 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${aiPrediction.risk_score * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold">{(aiPrediction.risk_score * 100).toFixed(0)}%</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <p className="text-sm font-medium mb-2">Recommended Actions</p>
                      <ul className="space-y-2">
                        {aiPrediction.recommended_actions.map((action, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}

              {riskAssessment && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                      Patient Risk Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Risk Level</p>
                        <p className={`text-2xl font-bold ${getRiskColor(riskAssessment.risk_level)}`}>
                          {riskAssessment.risk_level.toUpperCase()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Confidence</p>
                        <p className="text-2xl font-bold">
                          {(riskAssessment.confidence * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>

                    {riskAssessment.risk_factors.length > 0 && (
                      <div className="pt-4 border-t">
                        <p className="text-sm font-medium mb-2">Risk Factors</p>
                        <ul className="space-y-1">
                          {riskAssessment.risk_factors.map((factor: string, idx: number) => (
                            <li key={idx} className="text-sm flex items-start gap-2">
                              <span className="text-red-500">•</span>
                              {factor}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {riskAssessment.alerts.length > 0 && (
                      <div className="pt-4 border-t">
                        <p className="text-sm font-medium mb-2 text-red-600">⚠️ Critical Alerts</p>
                        <ul className="space-y-2">
                          {riskAssessment.alerts.map((alert: string, idx: number) => (
                            <li key={idx} className="text-sm p-2 bg-red-50 border border-red-200 rounded">
                              {alert}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {waitTimePrediction && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      Estimated Wait Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-4">
                      <p className="text-5xl font-bold text-blue-600">
                        {waitTimePrediction.minutes}
                      </p>
                      <p className="text-muted-foreground">minutes</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Range: {waitTimePrediction.range.min}-{waitTimePrediction.range.max} minutes
                      </p>
                      <p className="text-sm mt-4">
                        <span className="font-medium">Queue Position:</span> #{waitTimePrediction.position}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Patients Ahead:</span> {waitTimePrediction.patients_ahead}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {successMessage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <Card className="w-96 bg-white">
            <CardContent className="pt-6 text-center space-y-4">
              <CheckCircle className="w-16 h-16 mx-auto text-green-600" />
              <p className="text-lg font-semibold">{successMessage}</p>
              <p className="text-sm text-muted-foreground">Redirecting in a moment...</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => router.push('/queue')} disabled={submitting}>
              Cancel
            </Button>
            <Button 
              size="lg"
              onClick={submitTriage}
              disabled={submitting || (!aiPrediction && !manualPriority)}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Complete Triage Assessment'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}