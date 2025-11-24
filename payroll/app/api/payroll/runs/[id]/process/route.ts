import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Authorization header required" }, { status: 401 })
    }

    const { id } = await params
    console.log("Process API Route - Payroll ID:", id) // Debug
    console.log("Process API Route - Token present:", !!authHeader) // Debug

    const backendUrl = `${BACKEND_URL}/api/payroll/runs/${id}/process`
    console.log("Process API Route - Calling backend:", backendUrl) // Debug

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/json",
      },
    })

    console.log("Process API Route - Backend response status:", response.status) // Debug

    const data = await response.json()
    console.log("Process API Route - Backend response data:", data) // Debug

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error processing payroll:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}