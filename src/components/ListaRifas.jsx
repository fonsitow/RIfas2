import React, { useState } from "react";

export default function ListaRifas({ rifas }) {
  const [cantidad, setCantidad] = useState(1);
  const [selectedRifa, setSelectedRifa] = useState(null);

  const pagarBolivares = async (rifa) => {
    const res = await fetch("/api/bolivares-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cantidad,
        precioUSD: rifa.precio,
        rifaId: rifa.id
      })
    });
    const data = await res.json();
    if (data.link) {
      alert(`Tasa de cambio: 1 USD = ${data.tasa} VES`);
      window.location.href = data.link;
    } else {
      alert("Error al generar pago");
    }
  };

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "20px",
      padding: "20px"
    }}>
      {rifas.map((rifa) => (
        <div key={rifa.id} style={{
          border: "1px solid #ddd",
          borderRadius: "10px",
          padding: "15px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          background: "#fff"
        }}>
          <h2>{rifa.nombre}</h2>
          <p>{rifa.descripcion}</p>
          <p><b>Precio:</b> ${rifa.precio} USD</p>

          <input
            type="number"
            min="1"
            value={cantidad}
            onChange={(e) => setCantidad(parseInt(e.target.value))}
            style={{ width: "100%", padding: "5px", margin: "5px 0" }}
          />

          <button
            onClick={() => pagarBolivares(rifa)}
            style={{
              width: "100%",
              padding: "10px",
              background: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Pagar
          </button>
        </div>
      ))}
    </div>
  );
}

