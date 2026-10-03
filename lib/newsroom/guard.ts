import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, hasStaffRole, isAdminSession } from "@/lib/auth";

// Server-side authorisation for every newsroom endpoint. The role always comes from the verified session, never from the request.
export async function requireNewsroomAccess(level: "read" | "write") {
  const session = await getServerSession(authOptions);
  const allowed = level === "write" ? isAdminSession(session) : hasStaffRole(session, ["ADMIN", "EDITOR"]);
  if (!allowed) return { error: NextResponse.json({ error: level === "write" ? "Owner access required." : "Editor access required." }, { status: session ? 403 : 401 }) } as const;
  return { session } as const;
}

// Best-effort per-instance limiter. It protects expensive endpoints from accidental hammering; it is not a global quota.
const hits = new Map<string, number[]>();
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((time) => now - time < windowMs);
  if (recent.length >= limit) { hits.set(key, recent); return false; }
  recent.push(now);
  hits.set(key, recent);
  return true;
}

export const tooManyRequests = () => NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
