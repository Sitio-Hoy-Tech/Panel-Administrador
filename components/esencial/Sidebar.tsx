"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Settings, LogOut, ExternalLink, HelpCircle, CreditCard } from "lucide-react";
import clsx from "clsx";
import { logout } from "@/actions/auth";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Catálogo", href: "/admin/productos", icon: Package },
  { name: "Configuración", href: "/admin/configuracion", icon: Settings },
];

const secondaryNavigation = [
  { name: "Mi Plan", href: "/admin/mi-plan", icon: CreditCard },
  { name: "Soporte", href: "/admin/soporte", icon: HelpCircle },
];

export function Sidebar({ userName, onLinkClick }: { userName?: string, onLinkClick?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col rounded-[2rem] bg-transparent px-2 py-6 relative">
      {/* Remove decorative top gradient since it's floating now */}

      <div className="flex items-center gap-3 px-4 mb-10">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-white to-zinc-400 flex items-center justify-center shadow-lg shadow-white/10 flex-shrink-0">
          <span className="text-black font-bold text-lg">
            {userName ? userName.charAt(0).toUpperCase() : 'S'}
          </span>
        </div>
        <span className="text-xl font-bold tracking-tight text-white drop-shadow-md truncate">
          {userName || "SitioHoy"}
        </span>
      </div>

      <nav className="flex-1 space-y-8">
        <ul className="space-y-1.5">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href + "/"));
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  onClick={onLinkClick}
                  className={clsx(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300",
                    isActive
                      ? "bg-gradient-to-r from-primary/10 to-transparent text-primary"
                      : "text-zinc-400 hover:bg-white/[0.03] hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full shadow-[0_0_8px_rgba(244,244,245,0.5)]"></div>
                  )}
                  <item.icon
                    className={clsx(
                      "h-5 w-5 flex-shrink-0 transition-colors",
                      isActive ? "text-primary" : "text-zinc-500 group-hover:text-zinc-300"
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>

        <div>
          <div className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 mb-3">
            Cuenta
          </div>
          <ul className="space-y-1.5">
            {secondaryNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={onLinkClick}
                    className={clsx(
                      "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300",
                      isActive
                        ? "bg-gradient-to-r from-primary/10 to-transparent text-primary"
                        : "text-zinc-400 hover:bg-white/[0.03] hover:text-foreground"
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full shadow-[0_0_8px_rgba(244,244,245,0.5)]"></div>
                    )}
                    <item.icon
                      className={clsx(
                        "h-5 w-5 flex-shrink-0 transition-colors",
                        isActive ? "text-primary" : "text-zinc-500 group-hover:text-zinc-300"
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      <div className="mt-auto pt-6 flex flex-col gap-2">

        <div className="space-y-1">
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onLinkClick}
            className="group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 hover:bg-white/[0.03] hover:text-foreground transition-all duration-300"
          >
            <span className="flex items-center gap-3">
              <ExternalLink className="h-5 w-5 flex-shrink-0 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
              Ver mi sitio
            </span>
          </a>
          <form action={logout}>
            <button className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300">
              <LogOut className="h-5 w-5 flex-shrink-0 group-hover:text-red-400 transition-colors" />
              Cerrar Sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
