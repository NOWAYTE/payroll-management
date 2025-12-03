"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardNav from "@/components/dashboard-nav"
import { toast } from "sonner"
import { Users, DollarSign, Calendar, TrendingUp, Plus, Filter, X, Search, Play, FileText, UserPlus, Building } from 'lucide-react'

interface Employee {
  id: number
  name: string
  email: string
  department: string
  current_salary: number
}

interface PayrollRun {
  id: number
  employee_id: number
  employee_name: string
  month: number
  year: number
  basic_salary: number
  deductions: number
  net_salary: number
  status: string
}

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState<PayrollRun[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [selectedEmployee, setSelectedEmployee] = useState<number | "">("")
  const [deductions, setDeductions] = useState(0)
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1)
  const [filterYear, setFilterYear] = useState(new Date().getFullYear())
  const [showBulkCreate, setShowBulkCreate] = useState(false)
  const [isCreatingBulk, setIsCreatingBulk] = useState(false)
  const [search, setSearch] = useState("")
  const [filteredPayrolls, setFilteredPayrolls] = useState<PayrollRun[]>([])
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userStr = localStorage.getItem("user")
    
    if (!token) {
      router.push("/login")
      return
    }

    if (userStr) {
      const userData = JSON.parse(userStr)
      // Check if user has permission to manage payroll
      if (!['admin', 'hr'].includes(userData.role)) {
        toast.error("Access denied: Admin or HR access required")
        router.push("/dashboard")
        return
      }
    }

    fetchPayrolls(token)
    fetchEmployees(token)
  }, [router])

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      fetchPayrolls(token)
    }
  }, [filterMonth, filterYear])

  // Filter payrolls based on search term
  useEffect(() => {
    if (!search) {
      setFilteredPayrolls(payrolls)
    } else {
      const filtered = payrolls.filter(payroll => 
        payroll.employee_name?.toLowerCase().includes(search.toLowerCase()) ||
        payroll.id.toString().includes(search) ||
        payroll.status.toLowerCase().includes(search.toLowerCase())
      )
      setFilteredPayrolls(filtered)
    }
  }, [payrolls, search])

  const fetchPayrolls = async (token: string) => {
    try {
      const params = new URLSearchParams()
      if (filterMonth) params.append('month', filterMonth.toString())
      if (filterYear) params.append('year', filterYear.toString())
      
      const response = await fetch(`/api/payroll/runs?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.status === 401) {
        localStorage.removeItem("token")
        router.push("/login")
        return
      }

      if (!response.ok) throw new Error("Failed to fetch payrolls")

      const data = await response.json()
      setPayrolls(data.payroll_runs || [])
      setFilteredPayrolls(data.payroll_runs || [])
    } catch (error) {
      toast.error("Failed to load payrolls")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchEmployees = async (token: string) => {
    try {
      const response = await fetch("/api/payroll/employees", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error("Failed to fetch employees")

      const data = await response.json()
      setEmployees(data.employees || [])
    } catch (error) {
      toast.error("Failed to load employees")
    }
  }

  const handleCreatePayroll = async () => {
    if (!selectedEmployee) {
      toast.error("Please select an employee")
      return
    }

    const token = localStorage.getItem("token")
    try {
      const response = await fetch("/api/payroll/runs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          employee_id: selectedEmployee, 
          month, 
          year, 
          deductions 
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create")
      }

      toast.success("Payroll run created")
      fetchPayrolls(token)
      setSelectedEmployee("")
      setDeductions(0)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create payroll")
    }
  }

  const handleProcessPayroll = async (id: number) => {
    const token = localStorage.getItem("token")
    console.log("Processing payroll ID:", id) // Debug
    console.log("Token present:", !!token) // Debug
    
    try {
      const response = await fetch(`/api/payroll/runs/${id}/process`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })

      console.log("Process response status:", response.status) // Debug
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error("Process error response:", errorData) // Debug
        throw new Error(errorData.error || "Failed to process")
      }

      const responseData = await response.json()
      console.log("Process success response:", responseData) // Debug

      toast.success("Payroll processed successfully")
      fetchPayrolls(token)
    } catch (error) {
      console.error("Process error:", error) // Debug
      toast.error(error instanceof Error ? error.message : "Failed to process payroll")
    }
  }

  const handleBulkCreatePayroll = async () => {
    if (!confirm(`Create payroll for all employees for ${month}/${year}?`)) {
      return
    }

    setIsCreatingBulk(true)
    const token = localStorage.getItem("token")

    try {
      const response = await fetch("/api/payroll/runs/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          month, 
          year, 
          default_deductions: 0 
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create bulk payroll")
      }

      toast.success(`${data.message}. ${data.success_count} records created.`)
      if (data.error_count > 0) {
        toast.error(`${data.error_count} errors occurred`)
      }
      
      if (token) {
        fetchPayrolls(token)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create bulk payroll")
    } finally {
      setIsCreatingBulk(false)
      setShowBulkCreate(false)
    }
  }

  const getSelectedEmployeeSalary = () => {
    if (!selectedEmployee) return 0
    const employee = employees.find(emp => emp.id === selectedEmployee)
    return employee?.current_salary || 0
  }

  const getNetSalary = () => {
    return getSelectedEmployeeSalary() - deductions
  }

  const getAvailableEmployees = () => {
    return employees.filter(emp => 
      !payrolls.some(payroll => 
        payroll.employee_id === emp.id && 
        payroll.month === month && 
        payroll.year === year
      )
    )
  }

  const getMonthName = (monthNum: number) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months[monthNum - 1] || ''
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Loading payroll data...</p>
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
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Payroll Management</h1>
                <p className="text-slate-600">Create and manage payroll runs for employees</p>
              </div>
              <Button 
                onClick={() => setShowBulkCreate(!showBulkCreate)} 
                className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Bulk Create
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium mb-1">Total Runs</p>
                    <p className="text-xl font-bold text-slate-900">{filteredPayrolls.length}</p>
                  </div>
                  <div className="bg-slate-100 rounded-full p-3">
                    <FileText className="h-6 w-6 text-slate-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium mb-1">Total Payroll</p>
                    <p className="text-xl font-bold text-green-600">
                      ${filteredPayrolls.reduce((sum, p) => sum + p.net_salary, 0).toLocaleString()}
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
                    <p className="text-sm text-slate-600 font-medium mb-1">Processed</p>
                    <p className="text-xl font-bold text-blue-600">
                      {filteredPayrolls.filter(p => p.status === 'processed').length}
                    </p>
                  </div>
                  <div className="bg-blue-100 rounded-full p-3">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium mb-1">Draft</p>
                    <p className="text-xl font-bold text-yellow-600">
                      {filteredPayrolls.filter(p => p.status === 'draft').length}
                    </p>
                  </div>
                  <div className="bg-yellow-100 rounded-full p-3">
                    <Calendar className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6 border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-200 bg-slate-50">
              <CardTitle className="text-slate-900 flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Search & Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-5 gap-4">
                <div className="md:col-span-2">
                  <Input 
                    placeholder="Search by employee name, status, or ID..." 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                  />
                </div>
                <div className="flex gap-2 items-center">
                  <label className="text-xs text-slate-500 uppercase font-medium tracking-wider block mb-2">Month</label>
                  <Input
                    type="number"
                    min="1"
                    max="12"
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(Number.parseInt(e.target.value))}
                    className="w-full border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                  />
                </div>
                <div className="flex gap-2 items-center">
                  <label className="text-xs text-slate-500 uppercase font-medium tracking-wider block mb-2">Year</label>
                  <Input
                    type="number"
                    value={filterYear}
                    onChange={(e) => setFilterYear(Number.parseInt(e.target.value))}
                    className="w-full border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                  />
                </div>
                <div className="flex items-end">
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
              <div className="mt-4 text-sm text-slate-600">
                Showing: <span className="font-medium text-slate-900">{getMonthName(filterMonth)} {filterYear}</span> • 
                <span className="font-medium text-slate-900">{filteredPayrolls.length}</span> of <span className="font-medium text-slate-900">{payrolls.length}</span> records
              </div>
            </CardContent>
          </Card>

          {/* Bulk Create Section */}
          {showBulkCreate && (
            <Card className="mb-6 border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-slate-900 flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Bulk Create Payroll
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowBulkCreate(false)}
                    className="border-slate-300 text-slate-700 hover:bg-slate-100"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-medium tracking-wider block mb-2">Month</label>
                    <Input
                      type="number"
                      min="1"
                      max="12"
                      value={month}
                      onChange={(e) => setMonth(Number.parseInt(e.target.value))}
                      className="w-full border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-medium tracking-wider block mb-2">Year</label>
                    <Input
                      type="number"
                      value={year}
                      onChange={(e) => setYear(Number.parseInt(e.target.value))}
                      className="w-full border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="text-sm text-slate-600">
                        <span className="font-semibold text-slate-900 text-lg">{getAvailableEmployees().length}</span> employees
                        <div className="text-xs mt-1">available for {getMonthName(month)} {year}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button 
                    onClick={handleBulkCreatePayroll} 
                    className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
                    disabled={isCreatingBulk || getAvailableEmployees().length === 0}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {isCreatingBulk ? "Creating..." : `Create for ${getAvailableEmployees().length} employees`}
                  </Button>
                  <Button 
                    onClick={() => setShowBulkCreate(false)}
                    variant="outline"
                    className="border-slate-300 text-slate-700 hover:bg-slate-100"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Individual Create Section */}
          <Card className="mb-6 border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-200 bg-slate-50">
              <CardTitle className="text-slate-900 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Create Individual Payroll Run
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="text-xs text-slate-500 uppercase font-medium tracking-wider block mb-2">Employee</label>
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value ? Number(e.target.value) : "")}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white text-slate-900"
                    aria-label="Select employee for payroll"
                    required
                  >
                    <option value="">Select Employee</option>
                    {getAvailableEmployees().map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name} - {employee.department} (${employee.current_salary})
                      </option>
                    ))}
                  </select>
                  {getAvailableEmployees().length === 0 && (
                    <p className="text-sm text-slate-500 mt-1">All employees have payroll for {getMonthName(month)} {year}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase font-medium tracking-wider block mb-2">Month</label>
                  <Input
                    type="number"
                    min="1"
                    max="12"
                    value={month}
                    onChange={(e) => setMonth(Number.parseInt(e.target.value))}
                    className="w-full border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase font-medium tracking-wider block mb-2">Year</label>
                  <Input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number.parseInt(e.target.value))}
                    className="w-full border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase font-medium tracking-wider block mb-2">Deductions ($)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={deductions}
                    onChange={(e) => setDeductions(parseFloat(e.target.value) || 0)}
                    className="w-full border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase font-medium tracking-wider block mb-2">Basic Salary</label>
                  <Input
                    value={`$${getSelectedEmployeeSalary().toFixed(2)}`}
                    disabled
                    className="w-full bg-slate-100 text-slate-700 font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase font-medium tracking-wider block mb-2">Net Salary</label>
                  <Input
                    value={`$${getNetSalary().toFixed(2)}`}
                    disabled
                    className="w-full bg-green-50 border-green-200 text-green-700 font-semibold"
                  />
                </div>
              </div>
              <Button 
                onClick={handleCreatePayroll} 
                className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
                disabled={!selectedEmployee}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Payroll
              </Button>
            </CardContent>
          </Card>

          {/* Payroll Table */}
          <Card className="border-slate-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Period</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Basic Salary</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Deductions</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Net Salary</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredPayrolls.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="bg-slate-100 rounded-full p-6 mb-4">
                            <FileText className="h-12 w-12 text-slate-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-slate-900 mb-2">No payroll runs found</h3>
                          <p className="text-slate-600">
                            {search ? "Try a different search term or " : "Get started by "}
                            <button 
                              onClick={() => setShowBulkCreate(true)} 
                              className="text-slate-900 font-medium hover:underline"
                            >
                              creating payroll runs
                            </button>
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredPayrolls.map((payroll) => (
                      <tr key={payroll.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="bg-slate-100 rounded-full p-2 mr-3">
                              <Users className="h-4 w-4 text-slate-600" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{payroll.employee_name}</p>
                              <p className="text-sm text-slate-500">ID: {payroll.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-slate-500 mr-2" />
                            <span className="text-slate-900 font-medium">{getMonthName(payroll.month)} {payroll.year}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-900">${payroll.basic_salary.toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-red-600 font-medium">-${payroll.deductions.toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-lg font-bold text-green-600">${payroll.net_salary.toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            payroll.status === "draft"
                              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                              : payroll.status === "processed"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-green-50 text-green-700 border-green-200"
                          }`}>
                            {payroll.status.charAt(0).toUpperCase() + payroll.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {payroll.status === "draft" && (
                            <Button 
                              size="sm" 
                              onClick={() => handleProcessPayroll(payroll.id)} 
                              className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Process
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Results Summary */}
          {filteredPayrolls.length > 0 && (
            <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
              <p>
                Showing <span className="font-medium text-slate-900">{filteredPayrolls.length}</span> of{' '}
                <span className="font-medium text-slate-900">{payrolls.length}</span> payroll run{payrolls.length !== 1 ? 's' : ''}
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
