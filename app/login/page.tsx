"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data for hospitals and clinics
const healthcareFacilities = {
  Gauteng: [
    { id: "gt001", name: "Chris Hani Baragwanath Hospital", type: "Hospital" },
    { id: "gt002", name: "Charlotte Maxeke Johannesburg Academic Hospital", type: "Hospital" },
    { id: "gt003", name: "Hillbrow Community Health Centre", type: "Clinic" },
    { id: "gt004", name: "Alexandra Clinic", type: "Clinic" },
  ],
  "Western Cape": [
    { id: "wc001", name: "Groote Schuur Hospital", type: "Hospital" },
    { id: "wc002", name: "Tygerberg Hospital", type: "Hospital" },
    { id: "wc003", name: "Mitchells Plain District Hospital", type: "Hospital" },
    { id: "wc004", name: "Khayelitsha District Hospital", type: "Hospital" },
  ],
  "KwaZulu-Natal": [
    { id: "kzn001", name: "Inkosi Albert Luthuli Central Hospital", type: "Hospital" },
    { id: "kzn002", name: "King Edward VIII Hospital", type: "Hospital" },
    { id: "kzn003", name: "Durban Central Clinic", type: "Clinic" },
  ],
}

// Mock admin users
const adminUsers = ["admin001", "superadmin"]

export default function LoginPage() {
  const [idNumber, setIdNumber] = useState("")
  const [password, setPassword] = useState("")
  const [selectedProvince, setSelectedProvince] = useState("")
  const [selectedFacility, setSelectedFacility] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const isAdmin = adminUsers.includes(idNumber)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Simple validation
    if (!idNumber || !password) {
      setError("Please fill in all fields.")
      return
    }

    if (!isAdmin && (!selectedProvince || !selectedFacility)) {
      setError("Please select your province and facility.")
      return
    }

    // Mock authentication
    if (password === "password") {
      // Store user data in localStorage for demo purposes
      const userData = {
        id: idNumber,
        isAdmin,
        province: selectedProvince,
        facility: selectedFacility,
        facilityName: isAdmin
          ? "Admin Dashboard"
          : healthcareFacilities[selectedProvince]?.find((f) => f.id === selectedFacility)?.name,
      }
      localStorage.setItem("userData", JSON.stringify(userData))
      router.push("/dashboard")
    } else {
      setError("Invalid credentials.")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Login to HPRS</CardTitle>
          <CardDescription>
            {isAdmin ? "Admin access - manage all facilities" : "Enter your credentials and select your facility"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="idNumber">ID Number</Label>
              <Input
                id="idNumber"
                type="text"
                placeholder="e.g., 218728448 or admin001"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {!isAdmin && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="province">Province</Label>
                  <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your province" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(healthcareFacilities).map((province) => (
                        <SelectItem key={province} value={province}>
                          {province}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedProvince && (
                  <div className="grid gap-2">
                    <Label htmlFor="facility">Hospital/Clinic</Label>
                    <Select value={selectedFacility} onValueChange={setSelectedFacility}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your facility" />
                      </SelectTrigger>
                      <SelectContent>
                        {healthcareFacilities[selectedProvince]?.map((facility) => (
                          <SelectItem key={facility.id} value={facility.id}>
                            {facility.name} ({facility.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
