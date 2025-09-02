"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, User, X } from "lucide-react"

interface PatientRegistration {
  // Personal Information
  firstName: string
  lastName: string
  idNumber: string
  dateOfBirth: string
  gender: string
  race: string
  cellphoneNumber: string
  alternativeNumber: string

  // Address Information
  streetAddress: string
  suburb: string
  city: string
  province: string
  postalCode: string

  // Employment Information
  employmentStatus: string
  employer: string
  occupation: string
  workAddress: string

  // Medical Information
  hasChronicDiseases: boolean
  chronicDiseases: string[]
  customChronicDisease: string
  allergies: string
  currentMedications: string

  // Pregnancy Information (for females)
  isPregnant: boolean
  pregnancyWeeks: string

  // Next of Kin Information
  nextOfKinName: string
  nextOfKinRelationship: string
  nextOfKinPhone: string
  nextOfKinAddress: string

  // Emergency Contact (if different from next of kin)
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactRelationship: string
}

const chronicDiseaseOptions = [
  "Diabetes Type 1",
  "Diabetes Type 2",
  "Hypertension",
  "Asthma",
  "COPD",
  "Heart Disease",
  "Kidney Disease",
  "Liver Disease",
  "Epilepsy",
  "HIV/AIDS",
  "Tuberculosis",
  "Cancer",
  "Arthritis",
  "Depression",
  "Anxiety",
  "Bipolar Disorder",
  "Thyroid Disease",
  "Other",
]

const relationshipOptions = [
  "Spouse",
  "Parent",
  "Child",
  "Sibling",
  "Grandparent",
  "Grandchild",
  "Uncle/Aunt",
  "Cousin",
  "Friend",
  "Guardian",
  "Other",
]

const employmentStatusOptions = [
  "Employed Full-time",
  "Employed Part-time",
  "Self-employed",
  "Unemployed",
  "Student",
  "Retired",
  "Disabled",
  "Homemaker",
]

const southAfricanProvinces = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
]

const raceOptions = ["African", "Coloured", "Indian/Asian", "White", "Other", "Prefer not to say"]

