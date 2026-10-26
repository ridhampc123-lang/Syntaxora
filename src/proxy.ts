import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

if (typeof process !== "undefined" && process.env) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Check fallback session cookie
  const demoAuthCookie = request.cookies.get("syntaxora_demo_auth")?.value;
  let demoUserRole: string | null = null;
  if (demoAuthCookie) {
    try {
      const parsed = JSON.parse(decodeURIComponent(demoAuthCookie));
      if (parsed?.role) {
        demoUserRole = parsed.role;
      }
    } catch {}
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  // Create an authenticated Supabase client using request cookies
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user || null;
  } catch {
    // If Supabase TLS/network fails, fallback cookie handles authentication
  }

  // CRITICAL: Do NOT redirect Server Actions or non-GET requests from proxy.
  const isServerAction = request.headers.has("next-action");
  if (isServerAction || request.method !== "GET") {
    return response;
  }

  const pathname = request.nextUrl.pathname;
  const isAuthenticated = Boolean(user || demoUserRole);
  const effectiveRole = demoUserRole || (user?.user_metadata?.role as string) || "student";

  // Protect Portal Routes for GET navigations
  const isProtectedPath =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/instructor") ||
    pathname.startsWith("/student") ||
    pathname.startsWith("/parent");

  if (isProtectedPath) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      const redirectResponse = NextResponse.redirect(loginUrl);
      response.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
      });
      return redirectResponse;
    }
  }

  // Redirect logged-in users away from auth pages to their respective dashboard
  if (isAuthenticated && (pathname === "/login" || pathname === "/sign-up")) {
    let destination = "/student";
    if (effectiveRole === "admin") destination = "/admin";
    else if (effectiveRole === "instructor") destination = "/instructor";
    else if (effectiveRole === "parent") destination = "/parent";

    const redirectResponse = NextResponse.redirect(new URL(destination, request.url));
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/instructor/:path*",
    "/student/:path*",
    "/parent/:path*",
    "/login",
    "/sign-up",
  ],
};
