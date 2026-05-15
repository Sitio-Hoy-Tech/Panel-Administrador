"use server";

import { getPlanType } from "@/lib/plan-config";

import { login as esencialLogin, logout as esencialLogout } from "./esencial/auth";
import { login as emprendimientoLogin, logout as emprendimientoLogout } from "./emprendimiento/auth";
import { login as empresaLogin, logout as empresaLogout } from "./empresa/auth";

export async function login(formData: FormData) {
  const plan = getPlanType();
  switch (plan) {
    case "esencial":
      return esencialLogin(formData);
    case "emprendimiento":
      return emprendimientoLogin(formData);
    case "empresa":
      return empresaLogin(formData);
  }
}

export async function logout() {
  const plan = getPlanType();
  switch (plan) {
    case "esencial":
      return esencialLogout();
    case "emprendimiento":
      return emprendimientoLogout();
    case "empresa":
      return empresaLogout();
  }
}
