"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, LogOut, CheckCircle, XCircle, ArrowLeft } from "lucide-react"
import { apiService } from "@/lib/api"

export default function SignOutPage() {
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [signOutStatus, setSignOutStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const router = useRouter()

  const handleSignOut = async () => {
    setIsSigningOut(true)
    setSignOutStatus('idle')
    setErrorMessage('')

    try {
      // Call the logout API endpoint
      const response = await apiService.logout()
      
      if (response.status === 'success') {
        // Clear local storage
        localStorage.removeItem('token')
        localStorage.removeItem('userData')
        
        // Clear any other stored data
        sessionStorage.clear()
        
        setSignOutStatus('success')
        
        // Redirect to login page after a brief delay
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        throw new Error(response.message || 'Logout failed')
      }
    } catch (error: any) {
      console.error('Sign out error:', error)
      setSignOutStatus('error')
      setErrorMessage(error.message || 'Failed to sign out. Please try again.')
      
      // Even if API call fails, clear local data and redirect
      localStorage.removeItem('token')
      localStorage.removeItem('userData')
      sessionStorage.clear()
      
      // Still redirect to login after error
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } finally {
      setIsSigningOut(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  // Auto-redirect if no user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <LogOut className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Sign Out</CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Are you sure you want to sign out?
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Success Message */}
          {signOutStatus === 'success' && (
            <div className="flex items-center gap-3 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-medium">Signed out successfully!</p>
                <p className="text-sm">Redirecting to login page...</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {signOutStatus === 'error' && (
            <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
              <XCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-medium">Sign out completed</p>
                <p className="text-sm">
                  {errorMessage || 'You have been signed out and will be redirected.'}
                </p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isSigningOut && (
            <div className="flex items-center justify-center gap-3 p-4 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
              <Loader2 className="w-5 h-5 animate-spin" />
              <p className="font-medium">Signing out...</p>
            </div>
          )}

          {/* Action Buttons - Only show when not loading/success */}
          {!isSigningOut && signOutStatus === 'idle' && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex-1"
                disabled={isSigningOut}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSignOut}
                variant="destructive"
                className="flex-1"
                disabled={isSigningOut}
              >
                {isSigningOut ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <LogOut className="w-4 h-4 mr-2" />
                )}
                Sign Out
              </Button>
            </div>
          )}

          {/* Auto-redirect info */}
          {(signOutStatus === 'success' || signOutStatus === 'error') && (
            <div className="text-center text-sm text-gray-500">
              <p>You will be automatically redirected to the login page.</p>
            </div>
          )}

          {/* Security Notice */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-yellow-600 text-xs font-bold">!</span>
              </div>
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Security Notice</p>
                <p>Signing out will clear your session and require you to log in again to access the system.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}