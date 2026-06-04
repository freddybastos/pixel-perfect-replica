import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { BottomNav } from "@/components/BottomNav";
import { Loader2 } from "lucide-react";

export function AppShell({ children, hideNav = false }: { children: ReactNode; hideNav?: boolean }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return <Navigate to="/" state={{ from: location }} replace />;

  return (
    <div className="min-h-screen bg-background">
      <main className={hideNav ? "" : "pb-20"}>
        <div className="mx-auto max-w-xl">{children}</div>
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
