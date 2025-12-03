"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { UserSearch, ClipboardList, BriefcaseBusiness, SquareActivity, CreditCard, ChevronRight, ChevronLeft } from 'lucide-react';

interface Employee {
  id: number
  name: string
  email: string
  employee_id: string
  department: string
  position: string
  phone: string
  basic_salary?: number
  hire_date?: string
  
  // Personal Details
  date_of_birth?: string
  gender?: string
  marital_status?: string
  national_id?: string
  tax_id?: string
  address?: string
  
  // Emergency Contact
  emergency_contact_name?: string
  emergency_contact_phone?: string
  
  // Employment Details
  employment_type?: string
  
  // Banking
  bank_account?: string
  bank_name?: string
}

interface EmployeeFormProps {
  employee?: Employee | null
  onClose: () => void
}

export default function EmployeeForm({ employee, onClose }: EmployeeFormProps) {
  const [formData, setFormData] = useState({
    // Basic Information
    name: employee?.name || "",
    email: employee?.email || "",
    employee_id: employee?.employee_id || "",
    phone: employee?.phone || "",
    
    // Employment Details
    department: employee?.department || "",
    position: employee?.position || "",
    employment_type: employee?.employment_type || "",
    hire_date: employee?.hire_date || "",
    basic_salary: employee?.basic_salary || 0,
    
    // Personal Details
    date_of_birth: employee?.date_of_birth || "",
    gender: employee?.gender || "",
    marital_status: employee?.marital_status || "",
    national_id: employee?.national_id || "",
    tax_id: employee?.tax_id || "",
    address: employee?.address || "",
    
    // Emergency Contact
    emergency_contact_name: employee?.emergency_contact_name || "",
    emergency_contact_phone: employee?.emergency_contact_phone || "",
    
    // Banking Information
    bank_account: employee?.bank_account || "",
    bank_name: employee?.bank_name || "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [formOptions, setFormOptions] = useState({
    departments: [] as string[],
    employment_types: [] as string[],
    genders: [] as string[],
    marital_statuses: [] as string[]
  })
  const [optionsLoading, setOptionsLoading] = useState(true)

  // Fetch form options on component mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setOptionsLoading(true)
        const token = localStorage.getItem("token")
        const response = await fetch("/api/employees/options", {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        if (response.ok) {
          const data = await response.json()
          setFormOptions(data.form_options)
        }
      } catch (error) {
        console.error("Error fetching form options:", error)
      } finally {
        setOptionsLoading(false)
      }
    }
    
    fetchOptions()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Enhanced validation
    if (!formData.name.trim()) {
      toast.error("Employee name is required")
      setIsLoading(false)
      return
    }

    if (!formData.email.trim()) {
      toast.error("Email is required")
      setIsLoading(false)
      return
    }

    if (!employee && !formData.employee_id.trim()) {
      toast.error("Employee ID is required")
      setIsLoading(false)
      return
    }

    if (formData.basic_salary <= 0) {
      toast.error("Please enter a valid salary greater than 0")
      setIsLoading(false)
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address")
      setIsLoading(false)
      return
    }

    // Validate dates
    if (formData.date_of_birth) {
      const birthDate = new Date(formData.date_of_birth)
      const today = new Date()
      if (birthDate > today) {
        toast.error("Date of birth cannot be in the future")
        setIsLoading(false)
        return
      }
    }

    if (formData.hire_date) {
      const hireDate = new Date(formData.hire_date)
      const today = new Date()
      if (hireDate > today) {
        toast.error("Hire date cannot be in the future")
        setIsLoading(false)
        return
      }
    }

    try {
      const token = localStorage.getItem("token")
      const url = employee ? `/api/employees/${employee.id}` : "/api/employees"
      const method = employee ? "PUT" : "POST"

      console.log("Submitting employee data:", formData) // Debug

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const responseData = await response.json()
      console.log("Response:", response.status, responseData) // Debug

      if (!response.ok) {
        if (responseData.details && Array.isArray(responseData.details)) {
          toast.error(`Validation failed: ${responseData.details.join(", ")}`)
        } else {
          toast.error(responseData.error || `Failed to save (${response.status})`)
        }
        setIsLoading(false)
        return
      }

      toast.success(employee ? "Employee updated successfully" : "Employee created successfully")
      onClose()
    } catch (error) {
      console.error("Error saving employee:", error) // Debug
      toast.error(error instanceof Error ? error.message : "Failed to save employee")
    } finally {
      setIsLoading(false)
    }
  }

  const tabs = [
    { id: "basic", label: "Basic Info", icon: <UserSearch className="inline-block mr-2" /> },
    { id: "personal", label: "Personal Details", icon: <ClipboardList className="inline-block mr-2" /> },
    { id: "employment", label: "Employment", icon: <BriefcaseBusiness className="inline-block mr-2" /> },
    { id: "emergency", label: "Emergency Contact", icon: <SquareActivity className="inline-block mr-2" /> },
    { id: "banking", label: "Banking", icon: <CreditCard className="inline-block mr-2" /> }
  ]

  return (
    <div className="text-black">
      {/* Tab Navigation */}
      <div className="flex border-b mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Tab */}
        {activeTab === "basic" && (
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Name *</label>
                  <Input 
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                    required
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email *</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="email@company.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Employee ID *</label>
                  <Input
                    value={formData.employee_id}
                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                    required={!employee}
                    disabled={!!employee}
                    placeholder="e.g., EMP001"
                  />
                  {employee && <p className="text-xs text-gray-500 mt-1">Employee ID cannot be changed after creation</p>}
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <Input 
                    type="tel"
                    value={formData.phone} 
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1-555-0123"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Personal Details Tab */}
        {activeTab === "personal" && (
          <Card>
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Date of Birth</label>
                  <Input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Gender</label>
                  <Select
                    value={formData.gender}
                    className="bg-white"
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Marital Status</label>
                  <Select
                    value={formData.marital_status}
                    className="bg-white"
                    onChange={(e) => setFormData({ ...formData, marital_status: e.target.value })}
                  >
                    <option value="">Select status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Separated">Separated</option>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">National ID</label>
                  <Input
                    value={formData.national_id}
                    onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
                    placeholder="National identification number"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Tax ID</label>
                  <Input
                    value={formData.tax_id}
                    onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                    placeholder="Tax identification number"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Address</label>
                <Textarea
                  value={formData.address}
                  className="bg-white"
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Full address including street, city, state, zip code"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Employment Details Tab */}
        {activeTab === "employment" && (
          <Card>
            <CardHeader>
              <CardTitle>Employment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Department</label>
                  <Select
                    value={formData.department}
                    className="bg-white"
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    <option value="">Select department</option>
                    {formOptions.departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                    <option value="Engineering">Engineering</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Finance">Finance</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Operations">Operations</option>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Position</label>
                  <Input
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="Job title/position"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Employment Type</label>
                  <Select
                    value={formData.employment_type}
                    className="bg-white"
                    onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                  >
                    <option value="">Select type</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Temporary">Temporary</option>
                    <option value="Intern">Intern</option>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Hire Date</label>
                  <Input
                    type="date"
                    value={formData.hire_date}
                    onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Basic Salary ($) *</label>
                <Input 
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.basic_salary} 
                  onChange={(e) => setFormData({ ...formData, basic_salary: parseFloat(e.target.value) || 0 })} 
                  required
                  placeholder="Enter monthly salary"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Emergency Contact Tab */}
        {activeTab === "emergency" && (
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Contact Name</label>
                  <Input
                    value={formData.emergency_contact_name}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                    placeholder="Emergency contact person"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Contact Phone</label>
                  <Input
                    type="tel"
                    value={formData.emergency_contact_phone}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                    placeholder="+1-555-0456"
                  />
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm text-blue-800">
                  This information will be used to contact someone in case of emergency. 
                  Please ensure the contact details are current and the person is aware they are listed as an emergency contact.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Banking Information Tab */}
        {activeTab === "banking" && (
          <Card>
            <CardHeader>
              <CardTitle>Banking Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Bank Account Number</label>
                  <Input
                    value={formData.bank_account}
                    onChange={(e) => setFormData({ ...formData, bank_account: e.target.value })}
                    placeholder="Account number"
                    type="password"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Bank Name</label>
                  <Input
                    value={formData.bank_name}
                    onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                    placeholder="Name of the bank"
                  />
                </div>
              </div>
              <div className="bg-yellow-50 p-3 rounded-md">
                <p className="text-sm text-yellow-800">
                  🔒 Banking information is encrypted and securely stored. This information is used for payroll processing only.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
            {isLoading ? "Saving..." : (employee ? "Update Employee" : "Create Employee")}
          </Button>
          <Button type="button" variant="outline" onClick={onClose} className="bg-gray-500 border-0 hover:bg-gray-600">
            Cancel
          </Button>
          
          {/* Tab Navigation Buttons */}
          <div className="flex gap-2 ml-auto">
            {activeTab !== "basic" && (
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                className="bg-gray-500 hover:bg-gray-600"
                onClick={() => {
                  const currentIndex = tabs.findIndex(tab => tab.id === activeTab)
                  if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1].id)
                }}
              >
                <ChevronLeft className="inline-block mr-1 h-4 w-4" /> Previous
              </Button>
            )}
            {activeTab !== "banking" && (
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                className="bg-gray-500 hover:bg-gray-600"
                onClick={() => {
                  const currentIndex = tabs.findIndex(tab => tab.id === activeTab)
                  if (currentIndex < tabs.length - 1) setActiveTab(tabs[currentIndex + 1].id)
                }}
              >
                Next <ChevronRight className="inline-block ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
