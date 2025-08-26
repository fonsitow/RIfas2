import React, { useState } from "react";
import ModalPago from "../components/ModalPago.jsx";

export default function RifaGrid({ rifas }) {
  const [sel, setSel] = useState(null);

  return (
    <>
      <div className="grid">
        {rifas.map((r) => (
          <div key={r.id} className="card">
            <img src={r.imagen_url || "https://via.placeholder.com/800x600?text=Rifa"} alt={r.nombre} />
            <div className="card-body">
              <div className="title">{r.nombre}</div>
              <div className="desc">{r.descripcion || "Participa y gana."}</div>
              <div className="price">Bs {Number(r.precio_bs).toFixed(2)} / boleto</div>
              <button className="btn" onClick={() => setSel(r)}>Comprar</button>
            </div>
          </div>
        ))}
      </div>

      {sel && <ModalPago rifa={sel} onClose={() => setSel(null)} />}
    </>
  );
}
