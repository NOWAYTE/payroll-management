"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardNav from "@/components/dashboard-nav"
import { toast } from "sonner"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"

interface DepartmentData {
  department: string
  employee_count: number
  total_salary: number
}

interface TrendData {
  year: number
  month: number
  total_payroll: number
  employee_count: number
}

export default function AnalyticsPage() {
  const [departments, setDepartments] = useState<DepartmentData[]>([])
  const [trends, setTrends] = useState<TrendData[]>([])
  const [isLoading, setIsLoading] = useState(true)
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
      // Check if user has permission to view analytics
      if (userData.role !== 'admin') {
        toast.error("Access denied: Admin access required")
        router.push("/dashboard")
        return
      }
    }

    fetchAnalytics(token)
  }, [router])

  const fetchAnalytics = async (token: string) => {
    try {
      const [deptRes, trendRes] = await Promise.all([
        fetch("/api/analytics/department-distribution", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/analytics/monthly-trend", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (deptRes.status === 401 || trendRes.status === 401) {
        localStorage.removeItem("token")
        router.push("/login")
        return
      }

      if (!deptRes.ok || !trendRes.ok) throw new Error("Failed to fetch")

      const deptData = await deptRes.json()
      const trendData = await trendRes.json()

      setDepartments(deptData.departments || [])
      setTrends(trendData.trends || [])
    } catch (error) {
      toast.error("Failed to load analytics")
    } finally {
      setIsLoading(false)
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
          <h1 className="text-3xl font-bold mb-8">Analytics</h1>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Department Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departments}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="employee_count" fill="#3b82f6" name="Employees" />
                  <Bar dataKey="total_salary" fill="#10b981" name="Total Salary" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Payroll Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={(d) => `${d.month}/${d.year}`} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total_payroll" stroke="#3b82f6" name="Total Payroll" />
                  <Line type="monotone" dataKey="employee_count" stroke="#10b981" name="Employee Count" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
