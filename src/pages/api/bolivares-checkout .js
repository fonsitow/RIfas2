export const prerender = false;

import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function post({ request }) {
  try {
    const { cantidad, precioUSD, rifaId } = await request.json();

    // 1️⃣ Obtener tasa de cambio USD → VES
    const cambioRes = await fetch("https://api.exchangerate.host/latest?base=USD&symbols=VES");
    const cambioData = await cambioRes.json();
    const tasa = cambioData?.rates?.VES || 0;

    if (!tasa) {
      return new Response(JSON.stringify({ error: "No se pudo obtener la tasa de cambio" }), { status: 500 });
    }

    // 2️⃣ Calcular monto en VES
    const montoVES = Math.round(precioUSD * cantidad * tasa * 100) / 100;

    // 3️⃣ Crear enlace de pago en PagoFlash
    const response = await fetch("https://api.pagoflash.com/v1/payment-links", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.PAGOFLASH_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: montoVES,
        currency: "VES",
        description: `Compra de ${cantidad} boletos para la rifa ${rifaId}`,
        callback_url: "https://tu-dominio.com/api/pago-webhook",
      }),
    });

    const data = await response.json();

    if (!data || !data.payment_link) {
      return new Response(JSON.stringify({ error: "Error creando el enlace de pago" }), { status: 500 });
    }

    // 4️⃣ Guardar orden en BD
    await supabase.from("ordenes").insert([
      {
        rifa_id: rifaId,
        cantidad_boletos: cantidad,
        monto: montoVES,
        estado: "pendiente",
        referencia_pago: data.reference
      }
    ]);

    return new Response(JSON.stringify({
      link: data.payment_link,
      referencia: data.reference,
      tasa
    }), { status: 200 });

  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Error interno" }), { status: 500 });
  }
}
