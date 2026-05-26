"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import Image from "next/image";
import { LayoutDashboard, Package, Settings, LogOut, ExternalLink, HelpCircle, CreditCard, Tag, Clock, Lock } from "lucide-react";
import clsx from "clsx";
import { logout } from "@/actions/auth";
import { useSubscription } from "@/components/shared/SubscriptionContext";

const ALLOWED_WHEN_EXPIRED = ["/admin/mi-plan", "/admin/soporte"];

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Catálogo", href: "/admin/productos", icon: Package },
  { name: "Categorías", href: "/admin/categorias", icon: Tag },
  { name: "Configuración", href: "/admin/configuracion", icon: Settings },
];

const secondaryNavigation = [
  { name: "Mi Plan", href: "/admin/mi-plan", icon: CreditCard },
  { name: "Soporte", href: "/admin/soporte", icon: HelpCircle },
];

export function Sidebar({ userName, storeUrl, onLinkClick }: { userName?: string, storeUrl?: string | null, onLinkClick?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending) setPendingHref(null);
  }, [isPending]);

  const handleNav = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    setPendingHref(href);
    startTransition(() => router.push(href));
    onLinkClick?.();
  };

  const isActive = (href: string) => {
    const target = pendingHref ?? pathname;
    if (href === "/admin") return target === href;
    return target === href || target.startsWith(href + "/");
  };

  const isSecondaryActive = (href: string) => (pendingHref ?? pathname) === href;
  const { expired } = useSubscription();

  return (
    <div className="flex h-full w-64 flex-col rounded-[2rem] bg-transparent px-2 py-6 relative">
      {/* Remove decorative top gradient since it's floating now */}

      <div className="flex items-center gap-3 px-4 mb-10">
        <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-emerald-500/20 via-teal-500/25 to-emerald-400/10 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)] flex-shrink-0">
          <span className="text-emerald-400 font-bold text-base drop-shadow-[0_0_6px_rgba(16,185,129,0.4)]">
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
            const locked = expired && !ALLOWED_WHEN_EXPIRED.includes(item.href);
            const active = !locked && isActive(item.href);
            const pending = !locked && isPending && pendingHref === item.href;
            return (
              <li key={item.name}>
                {locked ? (
                  <div className="relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 cursor-not-allowed select-none">
                    <item.icon className="h-5 w-5 flex-shrink-0 text-slate-700" aria-hidden="true" />
                    {item.name}
                    <Lock className="h-3 w-3 ml-auto text-slate-700" />
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    onClick={(e) => handleNav(e, item.href)}
                    className={clsx(
                      "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300",
                      active
                        ? "bg-gradient-to-r from-primary/10 to-transparent text-primary"
                        : "text-slate-400 hover:bg-white/[0.03] hover:text-foreground"
                    )}
                  >
                    {active && (
                      <div className={clsx(
                        "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full shadow-[0_0_8px_rgba(244,244,245,0.5)]",
                        pending && "animate-pulse"
                      )} />
                    )}
                    <item.icon
                      className={clsx(
                        "h-5 w-5 flex-shrink-0 transition-colors",
                        active ? "text-primary" : "text-slate-500 group-hover:text-slate-300"
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>

        <div>
          <div className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600 mb-3">
            Cuenta
          </div>
          <ul className="space-y-1.5">
            {secondaryNavigation.map((item) => {
              const active = isSecondaryActive(item.href);
              const pending = isPending && pendingHref === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={(e) => handleNav(e, item.href)}
                    className={clsx(
                      "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300",
                      active
                        ? "bg-gradient-to-r from-primary/10 to-transparent text-primary"
                        : "text-slate-400 hover:bg-white/[0.03] hover:text-foreground"
                    )}
                  >
                    {active && (
                      <div className={clsx(
                        "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full shadow-[0_0_8px_rgba(244,244,245,0.5)]",
                        pending && "animate-pulse"
                      )} />
                    )}
                    <item.icon
                      className={clsx(
                        "h-5 w-5 flex-shrink-0 transition-colors",
                        active ? "text-primary" : "text-slate-500 group-hover:text-slate-300"
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
          {storeUrl === undefined ? null : storeUrl ? (
            <a
              href={storeUrl.startsWith("http") ? storeUrl : `https://${storeUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onLinkClick}
              className="group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-white/[0.03] hover:text-foreground transition-all duration-300"
            >
              <span className="flex items-center gap-3">
                <ExternalLink className="h-5 w-5 flex-shrink-0 text-slate-500 group-hover:text-slate-300 transition-colors" />
                Ver mi sitio
              </span>
            </a>
          ) : (
            <div className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600">
              <Clock className="h-5 w-5 flex-shrink-0" />
              <span>Sitio no disponible aún</span>
            </div>
          )}
          <button
            className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300"
            onClick={async () => { await logout(); window.location.href = "/admin/login"; }}
          >
            <LogOut className="h-5 w-5 flex-shrink-0 group-hover:text-red-400 transition-colors" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Watermark Logo */}
      <div className="mt-8 px-4 opacity-[0.1] pointer-events-none select-none transition-opacity duration-500 hover:opacity-20 flex justify-center">
        <Image 
          src="/logo-sitiohoy.png" 
          alt="SitioHoy Logo" 
          width={80} 
          height={80} 
          className="object-contain"
        />
      </div>
    </div>
  );
}
