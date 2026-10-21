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
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      // In local development before DB connection is populated, construct safe fallback
      const defaultRole = (user.user_metadata?.role as UserRole) || "student";
      const fallbackProfile: Profile = {
        id: user.id,
        role: defaultRole,
        full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
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
