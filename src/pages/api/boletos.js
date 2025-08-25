import { createClient } from "@supabase/supabase-js";
const supabase = createClient(import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_KEY);

export async function get({ request }) {
  const url = new URL(request.url);
  const rifaId = url.searchParams.get("rifa");

  let query = supabase.from("tickets").select("*").order("numero", { ascending: true });
  if (rifaId) {
    query = query.eq("rifa_id", rifaId);
  }

  const { data, error } = await query;

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" }
  });
}
