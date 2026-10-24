import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // CRITICAL: Do NOT redirect Server Actions or non-GET requests from proxy.
  // Server Actions make POST requests expecting text/x-component RSC streaming data.
  // If proxy redirects a Server Action (e.g. returning 307 to a dashboard or login),
  // the client-side router follows the redirect to an HTML page and crashes with:
  // "An unexpected response was received from the server."
  const isServerAction = request.headers.has("next-action");
  if (isServerAction || request.method !== "GET") {
    return response;
  }

  const pathname = request.nextUrl.pathname;

  // Protect Portal Routes for GET navigations
  const isProtectedPath =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/instructor") ||
    pathname.startsWith("/student") ||
    pathname.startsWith("/parent");

  if (isProtectedPath) {
    if (!user) {
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
  if (user && (pathname === "/login" || pathname === "/sign-up")) {
    const role = (user.user_metadata?.role as string) || "student";
    let destination = "/student";
    if (role === "admin") destination = "/admin";
    else if (role === "instructor") destination = "/instructor";
    else if (role === "parent") destination = "/parent";

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
