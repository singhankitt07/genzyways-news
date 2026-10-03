import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions, hasStaffRole, isAdminSession } from "@/lib/auth";
import DraftReview from "@/components/ai-news/DraftReview";

export const metadata = { title: "Review draft", robots: { index: false } };

export default async function DraftReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!hasStaffRole(session, ["ADMIN", "EDITOR"])) redirect(session ? "/admin" : "/admin/login");
  const { id } = await params;
  return <DraftReview id={id} canWrite={isAdminSession(session)} />;
}
