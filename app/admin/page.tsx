"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid } from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Hospital, AlertTriangle, MapPin, TrendingUp, Activity } from "lucide-react"

// Mock data for provinces
const provinceData = [
  {
    name: "Gauteng",
    hospitals: 45,
    clinics: 120,
    totalPatients: 15420,
    staffShortage: 23,
    equipmentNeeds: 15,
    occupancyRate: 87,
  },
  {
    name: "Western Cape",
    hospitals: 38,
    clinics: 95,
    totalPatients: 12350,
    staffShortage: 18,
    equipmentNeeds: 12,
    occupancyRate: 82,
  },
  {
    name: "KwaZulu-Natal",
    hospitals: 42,
    clinics: 110,
    totalPatients: 13890,
    staffShortage: 31,
    equipmentNeeds: 22,
    occupancyRate: 91,
  },
  {
    name: "Eastern Cape",
    hospitals: 35,
    clinics: 85,
    totalPatients: 9870,
    staffShortage: 28,
    equipmentNeeds: 19,
    occupancyRate: 78,
  },
  {
    name: "Limpopo",
    hospitals: 28,
    clinics: 75,
    totalPatients: 7650,
    staffShortage: 35,
    equipmentNeeds: 25,
    occupancyRate: 85,
  },
]

const resourceAllocationData = [
  { category: "Doctors", current: 2450, needed: 3200, shortage: 750 },
  { category: "Nurses", current: 8900, needed: 12500, shortage: 3600 },
  { category: "Specialists", current: 890, needed: 1350, shortage: 460 },
  { category: "Medical Equipment", current: 75, needed: 100, shortage: 25 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function AdminDashboard() {
  const [userData, setUserData] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const storedData = localStorage.getItem("userData")
    if (storedData) {
      const data = JSON.parse(storedData)
      if (!data.isAdmin) {
        router.push("/dashboard")
        return
      }
      setUserData(data)
    } else {
      router.push("/login")
    }
  }, [router])

  if (!userData) {
    return <div>Loading...</div>
  }

  const totalPatients = provinceData.reduce((sum, province) => sum + province.totalPatients, 0)
  const totalFacilities = provinceData.reduce((sum, province) => sum + province.hospitals + province.clinics, 0)
  const avgOccupancy = Math.round(
    provinceData.reduce((sum, province) => sum + province.occupancyRate, 0) / provinceData.length,
  )
  const totalStaffShortage = provinceData.reduce((sum, province) => sum + province.staffShortage, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">National Healthcare Administration</h1>
        <div className="text-sm text-muted-foreground">Admin: {userData.id} | South Africa Overview</div>
      </div>

      {/* National Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPatients.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all provinces</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Healthcare Facilities</CardTitle>
            <Hospital className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFacilities}</div>
            <p className="text-xs text-muted-foreground">Hospitals & Clinics</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Occupancy</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgOccupancy}%</div>
            <p className="text-xs text-muted-foreground">National average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Staff Shortage</CardTitle>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalStaffShortage}%</div>
            <p className="text-xs text-muted-foreground">Critical shortage areas</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="provinces" className="space-y-4">
        <TabsList>
          <TabsTrigger value="provinces">Provincial Overview</TabsTrigger>
          <TabsTrigger value="resources">Resource Allocation</TabsTrigger>
          <TabsTrigger value="trends">National Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="provinces" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Patient Distribution by Province</CardTitle>
                <CardDescription>Current patient load across provinces</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    totalPatients: { label: "Patients", color: "hsl(var(--chart-1))" },
                  }}
                  className="h-[300px]"
                >
                  <BarChart data={provinceData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="totalPatients" fill="hsl(var(--chart-1))" radius={4} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Occupancy Rates by Province</CardTitle>
                <CardDescription>Hospital bed occupancy percentages</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    occupancyRate: { label: "Occupancy %", color: "hsl(var(--chart-2))" },
                  }}
                  className="h-[300px]"
                >
                  <LineChart data={provinceData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line dataKey="occupancyRate" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Provincial Details */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {provinceData.map((province) => (
              <Card key={province.name}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {province.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Hospitals:</span>
                    <span className="font-medium">{province.hospitals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Clinics:</span>
                    <span className="font-medium">{province.clinics}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Patients:</span>
                    <span className="font-medium">{province.totalPatients.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Staff Shortage:</span>
                    <span className={`font-medium ${province.staffShortage > 25 ? "text-red-600" : "text-yellow-600"}`}>
                      {province.staffShortage}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Equipment Needs:</span>
                    <span className="font-medium text-orange-600">{province.equipmentNeeds}%</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>National Resource Allocation</CardTitle>
                <CardDescription>Current vs. required resources across South Africa</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    current: { label: "Current", color: "hsl(var(--chart-1))" },
                    needed: { label: "Needed", color: "hsl(var(--chart-2))" },
                  }}
                  className="h-[300px]"
                >
                  <BarChart data={resourceAllocationData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="category" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="current" fill="hsl(var(--chart-1))" radius={4} />
                    <Bar dataKey="needed" fill="hsl(var(--chart-2))" radius={4} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Critical Resource Shortages</CardTitle>
                <CardDescription>Priority areas requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {resourceAllocationData.map((resource) => (
                  <div key={resource.category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{resource.category}</span>
                      <span className="text-sm text-red-600">-{resource.shortage}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${(resource.shortage / resource.needed) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>National Healthcare Trends</CardTitle>
              <CardDescription>Key performance indicators and trends</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-4" />
                <p>Advanced analytics and trend visualization coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
