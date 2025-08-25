import { useState } from "react";
import "../styles/comprar.css";

export default function ComprarRifa() {
  const [cantidad, setCantidad] = useState(1);
  const precioPorBoleto = 5;

  const iniciarPago = async () => {
    // 1️⃣ Pedimos a nuestro endpoint crear la sesión de Stripe
    const res = await fetch("/api/crear-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cantidad, precio: precioPorBoleto })
    });
    const data = await res.json();

    // 2️⃣ Redirigimos a Stripe Checkout
    window.location.href = data.url;
  };

  return (
    <div className="comprar-container">
      <h1 className="titulo">Compra tus boletos</h1>
      <div className="barra-compra">
      <input
        type="number"
        min="1"
        max="999"
        value={cantidad}
        onChange={(e) => setCantidad(parseInt(e.target.value))}
      />
      <p>Total: ${cantidad * precioPorBoleto} USD</p>
      <button onClick={iniciarPago}>Pagar con tarjeta</button>
    </div>
    </div>
  );
}
