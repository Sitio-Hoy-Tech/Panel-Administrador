"use client";

import { getPlanType } from "@/lib/plan-config";

import EsencialLayout from "./_plans/esencial/layout";
import EmprendimientoLayout from "./_plans/emprendimiento/layout";
import EmpresaLayout from "./_plans/empresa/layout";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const plan = getPlanType();

  switch (plan) {
    case "esencial":
      return <EsencialLayout>{children}</EsencialLayout>;
    case "emprendimiento":
      return <EmprendimientoLayout>{children}</EmprendimientoLayout>;
    case "empresa":
      return <EmpresaLayout>{children}</EmpresaLayout>;
  }
}
