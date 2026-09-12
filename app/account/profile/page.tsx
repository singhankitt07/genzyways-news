import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import ProfileForm from "@/components/ProfileForm";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/account/login");
  return (
    <div className="max-w-2xl mx-auto py-12">
      <p className="text-xs uppercase tracking-[0.2em] text-gold font-semibold mb-3">Your account</p>
      <h1 className="font-serif text-4xl mb-2">Hello, {session.user.name || "Reader"}</h1>
      <p className="text-ink/60 mb-8">Personalize your news feed and optional profile details.</p>
      <ProfileForm />
    </div>
  );
}
