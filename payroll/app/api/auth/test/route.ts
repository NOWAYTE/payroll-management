import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    
    console.log("Test API - Token:", token?.substring(0, 20) + "...") // Debug (show first 20 chars)
    
    if (!token) {
      return NextResponse.json({ error: "No token" }, { status: 401 })
    }

    // Test JWT with Flask backend
    const response = await fetch("http://localhost:5000/api/auth/test", {
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
    })

    console.log("Test API - Flask response status:", response.status) // Debug

    const data = await response.json()
    console.log("Test API - Flask response:", data) // Debug

    return NextResponse.json({
      test_result: data,
      status: response.status,
      token_preview: token.substring(0, 20) + "..."
    })

  } catch (error) {
    console.error("Test API error:", error)
    return NextResponse.json({ error: "Test failed", details: String(error) }, { status: 500 })
  }
}