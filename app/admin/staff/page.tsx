import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions, isAdminSession } from "@/lib/auth";
import AdminStaffManager from "@/components/AdminStaffManager";

export default async function StaffPage() {
  const session = await getServerSession(authOptions);
  if (!isAdminSession(session)) redirect(session ? "/admin" : "/admin/login");
  return <AdminStaffManager />;
}