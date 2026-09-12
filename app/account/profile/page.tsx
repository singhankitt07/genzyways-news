import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import ProfileForm from "@/components/ProfileForm";
import Link from "next/link";
import { isAdminSession } from "@/lib/auth";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/account/login");
  return (
    <div className="max-w-2xl mx-auto py-12">
      <p className="text-xs uppercase tracking-[0.2em] text-gold font-semibold mb-3">Your account</p>
      <h1 className="font-serif text-4xl mb-2">Hello, {session.user.name || "Reader"}</h1>
      <p className="text-ink/60 mb-8">Personalize your news feed and optional profile details.</p>
      {isAdminSession(session) && (
        <div className="border border-line bg-white px-4 py-4 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="font-semibold">Owner access</p>
            <p className="text-sm text-ink/60">Manage every article, draft, image, and publication status.</p>
          </div>
          <Link href="/admin" className="text-sm font-semibold text-press hover:underline">Open owner workspace</Link>
        </div>
      )}
      <ProfileForm />
    </div>
  );
}
