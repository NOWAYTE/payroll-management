"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardNav from "@/components/dashboard-nav"
import { toast } from "sonner"
import { Download, Receipt, DollarSign, Calendar, Users, Search, X, FileText } from 'lucide-react'

interface Payslip {
  id: number
  employee_id: number
  payroll_run_id: number
  basic_salary: number
  total_allowances: number
  total_deductions: number
  gross_salary: number
  tax: number
  net_salary: number
  payment_status: string
  created_at: string
  employee_name?: string
  employee_id_number?: string
  department?: string
  month?: number
  year?: number
}

export default function PayslipsPage() {
  const [payslips, setPayslips] = useState<Payslip[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [search, setSearch] = useState("")
  const [filteredPayslips, setFilteredPayslips] = useState<Payslip[]>([])
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userStr = localStorage.getItem("user")
    
    if (!token) {
      router.push("/login")
      return
    }

    if (userStr) {
      setUser(JSON.parse(userStr))
    }

    fetchPayslips(token)
  }, [router])

  // Filter payslips based on search term
  useEffect(() => {
    if (!search) {
      setFilteredPayslips(payslips)
    } else {
      const filtered = payslips.filter(payslip => 
        payslip.employee_name?.toLowerCase().includes(search.toLowerCase()) ||
        payslip.employee_id_number?.toLowerCase().includes(search.toLowerCase()) ||
        payslip.department?.toLowerCase().includes(search.toLowerCase()) ||
        payslip.id.toString().includes(search)
      )
      setFilteredPayslips(filtered)
    }
  }, [payslips, search])

  const fetchPayslips = async (token: string) => {
    try {
      const response = await fetch("/api/payslips", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.status === 401) {
        localStorage.removeItem("token")
        router.push("/login")
        return
      }

      if (!response.ok) throw new Error("Failed to fetch payslips")

      const data = await response.json()
      setPayslips(data.payslips || [])
      setFilteredPayslips(data.payslips || [])
    } catch (error) {
      toast.error("Failed to load payslips")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadPDF = async (payslipId: number) => {
    const token = localStorage.getItem("token")
    console.log("Downloading PDF for payslip ID:", payslipId) // Debug
    console.log("Token present:", !!token) // Debug
    
    try {
      const response = await fetch(`/api/payslips/${payslipId}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      console.log("PDF response status:", response.status) // Debug
      console.log("PDF response headers:", response.headers.get('content-type')) // Debug

      if (!response.ok) {
        const errorData = await response.json()
        console.error("PDF error response:", errorData) // Debug
        throw new Error(errorData.error || "Failed to download")
      }

      const blob = await response.blob()
      console.log("PDF blob size:", blob.size, "bytes") // Debug
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `payslip_${payslipId}.pdf`
      document.body.appendChild(a) // Add to body for better browser compatibility
      a.click()
      document.body.removeChild(a) // Clean up
      window.URL.revokeObjectURL(url) // Clean up
      
      toast.success("PDF downloaded successfully")
    } catch (error) {
      console.error("PDF download error:", error) // Debug
      toast.error(error instanceof Error ? error.message : "Failed to download PDF")
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Loading payslips...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <main className="flex w-full">
        <DashboardNav />
        <div className="flex-1 p-6 lg:p-8 h-[100vh] overflow-y-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  {user?.role === 'employee' ? 'My Payslips' : 'Payslips'}
                </h1>
                <p className="text-slate-600">View and download salary statements</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium mb-1">Total Payslips</p>
                    <p className="text-3xl font-bold text-slate-900">{filteredPayslips.length}</p>
                  </div>
                  <div className="bg-slate-100 rounded-full p-3">
                    <Receipt className="h-6 w-6 text-slate-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium mb-1">Total Paid</p>
                    <p className="text-3xl font-bold text-gray-600">
                      ${filteredPayslips.filter(p => p.payment_status === 'paid').reduce((sum, p) => sum + p.net_salary, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-green-100 rounded-full p-3">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium mb-1">Pending</p>
                    <p className="text-3xl font-bold text-gray-600">
                      ${filteredPayslips.filter(p => p.payment_status === 'pending').reduce((sum, p) => sum + p.net_salary, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-yellow-100 rounded-full p-3">
                    <Calendar className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium mb-1">Unique Employees</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {new Set(filteredPayslips.map(p => p.employee_id)).size}
                    </p>
                  </div>
                  <div className="bg-slate-100 rounded-full p-3">
                    <Users className="h-6 w-6 text-slate-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6 border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <Input 
                    placeholder="Search by employee name, ID, or department..." 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                  />
                </div>
                <div>
                  <Button 
                    variant="outline"
                    className="w-full border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400"
                    disabled
                  >
                    <Search className="h-4 w-4 mr-2"/>
                    Search
                  </Button>
                </div>
                <div>
                  <Button 
                    onClick={() => setSearch("")}
                    variant="outline"
                    className="w-full border-slate-300 bg-white hover:bg-slate-100"
                  >
                    <X className="h-4 w-4 mr-2"/>
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payslips Grid */}
          <div className="space-y-4">
            {filteredPayslips.length === 0 ? (
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="bg-slate-100 rounded-full p-6 mb-4">
                      <Receipt className="h-12 w-12 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No payslips found</h3>
                    <p className="text-slate-600">
                      {search ? "Try a different search term or check back later." : "Process some payroll runs to generate payslips."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredPayslips.map((payslip) => (
                <Card key={payslip.id} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="border-b border-slate-200 bg-slate-50">
                    <CardTitle className="text-lg flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="bg-slate-100 rounded-full p-2 mr-3">
                          <FileText className="h-5 w-5 text-slate-600" />
                        </div>
                        <div>
                          <span className="text-slate-900">Payslip #{payslip.id}</span>
                          {payslip.employee_name && (
                            <div className="text-sm font-normal text-slate-600 mt-1">
                              {payslip.employee_name} ({payslip.employee_id_number})
                              {payslip.department && <span className="ml-2">• {payslip.department}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            payslip.payment_status === 'paid' 
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : payslip.payment_status === 'pending'
                                ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}>
                            {payslip.payment_status.toUpperCase()}
                          </span>
                        </div>
                        {payslip.month && payslip.year && (
                          <div className="text-sm text-slate-500">
                            {new Date(payslip.year, payslip.month - 1).toLocaleDateString('en-US', { 
                              month: 'long', 
                              year: 'numeric' 
                            })}
                          </div>
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-5 gap-6">
                      <div className="space-y-1">
                        <p className="text-xs text-slate-500 uppercase font-medium tracking-wider">Basic Salary</p>
                        <p className="text-lg font-semibold text-slate-900">${payslip.basic_salary.toFixed(2)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-slate-500 uppercase font-medium tracking-wider">Allowances</p>
                        <p className="text-lg font-semibold text-green-600">+${payslip.total_allowances.toFixed(2)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-slate-500 uppercase font-medium tracking-wider">Deductions</p>
                        <p className="text-lg font-semibold text-red-600">-${(payslip.total_deductions + payslip.tax).toFixed(2)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-slate-500 uppercase font-medium tracking-wider">Net Salary</p>
                        <p className="text-2xl font-bold text-slate-900">${payslip.net_salary.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center justify-end">
                        <Button 
                          size="sm" 
                          onClick={() => handleDownloadPDF(payslip.id)}
                          className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Results Summary */}
          {filteredPayslips.length > 0 && (
            <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
              <p>
                Showing <span className="font-medium text-slate-900">{filteredPayslips.length}</span> of{' '}
                <span className="font-medium text-slate-900">{payslips.length}</span> payslip{payslips.length !== 1 ? 's' : ''}
              </p>
              {search && (
                <p>Search results for: <span className="font-medium text-slate-900">"{search}"</span></p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
