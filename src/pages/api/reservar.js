import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_KEY
);

export async function post({ request }) {
  const { cantidad, comprador } = await request.json();

  // Tomar X boletos disponibles aleatorios
  const { data: disponibles, error: errorSelect } = await supabase
    .from("tickets")
    .select("*")
    .eq("estado", "disponible")
    .order("numero", { ascending: true })
    .limit(cantidad);

  if (errorSelect) {
    return new Response(JSON.stringify({ error: errorSelect.message }), { status: 500 });
  }

  // Actualizar boletos a vendidos
  const boletosIds = disponibles.map(b => b.id);
  const { error: errorUpdate } = await supabase
    .from("tickets")
    .update({ estado: "vendido", comprador })
    .in("id", boletosIds);

  if (errorUpdate) {
    return new Response(JSON.stringify({ error: errorUpdate.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ boletos: disponibles }), {
    headers: { "Content-Type": "application/json" }
  });
}

const iniciarPago = async () => {
  const total = cantidad * precioPorBoleto;

  // Simulación de pago
  alert(`Simulando pago de $${total} USD`);

  // Después del pago, reservar boletos
  const res = await fetch("/api/reservar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cantidad, comprador: "cliente_demo" })
  });

  const data = await res.json();
  if (data.boletos) {
    alert(`Boletos asignados: ${data.boletos.map(b => b.numero).join(", ")}`);
  }
};
