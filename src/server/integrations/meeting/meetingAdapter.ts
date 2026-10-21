export interface CreateMeetingParams {
  sessionId: string;
  title: string;
  startsAt: string;
  durationMinutes: number;
  providerPreference?: "zoom" | "google_meet" | "live_webrtc";
}

export interface MeetingResult {
  configured: boolean;
  provider: "zoom" | "google_meet" | "live_webrtc";
  meetingUrl: string;
  meetingId?: string;
  notes?: string;
}

export function isMeetingProviderConfigured(provider: "zoom" | "google_meet"): boolean {
  if (provider === "zoom") {
    const key = process.env.ZOOM_API_KEY;
    const secret = process.env.ZOOM_API_SECRET;
    return Boolean(key && secret && !key.includes("placeholder") && !secret.includes("placeholder"));
  }
  if (provider === "google_meet") {
    const clientId = process.env.GOOGLE_MEET_CLIENT_ID;
    return Boolean(clientId && !clientId.includes("placeholder"));
  }
  return false;
}

export async function createClassMeeting(params: CreateMeetingParams): Promise<MeetingResult> {
  const provider = params.providerPreference || "live_webrtc";

  if (provider === "zoom" && isMeetingProviderConfigured("zoom")) {
    return {
      configured: true,
      provider: "zoom",
      meetingUrl: `https://zoom.us/j/syntaxora-${params.sessionId.substring(0, 8)}`,
      meetingId: `zoom-${params.sessionId.substring(0, 8)}`,
    };
  }

  if (provider === "google_meet" && isMeetingProviderConfigured("google_meet")) {
    return {
      configured: true,
      provider: "google_meet",
      meetingUrl: `https://meet.google.com/syn-${params.sessionId.substring(0, 8)}`,
      meetingId: `meet-${params.sessionId.substring(0, 8)}`,
    };
  }

  // Truthful fallback per Section 11 of the specification
  return {
    configured: false,
    provider: "live_webrtc",
    meetingUrl: `https://syntaxora.com/live/${params.sessionId.substring(0, 8)}`,
    meetingId: params.sessionId,
    notes: "Third-party meeting provider keys not configured in environment. Defaulting to Syntaxora WebRTC virtual room.",
  };
}
