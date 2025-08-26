import { useState } from "react";

export default function RifaCard({ rifa, onSelect, selected }) {
  return (
    <div
      onClick={() => onSelect(rifa)}
      style={{
        border: selected?.id === rifa.id ? "3px solid #0070f3" : "1px solid #ccc",
        borderRadius: "10px",
        padding: "1rem",
        margin: "1rem",
        cursor: "pointer",
        width: "250px",
        boxShadow: selected?.id === rifa.id ? "0 0 10px rgba(0,112,243,0.5)" : "0 0 5px rgba(0,0,0,0.1)",
        transition: "0.3s",
      }}
    >
      <h3>{rifa.nombre}</h3>
      <p>{rifa.descripcion}</p>
      <p>Precio: {rifa.precio} {rifa.moneda}</p>
    </div>
  );
}
