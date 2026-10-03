import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions, hasStaffRole, isAdminSession } from "@/lib/auth";
import AiNewsDashboard from "@/components/ai-news/AiNewsDashboard";

export const metadata = { title: "AI News", robots: { index: false } };

export default async function AiNewsPage() {
  const session = await getServerSession(authOptions);
  if (!hasStaffRole(session, ["ADMIN", "EDITOR"])) redirect(session ? "/admin" : "/admin/login");
  return <Suspense fallback={null}><AiNewsDashboard canWrite={isAdminSession(session)} /></Suspense>;
}
