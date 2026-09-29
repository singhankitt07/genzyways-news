import { getServerSession } from "next-auth";
import { authOptions, isAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminVideoForm from "@/components/AdminVideoForm";
import AdminMediaLibrary from "@/components/AdminMediaLibrary";

export default async function MediaLibraryPage() {
  const session = await getServerSession(authOptions);
  if (!isAdminSession(session)) redirect(session ? "/" : "/admin/login");
  return <div className="admin-page py-8"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="section-kicker mb-2">Publishing tools</p><h1 className="font-serif text-3xl">Media library</h1><p className="mt-2 text-sm text-ink/60">Upload and manage Shorts and full videos.</p></div><a href="/admin/media/new" className="button-primary text-sm">Upload media</a></div><AdminVideoForm /><AdminMediaLibrary /></div>;
}
