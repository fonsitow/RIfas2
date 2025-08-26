export const prerender = false;

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function post({ request }) {
  try {
    const { reference, status } = await request.json();

    if (status === "approved") {
      // Marcar la orden como pagada
      const { data, error } = await supabase
        .from("ordenes")
        .update({ estado: "pagado" })
        .eq("referencia_pago", reference)
        .select()
        .single();

      if (error) throw error;

      // Generar boletos del 1 al 999 sin repetir
      const boletosDisponibles = Array.from({ length: 999 }, (_, i) => i + 1);

      // Obtener boletos ya ocupados
      const { data: ocupados } = await supabase
        .from("boletos")
        .select("numero")
        .eq("rifa_id", data.rifa_id);

      const ocupadosSet = new Set(ocupados?.map(b => b.numero) || []);
      const boletosLibres = boletosDisponibles.filter(n => !ocupadosSet.has(n));

      // Asignar boletos
      const boletosAsignados = boletosLibres.slice(0, data.cantidad_boletos);
      const nuevosBoletos = boletosAsignados.map(num => ({
        rifa_id: data.rifa_id,
        numero: num,
        usuario_id: data.usuario_id || null
      }));

      await supabase.from("boletos").insert(nuevosBoletos);

      return new Response(JSON.stringify({ message: "Pago confirmado y boletos asignados." }), { status: 200 });
    }

    return new Response(JSON.stringify({ message: "Pago no confirmado." }), { status: 400 });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Error en el webhook" }), { status: 500 });
  }
}
 