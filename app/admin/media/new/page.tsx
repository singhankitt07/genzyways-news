import { getServerSession } from "next-auth";
import { authOptions, isAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminVideoForm from "@/components/AdminVideoForm";

export default async function NewMediaPage() {
  const session = await getServerSession(authOptions);
  if (!isAdminSession(session)) redirect(session ? "/" : "/admin/login");
  return <div className="admin-page py-8"><h1 className="font-serif text-2xl mb-2">Upload Shorts or Video</h1><p className="mb-6 text-sm text-ink/60">Use MP4, WEBM, or MOV up to 100 MB. Publish only media you have the right to use.</p><AdminVideoForm /></div>;
}
