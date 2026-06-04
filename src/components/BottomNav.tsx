import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, Calendar, Wallet, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Início" },
  { to: "/os", icon: FileText, label: "OS" },
  { to: "/agenda", icon: Calendar, label: "Agenda" },
  { to: "/financeiro", icon: Wallet, label: "Financeiro" },
  { to: "/clientes", icon: Users, label: "Clientes" },
];

export function BottomNav() {
  const { pathname } = useLocation();
  // Hide on certain routes (handled at layout level too)
  if (pathname.startsWith("/aceite") || pathname === "/" || pathname === "/onboarding") return null;
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/95 backdrop-blur-lg safe-bottom">
      <ul className="mx-auto flex max-w-xl">
        {items.map(({ to, icon: Icon, label }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-base",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn("h-5 w-5 transition-base", isActive && "scale-110")} strokeWidth={isActive ? 2.4 : 2} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
