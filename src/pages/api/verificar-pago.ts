export const prerender = false;

import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

export const POST: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const pago_id = url.searchParams.get("pago_id");

  if (!pago_id) return new Response("Falta pago_id", { status: 400 });

  const supabase = createClient(
    import.meta.env.PUBLIC_SUPABASE_URL!,
    import.meta.env.PUBLIC_SUPABASE_KEY!
  );

  // 1) Marcar pago aprobado
  await supabase.from("pagos").update({ estado: "aprobado" }).eq("id", pago_id);

  // 2) Mover tickets de apartado -> vendido
  await supabase
    .from("tickets")
    .update({ estado: "vendido" })
    .eq("pago_id", pago_id)
    .eq("estado", "apartado");

  return new Response("OK", { status: 200 });
};
