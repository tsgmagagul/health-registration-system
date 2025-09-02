"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts"
import { Button } from "@/components/ui/button"
import {
  Users,
  Clock,
  Hospital,
  ArrowUpRight,
  CalendarDays,
  Hourglass,
  GitPullRequestArrow,
  CheckCircle,
  Settings,
} from "lucide-react"

// Mock Data for Charts and Metrics
const patientRegistrationData = [
  { date: "Jan", registrations: 120 },
  { date: "Feb", registrations: 150 },
  { date: "Mar", registrations: 130 },
  { date: "Apr", registrations: 180 },
  { date: "May", registrations: 200 },
  { date: "Jun", registrations: 170 },
]

const waitTimeData = [
  { department: "Emergency", avgWait: 45 },
  { department: "General", avgWait: 20 },
  { department: "Pediatrics", avgWait: 30 },
  { department: "Cardiology", avgWait: 60 },
  { department: "Orthopedics", avgWait: 35 },
]

export default function DashboardPage() {
  const [userData, setUserData] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const storedData = localStorage.getItem("userData")
    if (storedData) {
      const data = JSON.parse(storedData)
      setUserData(data)

      // Redirect admin users to admin dashboard
      if (data.isAdmin) {
        router.push("/admin")
        return
      }
    } else {
      router.push("/login")
    }
  }, [router])

  if (!userData) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{userData.facilityName}</h1>
          <p className="text-muted-foreground">{userData.province} Province</p>
        </div>
        {userData.isAdmin && (
          <Button onClick={() => router.push("/admin")} variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Admin Dashboard
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Overview Cards */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Patients Today</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              <ArrowUpRight className="inline-block w-3 h-3 mr-1" />
              {"20% from last month"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Current Occupancy</CardTitle>
            <Hospital className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">{"350/410 beds occupied"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Wait Time</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">25 min</div>
            <p className="text-xs text-muted-foreground">
              <ArrowUpRight className="inline-block w-3 h-3 mr-1" />
              {"5% decrease from last week"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
            <CalendarDays className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">187</div>
            <p className="text-xs text-muted-foreground">{"Next 24 hours"}</p>
          </CardContent>
        </Card>

        {/* Patient Registration Trends Chart */}
        <Card className="col-span-full lg:col-span-2">
          <CardHeader>
            <CardTitle>Patient Registration Trends</CardTitle>
            <CardDescription>Monthly new patient registrations at {userData.facilityName}.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                registrations: {
                  label: "Registrations",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="aspect-video h-[250px]"
            >
              <LineChart data={patientRegistrationData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Line
                  dataKey="registrations"
                  type="monotone"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Wait Times by Department Chart */}
        <Card className="col-span-full lg:col-span-2">
          <CardHeader>
            <CardTitle>Average Wait Times by Department</CardTitle>
            <CardDescription>Average wait time in minutes per department.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                avgWait: {
                  label: "Avg. Wait (min)",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="aspect-video h-[250px]"
            >
              <BarChart data={waitTimeData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="department" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Bar dataKey="avgWait" fill="hsl(var(--chart-2))" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Predictive Analytics Placeholder */}
        <Card className="col-span-full md:col-span-2">
          <CardHeader>
            <CardTitle>Predictive Analytics</CardTitle>
            <CardDescription>Forecast staffing, equipment, and patient flow.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-32 text-muted-foreground">
            <GitPullRequestArrow className="w-8 h-8 mr-2" />
            {"Predictive models coming soon..."}
          </CardContent>
        </Card>

        {/* AI-Powered Queue Management Placeholder */}
        <Card className="col-span-full md:col-span-2">
          <CardHeader>
            <CardTitle>AI-Powered Queue Management</CardTitle>
            <CardDescription>Automated room assignment and dynamic prioritization.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-32 text-muted-foreground">
            <Hourglass className="w-8 h-8 mr-2" />
            {"Smart queue optimization in development..."}
          </CardContent>
        </Card>

        {/* Check-Out Time Monitoring Placeholder */}
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Check-Out Time Monitoring</CardTitle>
            <CardDescription>Track expected check-out times and patient progress.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-32 text-muted-foreground">
            <CheckCircle className="w-8 h-8 mr-2" />
            {"Real-time check-out tracking features..."}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
