"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  FileText, 
  BarChart3, 
  LogOut,
  Building2,
  User
} from "lucide-react"

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
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }
    ]

    switch (user.role) {
      case 'admin':
        return [
          ...baseItems,
          { href: "/employees", label: "Employees", icon: Users },
          { href: "/payroll", label: "Payroll", icon: DollarSign },
          { href: "/payslips", label: "Payslips", icon: FileText },
          { href: "/analytics", label: "Analytics", icon: BarChart3 },
        ]
      
      case 'hr':
        return [
          ...baseItems,
          { href: "/payroll", label: "Payroll", icon: DollarSign },
          { href: "/payslips", label: "Payslips", icon: FileText },
        ]
      
      case 'employee':
        return [
          ...baseItems,
          { href: "/payslips", label: "My Payslips", icon: FileText },
        ]
      
      default:
        return baseItems
    }
  }

  const navItems = getNavItems()

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col border-r border-slate-800">
      {/* Header */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center space-x-2 mb-4">
          <div className="bg-slate-700 rounded-lg p-2">
            <Building2 className="h-6 w-6 text-slate-200" />
          </div>
          <h2 className="text-xl font-bold text-white">Payroll System</h2>
        </div>
        
        {/* User Info Card */}
        <div className="bg-slate-800 rounded-lg p-4 mt-4 border border-slate-700">
          <div className="flex items-start space-x-3">
            <div className="bg-slate-700 rounded-full p-2 mt-0.5">
              <User className="h-4 w-4 text-slate-300" />
            </div>
            <div className="flex-1 min-w-0">
              {employee ? (
                <>
                  <p className="font-semibold text-white text-sm truncate">{employee.name}</p>
                  <p className="text-xs text-slate-400 mt-1">{employee.department}</p>
                  <p className="text-xs text-slate-500 mt-1 font-mono">ID: {employee.employee_id}</p>
                </>
              ) : user ? (
                <>
                  <p className="font-semibold text-white text-sm truncate">{user.email}</p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-700 text-slate-300 border border-slate-600 mt-2">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link key={item.href} href={item.href}>
              <Button 
                variant="ghost"
                className={`w-full justify-start transition-all ${
                  isActive 
                    ? "bg-slate-800 text-white hover:bg-slate-700 border border-slate-700" 
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <Icon className="h-4 w-4 mr-3" />
                {item.label}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-800">
        <Button 
          onClick={handleLogout} 
          variant="outline"
          className="w-full justify-start border-slate-700 text-slate-300 hover:bg-rose-900/20 hover:text-rose-400 hover:border-rose-800 transition-all"
        >
          <LogOut className="h-4 w-4 mr-3" />
          Logout
        </Button>
      </div>
    </aside>
  )
}