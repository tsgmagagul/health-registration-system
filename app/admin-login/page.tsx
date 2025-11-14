"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Shield, Lock, User, AlertCircle } from "lucide-react"

// Mock admin users with different access levels
const adminUsers = {
  admin001: { name: "System Administrator", level: "super", department: "IT" },
  superadmin: { name: "Super Administrator", level: "super", department: "Management" },
  admin123: { name: "Health Administrator", level: "health", department: "Health Services" },
  provincial001: { name: "Provincial Admin", level: "provincial", department: "Provincial Health" },
  national001: { name: "National Admin", level: "national", department: "National Health" },
}

export default function AdminLoginPage() {
  const [adminId, setAdminId] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Simple validation
    if (!adminId || !password) {
      setError("Please fill in all fields.")
      setLoading(false)
      return
    }

    // Check if user exists in admin database
    const adminUser = adminUsers[adminId as keyof typeof adminUsers]

    if (!adminUser) {
      setError("Invalid admin credentials. Admin ID not found.")
      setLoading(false)
      return
    }

    // Mock authentication - accept "admin123" as password for demo
    if (password === "admin123") {
      // Store admin data in localStorage
      const userData = {
        id: adminId,
        isAdmin: true,
        name: adminUser.name,
        level: adminUser.level,
        department: adminUser.department,
        facilityName: "Admin Dashboard",
        loginTime: new Date().toISOString(),
      }
      localStorage.setItem("userData", JSON.stringify(userData))

      // Simulate loading
      setTimeout(() => {
        setLoading(false)
        router.push("/admin")
      }, 1500)
    } else {
      setError("Invalid password. Use 'admin123' for demo access.")
      setLoading(false)
    }
  }

  const handleBackToLogin = () => {
    router.push("/login")
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      <Card className="w-full max-w-md relative z-10 border-slate-200 shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Admin Access Portal</CardTitle>
          <CardDescription className="text-slate-600">Secure login for HPRS administrators</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminId" className="text-slate-700 font-medium">
                Administrator ID
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="adminId"
                  type="text"
                  placeholder="Enter admin ID"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Authenticating...
                </div>
              ) : (
                "Access Admin Dashboard"
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="text-center space-y-3">
              <p className="text-xs text-slate-500">Demo Admin Credentials:</p>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="p-2 bg-slate-50 rounded border">
                  <strong>Super Admin:</strong> admin001 / admin123
                </div>
                <div className="p-2 bg-slate-50 rounded border">
                  <strong>Health Admin:</strong> admin123 / admin123
                </div>
                <div className="p-2 bg-slate-50 rounded border">
                  <strong>Provincial:</strong> provincial001 / admin123
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <Button variant="ghost" onClick={handleBackToLogin} className="text-slate-600 hover:text-slate-900">
              ← Back to Regular Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
