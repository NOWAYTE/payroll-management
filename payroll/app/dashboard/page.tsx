"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardNav from "@/components/dashboard-nav"

interface DashboardStats {
  total_employees: number
  total_payroll: number
  total_payslips: number
  average_salary: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    console.log("Dashboard: Checking authentication...") // Debug
    const token = localStorage.getItem("token")
    const userStr = localStorage.getItem("user")
    
    console.log("Token exists:", !!token) // Debug
    console.log("User data:", userStr) // Debug
    
    if (!token) {
      console.log("No token found, redirecting to login") // Debug
      window.location.href = "/login"
      return
    }

    if (userStr) {
      try {
        const userData = JSON.parse(userStr)
        console.log("Parsed user data:", userData) // Debug
        setUser(userData)
      } catch (e) {
        console.error("Error parsing user data:", e)
        localStorage.removeItem("user")
      }
    }

    console.log("Authentication successful, loading dashboard...") // Debug
    fetchStats(token)
  }, [router])

  const fetchStats = async (token: string) => {
    try {
      console.log("Fetching dashboard stats...") // Debug
      
      // Only fetch analytics for admin users
      if (user?.role === 'admin') {
        const response = await fetch("/api/analytics/summary", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.status === 401) {
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          window.location.href = "/login"
          return
        }

        if (response.ok) {
          const data = await response.json()
          setStats({
            total_employees: data.total_employees || 0,
            total_payroll: data.total_payroll || 0,
            total_payslips: data.total_payslips || 0,
            average_salary: data.average_salary || 0
          })
          return
        }
      }
      
      // For non-admin users, set minimal stats
      setStats({
        total_employees: 0,
        total_payroll: 0,
        total_payslips: 0,
        average_salary: 0
      })
    } catch (error) {
      console.error("Failed to load dashboard:", error)
      setStats({
        total_employees: 0,
        total_payroll: 0,
        total_payslips: 0,
        average_salary: 0
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    console.log("Logging out...") // Debug
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    // Clear cookies
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    window.location.href = "/login"
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardNav />
      <main className="flex-1 text-black">
        <div className="container mx-auto p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <div className="flex items-center gap-4">
              {user && (
                <span className="text-gray-600">
                  Welcome, {user.email} ({user.role})
                </span>
              )}
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>

          {user?.role === 'admin' && (
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Employees</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.total_employees || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Payroll</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats?.total_payroll?.toFixed(2) || "0.00"}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Payslips Generated</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.total_payslips || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Average Salary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats?.average_salary?.toFixed(2) || "0.00"}</div>
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>{user?.role === 'admin' ? '🎉 Admin Dashboard' : user?.role === 'hr' ? '🏢 HR Dashboard' : '👋 Employee Portal'}</CardTitle>
              <CardDescription>
                {user?.role === 'admin' ? 'Complete control over the payroll management system.' : 
                 user?.role === 'hr' ? 'Manage payroll operations and employee compensation.' : 
                 'Access your personal payroll information.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">✅ Authentication successful! You are now logged in.</p>
              <p className="text-gray-600 mb-4">Use the navigation menu to:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                {user?.role === 'admin' && (
                  <>
                    <li>Manage employee information and profiles</li>
                    <li>Process monthly payroll for all employees</li>
                    <li>View and download all payslips</li>
                    <li>Access comprehensive analytics and reports</li>
                  </>
                )}
                {user?.role === 'hr' && (
                  <>
                    <li>Process monthly payroll for all employees</li>
                    <li>Review and approve payroll runs</li>
                    <li>Generate and manage payslips</li>
                    <li>Monitor payroll processing status</li>
                  </>
                )}
                {user?.role === 'employee' && (
                  <>
                    <li>View your monthly payslips</li>
                    <li>Download payslip PDFs</li>
                    <li>Track payment history</li>
                    <li>View salary details and deductions</li>
                  </>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
