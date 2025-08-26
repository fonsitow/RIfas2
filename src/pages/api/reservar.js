export async function post({ request }) {
  const { cantidad } = await request.json();
  const boletos = [];

  while (boletos.length < cantidad) {
    const numero = Math.floor(Math.random() * 999) + 1;
    if (!boletos.includes(numero)) boletos.push(numero);
  }

  return new Response(JSON.stringify({ boletos }), { headers: { "Content-Type": "application/json" } });
}
