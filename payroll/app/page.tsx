import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Payroll Management System</h1>
          <p className="text-xl text-gray-600 mb-12">
            Manage employees, process payroll, and generate payslips with ease.
          </p>

          <div className="flex gap-4 justify-center mb-16">
            <Link href="/login">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="border-blue-600 bg-white text-blue-600 hover:bg-blue-600 hover:text-white">
                Create Account
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-12 text-black">
            <Card>
              <CardHeader>
                <CardTitle>Employee Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Manage employee information, departments, and positions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payroll Processing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Process monthly payroll with accurate calculations</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payslip Generation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Generate and download payslips in PDF format</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
