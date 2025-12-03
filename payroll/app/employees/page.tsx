"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import EmployeeForm from "@/components/employee-form"
import { toast } from "sonner"
import { Trash2, Eye, PencilLine, UserSearch, UserPlus, Users, X } from 'lucide-react';
import DashboardNav from "@/components/dashboard-nav"

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

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
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
      // Check if user has permission to view employees
      if (userData.role !== 'admin') {
        toast.error("Access denied: Admin access required")
        router.push("/dashboard")
        return
      }
    }

    fetchEmployees(token)
  }, [router])

  const fetchEmployees = async (token: string) => {
    try {
      const query = search ? `?search=${search}` : ""
      const response = await fetch(`/api/employees${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.status === 401) {
        localStorage.removeItem("token")
        router.push("/login")
        return
      }

      if (!response.ok) throw new Error("Failed to fetch employees")

      const data = await response.json()
      console.log("Employees fetched:", data) // Debug log
      setEmployees(data.employees || [])
    } catch (error) {
      console.error("Error fetching employees:", error) // Debug log
      toast.error("Failed to load employees")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this employee?")) return

    const token = localStorage.getItem("token")
    console.log("Attempting to delete employee:", id) // Debug
    
    try {
      const response = await fetch(`/api/employees/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      console.log("Delete response status:", response.status) // Debug
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error("Delete error response:", errorData) // Debug
        throw new Error(errorData.error || `Failed to delete (${response.status})`)
      }

      const responseData = await response.json()
      console.log("Delete success response:", responseData) // Debug
      
      toast.success("Employee deleted successfully")
      setEmployees(employees.filter((e) => e.id !== id))
    } catch (error) {
      console.error("Delete error:", error) // Debug
      toast.error(error instanceof Error ? error.message : "Failed to delete employee")
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Loading employees...</p>
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
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Employees</h1>
                <p className="text-slate-600">Manage your workforce and employee information</p>
              </div>
              <Button 
                onClick={() => setShowForm(true)} 
                className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            </div>
          </div>

          {/* Employee Form */}
          {showForm && (
            <Card className="mb-6 border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-slate-900">
                    {editingEmployee ? "Edit Employee" : "Add New Employee"}
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setShowForm(false)
                      setEditingEmployee(null)
                    }}
                    className="border-slate-300 text-slate-700 hover:bg-slate-100"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <EmployeeForm
                  employee={editingEmployee}
                  onClose={() => {
                    setShowForm(false)
                    setEditingEmployee(null)
                    fetchEmployees(localStorage.getItem("token")!)
                  }}
                />
              </CardContent>
            </Card>
          )}

          {/* Stats Card */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium mb-1">Total Employees</p>
                    <p className="text-3xl font-bold text-slate-900">{employees.length}</p>
                  </div>
                  <div className="bg-slate-100 rounded-full p-3">
                    <Users className="h-6 w-6 text-slate-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium mb-1">Departments</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {new Set(employees.map(e => e.department).filter(Boolean)).size}
                    </p>
                  </div>
                  <div className="bg-slate-100 rounded-full p-3">
                    <Users className="h-6 w-6 text-slate-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium mb-1">Total Payroll</p>
                    <p className="text-3xl font-bold text-slate-900">
                      ${employees.reduce((sum, e) => sum + (e.basic_salary || 0), 0).toLocaleString()}
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
                    placeholder="Search employees by name, email, or ID..." 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                  />
                </div>
                <div>
                  <Button 
                    onClick={() => fetchEmployees(localStorage.getItem("token")!)}
                    variant="outline"
                    className="w-full border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400"
                  >
                    <UserSearch className="h-4 w-4 mr-2"/>
                    Search
                  </Button>
                </div>
                <div>
                  <Button 
                    onClick={() => {
                      setSearch("")
                      fetchEmployees(localStorage.getItem("token")!)
                    }}
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

          {/* Employees Table */}
          <Card className="border-slate-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Employee ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Salary</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="bg-slate-100 rounded-full p-6 mb-4">
                            <Users className="h-12 w-12 text-slate-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-slate-900 mb-2">No employees found</h3>
                          <p className="text-slate-600 mb-4">
                            {search ? "Try a different search term or " : "Get started by "}
                            <button 
                              onClick={() => setShowForm(true)} 
                              className="text-slate-900 font-medium hover:underline"
                            >
                              adding your first employee
                            </button>
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    employees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="bg-slate-100 rounded-full p-2 mr-3">
                              <Users className="h-4 w-4 text-slate-600" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{emp.name}</p>
                              <p className="text-sm text-slate-500">{emp.position}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">{emp.email}</td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm text-slate-700">{emp.employee_id}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">{emp.department || 'N/A'}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            {emp.employment_type || 'Not specified'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-sm text-slate-900">
                            ${emp.basic_salary?.toFixed(2) || "0.00"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/employees/${emp.id}`)}
                              className="border-slate-300 hover:bg-slate-50 bg-green-500 hover:border-slate-400"
                              title="View employee details"
                            >
                              <Eye className="h-4 w-4"/>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingEmployee(emp)
                                setShowForm(true)
                              }}
                              className="border-slate-300 hover:bg-slate-50 bg-white hover:border-slate-400"
                              title="Edit employee"
                            >
                              <PencilLine className="h-4 w-4"/>
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDelete(emp.id)}
                              className="border-rose-300 text-rose-700 hover:bg-rose-50 bg-red-50 hover:border-rose-400"
                              title="Delete employee"
                            >
                              <Trash2 className="h-4 w-4"/>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Results Summary */}
          {employees.length > 0 && (
            <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
              <p>Showing <span className="font-medium text-slate-900">{employees.length}</span> employee{employees.length !== 1 ? 's' : ''}</p>
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