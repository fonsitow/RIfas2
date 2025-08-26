import { useEffect, useState } from "react";

export default function BoletosAsignados({ cantidad }) {
  const [boletos, setBoletos] = useState([]);

  useEffect(() => {
    const asignarBoletos = async () => {
      const res = await fetch("/api/reservar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cantidad }),
      });
      const data = await res.json();
      setBoletos(data.boletos);
    };
    asignarBoletos();
  }, [cantidad]);

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h2>Boletos asignados:</h2>
      <div>{boletos.join(", ")}</div>
    </div>
  );
}

