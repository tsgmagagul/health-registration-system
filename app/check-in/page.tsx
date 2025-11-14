'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { apiService } from '@/lib/api'
import { Patient, CheckInResponse } from '@/lib/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Search, UserCheck, AlertCircle, CheckCircle2, User, Phone, Calendar, Hash } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function CheckInPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [department, setDepartment] = useState('')
  const [chiefComplaint, setChiefComplaint] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [successDialog, setSuccessDialog] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Check authentication on mount
  useEffect(() => {
    const userData = localStorage.getItem('userData')
    const token = localStorage.getItem('token')
    
    console.log('🔐 Checking authentication...')
    console.log('User data exists:', !!userData)
    console.log('Token exists:', !!token)
    
    if (!userData || !token) {
      console.log('❌ No authentication found, redirecting to login')
      router.push('/login')
    } else {
      console.log('✅ User authenticated')
      const user = JSON.parse(userData)
      console.log('👤 User role:', user.role)
    }
  }, [])

 const departments = [
'emergency',
'outpatient',
'inpatient',
'specialist'
];


  // 🔍 Search for patients
  const searchPatients = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search term')
      return
    }
    
    setSearchLoading(true)
    setError('')
    setPatients([])
    
    try {
      const res = await apiService.searchPatients(searchQuery)
      if (res.status === 'success' && res.data.patients) {
        if (res.data.patients.length === 0) {
          setError('No patients found matching your search')
        } else {
          setPatients(res.data.patients)
        }
      } else {
        setError('No patients found')
      }
    } catch (err: any) {
      console.error('Search error:', err)
      setError(err.message || 'Failed to search patients')
    } finally {
      setSearchLoading(false)
    }
  }

  // Handle Enter key for search
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchPatients()
    }
  }

  // 🩺 Check in patient
  const handleCheckIn = async () => {
    if (!selectedPatient || !department || !chiefComplaint.trim()) {
      setError('Please fill in all required fields')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      console.log('🏥 Checking in patient:', selectedPatient.id)
      console.log('📋 Department:', department)
      console.log('💬 Chief Complaint:', chiefComplaint)
      
      const visitData = { 
        department, 
        chief_complaint: chiefComplaint.trim() 
      }
      
      const res = await apiService.checkInPatient(selectedPatient.id, visitData)
      
      console.log('✅ Check-in response:', res)
      
      if (res.status === 'success') {
        console.log('🎉 Check-in successful!')
        setSuccessDialog(true)
        // Reset form
        setSelectedPatient(null)
        setDepartment('')
        setChiefComplaint('')
        setPatients([])
        setSearchQuery('')
      } else {
        console.error('❌ Check-in failed:', res.message)
        setError(res.message || 'Failed to check in patient')
      }
    } catch (err: any) {
      console.error('❌ Check-in error:', err)
      console.error('Error details:', err.response || err)
      
      // Check if it's an authentication error
      if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        setError('Session expired. Please login again.')
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        setError(err.message || 'Failed to check in patient')
      }
    } finally {
      setLoading(false)
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-ZA', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-6 h-6" />
            Patient Check-In
          </CardTitle>
          <CardDescription>
            Search for a registered patient and check them in for their visit
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search Section */}
          <div className="space-y-3">
            <Label htmlFor="search">Search Patient</Label>
            <div className="flex space-x-2">
              <Input
                id="search"
                placeholder="Search by name, ID number, or phone number"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                disabled={searchLoading}
              />
              <Button 
                onClick={searchPatients} 
                disabled={searchLoading}
                className="min-w-[100px]"
              >
                <Search className="w-4 h-4 mr-2" />
                {searchLoading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Search Results */}
          {patients.length > 0 && (
            <div className="space-y-2">
              <Label>Search Results ({patients.length})</Label>
              <div className="border rounded-lg divide-y max-h-[300px] overflow-y-auto">
                {patients.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedPatient(p)
                      setError('')
                    }}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedPatient?.id === p.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="font-semibold text-lg">
                            {p.first_name} {p.last_name}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Hash className="w-3 h-3" />
                            <span>ID: {p.id_number || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span>{p.phone || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>DOB: {formatDate(p.date_of_birth)}</span>
                          </div>
                        </div>
                        {p.address && (
                          <div className="text-xs text-gray-500">
                            📍 {p.address}
                          </div>
                        )}
                      </div>
                      {selectedPatient?.id === p.id && (
                        <CheckCircle2 className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Check-In Form */}
          {selectedPatient && (
            <div className="space-y-4 border-t pt-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">
                  Selected Patient
                </h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Name:</strong> {selectedPatient.first_name} {selectedPatient.last_name}</p>
                  <p><strong>ID Number:</strong> {selectedPatient.id_number || 'N/A'}</p>
                  <p><strong>Phone:</strong> {selectedPatient.phone || 'N/A'}</p>
                  <p><strong>Date of Birth:</strong> {formatDate(selectedPatient.date_of_birth)}</p>
                  {selectedPatient.gender && (
                    <p><strong>Gender:</strong> {selectedPatient.gender}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="department">
                    Department <span className="text-red-500">*</span>
                  </Label>
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chiefComplaint">
                    Chief Complaint <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="chiefComplaint"
                    placeholder="Describe the main reason for visit (e.g., fever, headache, chest pain)"
                    value={chiefComplaint}
                    onChange={(e) => setChiefComplaint(e.target.value)}
                    rows={3}
                  />
                  <p className="text-xs text-gray-500">
                    Enter the primary reason the patient is seeking medical attention
                  </p>
                </div>

                <Button 
                  onClick={handleCheckIn} 
                  disabled={loading || !department || !chiefComplaint.trim()}
                  className="w-full"
                  size="lg"
                >
                  {loading ? 'Checking In...' : 'Confirm Check-In'}
                </Button>
              </div>
            </div>
          )}

          {/* No Patient Selected Message */}
          {!selectedPatient && patients.length === 0 && !error && (
            <div className="text-center py-8 text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Search for a patient to begin check-in</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ✅ Success Dialog */}
      <Dialog open={successDialog} onOpenChange={setSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
              Patient Checked In Successfully
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 py-4">
            The patient has been successfully checked in and added to the queue. 
            What would you like to do next?
          </p>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={() => {
                setSuccessDialog(false)
                router.push('/check-in')
              }}
              className="w-full sm:w-auto"
            >
              🔁 Check In Another Patient
            </Button>
            <Button
              onClick={() => {
                setSuccessDialog(false)
                router.push('/registration')
              }}
              variant="outline"
              className="w-full sm:w-auto"
            >
              ➕ Register New Patient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}