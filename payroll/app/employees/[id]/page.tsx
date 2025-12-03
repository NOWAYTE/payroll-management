"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import EmployeeForm from "@/components/employee-form"
import { toast } from "sonner"
import { 
  ArrowLeft, 
  Edit, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Building,
  CreditCard,
  Shield,
  AlertTriangle,
  TrendingUp,
  FileText,
  DollarSign,
  Clock,
  Briefcase
} from 'lucide-react'

interface EmployeeDetail {
  id: number
  name: string
  email: string
  employee_id: string
  department: string
  position: string
  phone: string
  basic_salary?: number
  hire_date?: string
  is_active: boolean
  
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
  
  // Financial Information
  current_salary?: {
    basic_salary: number
    start_date: string
    currency: string
  }
  salary_history?: Array<{
    basic_salary: number
    start_date: string
    end_date?: string
    currency: string
  }>
  allowances?: Array<{
    allowance_type: string
    amount: number
    is_fixed: boolean
    start_date: string
  }>
  deductions?: Array<{
    deduction_type: string
    amount: number
    is_fixed: boolean
    start_date: string
  }>
  recent_payrolls?: Array<{
    id: number
    month: number
    year: number
    net_salary: number
    status: string
  }>
  payslips_count: number
  
  // Summary
  summary?: {
    total_allowances: number
    total_deductions: number
    net_additions: number
    years_of_service: number
  }
  
  created_at: string
}