export default function PatientRegistrationPage() {
  const [formData, setFormData] = useState<PatientRegistration>({
    firstName: "",
    lastName: "",
    idNumber: "",
    dateOfBirth: "",
    gender: "",
    race: "",
    cellphoneNumber: "",
    alternativeNumber: "",
    streetAddress: "",
    suburb: "",
    city: "",
    province: "",
    postalCode: "",
    employmentStatus: "",
    employer: "",
    occupation: "",
    workAddress: "",
    hasChronicDiseases: false,
    chronicDiseases: [],
    customChronicDisease: "",
    allergies: "",
    currentMedications: "",
    isPregnant: false,
    pregnancyWeeks: "",
    nextOfKinName: "",
    nextOfKinRelationship: "",
    nextOfKinPhone: "",
    nextOfKinAddress: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelationship: "",
  })

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [currentStep, setCurrentStep] = useState(1)

  const handleInputChange = (field: keyof PatientRegistration, value: string | boolean | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleChronicDiseaseToggle = (disease: string, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        chronicDiseases: [...prev.chronicDiseases, disease],
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        chronicDiseases: prev.chronicDiseases.filter((d) => d !== disease),
      }))
    }
  }

  const removeChronicDisease = (disease: string) => {
    setFormData((prev) => ({
      ...prev,
      chronicDiseases: prev.chronicDiseases.filter((d) => d !== disease),
    }))
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          formData.firstName &&
          formData.lastName &&
          formData.idNumber &&
          formData.gender &&
          formData.cellphoneNumber
        )
      case 2:
        return !!(formData.streetAddress && formData.city && formData.province)
      case 3:
        return !!formData.employmentStatus
      case 4:
        return true // Medical info is optional
      case 5:
        return !!(formData.nextOfKinName && formData.nextOfKinPhone && formData.nextOfKinRelationship)
      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5))
      setMessage(null)
    } else {
      setMessage({ type: "error", text: "Please fill in all required fields before continuing." })
    }
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
    setMessage(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!validateStep(5)) {
      setMessage({ type: "error", text: "Please complete all required fields." })
      return
    }

    // Simulate registration
    console.log("Patient Registration Data:", formData)
    setMessage({
      type: "success",
      text: `Patient ${formData.firstName} ${formData.lastName} has been successfully registered with ID: ${formData.idNumber}`,
    })

    // Reset form
    setFormData({
      firstName: "",
      lastName: "",
      idNumber: "",
      dateOfBirth: "",
      gender: "",
      race: "",
      cellphoneNumber: "",
      alternativeNumber: "",
      streetAddress: "",
      suburb: "",
      city: "",
      province: "",
      postalCode: "",
      employmentStatus: "",
      employer: "",
      occupation: "",
      workAddress: "",
      hasChronicDiseases: false,
      chronicDiseases: [],
      customChronicDisease: "",
      allergies: "",
      currentMedications: "",
      isPregnant: false,
      pregnancyWeeks: "",
      nextOfKinName: "",
      nextOfKinRelationship: "",
      nextOfKinPhone: "",
      nextOfKinAddress: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelationship: "",
    })
    setCurrentStep(1)
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4, 5].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === currentStep
                ? "bg-blue-600 text-white"
                : step < currentStep
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-600"
            }`}
          >
            {step < currentStep ? <CheckCircle className="w-4 h-4" /> : step}
          </div>
          {step < 5 && <div className={`w-12 h-1 ${step < currentStep ? "bg-green-600" : "bg-gray-200"}`} />}
        </div>
      ))}
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Patient Registration
          </CardTitle>
          <CardDescription>Complete patient registration form - Step {currentStep} of 5</CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepIndicator()}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="idNumber">ID Number *</Label>
                    <Input
                      id="idNumber"
                      value={formData.idNumber}
                      onChange={(e) => handleInputChange("idNumber", e.target.value)}
                      placeholder="e.g., 9001015800083"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Gender *</Label>
                    <RadioGroup value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male">Male</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female">Female</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other">Other</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="race">Race</Label>
                    <Select value={formData.race} onValueChange={(value) => handleInputChange("race", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select race" />
                      </SelectTrigger>
                      <SelectContent>
                        {raceOptions.map((race) => (
                          <SelectItem key={race} value={race}>
                            {race}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cellphoneNumber">Cellphone Number *</Label>
                    <Input
                      id="cellphoneNumber"
                      value={formData.cellphoneNumber}
                      onChange={(e) => handleInputChange("cellphoneNumber", e.target.value)}
                      placeholder="e.g., 0821234567"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="alternativeNumber">Alternative Number</Label>
                    <Input
                      id="alternativeNumber"
                      value={formData.alternativeNumber}
                      onChange={(e) => handleInputChange("alternativeNumber", e.target.value)}
                      placeholder="e.g., 0117654321"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Address Information */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Address Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="streetAddress">Street Address *</Label>
                  <Input
                    id="streetAddress"
                    value={formData.streetAddress}
                    onChange={(e) => handleInputChange("streetAddress", e.target.value)}
                    placeholder="e.g., 123 Main Street"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="suburb">Suburb</Label>
                    <Input
                      id="suburb"
                      value={formData.suburb}
                      onChange={(e) => handleInputChange("suburb", e.target.value)}
                      placeholder="e.g., Sandton"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      placeholder="e.g., Johannesburg"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="province">Province *</Label>
                    <Select value={formData.province} onValueChange={(value) => handleInputChange("province", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select province" />
                      </SelectTrigger>
                      <SelectContent>
                        {southAfricanProvinces.map((province) => (
                          <SelectItem key={province} value={province}>
                            {province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange("postalCode", e.target.value)}
                      placeholder="e.g., 2196"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Employment Information */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Employment Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="employmentStatus">Employment Status *</Label>
                  <Select
                    value={formData.employmentStatus}
                    onValueChange={(value) => handleInputChange("employmentStatus", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employment status" />
                    </SelectTrigger>
                    <SelectContent>
                      {employmentStatusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {(formData.employmentStatus === "Employed Full-time" ||
                  formData.employmentStatus === "Employed Part-time" ||
                  formData.employmentStatus === "Self-employed") && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="employer">Employer</Label>
                        <Input
                          id="employer"
                          value={formData.employer}
                          onChange={(e) => handleInputChange("employer", e.target.value)}
                          placeholder="e.g., ABC Company"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="occupation">Occupation</Label>
                        <Input
                          id="occupation"
                          value={formData.occupation}
                          onChange={(e) => handleInputChange("occupation", e.target.value)}
                          placeholder="e.g., Software Developer"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="workAddress">Work Address</Label>
                      <Textarea
                        id="workAddress"
                        value={formData.workAddress}
                        onChange={(e) => handleInputChange("workAddress", e.target.value)}
                        placeholder="Enter work address"
                        rows={2}
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 4: Medical Information */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Medical Information</h3>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasChronicDiseases"
                      checked={formData.hasChronicDiseases}
                      onCheckedChange={(checked) => handleInputChange("hasChronicDiseases", checked as boolean)}
                    />
                    <Label htmlFor="hasChronicDiseases">Do you have any chronic diseases?</Label>
                  </div>

                  {formData.hasChronicDiseases && (
                    <div className="space-y-4 p-4 border rounded-lg">
                      <Label>Select chronic diseases:</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {chronicDiseaseOptions.map((disease) => (
                          <div key={disease} className="flex items-center space-x-2">
                            <Checkbox
                              id={disease}
                              checked={formData.chronicDiseases.includes(disease)}
                              onCheckedChange={(checked) => handleChronicDiseaseToggle(disease, checked as boolean)}
                            />
                            <Label htmlFor={disease} className="text-sm">
                              {disease}
                            </Label>
                          </div>
                        ))}
                      </div>

                      {formData.chronicDiseases.includes("Other") && (
                        <div className="space-y-2">
                          <Label htmlFor="customChronicDisease">Please specify other chronic disease:</Label>
                          <Input
                            id="customChronicDisease"
                            value={formData.customChronicDisease}
                            onChange={(e) => handleInputChange("customChronicDisease", e.target.value)}
                            placeholder="Enter chronic disease"
                          />
                        </div>
                      )}

                      {formData.chronicDiseases.length > 0 && (
                        <div className="space-y-2">
                          <Label>Selected chronic diseases:</Label>
                          <div className="flex flex-wrap gap-2">
                            {formData.chronicDiseases.map((disease) => (
                              <Badge key={disease} variant="secondary" className="flex items-center gap-1">
                                {disease === "Other" && formData.customChronicDisease
                                  ? formData.customChronicDisease
                                  : disease}
                                <X className="w-3 h-3 cursor-pointer" onClick={() => removeChronicDisease(disease)} />
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="allergies">Allergies</Label>
                    <Textarea
                      id="allergies"
                      value={formData.allergies}
                      onChange={(e) => handleInputChange("allergies", e.target.value)}
                      placeholder="List any known allergies (medications, food, environmental, etc.)"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentMedications">Current Medications</Label>
                    <Textarea
                      id="currentMedications"
                      value={formData.currentMedications}
                      onChange={(e) => handleInputChange("currentMedications", e.target.value)}
                      placeholder="List current medications and dosages"
                      rows={2}
                    />
                  </div>

                  {formData.gender === "female" && (
                    <div className="space-y-4 p-4 border rounded-lg bg-pink-50">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="isPregnant"
                          checked={formData.isPregnant}
                          onCheckedChange={(checked) => handleInputChange("isPregnant", checked as boolean)}
                        />
                        <Label htmlFor="isPregnant">Are you currently pregnant?</Label>
                      </div>

                      {formData.isPregnant && (
                        <div className="space-y-2">
                          <Label htmlFor="pregnancyWeeks">How many weeks pregnant?</Label>
                          <Input
                            id="pregnancyWeeks"
                            type="number"
                            value={formData.pregnancyWeeks}
                            onChange={(e) => handleInputChange("pregnancyWeeks", e.target.value)}
                            placeholder="e.g., 12"
                            min="1"
                            max="42"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 5: Next of Kin & Emergency Contact */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Next of Kin Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nextOfKinName">Full Name *</Label>
                      <Input
                        id="nextOfKinName"
                        value={formData.nextOfKinName}
                        onChange={(e) => handleInputChange("nextOfKinName", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nextOfKinRelationship">Relationship *</Label>
                      <Select
                        value={formData.nextOfKinRelationship}
                        onValueChange={(value) => handleInputChange("nextOfKinRelationship", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          {relationshipOptions.map((relationship) => (
                            <SelectItem key={relationship} value={relationship}>
                              {relationship}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nextOfKinPhone">Phone Number *</Label>
                      <Input
                        id="nextOfKinPhone"
                        value={formData.nextOfKinPhone}
                        onChange={(e) => handleInputChange("nextOfKinPhone", e.target.value)}
                        placeholder="e.g., 0821234567"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nextOfKinAddress">Address</Label>
                      <Input
                        id="nextOfKinAddress"
                        value={formData.nextOfKinAddress}
                        onChange={(e) => handleInputChange("nextOfKinAddress", e.target.value)}
                        placeholder="Next of kin address"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Emergency Contact (if different from next of kin)</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactName">Full Name</Label>
                      <Input
                        id="emergencyContactName"
                        value={formData.emergencyContactName}
                        onChange={(e) => handleInputChange("emergencyContactName", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactRelationship">Relationship</Label>
                      <Select
                        value={formData.emergencyContactRelationship}
                        onValueChange={(value) => handleInputChange("emergencyContactRelationship", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          {relationshipOptions.map((relationship) => (
                            <SelectItem key={relationship} value={relationship}>
                              {relationship}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactPhone">Phone Number</Label>
                    <Input
                      id="emergencyContactPhone"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => handleInputChange("emergencyContactPhone", e.target.value)}
                      placeholder="e.g., 0821234567"
                    />
                  </div>
                </div>
              </div>
            )}

            {message && (
              <div
                className={`flex items-center gap-2 p-4 rounded-lg ${
                  message.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {message.type === "success" ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                {message.text}
              </div>
            )}

            <div className="flex justify-between pt-6">
              <Button type="button" variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
                Previous
              </Button>

              {currentStep < 5 ? (
                <Button type="button" onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button type="submit">Register Patient</Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
