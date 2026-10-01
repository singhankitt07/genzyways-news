import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions, isAdminSession } from "@/lib/auth";
import AdminNewsletterManager from "@/components/AdminNewsletterManager";

export default async function AdminNewsletterPage() {
  const session = await getServerSession(authOptions);
  if (!isAdminSession(session)) redirect(session ? "/admin" : "/admin/login");
  return <AdminNewsletterManager />;
}