export default function EmployeeDetailsPage() {
  const [employee, setEmployee] = useState<EmployeeDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showEditForm, setShowEditForm] = useState(false)
  const router = useRouter()
  const params = useParams()
  const employeeId = params.id

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userStr = localStorage.getItem("user")
    
    if (!token) {
      router.push("/login")
      return
    }

    if (userStr) {
      const userData = JSON.parse(userStr)
      if (userData.role !== 'admin' && userData.role !== 'finance') {
        toast.error("Access denied: Admin or Finance access required")
        router.push("/dashboard")
        return
      }
    }

    fetchEmployeeDetails(token)
  }, [employeeId, router])

  const fetchEmployeeDetails = async (token: string) => {
    try {
      const response = await fetch(`/api/employees/${employeeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.status === 401) {
        localStorage.removeItem("token")
        router.push("/login")
        return
      }

      if (response.status === 404) {
        toast.error("Employee not found")
        router.push("/employees")
        return
      }

      if (!response.ok) throw new Error("Failed to fetch employee details")

      const data = await response.json()
      setEmployee(data)
    } catch (error) {
      console.error("Error fetching employee details:", error)
      toast.error("Failed to load employee details")
      router.push("/employees")
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not specified"
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount?: number) => {
    if (!amount) return "$0.00"
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const statusColors = {
      draft: "bg-slate-100 text-slate-700 border border-slate-200",
      processed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      pending: "bg-amber-50 text-amber-700 border border-amber-200",
      cancelled: "bg-rose-50 text-rose-700 border border-rose-200"
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-md ${statusColors[status as keyof typeof statusColors] || statusColors.draft}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Loading employee details...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="flex min-h-screen bg-slate-50 text-slate-900">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="bg-white rounded-full p-6 inline-flex mb-4 shadow-sm">
              <User className="h-16 w-16 text-slate-400" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">Employee Not Found</h2>
            <p className="text-slate-600 mb-6">The requested employee could not be found.</p>
            <Button onClick={() => router.push("/employees")} className="bg-slate-900 hover:bg-slate-800 text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Employees
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <main className="flex-1">
        <div className="container mx-auto p-6 max-w-7xl">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <Button 
                  variant="outline" 
                  onClick={() => router.push("/employees")}
                  className="flex items-center border-slate-300 text-slate-700 bg-white hover:bg-slate-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div className="flex items-center space-x-4">
                  <div className="bg-slate-100 rounded-full p-4">
                    <User className="h-8 w-8 text-slate-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900">{employee.name}</h1>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-slate-600 font-medium">{employee.position}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-sm text-slate-500 font-mono">{employee.employee_id}</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${employee.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                        {employee.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <Button 
                onClick={() => setShowEditForm(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Details
              </Button>
            </div>
          </div>

          {/* Edit Form Modal */}
          {showEditForm && (
            <Card className="mb-6 border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-200 bg-slate-50">
                <CardTitle className="text-slate-900">Edit Employee Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <EmployeeForm
                  employee={employee}
                  onClose={() => {
                    setShowEditForm(false)
                    fetchEmployeeDetails(localStorage.getItem("token")!)
                  }}
                />
              </CardContent>
            </Card>
          )}

          {/* Employee Status Warning */}
          {!employee.is_active && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-6">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-rose-600 mr-3" />
                <span className="text-rose-800 font-medium">This employee is currently inactive</span>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Basic Info & Personal Details */}
            <div className="lg:col-span-1 space-y-6">
              {/* Basic Information */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-100">
                  <CardTitle className="flex items-center text-slate-900 text-base">
                    <Briefcase className="h-5 w-5 mr-2 text-slate-600" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="flex items-start space-x-3">
                    <Mail className="h-4 w-4 text-slate-400 mt-1" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 uppercase font-medium mb-1">Email</p>
                      <p className="text-sm text-slate-900">{employee.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Phone className="h-4 w-4 text-slate-400 mt-1" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 uppercase font-medium mb-1">Phone</p>
                      <p className="text-sm text-slate-900">{employee.phone || "Not provided"}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Building className="h-4 w-4 text-slate-400 mt-1" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 uppercase font-medium mb-1">Department</p>
                      <p className="text-sm text-slate-900">{employee.department || "Not assigned"}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-4 w-4 text-slate-400 mt-1" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 uppercase font-medium mb-1">Hire Date</p>
                      <p className="text-sm text-slate-900">{formatDate(employee.hire_date)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Personal Details */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-100">
                  <CardTitle className="flex items-center text-slate-900 text-base">
                    <Shield className="h-5 w-5 mr-2 text-slate-600" />
                    Personal Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-medium mb-1">Date of Birth</p>
                    <p className="text-sm text-slate-900">{formatDate(employee.date_of_birth)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-medium mb-1">Gender</p>
                    <p className="text-sm text-slate-900">{employee.gender || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-medium mb-1">Marital Status</p>
                    <p className="text-sm text-slate-900">{employee.marital_status || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-medium mb-1">Employment Type</p>
                    <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      {employee.employment_type || "Not specified"}
                    </span>
                  </div>
                  {employee.address && (
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-4 w-4 text-slate-400 mt-1" />
                      <div className="flex-1">
                        <p className="text-xs text-slate-500 uppercase font-medium mb-1">Address</p>
                        <p className="text-sm text-slate-900">{employee.address}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Emergency Contact */}
              {(employee.emergency_contact_name || employee.emergency_contact_phone) && (
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="border-b border-slate-100">
                    <CardTitle className="flex items-center text-slate-900 text-base">
                      <AlertTriangle className="h-5 w-5 mr-2 text-slate-600" />
                      Emergency Contact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-medium mb-1">Contact Name</p>
                      <p className="text-sm text-slate-900">{employee.emergency_contact_name || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-medium mb-1">Contact Phone</p>
                      <p className="text-sm text-slate-900">{employee.emergency_contact_phone || "Not provided"}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Middle Column - Financial Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Current Salary */}
              <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-slate-50 to-white">
                <CardHeader className="border-b border-slate-100">
                  <CardTitle className="flex items-center text-slate-900 text-base">
                    <DollarSign className="h-5 w-5 mr-2 text-slate-600" />
                    Current Salary
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-slate-900 mb-1">
                      {formatCurrency(employee.current_salary?.basic_salary || employee.basic_salary)}
                    </p>
                    <p className="text-sm text-slate-600 font-medium">Monthly Basic Salary</p>
                    {employee.current_salary?.start_date && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <p className="text-xs text-slate-500">
                          Effective from {formatDate(employee.current_salary.start_date)}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Financial Summary */}
              {employee.summary && (
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="border-b border-slate-100">
                    <CardTitle className="flex items-center text-slate-900 text-base">
                      <TrendingUp className="h-5 w-5 mr-2 text-slate-600" />
                      Financial Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-6">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-slate-600">Total Allowances</span>
                      <span className="font-semibold text-emerald-600">
                        {formatCurrency(employee.summary.total_allowances)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-slate-600">Total Deductions</span>
                      <span className="font-semibold text-rose-600">
                        {formatCurrency(employee.summary.total_deductions)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t border-slate-200 pt-3 mt-2">
                      <span className="font-semibold text-slate-900">Net Additions</span>
                      <span className={`font-bold text-lg ${employee.summary.net_additions >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {formatCurrency(employee.summary.net_additions)}
                      </span>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg mt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-slate-500 mr-2" />
                          <span className="text-sm text-slate-700 font-medium">Years of Service</span>
                        </div>
                        <span className="text-lg font-bold text-slate-900">{employee.summary.years_of_service}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Banking Information */}
              {(employee.bank_account || employee.bank_name) && (
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="border-b border-slate-100">
                    <CardTitle className="flex items-center text-slate-900 text-base">
                      <CreditCard className="h-5 w-5 mr-2 text-slate-600" />
                      Banking Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-medium mb-1">Bank Name</p>
                      <p className="text-sm text-slate-900 font-medium">{employee.bank_name || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-medium mb-1">Account Number</p>
                      <p className="text-sm text-slate-900 font-mono">
                        {employee.bank_account ? "••••••" + employee.bank_account.slice(-4) : "Not provided"}
                      </p>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg mt-4">
                      <p className="text-xs text-amber-800 flex items-center">
                        <Shield className="h-3 w-3 mr-2" />
                        Banking information is securely encrypted
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Activity & History */}
            <div className="lg:col-span-1 space-y-6">
              {/* Quick Stats */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-100">
                  <CardTitle className="flex items-center text-slate-900 text-base">
                    <FileText className="h-5 w-5 mr-2 text-slate-600" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-3xl font-bold text-slate-900 mb-1">{employee.payslips_count}</p>
                      <p className="text-xs text-slate-600 font-medium">Total Payslips</p>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-3xl font-bold text-slate-900 mb-1">
                        {employee.recent_payrolls?.length || 0}
                      </p>
                      <p className="text-xs text-slate-600 font-medium">Payroll Runs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Payroll Activity */}
              {employee.recent_payrolls && employee.recent_payrolls.length > 0 && (
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="border-b border-slate-100">
                    <CardTitle className="text-slate-900 text-base">Recent Payroll Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      {employee.recent_payrolls.slice(0, 5).map((payroll, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div>
                            <p className="font-medium text-sm text-slate-900">
                              {new Date(payroll.year, payroll.month - 1).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short' 
                              })}
                            </p>
                            <p className="text-xs text-slate-600 mt-0.5">{formatCurrency(payroll.net_salary)}</p>
                          </div>
                          <div>
                            {getStatusBadge(payroll.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Allowances */}
              {employee.allowances && employee.allowances.length > 0 && (
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="border-b border-slate-100">
                    <CardTitle className="text-slate-900 text-base">Active Allowances</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      {employee.allowances.map((allowance, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                          <div>
                            <p className="font-medium text-sm text-slate-900">{allowance.allowance_type}</p>
                            <p className="text-xs text-slate-600 mt-0.5">
                              {allowance.is_fixed ? "Fixed" : "Variable"}
                            </p>
                          </div>
                          <span className="font-semibold text-emerald-700">
                            +{formatCurrency(allowance.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Deductions */}
              {employee.deductions && employee.deductions.length > 0 && (
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="border-b border-slate-100">
                    <CardTitle className="text-slate-900 text-base">Active Deductions</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      {employee.deductions.map((deduction, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-rose-50 rounded-lg border border-rose-200">
                          <div>
                            <p className="font-medium text-sm text-slate-900">{deduction.deduction_type}</p>
                            <p className="text-xs text-slate-600 mt-0.5">
                              {deduction.is_fixed ? "Fixed" : "Variable"}
                            </p>
                          </div>
                          <span className="font-semibold text-rose-700">
                            -{formatCurrency(deduction.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Footer Info */}
          <Card className="mt-6 border-slate-200 shadow-sm">
            <CardContent className="py-3">
              <p className="text-xs text-slate-500 text-center">
                Employee created on {formatDate(employee.created_at)} • Last updated: {formatDate(employee.created_at)}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}