import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params

    // Forward to Flask backend
    const response = await fetch(`http://localhost:5000/api/employees/${id}`, {
      method: "GET",
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

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()

    // Forward to Flask backend
    const response = await fetch(`http://localhost:5000/api/employees/${id}`, {
      method: "PUT",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body),
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

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    
    if (!token) {
      console.log("DELETE API Route - No token provided") // Debug
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    
    console.log("DELETE API Route - Employee ID:", id) // Debug
    console.log("DELETE API Route - Token present:", !!token) // Debug

    // Forward to Flask backend
    const backendUrl = `http://localhost:5000/api/employees/${id}`
    console.log("DELETE API Route - Calling backend:", backendUrl) // Debug
    
    const response = await fetch(backendUrl, {
      method: "DELETE",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
    })

    console.log("DELETE API Route - Backend response status:", response.status) // Debug
    
    let data
    try {
      data = await response.json()
      console.log("DELETE API Route - Backend response data:", data) // Debug
    } catch (e) {
      console.log("DELETE API Route - Backend response not JSON:", await response.text()) // Debug
      data = { error: "Invalid response from backend" }
    }

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("DELETE API Route - Error:", error) // Debug
    return NextResponse.json({ error: `Server error: ${error}` }, { status: 500 })
  }
}