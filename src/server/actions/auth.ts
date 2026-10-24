"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPortalRedirect } from "@/server/services/authService";
import { UserRole } from "@/types";
import {
  signInSchema,
  signUpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validation/auth";

export interface AuthActionResult {
  success: boolean;
  message: string;
  redirectTo?: string;
  errors?: Record<string, string[]>;
}

export async function signInAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const rawData = {
    email: formData.get("email")?.toString() || "",
    password: formData.get("password")?.toString() || "",
  };

  const validation = signInSchema.safeParse(rawData);
  if (!validation.success) {
    const errors: Record<string, string[]> = {};
    for (const issue of validation.error.issues) {
      const path = issue.path[0]?.toString() || "form";
      if (!errors[path]) errors[path] = [];
      errors[path].push(issue.message);
    }
    return {
      success: false,
      message: "Please correct the highlighted fields.",
      errors,
    };
  }

  try {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: validation.data.email,
      password: validation.data.password,
    });

    if (authError || !authData.user) {
      return {
        success: false,
        message: authError?.message || "Invalid email or password.",
      };
    }

    // Resolve authoritative role from database
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .single();

    const role: UserRole =
      (profile?.role as UserRole) ||
      (authData.user.user_metadata?.role as UserRole) ||
      "student";
    const defaultDestination = getPortalRedirect(role);
    const rawRedirect = formData.get("redirect")?.toString();
    const isSafeRelativeUrl =
      Boolean(rawRedirect && rawRedirect.startsWith("/") && !rawRedirect.startsWith("//"));

    let destination = defaultDestination;
    if (isSafeRelativeUrl && rawRedirect) {
      const pathRoleMap: Record<string, UserRole> = {
        "/admin": "admin",
        "/instructor": "instructor",
        "/student": "student",
        "/parent": "parent",
      };
      const matchingPrefix = Object.keys(pathRoleMap).find((prefix) =>
        rawRedirect.startsWith(prefix)
      );
      if (!matchingPrefix || pathRoleMap[matchingPrefix] === role) {
        destination = rawRedirect;
      }
    }

    return {
      success: true,
      message: "Signed in successfully.",
      redirectTo: destination,
    };
  } catch (err) {
    console.error("[Sign In Action Error]", err);
    return {
      success: false,
      message: "An unexpected error occurred during authentication. Please try again.",
    };
  }
}

export async function signUpAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const rawData = {
    fullName: formData.get("fullName")?.toString() || "",
    email: formData.get("email")?.toString() || "",
    password: formData.get("password")?.toString() || "",
    role: formData.get("role")?.toString() || "student",
  };

  const validation = signUpSchema.safeParse(rawData);
  if (!validation.success) {
    const errors: Record<string, string[]> = {};
    for (const issue of validation.error.issues) {
      const path = issue.path[0]?.toString() || "form";
      if (!errors[path]) errors[path] = [];
      errors[path].push(issue.message);
    }
    return {
      success: false,
      message: "Please correct the highlighted fields.",
      errors,
    };
  }

  try {
    const supabase = await createClient();
    const { error: authError } = await supabase.auth.signUp({
      email: validation.data.email,
      password: validation.data.password,
      options: {
        data: {
          full_name: validation.data.fullName,
          role: validation.data.role, // Strictly validated: only 'student' or 'parent'
        },
      },
    });

    if (authError) {
      const isRateLimit =
        authError.message.toLowerCase().includes("rate limit") ||
        (authError as { status?: number }).status === 429;
      return {
        success: false,
        message: isRateLimit
          ? "Supabase email rate limit exceeded. Please wait a few minutes before registering again, or sign in with an existing account."
          : authError.message,
      };
    }

    const destination = getPortalRedirect(validation.data.role);

    return {
      success: true,
      message:
        "Account created successfully. Please check your email to verify your account or proceed to your dashboard.",
      redirectTo: destination,
    };
  } catch (err) {
    console.error("[Sign Up Action Error]", err);
    return {
      success: false,
      message: "An unexpected error occurred during registration. Please try again.",
    };
  }
}

export async function signOutAction(): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Continue with redirect on sign out error
  }
  redirect("/login");
}

export async function forgotPasswordAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const rawData = {
    email: formData.get("email")?.toString() || "",
  };

  const validation = forgotPasswordSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      message: "Please provide a valid email address.",
    };
  }

  try {
    const supabase = await createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    await supabase.auth.resetPasswordForEmail(validation.data.email, {
      redirectTo: `${siteUrl}/reset-password`,
    });

    return {
      success: true,
      message:
        "If an account exists for this email address, password recovery instructions have been dispatched.",
    };
  } catch (err) {
    console.error("[Forgot Password Error]", err);
    return {
      success: true,
      message:
        "If an account exists for this email address, password recovery instructions have been dispatched.",
    };
  }
}

export async function resetPasswordAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const rawData = {
    password: formData.get("password")?.toString() || "",
  };

  const validation = resetPasswordSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message || "Invalid password format.",
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
      password: validation.data.password,
    });

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: true,
      message: "Your password has been successfully updated. You may now sign in.",
      redirectTo: "/login",
    };
  } catch (err) {
    console.error("[Reset Password Action Error]", err);
    return {
      success: false,
      message: "Failed to reset password. The reset link may have expired.",
    };
  }
}
