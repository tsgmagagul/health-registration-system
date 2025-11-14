"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Shield, Hospital, AlertCircle, Loader2, CheckCircle } from "lucide-react"
import { apiService } from "@/lib/api"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")
    setLoading(true)

    // Validation
    if (!username || !password) {
      setError("Please fill in all fields.")
      setLoading(false)
      return
    }

    try {
      console.log('🔐 Attempting login with username:', username)
      
      // Call backend API
      const response = await apiService.login({
        username: username,
        password: password
      })

      console.log('📦 Login response:', response)
      console.log('User data:', response.data?.user)

      if (response.status === 'success' && response.data) {
        const userData = response.data.user

        console.log('✅ Login successful!')
        console.log('User ID:', userData.id)
        console.log('Role:', userData.role)
        console.log('Facility ID:', userData.facility_id)
        console.log('🏥 Facility name:', userData.facility_name)
        console.log('📍 Province:', userData.province)
        console.log('🏢 Facility type:', userData.facility_type)

        // Create user data object with all info
        const userDataToStore = {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          role: userData.role,
          first_name: userData.first_name,
          last_name: userData.last_name,
          facility_id: userData.facility_id,
          facility_name: userData.facility_name,
          province: userData.province,
          facility_type: userData.facility_type,
          loginTime: new Date().toISOString()
        }
        
        console.log('💾 Storing user data:', userDataToStore)

        // Store in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem("userData", JSON.stringify(userDataToStore))
          localStorage.setItem("token", response.data.token)
        }

        // Show success message based on role
        const roleDisplay = getRoleDisplay(userData.role)
        if (userData.facility_name) {
          setSuccessMessage(`✅ Welcome ${roleDisplay}! Facility: ${userData.facility_name}`)
        } else {
          setSuccessMessage(`✅ Welcome ${roleDisplay}!`)
        }

        console.log('🎯 Redirecting based on role:', userData.role)

        // Route based on user role
        setTimeout(() => {
          const role = userData.role?.toLowerCase()
          switch (role) {
            case 'admin':
              router.push("/admin")
              break
            case 'clerk':
            case 'front_desk':
              router.push("/registration")
              break
            case 'nurse':
              router.push("/triage")
              break
            case 'doctor':
              router.push("/consultation")
              break
            default:
              router.push("/dashboard")
              break
          }
        }, 1500)
      } else {
        setError(response.message || "Login failed. Please try again.")
      }
    } catch (error: any) {
      console.error('❌ Login error:', error)
      console.error('Error message:', error.message)
      setError(error.message || "Login failed. Please check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  const getRoleDisplay = (role: string) => {
    const roleLower = role?.toLowerCase()
    switch (roleLower) {
      case 'clerk':
      case 'front_desk':
        return 'Front Desk Staff'
      case 'nurse':
        return 'Nurse'
      case 'doctor':
        return 'Doctor'
      case 'admin':
        return 'Administrator'
      default:
        return 'User'
    }
  }

  const handleAdminLogin = () => {
    router.push("/admin-login")
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Hospital className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">HPRS Login</CardTitle>
          <CardDescription>Healthcare Professional Login</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {successMessage && (
              <div className="flex items-center gap-2 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">
                <CheckCircle className="w-4 h-4" />
                {successMessage}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Logging in...
                </div>
              ) : (
                "Login"
              )}
            </Button>
          </form>

         

          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={handleAdminLogin}
              className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
              disabled={loading}
            >
              <Shield className="w-4 h-4 mr-2" />
              Administrator Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}