import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000"

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Authorization header required" }, { status: 401 })
    }

    const { id } = await context.params

    console.log("PDF API Route - Payslip ID:", id) // Debug
    console.log("PDF API Route - Token present:", !!authHeader) // Debug

    const backendUrl = `${BACKEND_URL}/api/payslips/${id}/pdf`
    console.log("PDF API Route - Calling backend:", backendUrl) // Debug

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Authorization": authHeader,
      },
    })

    console.log("PDF API Route - Backend response status:", response.status) // Debug

    if (!response.ok) {
      const errorData = await response.json()
      console.error("PDF API Route - Backend error:", errorData) // Debug
      return NextResponse.json(errorData, { status: response.status })
    }

    // Get the PDF blob from the backend
    const pdfBuffer = await response.arrayBuffer()
    console.log("PDF API Route - PDF buffer size:", pdfBuffer.byteLength) // Debug
    
    // Set appropriate headers for PDF download
    const headers = new Headers()
    headers.set('Content-Type', 'application/pdf')
    headers.set('Content-Disposition', response.headers.get('Content-Disposition') || `attachment; filename="payslip_${id}.pdf"`)

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers,
    })

  } catch (error) {
    console.error("Error downloading payslip PDF:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}