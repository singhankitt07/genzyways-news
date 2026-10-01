import { getServerSession } from "next-auth";
import { authOptions, hasStaffRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminCommentReports from "@/components/AdminCommentReports";

export default async function CommentReportsPage() {
  const session = await getServerSession(authOptions);
  if (!hasStaffRole(session, ["ADMIN", "MODERATOR"])) redirect(session ? "/" : "/admin/login");
  return <AdminCommentReports />;
}
