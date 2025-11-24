"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardNav from "@/components/dashboard-nav"
import EmployeeForm from "@/components/employee-form"
import { toast } from "sonner"

interface Employee {
  id: number
  name: string
  email: string
  employee_id: string
  department: string
  position: string
  phone: string
  basic_salary?: number
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
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-black">
      <DashboardNav />
      <main className="flex-1">
        <div className="container mx-auto p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Employees</h1>
            <Button onClick={() => setShowForm(true)} className="bg-black text-white">Add Employee</Button>
          </div>

          {showForm && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>{editingEmployee ? "Edit Employee" : "Add New Employee"}</CardTitle>
              </CardHeader>
              <CardContent>
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

          <div className="mb-6">
            <Input placeholder="Search employees..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Employee ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Department</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Salary</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No employees found. {search ? "Try a different search term or " : ""}<button 
                        onClick={() => setShowForm(true)} 
                        className="text-blue-600 hover:underline"
                      >
                        add the first employee
                      </button>.
                    </td>
                  </tr>
                ) : (
                  employees.map((emp) => (
                    <tr key={emp.id} className="border-t hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{emp.name}</td>
                      <td className="px-6 py-4">{emp.email}</td>
                      <td className="px-6 py-4">{emp.employee_id}</td>
                      <td className="px-6 py-4">{emp.department || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-green-600">
                          ${emp.basic_salary?.toFixed(2) || "0.00"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingEmployee(emp)
                              setShowForm(true)
                            }}
                            className="bg-white border-gray-300"
                          >
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => handleDelete(emp.id)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
