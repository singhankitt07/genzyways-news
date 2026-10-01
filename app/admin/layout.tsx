import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import AdminSidebar from "@/components/AdminSidebar";
import AdminNav from "@/components/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role || "READER";
  return (
    <SessionProviderWrapper>
      <div className="admin-shell">
        <AdminSidebar />
        <div className="admin-main">
          <AdminNav role={role} isAuthenticated={Boolean(session)} />
          {children}
        </div>
      </div>
    </SessionProviderWrapper>
  );
}
