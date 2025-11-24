import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({ message: "Employee ID route is working", timestamp: new Date().toISOString() })
}

export async function DELETE() {
  return NextResponse.json({ message: "DELETE method is available" })
}