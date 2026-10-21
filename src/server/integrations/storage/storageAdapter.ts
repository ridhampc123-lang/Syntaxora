import { createClient } from "@/lib/supabase/server";

export type StorageBucket = "submissions" | "invoices" | "course-materials";

export interface SignedUrlResult {
  signedUrl: string | null;
  expiresInSeconds: number;
  error?: string;
}

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
      key &&
      !url.includes("placeholder") &&
      !url.includes("example.supabase.co") &&
      !key.includes("placeholder")
  );
}

/**
 * Generates a short-lived signed download URL for private student artifacts.
 * In accordance with Section 8 & 9: Never expose permanent public URLs for private student files.
 */
export async function getSignedDownloadUrl(
  bucket: StorageBucket,
  filePath: string,
  expiresInSeconds = 900 // 15 minutes
): Promise<SignedUrlResult> {
  if (!filePath || filePath.trim() === "") {
    return { signedUrl: null, expiresInSeconds, error: "File path is required" };
  }

  if (!isSupabaseConfigured()) {
    // Development / fixture fallback with explicit expiration query token
    const token = Buffer.from(`${filePath}:${Date.now() + expiresInSeconds * 1000}`).toString("base64url");
    return {
      signedUrl: `https://syntaxora.com/storage/${bucket}/${filePath}?token=${token}&expires=${expiresInSeconds}`,
      expiresInSeconds,
    };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresInSeconds);

    if (error || !data?.signedUrl) {
      return {
        signedUrl: null,
        expiresInSeconds,
        error: error?.message || "Failed to generate signed URL",
      };
    }

    return {
      signedUrl: data.signedUrl,
      expiresInSeconds,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Storage provider communication failed";
    return { signedUrl: null, expiresInSeconds, error: msg };
  }
}

/**
 * Generates a signed upload URL for student submission deliverables.
 */
export async function getSignedUploadUrl(
  bucket: StorageBucket,
  filePath: string,
  expiresInSeconds = 900
): Promise<SignedUrlResult> {
  if (!isSupabaseConfigured()) {
    const token = Buffer.from(`${filePath}:upload:${Date.now() + expiresInSeconds * 1000}`).toString("base64url");
    return {
      signedUrl: `https://syntaxora.com/storage/upload/${bucket}/${filePath}?token=${token}`,
      expiresInSeconds,
    };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(filePath);

    if (error || !data?.signedUrl) {
      return {
        signedUrl: null,
        expiresInSeconds,
        error: error?.message || "Failed to generate upload signed URL",
      };
    }

    return {
      signedUrl: data.signedUrl,
      expiresInSeconds,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Storage provider upload URL creation failed";
    return { signedUrl: null, expiresInSeconds, error: msg };
  }
}
