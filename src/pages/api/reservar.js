import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_KEY
);

export async function post({ request }) {
  const { cantidad, comprador } = await request.json();

  const { data: disponibles, error: errorSelect } = await supabase
    .from("tickets")
    .select("*")
    .eq("estado", "disponible")
    .order("numero", { ascending: true })
    .limit(cantidad);

  if (errorSelect) return new Response(JSON.stringify({ error: errorSelect.message }), { status: 500 });

  const boletosIds = disponibles.map(b => b.id);

  const { error: errorUpdate } = await supabase
    .from("tickets")
    .update({ estado: "vendido", comprador })
    .in("id", boletosIds);

  if (errorUpdate) return new Response(JSON.stringify({ error: errorUpdate.message }), { status: 500 });

  return new Response(JSON.stringify({ boletos: disponibles }), {
    headers: { "Content-Type": "application/json" }
  });
}
