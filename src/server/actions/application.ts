"use server";

import { studentApplicationSchema } from "@/lib/validation/application";
import { submitStudentApplication } from "@/server/services/applicationService";
import { getCourseById } from "@/server/services/courseService";

export interface ApplicationActionResult {
  success: boolean;
  message: string;
  reference?: string;
  duplicate?: boolean;
  errors?: Record<string, string[]>;
}

export async function submitApplicationAction(
  prevState: ApplicationActionResult | null,
  formData: FormData
): Promise<ApplicationActionResult> {
  const rawData = {
    fullName: formData.get("fullName")?.toString() || "",
    email: formData.get("email")?.toString() || "",
    phone: formData.get("phone")?.toString() || "",
    dateOfBirth: formData.get("dateOfBirth")?.toString() || "",
    courseId: formData.get("courseId")?.toString() || "",
    educationLevel: formData.get("educationLevel")?.toString() || "",
    guardianName: formData.get("guardianName")?.toString() || "",
    guardianEmail: formData.get("guardianEmail")?.toString() || "",
    guardianPhone: formData.get("guardianPhone")?.toString() || "",
    statementOfInterest: formData.get("statementOfInterest")?.toString() || "",
    consent: formData.get("consent") === "on" || formData.get("consent") === "true",
  };

  const validation = studentApplicationSchema.safeParse(rawData);
  if (!validation.success) {
    const errors: Record<string, string[]> = {};
    for (const issue of validation.error.issues) {
      const path = issue.path[0]?.toString() || "form";
      if (!errors[path]) errors[path] = [];
      errors[path].push(issue.message);
    }
    return {
      success: false,
      message: "Please correct the highlighted fields before submitting.",
      errors,
    };
  }

  // Resolve course title if courseId provided
  let courseTitle: string | undefined;
  if (validation.data.courseId) {
    const course = await getCourseById(validation.data.courseId);
    if (course) {
      courseTitle = course.title;
    }
  }

  const result = await submitStudentApplication(
    validation.data,
    courseTitle
  );

  return {
    success: result.success,
    message: result.message,
    reference: result.reference,
    duplicate: result.duplicate,
  };
}
