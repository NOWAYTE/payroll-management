"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardNav from "@/components/dashboard-nav"
import { toast } from "sonner"

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
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-black">
      <DashboardNav />
      <main className="flex-1">
        <div className="container mx-auto p-8">
          <h1 className="text-3xl font-bold mb-8">
            {user?.role === 'employee' ? 'My Payslips' : 'Payslips'}
          </h1>

          <div className="space-y-4">
            {payslips.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">No payslips found. Process some payroll runs to generate payslips.</p>
                </CardContent>
              </Card>
            ) : (
              payslips.map((payslip) => (
                <Card key={payslip.id}>
                  <CardHeader>
                    <CardTitle className="text-lg flex justify-between items-center">
                      <div>
                        <span>Payslip #{payslip.id}</span>
                        {payslip.employee_name && (
                          <span className="ml-2 text-base font-normal text-gray-600">
                            - {payslip.employee_name} ({payslip.employee_id_number})
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-normal text-gray-500">
                        {payslip.month && payslip.year && (
                          <span>{new Date(payslip.year, payslip.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-5 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Basic Salary</p>
                        <p className="text-lg font-semibold">${payslip.basic_salary.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Allowances</p>
                        <p className="text-lg font-semibold text-green-600">+${payslip.total_allowances.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Deductions</p>
                        <p className="text-lg font-semibold text-red-600">-${(payslip.total_deductions + payslip.tax).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Net Salary</p>
                        <p className="text-xl font-bold text-blue-600">${payslip.net_salary.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center justify-end">
                        <div>
                          <div className="mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              payslip.payment_status === 'paid' 
                                ? 'bg-green-100 text-green-800'
                                : payslip.payment_status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                            }`}>
                              {payslip.payment_status.toUpperCase()}
                            </span>
                          </div>
                          <Button size="sm" onClick={() => handleDownloadPDF(payslip.id)}>
                            Download PDF
                          </Button>
                        </div>
                      </div>
                    </div>
                    {payslip.department && (
                      <div className="text-sm text-gray-500">
                        Department: {payslip.department}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
