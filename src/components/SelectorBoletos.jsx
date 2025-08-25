
import { useState, useEffect } from "react";
import "../styles/boletos.css";

export default function SelectorBoletos({ rifaId, titulo }) {
  const [boletos, setBoletos] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);

  useEffect(() => {
    // Datos de prueba
    setBoletos(
      Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        numero: (i + 1).toString().padStart(3, "0"),
        estado: i % 5 === 0 ? "vendido" : i % 7 === 0 ? "reservado" : "disponible"
      }))
    );
  }, [rifaId]);

  const toggleBoleto = (id, estado) => {
    if (estado !== "disponible") return;
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  return (
    <div className="contenedor">
      <h1 className="titulo">{titulo}</h1>
      <div className="grid">
        {boletos.map((b) => (
          <button
            key={b.id}
            onClick={() => toggleBoleto(b.id, b.estado)}
            className={`boleto ${b.estado} ${
              seleccionados.includes(b.id) ? "seleccionado" : ""
            }`}
          >
            {b.numero}
          </button>
        ))}
      </div>
      {seleccionados.length > 0 && (
        <button className="btn-reservar">
          Reservar {seleccionados.length} boleto(s)
        </button>
      )}
    </div>
  );
}
