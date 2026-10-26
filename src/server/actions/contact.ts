"use server";

import { createClient } from "@/lib/supabase/server";
import { contactFormSchema } from "@/lib/validation/contact";

export interface ContactActionResult {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  values?: {
    fullName?: string;
    email?: string;
    phone?: string;
    subject?: string;
    message?: string;
  };
}

export async function submitContactEnquiry(
  prevState: ContactActionResult | null,
  formData: FormData
): Promise<ContactActionResult> {
  const rawData = {
    fullName: formData.get("fullName")?.toString() || "",
    email: formData.get("email")?.toString() || "",
    phone: formData.get("phone")?.toString() || "",
    subject: formData.get("subject")?.toString() || "",
    message: formData.get("message")?.toString() || "",
    botField: formData.get("botField")?.toString() || "",
  };

  const validation = contactFormSchema.safeParse(rawData);

  if (!validation.success) {
    const errors: Record<string, string[]> = {};
    for (const issue of validation.error.issues) {
      const path = issue.path[0]?.toString() || "form";
      if (!errors[path]) errors[path] = [];
      errors[path].push(issue.message);
    }
    const errorCount = Object.keys(errors).length;
    return {
      success: false,
      message: `Please correct the ${errorCount} highlighted field${errorCount > 1 ? "s" : ""} below. Your entered details have been saved.`,
      errors,
      values: rawData,
    };
  }

  // Honeypot check
  if (validation.data.botField) {
    return {
      success: true,
      message: "Thank you for reaching out. An admissions counselor will respond within 24 hours.",
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("contact_enquiries").insert({
      full_name: validation.data.fullName,
      email: validation.data.email,
      phone: validation.data.phone || null,
      subject: validation.data.subject,
      message: validation.data.message,
      status: "unread",
    });

    if (error) {
      console.info("[Contact Enquiry Received]", {
        name: validation.data.fullName,
        email: validation.data.email,
        subject: validation.data.subject,
      });
    }

    return {
      success: true,
      message:
        "Thank you for contacting Syntaxora. Your enquiry has been received and our admissions team will be in touch shortly.",
    };
  } catch (err) {
    console.error("[Contact Action Error]", err);
    return {
      success: false,
      message:
        "An unexpected error occurred while sending your message. Please try again or email us directly.",
    };
  }
}
