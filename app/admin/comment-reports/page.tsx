import { getServerSession } from "next-auth";
import { authOptions, isAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminCommentReports from "@/components/AdminCommentReports";

export default async function CommentReportsPage() {
  const session = await getServerSession(authOptions);
  if (!isAdminSession(session)) redirect(session ? "/" : "/admin/login");
  return <AdminCommentReports />;
}
