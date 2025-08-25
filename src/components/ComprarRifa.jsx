import { useState } from "react";
import "../styles/comprar.css";

export default function ComprarRifa() {
  const [cantidad, setCantidad] = useState(1);
  const precioPorBoleto = 5;

  const iniciarPago = async () => {
  const res = await fetch("/api/crear-checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cantidad, precio: precioPorBoleto })
  });

  const data = await res.json();

  // Redirigir a Stripe
  window.location.href = data.url;
};


  return (
    <div className="comprar-container">
      <h1 className="titulo">Compra tus boletos</h1>
      <div className="barra-compra">
        <label>Cantidad:</label>
        <input
          type="number"
          min="1"
          max="999"
          value={cantidad}
          onChange={(e) => setCantidad(parseInt(e.target.value))}
        />
        <span>Total: ${cantidad * precioPorBoleto} USD</span>
        <button onClick={iniciarPago}>Pagar con tarjeta</button>
      </div>
    </div>
  );
}

