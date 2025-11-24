"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

interface EmployeeFormProps {
  employee?: Employee | null
  onClose: () => void
}

export default function EmployeeForm({ employee, onClose }: EmployeeFormProps) {
  const [formData, setFormData] = useState({
    name: employee?.name || "",
    email: employee?.email || "",
    employee_id: employee?.employee_id || "",
    department: employee?.department || "",
    position: employee?.position || "",
    phone: employee?.phone || "",
    basic_salary: employee?.basic_salary || 0,
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validate salary
    if (formData.basic_salary <= 0) {
      toast.error("Please enter a valid salary greater than 0")
      setIsLoading(false)
      return
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
        throw new Error(responseData.error || `Failed to save (${response.status})`)
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-black">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Name</label>
          <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Employee ID</label>
          <Input
            value={formData.employee_id}
            onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
            required
            disabled={!!employee}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Department</label>
          <Input
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Position</label>
          <Input value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} />
        </div>
        <div>
          <label className="text-sm font-medium">Phone</label>
          <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
        </div>
      </div>
      <div className="inline-block w-full">
          <label className="text-sm font-medium">Basic Salary ($)</label>
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

      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save"}
        </Button>
        <Button type="button" variant="destructive" onClick={onClose} className="bg-red-500">
          Cancel
        </Button>
      </div>
    </form>
  )
}
