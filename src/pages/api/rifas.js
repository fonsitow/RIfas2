import { createClient } from "@supabase/supabase-js";
const supabase = createClient(import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_KEY);

export async function get() {
  const { data, error } = await supabase.from("rifas").select("*");

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" }
  });
}
