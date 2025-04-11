import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define routes that don't require authentication
const publicRoutes = ["/login", "/register", "/"]

// Define routes that require specific roles
const roleBasedRoutes = {
  "/events/create": ["admin", "manager", "organizer"],
  "/events/edit": ["admin", "manager", "organizer"],
  "/venues/create": ["admin", "manager"],
  "/venues/edit": ["admin", "manager"],
  "/attendance/generate": ["admin", "manager", "organizer"],
  "/attendance/list": ["admin", "manager", "organizer"],
  "/admin": ["admin"],
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("token")?.value

  // Allow access to public routes without authentication
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check if user is authenticated for protected routes
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // For role-based routes, check user role
  const requiresRole = Object.entries(roleBasedRoutes).find(([route]) => pathname.startsWith(route))

  if (requiresRole) {
    try {
      // In a real app, you would verify the token and extract the role
      // This is a simplified example
      const payload = JSON.parse(atob(token.split(".")[1]))
      const userRole = payload.role

      if (!requiresRole[1].includes(userRole)) {
        return NextResponse.redirect(new URL("/unauthorized", request.url))
      }
    } catch (error) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}

