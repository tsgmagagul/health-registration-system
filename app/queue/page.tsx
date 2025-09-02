"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, Clock, User, Heart, CheckCircle } from "lucide-react"

interface QueuePatient {
  id: string
  name: string
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  priority: number
  department: string
  estimatedWaitTime: string
  checkedInAt: string
  status: "waiting" | "in-progress" | "completed"
}

export default function QueuePage() {
  const [queueData, setQueueData] = useState<QueuePatient[]>([
    {
      id: "218728448",
      name: "Thandolwenkosi Magagula",
      riskLevel: "HIGH",
      priority: 2,
      department: "Emergency",
      estimatedWaitTime: "5-15 minutes",
      checkedInAt: "09:30",
      status: "waiting",
    },
    {
      id: "987654321",
      name: "Jane Doe",
      riskLevel: "MEDIUM",
      priority: 3,
      department: "General Medicine",
      estimatedWaitTime: "30-60 minutes",
      checkedInAt: "09:45",
      status: "waiting",
    },
    {
      id: "123456789",
      name: "John Smith",
      riskLevel: "LOW",
      priority: 4,
      department: "General Medicine",
      estimatedWaitTime: "60-120 minutes",
      checkedInAt: "10:00",
      status: "waiting",
    },
  ])

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "waiting":
        return <Badge variant="outline">Waiting</Badge>
      case "in-progress":
        return <Badge className="bg-blue-500 text-white">In Progress</Badge>
      case "completed":
        return <Badge className="bg-green-500 text-white">Completed</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const updatePatientStatus = (patientId: string, newStatus: "waiting" | "in-progress" | "completed") => {
    setQueueData((prev) =>
      prev.map((patient) => (patient.id === patientId ? { ...patient, status: newStatus } : patient)),
    )
  }

  const sortedQueue = [...queueData].sort((a, b) => a.priority - b.priority)
  const emergencyQueue = sortedQueue.filter((p) => p.department === "Emergency")
  const generalQueue = sortedQueue.filter((p) => p.department === "General Medicine")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Patient Queue Management</h1>
        <div className="text-sm text-muted-foreground">
          Total patients in queue: {queueData.filter((p) => p.status === "waiting").length}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Critical/High Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {queueData.filter((p) => p.riskLevel === "CRITICAL" || p.riskLevel === "HIGH").length}
            </div>
            <p className="text-xs text-muted-foreground">Immediate attention needed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Wait Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45 min</div>
            <p className="text-xs text-muted-foreground">Current average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Patients Seen Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">Completed consultations</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Patients</TabsTrigger>
          <TabsTrigger value="emergency">Emergency ({emergencyQueue.length})</TabsTrigger>
          <TabsTrigger value="general">General ({generalQueue.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Complete Patient Queue</CardTitle>
              <CardDescription>All patients sorted by priority level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedQueue.map((patient, index) => (
                  <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
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
                          {patient.department} • Checked in: {patient.checkedInAt} • Wait: {patient.estimatedWaitTime}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {patient.status === "waiting" && (
                        <Button size="sm" onClick={() => updatePatientStatus(patient.id, "in-progress")}>
                          Call Patient
                        </Button>
                      )}
                      {patient.status === "in-progress" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updatePatientStatus(patient.id, "completed")}
                        >
                          Mark Complete
                        </Button>
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
              <div className="space-y-4">
                {emergencyQueue.map((patient, index) => (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between p-4 border-l-4 border-red-500 bg-red-50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-red-600">#{index + 1}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{patient.name}</span>
                          <Badge className={getRiskBadgeColor(patient.riskLevel)}>
                            {getRiskIcon(patient.riskLevel)}
                            {patient.riskLevel}
                          </Badge>
                          {getStatusBadge(patient.status)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Checked in: {patient.checkedInAt} • Wait: {patient.estimatedWaitTime}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {patient.status === "waiting" && (
                        <Button
                          size="sm"
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => updatePatientStatus(patient.id, "in-progress")}
                        >
                          Call Now
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Medicine Queue</CardTitle>
              <CardDescription>Standard priority patients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {generalQueue.map((patient, index) => (
                  <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
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
                          Checked in: {patient.checkedInAt} • Wait: {patient.estimatedWaitTime}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {patient.status === "waiting" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updatePatientStatus(patient.id, "in-progress")}
                        >
                          Call Patient
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
