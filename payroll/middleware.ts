import { type NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value

  // Protect dashboard routes
  if (
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/employees") ||
    request.nextUrl.pathname.startsWith("/payroll") ||
    request.nextUrl.pathname.startsWith("/payslips") ||
    request.nextUrl.pathname.startsWith("/analytics")
  ) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Role-based access control would need user data
    // For now, we'll handle this in individual components
    // Advanced: Could decode JWT token here to check roles
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*", 
    "/employees/:path*", 
    "/payroll/:path*", 
    "/payslips/:path*", 
    "/analytics/:path*"
  ],
}
