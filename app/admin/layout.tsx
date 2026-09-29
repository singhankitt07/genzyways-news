import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import AdminSidebar from "@/components/AdminSidebar";
import AdminNav from "@/components/AdminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProviderWrapper>
      <div className="admin-shell">
        <AdminSidebar />
        <div className="admin-main">
          <AdminNav />
          {children}
        </div>
      </div>
    </SessionProviderWrapper>
  );
}
