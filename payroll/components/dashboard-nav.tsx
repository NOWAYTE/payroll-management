"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

interface User {
  id: number
  email: string
  role: string
}

interface Employee {
  name: string
  department: string
  employee_id: string
}

export default function DashboardNav() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [employee, setEmployee] = useState<Employee | null>(null)

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("user")
    const employeeData = localStorage.getItem("employee")
    
    if (userData) {
      setUser(JSON.parse(userData))
    }
    if (employeeData) {
      setEmployee(JSON.parse(employeeData))
    }
  }, [])

  const handleLogout = () => {
    console.log("Nav: Logging out...") // Debug
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("employee")
    // Clear cookies
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    window.location.href = "/login"
  }

  const getNavItems = () => {
    if (!user) return []

    const baseItems = [
      { href: "/dashboard", label: "Dashboard" }
    ]

    switch (user.role) {
      case 'admin':
        return [
          ...baseItems,
          { href: "/employees", label: "Employees" },
          { href: "/payroll", label: "Payroll" },
          { href: "/payslips", label: "Payslips" },
          { href: "/analytics", label: "Analytics" },
        ]
      
      case 'hr':
        return [
          ...baseItems,
          { href: "/payroll", label: "Payroll" },
          { href: "/payslips", label: "Payslips" },
        ]
      
      case 'employee':
        return [
          ...baseItems,
          { href: "/payslips", label: "My Payslips" },
        ]
      
      default:
        return baseItems
    }
  }

  const navItems = getNavItems()

  return (
    <aside className="w-64 bg-gray-900 text-white">
      <div className="p-6">
        <h2 className="text-xl font-bold">Payroll System</h2>
        {employee && (
          <div className="mt-4 text-sm text-gray-300">
            <p className="font-medium">{employee.name}</p>
            <p>{employee.department}</p>
            <p className="text-gray-400">ID: {employee.employee_id}</p>
          </div>
        )}
        {user && !employee && (
          <div className="mt-4 text-sm text-gray-300">
            <p className="font-medium">{user.email}</p>
            <p className="text-gray-400 capitalize">{user.role}</p>
          </div>
        )}
      </div>
      <nav className="space-y-2 px-4">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button variant={pathname === item.href ? "default" : "ghost"} className="w-full justify-start">
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>
      <div className="absolute bottom-4 left-4 right-4">
        <Button onClick={handleLogout} variant="destructive" className="w-full">
          Logout
        </Button>
      </div>
    </aside>
  )
}
