import { createClient } from "@supabase/supabase-js";

const supabase = createClient(import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_KEY);

export async function post({ request }) {
  const { boletos } = await request.json();

  const { error } = await supabase
    .from("tickets")
    .update({ estado: "reservado" })
    .in("id", boletos);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" }
  });
}
