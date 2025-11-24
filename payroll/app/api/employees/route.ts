import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const search = url.searchParams.get("search") || ""
    
    const queryParam = search ? `?search=${encodeURIComponent(search)}` : ""
    
    // Forward to Flask backend
    const response = await fetch(`http://localhost:5000/api/employees${queryParam}`, {
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    
    console.log("API Route - Token received:", token ? "Yes" : "No") // Debug
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    console.log("API Route - Body received:", body) // Debug

    // Forward to Flask backend with properly formatted Authorization header
    const response = await fetch("http://localhost:5000/api/employees", {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body),
    })

    console.log("API Route - Flask response status:", response.status) // Debug

    const data = await response.json()
    console.log("API Route - Flask response data:", data) // Debug

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("API Route error:", error) // Debug
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}