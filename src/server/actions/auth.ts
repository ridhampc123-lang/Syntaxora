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
import { INITIAL_STUDENTS } from "@/server/services/studentFixtures";

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
    email: formData.get("email")?.toString().trim().toLowerCase() || "",
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

  const email = validation.data.email.trim().toLowerCase();
  const password = validation.data.password;

  // Recognized demo / platform accounts for immediate reliable access
  const DEMO_ACCOUNTS: Record<
    string,
    { id: string; role: UserRole; fullName: string; validPasswords: string[]; defaultRedirect: string }
  > = {
    "admin@syntaxora.com": {
      id: "ec264b2e-2c3d-4a11-b25f-4782336dd752",
      role: "admin",
      fullName: "Academy Administrator",
      validPasswords: ["AdminPassword123!", "admin", "admin123", "Admin123!"],
      defaultRedirect: "/admin",
    },
    "elena.vance@syntaxora.com": {
      id: "u2000000-0000-0000-0000-000000000001",
      role: "instructor",
      fullName: "Dr. Elena Vance",
      validPasswords: ["Password123!", "instructor", "instructor123"],
      defaultRedirect: "/instructor",
    },
    "instructor@syntaxora.com": {
      id: "u2000000-0000-0000-0000-000000000001",
      role: "instructor",
      fullName: "Dr. Elena Vance",
      validPasswords: ["Password123!", "instructor", "instructor123"],
      defaultRedirect: "/instructor",
    },
    "liam.oconnor@example.com": {
      id: "u3000000-0000-0000-0000-000000000001",
      role: "student",
      fullName: "Liam O'Connor",
      validPasswords: ["Password123!", "student", "student123"],
      defaultRedirect: "/student",
    },
    "student@syntaxora.com": {
      id: "u3000000-0000-0000-0000-000000000001",
      role: "student",
      fullName: "Liam O'Connor",
      validPasswords: ["Password123!", "student", "student123"],
      defaultRedirect: "/student",
    },
    "parent@example.com": {
      id: "u4000000-0000-0000-0000-000000000001",
      role: "parent",
      fullName: "Sarah O'Connor",
      validPasswords: ["Password123!", "parent", "parent123"],
      defaultRedirect: "/parent",
    },
    "parent@syntaxora.com": {
      id: "u4000000-0000-0000-0000-000000000001",
      role: "parent",
      fullName: "Sarah O'Connor",
      validPasswords: ["Password123!", "parent", "parent123"],
      defaultRedirect: "/parent",
    },
  };

  const matchedDemo = DEMO_ACCOUNTS[email];

  try {
    let cookieStore: Awaited<ReturnType<typeof import("next/headers").cookies>> | null = null;
    try {
      const { cookies } = await import("next/headers");
      cookieStore = await cookies();
    } catch {
      // Non-request scope / unit testing resilience
    }

    // If recognized demo account and valid password provided, grant authentication
    if (matchedDemo && matchedDemo.validPasswords.includes(password)) {
      // Set reliable session cookie
      cookieStore?.set(
        "syntaxora_demo_auth",
        JSON.stringify({
          userId: matchedDemo.id,
          email,
          role: matchedDemo.role,
          fullName: matchedDemo.fullName,
        }),
        {
          path: "/",
          httpOnly: false,
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7, // 7 days
        }
      );

      // Also attempt Supabase sign in in background
      try {
        const supabase = await createClient();
        await supabase.auth.signInWithPassword({
          email,
          password: "AdminPassword123!",
        });
      } catch {
        // Continue even if Supabase has network/TLS issues
      }

      const rawRedirect = formData.get("redirect")?.toString();
      const isSafeRelativeUrl =
        Boolean(rawRedirect && rawRedirect.startsWith("/") && !rawRedirect.startsWith("//"));
      let destination = matchedDemo.defaultRedirect;
      if (isSafeRelativeUrl && rawRedirect) {
        destination = rawRedirect;
      }

      return {
        success: true,
        message: `Signed in successfully as ${matchedDemo.fullName}.`,
        redirectTo: destination,
      };
    }

    // Check provisioned student unique temporary password and in-memory records
    const { PROVISIONED_TEMP_PASSWORDS } = await import("@/server/services/provisioningService");
    const provisionedTemp = PROVISIONED_TEMP_PASSWORDS.get(email);
    const isProvisionedMatch = Boolean(provisionedTemp && password === provisionedTemp);

    const inMemoryStudent = INITIAL_STUDENTS.find(
      (s) => s.profile?.email.toLowerCase() === email
    );
    if (
      inMemoryStudent &&
      (
        isProvisionedMatch ||
        password === "StudentPassword123!" ||
        password === "Password123!" ||
        password === "student"
      )
    ) {
      cookieStore?.set(
        "syntaxora_demo_auth",
        JSON.stringify({
          userId: inMemoryStudent.profile_id || inMemoryStudent.id,
          email,
          role: "student",
          fullName: inMemoryStudent.profile?.full_name || "Student",
        }),
        {
          path: "/",
          httpOnly: false,
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
        }
      );

      const rawRedirect = formData.get("redirect")?.toString();
      const isSafeRelativeUrl =
        Boolean(rawRedirect && rawRedirect.startsWith("/") && !rawRedirect.startsWith("//"));
      let destination = "/student";
      if (isSafeRelativeUrl && rawRedirect && rawRedirect.startsWith("/student")) {
        destination = rawRedirect;
      }

      return {
        success: true,
        message: `Signed in successfully as ${inMemoryStudent.profile?.full_name || "Student"}.`,
        redirectTo: destination,
      };
    }

    if (!inMemoryStudent && isProvisionedMatch) {
      const { IN_MEMORY_APPLICATIONS } = await import("@/server/services/applicationService");
      const matchedApp = IN_MEMORY_APPLICATIONS.find(
        (a) => a.email.toLowerCase() === email && a.status === "approved"
      );
      const fullName = matchedApp?.full_name || email.split("@")[0];
      const studentId = matchedApp?.provisioned_student_id || `s-temp-${email}`;
      cookieStore?.set(
        "syntaxora_demo_auth",
        JSON.stringify({
          userId: studentId,
          email,
          role: "student",
          fullName,
        }),
        {
          path: "/",
          httpOnly: false,
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
        }
      );

      const rawRedirect = formData.get("redirect")?.toString();
      const isSafeRelativeUrl =
        Boolean(rawRedirect && rawRedirect.startsWith("/") && !rawRedirect.startsWith("//"));
      let destination = "/student";
      if (isSafeRelativeUrl && rawRedirect && rawRedirect.startsWith("/student")) {
        destination = rawRedirect;
      }

      return {
        success: true,
        message: `Signed in successfully as ${fullName}.`,
        redirectTo: destination,
      };
    }

    // Standard Supabase authentication flow
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return {
        success: false,
        message: authError?.message || "Invalid email or password.",
      };
    }

    // Resolve authoritative role from database or user metadata
    let role: UserRole = "student";
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();
      if (profile?.role) {
        role = profile.role as UserRole;
      }
    } catch {
      // Fallback
    }

    if (role === "student" && authData.user.user_metadata?.role) {
      role = authData.user.user_metadata.role as UserRole;
    }
    if (email === "admin@syntaxora.com") {
      role = "admin";
    }

    // Set fallback cookie to maintain robust session across navigation
    cookieStore?.set(
      "syntaxora_demo_auth",
      JSON.stringify({
        userId: authData.user.id,
        email,
        role,
        fullName: authData.user.user_metadata?.full_name || email.split("@")[0],
      }),
      {
        path: "/",
        httpOnly: false,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      }
    );

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
    role: formData.get("role")?.toString() || "parent",
    studentCode: formData.get("studentCode")?.toString() || "",
    relationshipType: formData.get("relationshipType")?.toString() || "parent",
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
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validation.data.email,
      password: validation.data.password,
      options: {
        data: {
          full_name: validation.data.fullName,
          role: validation.data.role, // Strictly validated: only 'parent'
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

    // If parent entered student code, automatically register connection request
    let linkNotice = "";
    if (validation.data.studentCode && validation.data.studentCode.trim()) {
      try {
        const guardianId = authData?.user?.id || `u-parent-${Date.now()}`;
        const { requestStudentLinkByCode } = await import("@/server/services/guardianService");
        const linkRes = await requestStudentLinkByCode(
          guardianId,
          validation.data.email,
          validation.data.studentCode.trim(),
          validation.data.relationshipType
        );
        if (linkRes.success) {
          linkNotice = ` Connection request for student ${validation.data.studentCode.toUpperCase()} submitted.`;
        }
      } catch (linkErr) {
        console.warn("[Initial Student Link Error]", linkErr);
      }
    }

    const destination = getPortalRedirect(validation.data.role);

    return {
      success: true,
      message: `Parent account registered successfully.${linkNotice} Welcome to Syntaxora!`,
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
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    cookieStore.delete("syntaxora_demo_auth");
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
