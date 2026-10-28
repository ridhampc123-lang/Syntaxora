import { Student } from "@/types";

export const INITIAL_STUDENTS: Student[] = [
  {
    id: "s1000000-0000-0000-0000-000000000001",
    profile_id: "u1000000-0000-0000-0000-000000000001",
    student_code: "STU-8F39A1C2",
    date_of_birth: "2010-04-12",
    emergency_contact_phone: "+1 (555) 234-5678",
    status: "active",
    notes: "Enrolled in Teens Python & AI Track",
    created_at: "2026-09-01T00:00:00Z",
    updated_at: "2026-09-01T00:00:00Z",
    profile: {
      id: "u1000000-0000-0000-0000-000000000001",
      role: "student",
      full_name: "Liam O'Connor",
      email: "liam.oconnor@example.com",
      created_at: "2026-09-01T00:00:00Z",
      updated_at: "2026-09-01T00:00:00Z",
    },
  },
  {
    id: "s1000000-0000-0000-0000-000000000002",
    profile_id: "u1000000-0000-0000-0000-000000000002",
    student_code: "STU-7B21E4F9",
    date_of_birth: "2016-08-20",
    emergency_contact_phone: "+1 (555) 345-6789",
    status: "active",
    notes: "Young AI Explorers cohort",
    created_at: "2026-09-01T00:00:00Z",
    updated_at: "2026-09-01T00:00:00Z",
    profile: {
      id: "u1000000-0000-0000-0000-000000000002",
      role: "student",
      full_name: "Maya Patel",
      email: "maya.patel@example.com",
      created_at: "2026-09-01T00:00:00Z",
      updated_at: "2026-09-01T00:00:00Z",
    },
  },
];

