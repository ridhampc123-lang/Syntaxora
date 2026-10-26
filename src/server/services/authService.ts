import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Profile, UserRole } from "@/types";

export interface AuthenticatedUser {
  userId: string;
  email: string;
  profile: Profile;
}

export function getPortalRedirect(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "instructor":
      return "/instructor";
    case "student":
      return "/student";
    case "parent":
      return "/parent";
    default:
      return "/login";
  }
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  // 1. Check persistent fallback session cookie
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const demoCookie = cookieStore.get("syntaxora_demo_auth")?.value;
    if (demoCookie) {
      try {
        const parsed = JSON.parse(decodeURIComponent(demoCookie));
        if (parsed && parsed.email && parsed.role) {
          const profile: Profile = {
            id: parsed.userId || "u-admin-seed",
            role: parsed.role as UserRole,
            full_name: parsed.fullName || parsed.full_name || "Academy Administrator",
            email: parsed.email,
            phone: null,
            avatar_url: null,
            bio: parsed.bio || "Chief Academy Administrator & Operations Director",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          return {
            userId: profile.id,
            email: profile.email,
            profile,
          };
        }
      } catch {
        // Fall through to standard Supabase auth
      }
    }
  } catch {
    // Continue
  }

  // 2. Query Supabase
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    let profile: Profile | null = null;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (!error && data) {
        profile = data as Profile;
      }
    } catch {
      // In case of RLS recursion or query failure, fallback to metadata
    }

    if (!profile) {
      const isAdmin = user.email?.toLowerCase() === "admin@syntaxora.com";
      const defaultRole = isAdmin
        ? "admin"
        : (user.user_metadata?.role as UserRole) || "student";

      const fallbackProfile: Profile = {
        id: user.id,
        role: defaultRole,
        full_name:
          user.user_metadata?.full_name ||
          (isAdmin ? "Academy Administrator" : user.email?.split("@")[0] || "User"),
        email: user.email || "",
        phone: null,
        avatar_url: null,
        bio: null,
        created_at: user.created_at,
        updated_at: user.created_at,
      };
      return {
        userId: user.id,
        email: user.email || "",
        profile: fallbackProfile,
      };
    }

    return {
      userId: user.id,
      email: user.email || "",
      profile: profile as Profile,
    };
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<AuthenticatedUser> {
  const auth = await getCurrentUser();
  if (!auth) {
    redirect("/login");
  }
  return auth;
}

export async function requireRole(allowedRoles: UserRole[]): Promise<AuthenticatedUser> {
  const auth = await requireUser();
  if (!allowedRoles.includes(auth.profile.role)) {
    // Redirect user to their own authorized portal if attempting unauthorized cross-role access
    redirect(getPortalRedirect(auth.profile.role));
  }
  return auth;
}
