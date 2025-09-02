"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertTriangle, Clock, User, Heart } from "lucide-react"

interface Patient {
  id: string
  name: string
  dob: string
  lastVisit: string
  medicalHistory?: string[]
}

interface TriageResult {
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  priority: number
  estimatedWaitTime: string
  recommendedAction: string
  department: string
}

export default function CheckInPage() {
  const [patientId, setPatientId] = useState("")
  const [patientData, setPatientData] = useState<Patient | null>(null)
  const [triageSymptoms, setTriageSymptoms] = useState("")
  const [triageVitals, setTriageVitals] = useState("")
  const [painLevel, setPainLevel] = useState("")
  const [urgencyLevel, setUrgencyLevel] = useState("")
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const mockPatients: Patient[] = [
    {
      id: "218728448",
      name: "Thandolwenkosi Magagula",
      dob: "1990-01-15",
      lastVisit: "2023-10-20",
      medicalHistory: ["Hypertension", "Diabetes Type 2"],
    },
    {
      id: "987654321",
      name: "Jane Doe",
      dob: "1985-05-22",
      lastVisit: "2024-01-01",
      medicalHistory: ["Asthma"],
    },
    {
      id: "123456789",
      name: "John Smith",
      dob: "1978-11-30",
      lastVisit: "2023-12-15",
      medicalHistory: [],
    },
  ]

  const calculateTriageRisk = (symptoms: string, vitals: string, pain: string, urgency: string): TriageResult => {
    let riskScore = 0
    let riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW"
    let department = "General Medicine"

    // Analyze symptoms for high-risk keywords
    const highRiskSymptoms = [
      "chest pain",
      "difficulty breathing",
      "severe bleeding",
      "unconscious",
      "stroke",
      "heart attack",
    ]
    const mediumRiskSymptoms = ["fever", "vomiting", "severe pain", "dizziness", "confusion"]

    const symptomsLower = symptoms.toLowerCase()

    if (highRiskSymptoms.some((symptom) => symptomsLower.includes(symptom))) {
      riskScore += 3
      department = "Emergency"
    } else if (mediumRiskSymptoms.some((symptom) => symptomsLower.includes(symptom))) {
      riskScore += 2
    }

    // Analyze vitals (simplified parsing)
    if (vitals.toLowerCase().includes("bp:")) {
      const bpMatch = vitals.match(/bp:\s*(\d+)\/(\d+)/i)
      if (bpMatch) {
        const systolic = Number.parseInt(bpMatch[1])
        const diastolic = Number.parseInt(bpMatch[2])
        if (systolic > 180 || diastolic > 110 || systolic < 90) {
          riskScore += 2
        }
      }
    }

    if (vitals.toLowerCase().includes("temp:")) {
      const tempMatch = vitals.match(/temp:\s*(\d+\.?\d*)/i)
      if (tempMatch) {
        const temp = Number.parseFloat(tempMatch[1])
        if (temp > 39 || temp < 35) {
          riskScore += 1
        }
      }
    }

    // Pain level assessment
    const painNum = Number.parseInt(pain)
    if (painNum >= 8) {
      riskScore += 2
    } else if (painNum >= 6) {
      riskScore += 1
    }

    // Urgency level
    if (urgency === "immediate") {
      riskScore += 3
    } else if (urgency === "urgent") {
      riskScore += 2
    } else if (urgency === "semi-urgent") {
      riskScore += 1
    }

    // Determine final risk level and priority
    if (riskScore >= 6) {
      riskLevel = "CRITICAL"
    } else if (riskScore >= 4) {
      riskLevel = "HIGH"
    } else if (riskScore >= 2) {
      riskLevel = "MEDIUM"
    }

    // Calculate priority and wait time
    let priority: number
    let estimatedWaitTime: string
    let recommendedAction: string

    switch (riskLevel) {
      case "CRITICAL":
        priority = 1
        estimatedWaitTime = "Immediate"
        recommendedAction = "Transfer to Emergency Department immediately. Alert medical team."
        department = "Emergency"
        break
      case "HIGH":
        priority = 2
        estimatedWaitTime = "5-15 minutes"
        recommendedAction = "Fast-track to appropriate department. Monitor closely."
        break
      case "MEDIUM":
        priority = 3
        estimatedWaitTime = "30-60 minutes"
        recommendedAction = "Standard queue with regular monitoring."
        break
      default:
        priority = 4
        estimatedWaitTime = "60-120 minutes"
        recommendedAction = "Standard queue. Routine care."
        break
    }

    return {
      riskLevel,
      priority,
      estimatedWaitTime,
      recommendedAction,
      department,
    }
  }

  const handleCheckIn = (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setTriageResult(null)
    const foundPatient = mockPatients.find((p) => p.id === patientId)

    if (foundPatient) {
      setPatientData(foundPatient)
      setMessage({ type: "success", text: `Patient ${foundPatient.name} found. Please proceed to triage.` })
    } else {
      setPatientData(null)
      setMessage({ type: "error", text: "Patient not found. Please check the ID number." })
    }
  }

  const handleTriageSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (patientData && triageSymptoms && triageVitals && painLevel && urgencyLevel) {
      const result = calculateTriageRisk(triageSymptoms, triageVitals, painLevel, urgencyLevel)
      setTriageResult(result)

      setMessage({
        type: "success",
        text: `Triage completed for ${patientData.name}. Risk level: ${result.riskLevel}`,
      })
    } else {
      setMessage({ type: "error", text: "Please complete all triage fields." })
    }
  }

  const handlePatientAssignment = () => {
    if (patientData && triageResult) {
      // Reset form for next patient
      setPatientId("")
      setPatientData(null)
      setTriageSymptoms("")
      setTriageVitals("")
      setPainLevel("")
      setUrgencyLevel("")
      setTriageResult(null)
      setMessage({
        type: "success",
        text: `${patientData.name} has been assigned to ${triageResult.department}. Next patient ready for check-in.`,
      })
    }
  }

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case "CRITICAL":
        return "bg-red-600 text-white"
      case "HIGH":
        return "bg-orange-500 text-white"
      case "MEDIUM":
        return "bg-yellow-500 text-black"
      default:
        return "bg-green-500 text-white"
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

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Patient Check-in</CardTitle>
          <CardDescription>Check in a registered patient using their ID number.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCheckIn} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="patientId">Patient ID Number</Label>
              <Input
                id="patientId"
                type="text"
                placeholder="Enter patient ID"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                required
              />
            </div>
            <Button type="submit">Check In Patient</Button>
          </form>
          {message && (
            <div
              className={`mt-4 flex items-center gap-2 ${
                message.type === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              {message.type === "success" ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              {message.text}
            </div>
          )}
        </CardContent>
      </Card>

      {patientData && !triageResult && (
        <Card>
          <CardHeader>
            <CardTitle>Triage Assessment for {patientData.name}</CardTitle>
            <CardDescription>
              Patient ID: {patientData.id} | DOB: {patientData.dob} | Last Visit: {patientData.lastVisit}
              {patientData.medicalHistory && patientData.medicalHistory.length > 0 && (
                <div className="mt-2">
                  <span className="font-medium">Medical History: </span>
                  {patientData.medicalHistory.map((condition, index) => (
                    <Badge key={index} variant="outline" className="ml-1">
                      {condition}
                    </Badge>
                  ))}
                </div>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTriageSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="symptoms">Chief Complaint & Symptoms</Label>
                <Textarea
                  id="symptoms"
                  placeholder="Describe patient's main complaint and symptoms..."
                  value={triageSymptoms}
                  onChange={(e) => setTriageSymptoms(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="vitals">Vital Signs</Label>
                <Input
                  id="vitals"
                  placeholder="e.g., BP: 120/80, Temp: 37.0C, HR: 72, RR: 16"
                  value={triageVitals}
                  onChange={(e) => setTriageVitals(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="painLevel">Pain Level (0-10)</Label>
                  <Select value={painLevel} onValueChange={setPainLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select pain level" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(11)].map((_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {i} - {i === 0 ? "No pain" : i <= 3 ? "Mild" : i <= 6 ? "Moderate" : "Severe"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="urgency">Urgency Level</Label>
                  <Select value={urgencyLevel} onValueChange={setUrgencyLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate (Life-threatening)</SelectItem>
                      <SelectItem value="urgent">Urgent (Within 1 hour)</SelectItem>
                      <SelectItem value="semi-urgent">Semi-urgent (Within 2 hours)</SelectItem>
                      <SelectItem value="standard">Standard (Within 4 hours)</SelectItem>
                      <SelectItem value="non-urgent">Non-urgent (Within 24 hours)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit">Complete Triage Assessment</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {triageResult && patientData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Triage Results for {patientData.name}
              <Badge className={getRiskBadgeColor(triageResult.riskLevel)}>
                {getRiskIcon(triageResult.riskLevel)}
                {triageResult.riskLevel} RISK
              </Badge>
            </CardTitle>
            <CardDescription>Assessment completed - Patient classification and next steps</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Priority Level:</span>
                  <span className="text-lg font-bold">P{triageResult.priority}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Estimated Wait Time:</span>
                  <span className="font-semibold text-blue-600">{triageResult.estimatedWaitTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Assigned Department:</span>
                  <span className="font-semibold">{triageResult.department}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Recommended Action:</h4>
                  <p className="text-sm">{triageResult.recommendedAction}</p>
                </div>
              </div>
            </div>

            {triageResult.riskLevel === "CRITICAL" && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-bold">CRITICAL PATIENT ALERT</span>
                </div>
                <p className="text-red-700 mt-2">
                  This patient requires immediate medical attention. Alert the emergency team and prepare for immediate
                  treatment.
                </p>
              </div>
            )}

            {triageResult.riskLevel === "HIGH" && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2 text-orange-800">
                  <Heart className="w-5 h-5" />
                  <span className="font-bold">HIGH PRIORITY PATIENT</span>
                </div>
                <p className="text-orange-700 mt-2">
                  This patient should be seen promptly. Fast-track to the appropriate department.
                </p>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button onClick={handlePatientAssignment} className="flex-1">
                {triageResult.riskLevel === "CRITICAL"
                  ? "Send to Emergency Now"
                  : triageResult.riskLevel === "HIGH"
                    ? "Fast-Track Patient"
                    : "Add to Queue"}
              </Button>
              <Button variant="outline" onClick={() => setTriageResult(null)}>
                Modify Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
