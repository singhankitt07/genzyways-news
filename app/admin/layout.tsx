import SessionProviderWrapper from "@/components/SessionProviderWrapper";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <SessionProviderWrapper>{children}</SessionProviderWrapper>;
}
