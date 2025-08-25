// Indica a Astro que esta ruta NO debe prerenderizarse
export const prerender = false;

import Stripe from "stripe";

// Inicializa Stripe con la clave secreta desde .env
const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY);

/**
 * Handler POST para crear una sesión de Stripe Checkout
 */
export async function post({ request }) {
  try {
    const { cantidad, precio } = await request.json();

    // Crear sesión de pago en Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: `${cantidad} boletos de rifa` },
          unit_amount: precio * 100, // Stripe usa centavos
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${request.headers.get("origin")}/success?cantidad=${cantidad}`,
      cancel_url: `${request.headers.get("origin")}/cancel`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error creando sesión Stripe:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
