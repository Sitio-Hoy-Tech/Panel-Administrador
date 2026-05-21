const CRM_WEBHOOK_URL = "https://crm.sitiohoy.com.ar/api/webhooks/ticket";

export async function sendTicketToCRM(params: {
  tenant_id: string;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  source: string;
}): Promise<void> {
  const secret = process.env.CRM_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[CRM] CRM_WEBHOOK_SECRET no está configurado");
    return;
  }

  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  const body = {
    type: "INSERT",
    record: {
      id,
      tenant_id: params.tenant_id,
      name: params.name,
      email: params.email,
      phone: params.phone ?? null,
      message: params.message,
      source: params.source,
      status: "new",
      created_at: now,
      updated_at: now,
    },
  };

  try {
    const res = await fetch(CRM_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-webhook-secret": secret,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.error(`[CRM] Webhook respondió con ${res.status}`, await res.text());
    }
  } catch (err) {
    console.error("[CRM] Error al enviar ticket al CRM:", err);
  }
}
