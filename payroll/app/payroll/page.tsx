"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardNav from "@/components/dashboard-nav"
import { toast } from "sonner"

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
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-black">
      <DashboardNav />
      <main className="flex-1">
        <div className="container mx-auto p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Payroll Management</h1>
            <Button 
              onClick={() => setShowBulkCreate(!showBulkCreate)} 
              className="bg-blue-600 text-white"
            >
              Bulk Create
            </Button>
          </div>

          {/* Filter Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Filter Payroll Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Filter by Month</label>
                  <Input
                    type="number"
                    min="1"
                    max="12"
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(Number.parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Filter by Year</label>
                  <Input
                    type="number"
                    value={filterYear}
                    onChange={(e) => setFilterYear(Number.parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="flex items-end">
                  <div className="text-sm text-gray-600">
                    Showing: {getMonthName(filterMonth)} {filterYear}
                    <br />
                    <span className="font-medium">{payrolls.length} records</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Create Section */}
          {showBulkCreate && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Bulk Create Payroll</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">Month</label>
                    <Input
                      type="number"
                      min="1"
                      max="12"
                      value={month}
                      onChange={(e) => setMonth(Number.parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Year</label>
                    <Input
                      type="number"
                      value={year}
                      onChange={(e) => setYear(Number.parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-end">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{getAvailableEmployees().length}</span> employees 
                      <br />without payroll for {getMonthName(month)} {year}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleBulkCreatePayroll} 
                    className="bg-green-600 text-white"
                    disabled={isCreatingBulk || getAvailableEmployees().length === 0}
                  >
                    {isCreatingBulk ? "Creating..." : `Create for ${getAvailableEmployees().length} employees`}
                  </Button>
                  <Button 
                    onClick={() => setShowBulkCreate(false)} 
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Individual Create Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create Individual Payroll Run</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Employee</label>
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value ? Number(e.target.value) : "")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <p className="text-sm text-gray-500 mt-1">All employees have payroll for {getMonthName(month)} {year}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Month</label>
                  <Input
                    type="number"
                    min="1"
                    max="12"
                    value={month}
                    onChange={(e) => setMonth(Number.parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Year</label>
                  <Input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number.parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Deductions ($)</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={deductions}
                    onChange={(e) => setDeductions(parseFloat(e.target.value) || 0)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Basic Salary</label>
                  <Input
                    value={`$${getSelectedEmployeeSalary().toFixed(2)}`}
                    disabled
                    className="w-full bg-gray-100"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Net Salary</label>
                  <Input
                    value={`$${getNetSalary().toFixed(2)}`}
                    disabled
                    className="w-full bg-green-100 font-semibold"
                  />
                </div>
              </div>
              <Button 
                onClick={handleCreatePayroll} 
                className="bg-black text-white"
                disabled={!selectedEmployee}
              >
                Create Payroll
              </Button>
            </CardContent>
          </Card>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Employee</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Month/Year</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Basic Salary</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Deductions</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Net Salary</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payrolls.map((payroll) => (
                  <tr key={payroll.id} className="border-t">
                    <td className="px-6 py-4">{payroll.employee_name}</td>
                    <td className="px-6 py-4">{payroll.month}/{payroll.year}</td>
                    <td className="px-6 py-4">${payroll.basic_salary.toFixed(2)}</td>
                    <td className="px-6 py-4">${payroll.deductions.toFixed(2)}</td>
                    <td className="px-6 py-4 font-semibold">${payroll.net_salary.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-sm font-medium ${
                          payroll.status === "draft"
                            ? "bg-yellow-100 text-yellow-800"
                            : payroll.status === "processed"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                        }`}
                      >
                        {payroll.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {payroll.status === "draft" && (
                        <Button 
                          size="sm" 
                          onClick={() => handleProcessPayroll(payroll.id)} 
                          className="text-white bg-green-500"
                        >
                          Process
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {payrolls.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No payroll runs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )}
