"use server";

// Las 3 versiones de login son idénticas (misma lógica de Supabase Auth).
// Se re-exportan desde empresa como referencia canónica.
// El logout también es idéntico en los 3.

import { login as empresaLogin, logout as empresaLogout } from "./empresa/auth";

export async function login(formData: FormData) {
  return empresaLogin(formData);
}

export async function logout() {
  return empresaLogout();
}
